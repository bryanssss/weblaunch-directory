import { SUBMISSIONS_PER_DAY } from "../_lib/constants.js";
import { json, methodNotAllowed, readJson } from "../_lib/http.js";
import { getClientIp, getDayKey, hashIdentifier } from "../_lib/security.js";
import { inspectHomepage, slugFromDomain, validateSubmission } from "../_lib/validation.js";

async function verifyTurnstile(token, secret, remoteIp) {
  if (!secret) throw new Error("TURNSTILE_NOT_CONFIGURED");
  if (!token) return false;
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteIp && remoteIp !== "0.0.0.0") form.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}

function friendlyDatabaseError(error) {
  const message = String(error?.message || error);
  if (message.includes("submission_limits") || message.includes("CHECK constraint failed")) {
    return { status: 429, message: `You have reached the limit of ${SUBMISSIONS_PER_DAY} submissions today.` };
  }
  if (message.includes("sites.normalized_domain") || message.includes("sites.slug")) {
    return { status: 409, message: "This domain has already been submitted." };
  }
  return null;
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  let body;
  try {
    body = await readJson(context.request);
  } catch (error) {
    const status = error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400;
    return json({ error: status === 413 ? "The submission is too large." : "Invalid submission data." }, status);
  }

  let input;
  try {
    input = validateSubmission(body);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const clientIp = getClientIp(context.request);
  let human = false;
  try {
    human = await verifyTurnstile(body.turnstileToken, context.env.TURNSTILE_SECRET_KEY, clientIp);
  } catch (error) {
    if (error.message === "TURNSTILE_NOT_CONFIGURED") {
      return json({ error: "Turnstile has not been configured by the site owner." }, 503);
    }
  }
  if (!human) return json({ error: "The anti-spam check failed. Refresh the page and try again." }, 400);

  let checkedWebsite;
  try {
    checkedWebsite = await inspectHomepage(input.website.url, `${input.name} ${input.description}`);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  let ipHash;
  let emailHash;
  try {
    [ipHash, emailHash] = await Promise.all([
      hashIdentifier(clientIp, context.env.IP_HASH_SALT),
      hashIdentifier(input.email, context.env.IP_HASH_SALT)
    ]);
  } catch {
    return json({ error: "The privacy salt has not been configured by the site owner." }, 503);
  }

  const timeZone = context.env.RATE_LIMIT_TIMEZONE || "Europe/London";
  const dayKey = getDayKey(timeZone);
  const now = new Date().toISOString();
  const ipKey = `ip:${ipHash}`;
  const emailKey = `email:${emailHash}`;
  const slug = slugFromDomain(checkedWebsite.normalisedDomain);

  try {
    const [duplicate, ipUsage, emailUsage] = await context.env.DB.batch([
      context.env.DB.prepare("SELECT id, status FROM sites WHERE normalized_domain = ?1 LIMIT 1").bind(checkedWebsite.normalisedDomain),
      context.env.DB.prepare("SELECT count FROM submission_limits WHERE limit_key = ?1 AND day_key = ?2").bind(ipKey, dayKey),
      context.env.DB.prepare("SELECT count FROM submission_limits WHERE limit_key = ?1 AND day_key = ?2").bind(emailKey, dayKey)
    ]);

    if (duplicate.results?.length) return json({ error: "This domain has already been submitted." }, 409);
    if (Number(ipUsage.results?.[0]?.count || 0) >= SUBMISSIONS_PER_DAY) {
      return json({ error: `This internet connection has already made ${SUBMISSIONS_PER_DAY} submissions today.` }, 429);
    }
    if (Number(emailUsage.results?.[0]?.count || 0) >= SUBMISSIONS_PER_DAY) {
      return json({ error: `This email address has already made ${SUBMISSIONS_PER_DAY} submissions today.` }, 429);
    }

    const writeResults = await context.env.DB.batch([
      context.env.DB.prepare(`
        INSERT INTO submission_limits (limit_key, day_key, count, updated_at)
        VALUES (?1, ?2, 1, ?3)
        ON CONFLICT(limit_key, day_key)
        DO UPDATE SET count = submission_limits.count + 1, updated_at = excluded.updated_at
      `).bind(ipKey, dayKey, now),
      context.env.DB.prepare(`
        INSERT INTO submission_limits (limit_key, day_key, count, updated_at)
        VALUES (?1, ?2, 1, ?3)
        ON CONFLICT(limit_key, day_key)
        DO UPDATE SET count = submission_limits.count + 1, updated_at = excluded.updated_at
      `).bind(emailKey, dayKey, now),
      context.env.DB.prepare(`
        INSERT INTO sites (
          name, slug, url, normalized_domain, description, category, status,
          submitter_email_hash, submitter_ip_hash, submission_day, created_at, updated_at, approved_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'approved', ?7, ?8, ?9, ?10, ?10, ?10)
      `).bind(
        input.name,
        slug,
        checkedWebsite.url,
        checkedWebsite.normalisedDomain,
        input.description,
        input.category,
        emailHash,
        ipHash,
        dayKey,
        now
      )
    ]);

    context.waitUntil(
      context.env.DB.prepare("DELETE FROM submission_limits WHERE day_key < date('now', '-7 day')").run().catch(() => {})
    );

    const insertedId = Number(writeResults?.[2]?.meta?.last_row_id || 0);
    return json({
      success: true,
      message: "Your website passed the automated checks and is now live in the directory.",
      id: insertedId || undefined,
      slug,
      domain: checkedWebsite.normalisedDomain,
      path: `/site.html?domain=${encodeURIComponent(checkedWebsite.normalisedDomain)}`
    }, 201);
  } catch (error) {
    const friendly = friendlyDatabaseError(error);
    if (friendly) return json({ error: friendly.message }, friendly.status);
    console.error("Submission error", error);
    return json({ error: "The submission could not be saved. Please try again." }, 500);
  }
}
