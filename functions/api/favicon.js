import { methodNotAllowed } from "../_lib/http.js";
import { normalizeWebsiteUrl } from "../_lib/validation.js";

const MAX_ICON_BYTES = 500_000;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon"
]);

function timeoutSignal(milliseconds = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function cleanDomain(hostname) {
  return String(hostname || "").toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}

function safePublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = cleanDomain(url.hostname);
    if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
    if (/^(?:10|127|169\.254|192\.168)\./.test(host)) return null;
    const octets = host.split(".").map(Number);
    if (octets.length === 4 && octets.every(Number.isFinite)) {
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return null;
      if (octets[0] === 0 || octets[0] >= 224) return null;
    }
    return url;
  } catch {
    return null;
  }
}

function iconHrefFromHtml(html, baseUrl) {
  const links = String(html).match(/<link\b[^>]*>/gi) || [];
  const preferred = [];
  for (const tag of links) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    if (!/(?:^|\s)(?:shortcut\s+icon|icon|apple-touch-icon|mask-icon)(?:\s|$)/i.test(rel)) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href || href.startsWith("data:")) continue;
    try {
      const absolute = new URL(href, baseUrl).toString();
      const sizes = tag.match(/\bsizes\s*=\s*["']([^"']+)["']/i)?.[1] || "";
      preferred.push({ absolute, score: /192|180|128|96|64|48|32/i.test(sizes) ? 2 : 1 });
    } catch { /* ignore malformed icon */ }
  }
  preferred.sort((a, b) => b.score - a.score);
  return preferred[0]?.absolute || "";
}

async function fetchIcon(value, { expectedDomain = "", allowExternal = false } = {}) {
  const requestedUrl = safePublicHttpsUrl(value);
  if (!requestedUrl) return null;
  const timer = timeoutSignal();
  try {
    const response = await fetch(requestedUrl, {
      redirect: "follow",
      signal: timer.signal,
      headers: {
        "user-agent": "WebLaunchDirectoryBot/1.4 (+favicon proxy)",
        accept: "image/avif,image/webp,image/svg+xml,image/png,image/jpeg,image/gif,image/x-icon,*/*;q=0.3"
      }
    });
    if (!response.ok) return null;
    const finalUrl = safePublicHttpsUrl(response.url);
    if (!finalUrl) return null;
    if (!allowExternal && cleanDomain(finalUrl.hostname) !== expectedDomain) return null;

    const length = Number(response.headers.get("content-length") || 0);
    if (length && length > MAX_ICON_BYTES) return null;
    const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const iconExtension = /\.(?:ico|png|jpe?g|webp|gif|svg|avif)(?:$|\?)/i.test(finalUrl.pathname);
    if (!ALLOWED_TYPES.has(contentType) && !iconExtension) return null;

    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_ICON_BYTES) return null;
    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": ALLOWED_TYPES.has(contentType) ? contentType : "image/png",
        "cache-control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=2592000",
        "x-content-type-options": "nosniff",
        "access-control-allow-origin": "*"
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
        "user-agent": "WebLaunchDirectoryBot/1.4 (+favicon discovery)",
        accept: "text/html,application/xhtml+xml"
      }
    });
    if (!response.ok) return "";
    const finalUrl = safePublicHttpsUrl(response.url);
    if (!finalUrl || cleanDomain(finalUrl.hostname) !== expectedDomain) return "";
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) return "";
    const html = (await response.text()).slice(0, 220_000);
    return iconHrefFromHtml(html, response.url);
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
  const cacheKey = new Request(`${requestUrl.origin}/api/favicon?domain=${encodeURIComponent(website.normalisedDomain)}&v=2`);
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const discovered = await discoverIcon(website.url, website.normalisedDomain);
  const candidates = [
    discovered,
    `https://${website.hostname}/favicon.ico`,
    `https://${website.hostname}/apple-touch-icon.png`,
    `https://${website.hostname}/favicon.png`,
    `https://${website.hostname}/favicon.svg`
  ].filter(Boolean);

  for (const candidate of [...new Set(candidates)]) {
    const icon = await fetchIcon(candidate, {
      expectedDomain: website.normalisedDomain,
      allowExternal: candidate === discovered
    });
    if (!icon) continue;
    if (cache) context.waitUntil(cache.put(cacheKey, icon.clone()));
    return icon;
  }

  // Final reliable fallback: Google returns the public favicon for the domain.
  const googleFallback = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(website.url)}&sz=128`;
  const icon = await fetchIcon(googleFallback, { allowExternal: true });
  if (icon) {
    if (cache) context.waitUntil(cache.put(cacheKey, icon.clone()));
    return icon;
  }

  return new Response(null, {
    status: 404,
    headers: { "cache-control": "public, max-age=1800", "x-content-type-options": "nosniff" }
  });
}
