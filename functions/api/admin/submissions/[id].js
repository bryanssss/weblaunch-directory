import { requireAdmin } from "../../../_lib/admin.js";
import { json, methodNotAllowed, readJson } from "../../../_lib/http.js";
import { cleanText } from "../../../_lib/security.js";

const ACTIONS = new Set(["approve", "reject", "suspend", "restore", "feature", "unfeature"]);

export async function onRequest(context) {
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  if (!context.env.DB) return json({ error: "The database is not connected yet." }, 503);

  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "Invalid submission ID." }, 400);

  if (context.request.method === "DELETE") {
    try {
      const result = await context.env.DB.prepare("DELETE FROM sites WHERE id = ?1").bind(id).run();
      if (!result.meta?.changes) return json({ error: "Submission not found." }, 404);
      return json({ success: true, message: "The submission was permanently deleted." });
    } catch (error) {
      console.error("Admin delete error", error);
      return json({ error: "The submission could not be deleted." }, 500);
    }
  }

  if (context.request.method !== "PATCH") return methodNotAllowed(["PATCH", "DELETE"]);
  let body;
  try {
    body = await readJson(context.request, 5_000);
  } catch {
    return json({ error: "Invalid action data." }, 400);
  }
  const action = cleanText(body.action).toLowerCase();
  const reason = cleanText(body.reason).slice(0, 300);
  if (!ACTIONS.has(action)) return json({ error: "Invalid moderation action." }, 400);
  const now = new Date().toISOString();

  let statement;
  if (action === "approve") {
    statement = context.env.DB.prepare(`
      UPDATE sites SET status = 'approved', rejection_reason = '', approved_at = COALESCE(approved_at, ?1), updated_at = ?1
      WHERE id = ?2
    `).bind(now, id);
  } else if (action === "reject") {
    statement = context.env.DB.prepare(`
      UPDATE sites SET status = 'rejected', featured = 0, rejection_reason = ?1, updated_at = ?2
      WHERE id = ?3
    `).bind(reason || "Did not meet the directory rules.", now, id);
  } else if (action === "suspend") {
    statement = context.env.DB.prepare(`
      UPDATE sites SET status = 'suspended', featured = 0, rejection_reason = ?1, updated_at = ?2
      WHERE id = ?3
    `).bind(reason || "Listing suspended for review.", now, id);
  } else if (action === "restore") {
    statement = context.env.DB.prepare(`
      UPDATE sites SET status = 'approved', rejection_reason = '', approved_at = COALESCE(approved_at, ?1), updated_at = ?1
      WHERE id = ?2
    `).bind(now, id);
  } else if (action === "feature") {
    statement = context.env.DB.prepare("UPDATE sites SET featured = 1, updated_at = ?1 WHERE id = ?2 AND status = 'approved'").bind(now, id);
  } else {
    statement = context.env.DB.prepare("UPDATE sites SET featured = 0, updated_at = ?1 WHERE id = ?2").bind(now, id);
  }

  try {
    const result = await statement.run();
    if (!result.meta?.changes) return json({ error: "Submission not found, or this action is not allowed for its current status." }, 404);
    return json({ success: true, message: `Action completed: ${action}.` });
  } catch (error) {
    console.error("Admin action error", error);
    return json({ error: "The moderation action failed." }, 500);
  }
}
