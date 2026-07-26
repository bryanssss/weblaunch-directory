import { requireAdmin } from "../../_lib/admin.js";
import { json, methodNotAllowed } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  try {
    const [statuses, reports, featured] = await context.env.DB.batch([
      context.env.DB.prepare("SELECT status, COUNT(*) AS count FROM sites GROUP BY status"),
      context.env.DB.prepare("SELECT COUNT(*) AS count FROM reports"),
      context.env.DB.prepare("SELECT COUNT(*) AS count FROM sites WHERE status = 'approved' AND featured = 1")
    ]);
    const statusMap = Object.fromEntries((statuses.results || []).map((row) => [row.status, Number(row.count)]));
    return json({
      pending: statusMap.pending || 0,
      approved: statusMap.approved || 0,
      rejected: statusMap.rejected || 0,
      suspended: statusMap.suspended || 0,
      featured: Number(featured.results?.[0]?.count || 0),
      reports: Number(reports.results?.[0]?.count || 0)
    });
  } catch (error) {
    console.error("Admin stats error", error);
    return json({ error: "Statistics could not be loaded." }, 500);
  }
}
