import { xmlEscape } from "./_lib/security.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const origin = (context.env.SITE_URL || new URL(context.request.url).origin).replace(/\/$/, "");
  const staticPages = ["/", "/submit.html", "/categories.html", "/rules.html", "/about.html", "/privacy.html", "/terms.html"];
  let sites = [];
  if (context.env.DB) {
    try {
      const result = await context.env.DB.prepare("SELECT slug, updated_at FROM sites WHERE status = 'approved' ORDER BY approved_at DESC LIMIT 5000").all();
      sites = result.results || [];
    } catch (error) {
      console.error("Sitemap database error", error);
    }
  }
  const items = [
    ...staticPages.map((path) => `<url><loc>${xmlEscape(origin + path)}</loc></url>`),
    ...sites.map((site) => `<url><loc>${xmlEscape(`${origin}/site/${site.slug}`)}</loc><lastmod>${xmlEscape(String(site.updated_at || "").slice(0, 10))}</lastmod></url>`)
  ].join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" }
  });
}
