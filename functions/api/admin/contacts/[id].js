import { requireAdmin } from "../../../_lib/admin.js";
import { ensureContactInboxTables } from "../../../_lib/contact-inbox.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { cleanText } from "../../../_lib/security.js";

const ACTIONS = new Set(["resolve", "reopen"]);

export async function onRequest(context) {
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "Invalid contact message ID." }, 400);

  try {
    await ensureContactInboxTables(context.env.DB);
  } catch {
    return json({ error: "The private contact inbox is unavailable." }, 500);
  }

  if (context.request.method === "DELETE") {
    try {
      const result = await context.env.DB.prepare("DELETE FROM contact_messages WHERE id = ?1").bind(id).run();
      if (!result.meta?.changes) return json({ error: "Contact message not found." }, 404);
      return json({ success: true, message: "The contact message was permanently deleted." });
    } catch (error) {
      console.error("Admin contact delete error", error);
      return json({ error: "The contact message could not be deleted." }, 500);
    }
  }

  if (context.request.method !== "PATCH") return methodNotAllowed(["PATCH", "DELETE"]);
  let body;
  try {
    body = await readJson(context.request, 5_000);
  } catch {
    return json({ error: "Invalid contact action data." }, 400);
  }

  const action = cleanText(body.action).toLowerCase();
  if (!ACTIONS.has(action)) return json({ error: "Invalid contact action." }, 400);
  const now = new Date().toISOString();
  const statement = action === "resolve"
    ? context.env.DB.prepare("UPDATE contact_messages SET status = 'resolved', resolved_at = ?1 WHERE id = ?2").bind(now, id)
    : context.env.DB.prepare("UPDATE contact_messages SET status = 'open', resolved_at = NULL WHERE id = ?1").bind(id);

  try {
    const result = await statement.run();
    if (!result.meta?.changes) return json({ error: "Contact message not found." }, 404);
    return json({ success: true, message: action === "resolve" ? "The message was marked as resolved." : "The message was reopened." });
  } catch (error) {
    console.error("Admin contact action error", error);
    return json({ error: "The contact action failed." }, 500);
  }
}
