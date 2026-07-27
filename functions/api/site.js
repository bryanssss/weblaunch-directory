import { json, methodNotAllowed } from "../_lib/http.js";

const SELECT_SITE = `
  SELECT id, name, slug, url, normalized_domain, description, category, featured, approved_at
  FROM sites
`;

function canonicalPath(site) {
  return `/site.html?domain=${encodeURIComponent(site.normalized_domain)}`;
}

function cleanKey(value) {
  return String(value || "").trim().toLowerCase();
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const url = new URL(context.request.url);
  const id = Number.parseInt(url.searchParams.get("id") || "", 10);
  const key = cleanKey(url.searchParams.get("key"));
  const domain = cleanKey(url.searchParams.get("domain"));

  if ((!Number.isInteger(id) || id <= 0) && !key && !domain) {
    return json({ error: "Listing not found." }, 404);
  }

  try {
    let site = null;

    if (Number.isInteger(id) && id > 0) {
      site = await context.env.DB.prepare(`${SELECT_SITE}
        WHERE id = ?1 AND status = 'approved' LIMIT 1
      `).bind(id).first();
    }

    if (!site && domain && /^[a-z0-9.-]{1,253}$/.test(domain)) {
      site = await context.env.DB.prepare(`${SELECT_SITE}
        WHERE LOWER(normalized_domain) = ?1 AND status = 'approved' LIMIT 1
      `).bind(domain.replace(/^www\./, "")).first();
    }

    if (!site && key && /^[a-z0-9.-]{1,180}$/.test(key)) {
      const idMatch = key.match(/^(\d+)(?:-|$)/);
      if (idMatch) {
        site = await context.env.DB.prepare(`${SELECT_SITE}
          WHERE id = ?1 AND status = 'approved' LIMIT 1
        `).bind(Number(idMatch[1])).first();
      }

      if (!site) {
        site = await context.env.DB.prepare(`${SELECT_SITE}
          WHERE status = 'approved' AND (
            LOWER(slug) = ?1 OR
            LOWER(normalized_domain) = ?1 OR
            REPLACE(LOWER(normalized_domain), '.', '-') = ?1
          )
          LIMIT 1
        `).bind(key).first();
      }
    }

    if (!site) return json({ error: "Listing not found." }, 404);
    return json({ site, canonicalPath: canonicalPath(site) }, 200);
  } catch (error) {
    console.error("Read exact site error", error);
    return json({ error: "The listing could not be loaded." }, 500);
  }
}
