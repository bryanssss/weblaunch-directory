import { requireAdmin } from "../../../_lib/admin.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { cleanText } from "../../../_lib/security.js";

const ALLOWED_STATUSES = new Set(["pending", "approved", "rejected", "suspended", "all"]);

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const url = new URL(context.request.url);
  const status = ALLOWED_STATUSES.has(url.searchParams.get("status")) ? url.searchParams.get("status") : "approved";
  const query = cleanText(url.searchParams.get("q")).slice(0, 100);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.max(1, Math.min(50, Number.parseInt(url.searchParams.get("limit") || "20", 10) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  const binds = [];
  if (status !== "all") {
    conditions.push("s.status = ?");
    binds.push(status);
  }
  if (query) {
    conditions.push("(s.name LIKE ? OR s.normalized_domain LIKE ? OR s.description LIKE ?)");
    const like = `%${query}%`;
    binds.push(like, like, like);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const listStatement = context.env.DB.prepare(`
      SELECT s.id, s.name, s.slug, s.url, s.normalized_domain, s.description, s.category,
             s.status, s.featured, s.rejection_reason, s.report_count, s.created_at,
             s.updated_at, s.approved_at,
             (SELECT COUNT(*) FROM reports r WHERE r.site_id = s.id) AS reports
      FROM sites s
      ${where}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...binds, limit, offset);
    const countBase = context.env.DB.prepare(`SELECT COUNT(*) AS total FROM sites s ${where}`);
    const countStatement = binds.length ? countBase.bind(...binds) : countBase;
    const [list, count] = await context.env.DB.batch([listStatement, countStatement]);
    const total = Number(count.results?.[0]?.total || 0);
    return json({
      submissions: list.results || [],
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }
    });
  } catch (error) {
    console.error("Admin list error", error);
    return json({ error: "Submissions could not be loaded." }, 500);
  }
}
