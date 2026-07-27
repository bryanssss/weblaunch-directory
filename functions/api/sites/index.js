import { CATEGORIES } from "../../_lib/constants.js";
import { json, methodNotAllowed } from "../../_lib/http.js";
import { cleanText } from "../../_lib/security.js";

function normaliseDomain(value) {
  return cleanText(value).toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const url = new URL(context.request.url);
  const query = cleanText(url.searchParams.get("q")).slice(0, 100);
  const category = cleanText(url.searchParams.get("category"));
  const exactDomain = normaliseDomain(url.searchParams.get("domain"));
  const exactId = Number.parseInt(url.searchParams.get("id") || "", 10);
  const featured = url.searchParams.get("featured") === "1";
  const page = Math.max(1, Math.min(1000, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const limit = Math.max(1, Math.min(24, Number.parseInt(url.searchParams.get("limit") || "12", 10) || 12));
  const offset = (page - 1) * limit;

  const conditions = ["status = 'approved'"];
  const bindings = [];

  if (Number.isInteger(exactId) && exactId > 0) {
    conditions.push("id = ?");
    bindings.push(exactId);
  }
  if (exactDomain && /^[a-z0-9.-]{1,253}$/.test(exactDomain)) {
    conditions.push("LOWER(normalized_domain) = ?");
    bindings.push(exactDomain);
  }
  if (category && CATEGORIES.includes(category)) {
    conditions.push("category = ?");
    bindings.push(category);
  }
  if (query) {
    conditions.push("(name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR normalized_domain LIKE ? ESCAPE '\\')");
    const escaped = query.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
    const like = `%${escaped}%`;
    bindings.push(like, like, like);
  }
  if (featured) conditions.push("featured = 1");

  const where = conditions.join(" AND ");
  const listSql = `
    SELECT id, name, slug, url, normalized_domain, description, category, featured, approved_at
    FROM sites
    WHERE ${where}
    ORDER BY featured DESC, approved_at DESC, id DESC
    LIMIT ? OFFSET ?
  `;
  const countSql = `SELECT COUNT(*) AS total FROM sites WHERE ${where}`;

  try {
    const listStatement = context.env.DB.prepare(listSql).bind(...bindings, limit, offset);
    const countBase = context.env.DB.prepare(countSql);
    const countStatement = bindings.length ? countBase.bind(...bindings) : countBase;
    const [listResult, countResult] = await context.env.DB.batch([listStatement, countStatement]);
    const total = Number(countResult.results?.[0]?.total || 0);
    return json({
      sites: listResult.results || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    }, 200);
  } catch (error) {
    console.error("List sites error", error);
    return json({ error: "Listings could not be loaded." }, 500);
  }
}
