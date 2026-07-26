export async function onRequest(context) {
  if (context.request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const origin = (context.env.SITE_URL || new URL(context.request.url).origin).replace(/\/$/, "");
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" }
  });
}
