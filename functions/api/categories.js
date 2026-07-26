import { CATEGORIES } from "../_lib/constants.js";
import { json, methodNotAllowed, publicCache } from "../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);
  try {
    const result = await context.env.DB.prepare(`
      SELECT category, COUNT(*) AS count
      FROM sites WHERE status = 'approved'
      GROUP BY category
    `).all();
    const countMap = new Map((result.results || []).map((row) => [row.category, Number(row.count)]));
    return json({
      categories: CATEGORIES.map((name) => ({ name, count: countMap.get(name) || 0 }))
    }, 200, publicCache(120));
  } catch (error) {
    console.error("Categories error", error);
    return json({ error: "Categories could not be loaded." }, 500);
  }
}
