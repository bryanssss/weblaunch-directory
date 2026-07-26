import { BLOCKED_SHORTENERS, CATEGORIES, REPORT_REASONS } from "./constants.js";
import { cleanText } from "./security.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HOST_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function isBlockedIpLiteral(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host.includes(":")) {
    return host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
  }
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
  const octets = host.split(".").map(Number);
  if (octets.some((n) => n < 0 || n > 255)) return true;
  return (
    octets[0] === 10 || octets[0] === 127 || octets[0] === 0 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    octets[0] >= 224
  );
}

export function normalizeWebsiteUrl(input) {
  const raw = cleanText(input);
  if (!raw) throw new Error("Enter your website address.");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Enter a complete address beginning with https://");
  }
  if (parsed.protocol !== "https:") throw new Error("Only secure https:// websites are accepted.");
  if (parsed.username || parsed.password) throw new Error("Website addresses containing a username or password are not accepted.");
  if (parsed.port && parsed.port !== "443") throw new Error("Custom ports are not accepted.");
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (["localhost", "localhost.localdomain"].includes(hostname) || hostname.endsWith(".local")) {
    throw new Error("Local or private websites are not accepted.");
  }
  if (isBlockedIpLiteral(hostname)) throw new Error("IP-address links are not accepted.");
  if (!HOST_RE.test(hostname)) throw new Error("Enter a normal public domain name, such as example.com.");
  const normalisedDomain = hostname.replace(/^www\./, "");
  if (BLOCKED_SHORTENERS.has(normalisedDomain)) throw new Error("URL shorteners are not accepted.");
  if (parsed.search || parsed.hash) throw new Error("Tracking, affiliate and referral parameters are not accepted.");
  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error("Submit the main homepage only, not an article, product or internal page.");
  }
  return {
    url: `https://${hostname}/`,
    hostname,
    normalisedDomain
  };
}

export function slugFromDomain(domain) {
  return domain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export function validateSubmission(body) {
  const name = cleanText(body.name);
  const description = cleanText(body.description);
  const category = cleanText(body.category);
  const email = cleanText(body.email).toLowerCase();
  if (cleanText(body.company)) throw new Error("Spam protection rejected this submission.");
  if (name.length < 2 || name.length > 80) throw new Error("Website name must be between 2 and 80 characters.");
  if (description.length < 50 || description.length > 350) throw new Error("Description must be between 50 and 350 characters.");
  if (!CATEGORIES.includes(category)) throw new Error("Choose a valid category.");
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new Error("Enter a valid email address.");
  if (body.ownership !== true) throw new Error("Confirm that you own or officially represent the website.");
  if (body.rules !== true) throw new Error("You must agree to the submission rules.");
  const website = normalizeWebsiteUrl(body.url);
  return { name, description, category, email, website };
}

export function validateReport(body) {
  const reason = cleanText(body.reason);
  const details = cleanText(body.details);
  if (cleanText(body.company)) throw new Error("Spam protection rejected this report.");
  if (!Number.isInteger(Number(body.siteId)) || Number(body.siteId) <= 0) throw new Error("Invalid website listing.");
  if (!REPORT_REASONS.includes(reason)) throw new Error("Choose a valid report reason.");
  if (details.length > 300) throw new Error("Report details must be 300 characters or fewer.");
  return { siteId: Number(body.siteId), reason, details };
}

async function fetchWithTimeout(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    return await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "WebLaunchDirectoryBot/1.0 (+website directory validation)",
        accept: "text/html,application/xhtml+xml"
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function inspectHomepage(startUrl) {
  let current = normalizeWebsiteUrl(startUrl);
  for (let hop = 0; hop <= 3; hop += 1) {
    let response;
    try {
      response = await fetchWithTimeout(current.url, "HEAD");
      if ([403, 405].includes(response.status)) response = await fetchWithTimeout(current.url, "GET");
    } catch {
      throw new Error("We could not reach this website. Check that it is online and try again.");
    }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The website returned a broken redirect.");
      const nextAbsolute = new URL(location, current.url).toString();
      const next = normalizeWebsiteUrl(nextAbsolute);
      if (next.normalisedDomain !== current.normalisedDomain) {
        throw new Error("The website redirects to a different domain, so it cannot be accepted automatically.");
      }
      current = next;
      continue;
    }
    if (response.status >= 400) throw new Error(`The website returned an error (${response.status}).`);
    if (response.status < 200 || response.status >= 400) throw new Error("The website did not return a normal page response.");
    return { ...current, status: response.status };
  }
  throw new Error("The website uses too many redirects.");
}
