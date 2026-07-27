import { CONTACTS_PER_DAY } from "../_lib/constants.js";
import { json, methodNotAllowed, readJson } from "../_lib/http.js";
import { cleanText, getClientIp, getDayKey, hashIdentifier } from "../_lib/security.js";
import { verifyTurnstile } from "../_lib/turnstile.js";
import { validateContact } from "../_lib/validation.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function contactText(input, requestUrl) {
  const contextLines = [];
  if (input.listingId) contextLines.push(`Listing ID: ${input.listingId}`);
  if (input.listingName) contextLines.push(`Listing name: ${input.listingName}`);
  if (input.listingDomain) contextLines.push(`Listing domain: ${input.listingDomain}`);
  if (input.listingPath) contextLines.push(`Listing page: ${new URL(input.listingPath, requestUrl).toString()}`);

  return [
    "New WebLaunch Directory contact message",
    "",
    `Name: ${input.name}`,
    `Reply email: ${input.email}`,
    `Subject: ${input.subject}`,
    ...(contextLines.length ? ["", ...contextLines] : []),
    "",
    "Message:",
    input.message
  ].join("\n");
}

function contactHtml(input, requestUrl) {
  const details = [];
  if (input.listingId) details.push(`<li><strong>Listing ID:</strong> ${escapeHtml(input.listingId)}</li>`);
  if (input.listingName) details.push(`<li><strong>Listing name:</strong> ${escapeHtml(input.listingName)}</li>`);
  if (input.listingDomain) details.push(`<li><strong>Listing domain:</strong> ${escapeHtml(input.listingDomain)}</li>`);
  if (input.listingPath) {
    const full = new URL(input.listingPath, requestUrl).toString();
    details.push(`<li><strong>Listing page:</strong> <a href="${escapeHtml(full)}">${escapeHtml(full)}</a></li>`);
  }

  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#122033;line-height:1.6">
    <h1 style="font-size:22px">New WebLaunch Directory message</h1>
    <p><strong>Name:</strong> ${escapeHtml(input.name)}<br>
    <strong>Reply email:</strong> ${escapeHtml(input.email)}<br>
    <strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
    ${details.length ? `<ul>${details.join("")}</ul>` : ""}
    <h2 style="font-size:18px">Message</h2>
    <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
  </body></html>`;
}

async function ensureContactLimitTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_limits (
      limit_key TEXT NOT NULL,
      day_key TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1 CHECK(count BETWEEN 1 AND ${CONTACTS_PER_DAY}),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(limit_key, day_key)
    )
  `).run();
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);
  if (!context.env.CONTACT_EMAIL || !context.env.CONTACT_TO_EMAIL || !context.env.CONTACT_FROM_EMAIL) {
    return json({ error: "The contact email service has not been configured by the site owner." }, 503);
  }

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
    await ensureContactLimitTable(context.env.DB);
    const [ipUsage, emailUsage] = await context.env.DB.batch([
      context.env.DB.prepare("SELECT count FROM contact_limits WHERE limit_key = ?1 AND day_key = ?2").bind(ipKey, dayKey),
      context.env.DB.prepare("SELECT count FROM contact_limits WHERE limit_key = ?1 AND day_key = ?2").bind(emailKey, dayKey)
    ]);

    if (Number(ipUsage.results?.[0]?.count || 0) >= CONTACTS_PER_DAY || Number(emailUsage.results?.[0]?.count || 0) >= CONTACTS_PER_DAY) {
      return json({ error: "You have reached the daily contact-form limit. Please try again tomorrow." }, 429);
    }

    const subjectPrefix = input.listingDomain ? `[Listing report: ${input.listingDomain}]` : "[WebLaunch Directory]";
    const senderName = cleanText(context.env.CONTACT_FROM_NAME || "WebLaunch Directory").slice(0, 80);
    await context.env.CONTACT_EMAIL.send({
      to: context.env.CONTACT_TO_EMAIL,
      from: { email: context.env.CONTACT_FROM_EMAIL, name: senderName },
      replyTo: { email: input.email, name: input.name },
      subject: `${subjectPrefix} ${input.subject}`.slice(0, 180),
      text: contactText(input, context.request.url),
      html: contactHtml(input, context.request.url)
    });

    await context.env.DB.batch([
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

    return json({ success: true, message: "Your message has been sent. Thank you for contacting WebLaunch Directory." }, 201);
  } catch (error) {
    console.error("Contact email error", error);
    return json({ error: "The message could not be sent right now. Please try again later." }, 500);
  }
}
