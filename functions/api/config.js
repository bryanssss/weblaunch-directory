import { CATEGORIES, REPORT_REASONS, SITE_NAME, SUBMISSIONS_PER_DAY } from "../_lib/constants.js";
import { json, methodNotAllowed, publicCache } from "../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  return json({
    siteName: context.env.SITE_NAME || SITE_NAME,
    turnstileSiteKey: context.env.TURNSTILE_SITE_KEY || "",
    categories: CATEGORIES,
    reportReasons: REPORT_REASONS,
    submissionsPerDay: SUBMISSIONS_PER_DAY,
    contactEnabled: Boolean(context.env.CONTACT_EMAIL && context.env.CONTACT_TO_EMAIL && context.env.CONTACT_FROM_EMAIL)
  }, 200, publicCache(300));
}
