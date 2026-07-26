import { requireAdmin } from "../../_lib/admin.js";
import { json, methodNotAllowed } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);
  const url = new URL(context.request.url);
  const siteId = Number(url.searchParams.get("siteId") || 0);
  if (!Number.isInteger(siteId) || siteId <= 0) return json({ error: "Invalid listing ID." }, 400);
  try {
    const result = await context.env.DB.prepare(`
      SELECT r.id, r.reason, r.details, r.created_at, s.name AS site_name
      FROM reports r JOIN sites s ON s.id = r.site_id
      WHERE r.site_id = ?1 ORDER BY r.created_at DESC LIMIT 100
    `).bind(siteId).all();
    return json({ reports: result.results || [] });
  } catch (error) {
    console.error("Admin reports error", error);
    return json({ error: "Reports could not be loaded." }, 500);
  }
}
