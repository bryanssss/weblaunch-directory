import { requireAdmin } from "../../../_lib/admin.js";
import { ensureContactInboxTables } from "../../../_lib/contact-inbox.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { cleanText } from "../../../_lib/security.js";

const ALLOWED_STATUSES = new Set(["open", "resolved", "all"]);

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const url = new URL(context.request.url);
  const requestedStatus = url.searchParams.get("status") || "open";
  const status = ALLOWED_STATUSES.has(requestedStatus) ? requestedStatus : "open";
  const query = cleanText(url.searchParams.get("q")).slice(0, 100);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.max(1, Math.min(50, Number.parseInt(url.searchParams.get("limit") || "20", 10) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  const binds = [];
  if (status !== "all") {
    conditions.push("status = ?");
    binds.push(status);
  }
  if (query) {
    conditions.push("(name LIKE ? OR reply_email LIKE ? OR subject LIKE ? OR message LIKE ? OR listing_domain LIKE ?)");
    const like = `%${query}%`;
    binds.push(like, like, like, like, like);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    await ensureContactInboxTables(context.env.DB);
    const listStatement = context.env.DB.prepare(`
      SELECT id, name, reply_email, subject, message, listing_id, listing_name,
             listing_domain, listing_path, status, created_at, resolved_at
      FROM contact_messages
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...binds, limit, offset);
    const countBase = context.env.DB.prepare(`SELECT COUNT(*) AS total FROM contact_messages ${where}`);
    const countStatement = binds.length ? countBase.bind(...binds) : countBase;
    const [list, count] = await context.env.DB.batch([listStatement, countStatement]);
    const total = Number(count.results?.[0]?.total || 0);
    return json({
      messages: list.results || [],
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }
    });
  } catch (error) {
    console.error("Admin contact list error", error);
    return json({ error: "Contact messages could not be loaded." }, 500);
  }
}
