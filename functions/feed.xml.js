import { xmlEscape } from "./_lib/security.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const origin = (context.env.SITE_URL || new URL(context.request.url).origin).replace(/\/$/, "");
  const name = context.env.SITE_NAME || "WebLaunch Directory";
  let sites = [];
  if (context.env.DB) {
    try {
      const result = await context.env.DB.prepare(`
        SELECT name, slug, description, category, approved_at
        FROM sites WHERE status = 'approved' ORDER BY approved_at DESC LIMIT 50
      `).all();
      sites = result.results || [];
    } catch (error) {
      console.error("Feed database error", error);
    }
  }
  const items = sites.map((site) => `
    <item>
      <title>${xmlEscape(site.name)}</title>
      <link>${xmlEscape(`${origin}/site/${site.slug}`)}</link>
      <guid>${xmlEscape(`${origin}/site/${site.slug}`)}</guid>
      <description>${xmlEscape(site.description)}</description>
      <category>${xmlEscape(site.category)}</category>
      <pubDate>${new Date(site.approved_at || Date.now()).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xmlEscape(name)}</title><link>${xmlEscape(origin)}</link><description>Recently added independent websites that passed automated checks.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}
