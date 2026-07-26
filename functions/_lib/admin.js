import { json } from "./http.js";
import { timingSafeTextEqual } from "./security.js";

export async function requireAdmin(request, env) {
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 20) {
    return json({ error: "The administrator key has not been configured." }, 503);
  }
  const header = request.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!supplied || !(await timingSafeTextEqual(supplied, env.ADMIN_KEY))) {
    return json({ error: "Incorrect administrator key." }, 401, {
      "www-authenticate": "Bearer"
    });
  }
  return null;
}
