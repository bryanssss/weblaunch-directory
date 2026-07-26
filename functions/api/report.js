import { json, methodNotAllowed, readJson } from "../_lib/http.js";
import { getClientIp, getDayKey, hashIdentifier } from "../_lib/security.js";
import { validateReport } from "../_lib/validation.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);
  let body;
  try {
    body = await readJson(context.request, 10_000);
  } catch {
    return json({ error: "Invalid report data." }, 400);
  }
  let report;
  try {
    report = validateReport(body);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const ip = getClientIp(context.request);
  let ipHash;
  try {
    ipHash = await hashIdentifier(ip, context.env.IP_HASH_SALT);
  } catch {
    return json({ error: "The privacy salt has not been configured by the site owner." }, 503);
  }
  const dayKey = getDayKey(context.env.RATE_LIMIT_TIMEZONE || "Europe/London");
  const limitKey = `report:${ipHash}`;
  const now = new Date().toISOString();

  try {
    const site = await context.env.DB.prepare("SELECT id FROM sites WHERE id = ?1 AND status = 'approved'").bind(report.siteId).first();
    if (!site) return json({ error: "This listing is no longer available." }, 404);

    await context.env.DB.batch([
      context.env.DB.prepare(`
        INSERT INTO report_limits (limit_key, day_key, count, updated_at)
        VALUES (?1, ?2, 1, ?3)
        ON CONFLICT(limit_key, day_key)
        DO UPDATE SET count = report_limits.count + 1, updated_at = excluded.updated_at
      `).bind(limitKey, dayKey, now),
      context.env.DB.prepare(`
        INSERT INTO reports (site_id, reason, details, reporter_ip_hash, day_key, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      `).bind(report.siteId, report.reason, report.details, ipHash, dayKey, now),
      context.env.DB.prepare("UPDATE sites SET report_count = report_count + 1, updated_at = ?1 WHERE id = ?2").bind(now, report.siteId)
    ]);

    context.waitUntil(
      context.env.DB.prepare("DELETE FROM report_limits WHERE day_key < date('now', '-7 day')").run().catch(() => {})
    );
    return json({ success: true, message: "Thank you. The report was sent to the moderator." }, 201);
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes("reports.site_id") || message.includes("UNIQUE constraint failed: reports")) {
      return json({ error: "You have already reported this listing today." }, 409);
    }
    if (message.includes("report_limits") || message.includes("CHECK constraint failed")) {
      return json({ error: "You have reached the daily report limit." }, 429);
    }
    console.error("Report error", error);
    return json({ error: "The report could not be saved." }, 500);
  }
}
