import { json, methodNotAllowed } from "../../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);
  const slug = String(context.params.slug || "").toLowerCase();
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return json({ error: "Listing not found." }, 404);
  try {
    const site = await context.env.DB.prepare(`
      SELECT id, name, slug, url, normalized_domain, description, category, featured, approved_at
      FROM sites WHERE slug = ?1 AND status = 'approved' LIMIT 1
    `).bind(slug).first();
    if (!site) return json({ error: "Listing not found." }, 404);
    return json({ site }, 200);
  } catch (error) {
    console.error("Read site error", error);
    return json({ error: "The listing could not be loaded." }, 500);
  }
}
