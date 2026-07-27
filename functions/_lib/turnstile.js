export async function verifyTurnstile(token, secret, remoteIp, expectedAction = "") {
  if (!secret) throw new Error("TURNSTILE_NOT_CONFIGURED");
  if (!token) return false;

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteIp && remoteIp !== "0.0.0.0") form.set("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  if (!response.ok) return false;

  const result = await response.json();
  if (result.success !== true) return false;
  if (expectedAction && result.action && result.action !== expectedAction) return false;
  return true;
}
