import { json, methodNotAllowed } from "../../_lib/http.js";

const SELECT_SITE = `
  SELECT id, name, slug, url, normalized_domain, description, category, featured, approved_at
  FROM sites
`;

function cleanListingKey(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalPath(site) {
  return `/site.html?domain=${encodeURIComponent(site.normalized_domain)}`;
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const key = cleanListingKey(context.params.slug);
  if (!/^[a-z0-9.-]{1,180}$/.test(key)) return json({ error: "Listing not found." }, 404);

  try {
    let site = null;
    const idMatch = key.match(/^(\d+)(?:-|$)/);

    // New listing links begin with the database ID. The ID remains stable even
    // if a slug is corrected later, so this is the most reliable lookup.
    if (idMatch) {
      site = await context.env.DB.prepare(`${SELECT_SITE}
        WHERE id = ?1 AND status = 'approved' LIMIT 1
      `).bind(Number(idMatch[1])).first();
    }

    // Keep all older /site/domain-com links working. The second condition also
    // repairs rows whose stored slug differs from the normalised domain slug.
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

    if (!site) return json({ error: "Listing not found." }, 404);
    return json({ site, canonicalPath: canonicalPath(site) }, 200);
  } catch (error) {
    console.error("Read site error", error);
    return json({ error: "The listing could not be loaded." }, 500);
  }
}
