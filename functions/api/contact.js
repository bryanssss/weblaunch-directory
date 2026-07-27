import { CONTACTS_PER_DAY } from "../_lib/constants.js";
import { ensureContactInboxTables } from "../_lib/contact-inbox.js";
import { json, methodNotAllowed, readJson } from "../_lib/http.js";
import { getClientIp, getDayKey, hashIdentifier } from "../_lib/security.js";
import { verifyTurnstile } from "../_lib/turnstile.js";
import { validateContact } from "../_lib/validation.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!context.env.DB) return json({ error: "The private contact inbox is not connected yet." }, 503);

  let body;
  try {
    body = await readJson(context.request, 30_000);
  } catch (error) {
    return json({ error: error.message === "PAYLOAD_TOO_LARGE" ? "The message is too large." : "Invalid contact form data." }, error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400);
  }

  let input;
  try {
    input = validateContact(body);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const clientIp = getClientIp(context.request);
  let human = false;
  try {
    human = await verifyTurnstile(body.turnstileToken, context.env.TURNSTILE_SECRET_KEY, clientIp, "contact");
  } catch (error) {
    if (error.message === "TURNSTILE_NOT_CONFIGURED") {
      return json({ error: "Turnstile has not been configured by the site owner." }, 503);
    }
  }
  if (!human) return json({ error: "The anti-spam check failed. Refresh the page and try again." }, 400);

  const dayKey = getDayKey(context.env.RATE_LIMIT_TIMEZONE || "Europe/London");
  const now = new Date().toISOString();
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

  const ipKey = `contact:ip:${ipHash}`;
  const emailKey = `contact:email:${emailHash}`;

  try {
    await ensureContactInboxTables(context.env.DB);
    const [ipUsage, emailUsage] = await context.env.DB.batch([
      context.env.DB.prepare("SELECT count FROM contact_limits WHERE limit_key = ?1 AND day_key = ?2").bind(ipKey, dayKey),
      context.env.DB.prepare("SELECT count FROM contact_limits WHERE limit_key = ?1 AND day_key = ?2").bind(emailKey, dayKey)
    ]);

    if (Number(ipUsage.results?.[0]?.count || 0) >= CONTACTS_PER_DAY || Number(emailUsage.results?.[0]?.count || 0) >= CONTACTS_PER_DAY) {
      return json({ error: "You have reached the daily contact-form limit. Please try again tomorrow." }, 429);
    }

    const listingId = input.listingId ? Number(input.listingId) : null;
    await context.env.DB.batch([
      context.env.DB.prepare(`
        INSERT INTO contact_messages (
          name, reply_email, subject, message, listing_id, listing_name,
          listing_domain, listing_path, status, submitter_email_hash,
          submitter_ip_hash, day_key, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'open', ?9, ?10, ?11, ?12)
      `).bind(
        input.name,
        input.email,
        input.subject,
        input.message,
        listingId,
        input.listingName,
        input.listingDomain,
        input.listingPath,
        emailHash,
        ipHash,
        dayKey,
        now
      ),
      context.env.DB.prepare(`
        INSERT INTO contact_limits (limit_key, day_key, count, updated_at)
        VALUES (?1, ?2, 1, ?3)
        ON CONFLICT(limit_key, day_key)
        DO UPDATE SET count = contact_limits.count + 1, updated_at = excluded.updated_at
      `).bind(ipKey, dayKey, now),
      context.env.DB.prepare(`
        INSERT INTO contact_limits (limit_key, day_key, count, updated_at)
        VALUES (?1, ?2, 1, ?3)
        ON CONFLICT(limit_key, day_key)
        DO UPDATE SET count = contact_limits.count + 1, updated_at = excluded.updated_at
      `).bind(emailKey, dayKey, now)
    ]);

    context.waitUntil(
      context.env.DB.prepare("DELETE FROM contact_limits WHERE day_key < date('now', '-14 day')").run().catch(() => {})
    );

    return json({
      success: true,
      message: "Your message has been saved in the private contact inbox. The directory owner can review it from the protected management dashboard."
    }, 201);
  } catch (error) {
    console.error("Contact inbox error", error);
    return json({ error: "The message could not be saved right now. Please try again later." }, 500);
  }
}
