import { json, methodNotAllowed } from "../_lib/http.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const checks = {
    database: Boolean(context.env.DB),
    turnstileSiteKey: Boolean(context.env.TURNSTILE_SITE_KEY),
    turnstileSecret: Boolean(context.env.TURNSTILE_SECRET_KEY),
    adminKey: Boolean(context.env.ADMIN_KEY && context.env.ADMIN_KEY.length >= 20),
    ipHashSalt: Boolean(context.env.IP_HASH_SALT && context.env.IP_HASH_SALT.length >= 16)
  };
  const contact = {
    emailBinding: Boolean(context.env.CONTACT_EMAIL),
    recipient: Boolean(context.env.CONTACT_TO_EMAIL),
    sender: Boolean(context.env.CONTACT_FROM_EMAIL)
  };
  const ready = Object.values(checks).every(Boolean);
  return json({ ready, checks, contact: { ready: Object.values(contact).every(Boolean), checks: contact } }, ready ? 200 : 503);
}
