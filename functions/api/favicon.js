import { methodNotAllowed } from "../_lib/http.js";
import { normalizeWebsiteUrl } from "../_lib/validation.js";

const MAX_ICON_BYTES = 300_000;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon"
]);

function timeoutSignal(milliseconds = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function iconHrefFromHtml(html, baseUrl) {
  const links = String(html).match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    if (!/(?:^|\s)(?:shortcut\s+icon|icon|apple-touch-icon)(?:\s|$)/i.test(rel)) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href || href.startsWith("data:")) continue;
    try { return new URL(href, baseUrl).toString(); } catch { /* ignore */ }
  }
  return "";
}

async function fetchIcon(url, expectedDomain) {
  const timer = timeoutSignal();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: timer.signal,
      headers: {
        "user-agent": "WebLaunchDirectoryBot/1.3 (+favicon proxy)",
        accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,image/x-icon,*/*;q=0.4"
      }
    });
    if (!response.ok) return null;
    const finalUrl = new URL(response.url);
    const finalDomain = finalUrl.hostname.toLowerCase().replace(/^www\./, "");
    if (finalDomain !== expectedDomain) return null;

    const length = Number(response.headers.get("content-length") || 0);
    if (length && length > MAX_ICON_BYTES) return null;
    const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.has(contentType) && !/\.ico(?:$|\?)/i.test(finalUrl.pathname)) return null;

    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_ICON_BYTES) return null;
    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": ALLOWED_TYPES.has(contentType) ? contentType : "image/x-icon",
        "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
        "x-content-type-options": "nosniff"
      }
    });
  } catch {
    return null;
  } finally {
    timer.clear();
  }
}

async function discoverIcon(homeUrl, expectedDomain) {
  const timer = timeoutSignal();
  try {
    const response = await fetch(homeUrl, {
      redirect: "follow",
      signal: timer.signal,
      headers: {
        "user-agent": "WebLaunchDirectoryBot/1.3 (+favicon discovery)",
        accept: "text/html,application/xhtml+xml"
      }
    });
    if (!response.ok) return "";
    const finalDomain = new URL(response.url).hostname.toLowerCase().replace(/^www\./, "");
    if (finalDomain !== expectedDomain) return "";
    const html = (await response.text()).slice(0, 180_000);
    const href = iconHrefFromHtml(html, response.url);
    if (!href) return "";
    const iconDomain = new URL(href).hostname.toLowerCase().replace(/^www\./, "");
    return iconDomain === expectedDomain ? href : "";
  } catch {
    return "";
  } finally {
    timer.clear();
  }
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const requestUrl = new URL(context.request.url);

  let website;
  try {
    website = normalizeWebsiteUrl(`https://${requestUrl.searchParams.get("domain") || ""}/`);
  } catch {
    return new Response(null, { status: 404, headers: { "cache-control": "public, max-age=300" } });
  }

  const cache = globalThis.caches?.default;
  const cacheKey = new Request(`${requestUrl.origin}/api/favicon?domain=${encodeURIComponent(website.normalisedDomain)}`);
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const candidates = [
    `https://${website.hostname}/favicon.ico`,
    `https://${website.hostname}/apple-touch-icon.png`,
    `https://${website.hostname}/favicon.png`
  ];
  const discovered = await discoverIcon(website.url, website.normalisedDomain);
  if (discovered) candidates.unshift(discovered);

  for (const candidate of [...new Set(candidates)]) {
    const icon = await fetchIcon(candidate, website.normalisedDomain);
    if (!icon) continue;
    if (cache) context.waitUntil(cache.put(cacheKey, icon.clone()));
    return icon;
  }

  return new Response(null, {
    status: 404,
    headers: { "cache-control": "public, max-age=1800", "x-content-type-options": "nosniff" }
  });
}
