export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

export function methodNotAllowed(allowed) {
  return json({ error: "Method not allowed." }, 405, { allow: allowed.join(", ") });
}

export async function readJson(request, maxBytes = 20_000) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function publicCache(seconds = 60) {
  return { "cache-control": `public, max-age=${seconds}, s-maxage=${seconds}` };
}
