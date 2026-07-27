import { api, clearNotice, getConfig, qs, setNotice } from "./common.js?v=1.4.0";

const form = qs("#contact-form");
const notice = qs("#contact-notice");
const submitButton = qs("#contact-submit");
const turnstileContainer = qs("#contact-turnstile");
const contextPanel = qs("#contact-listing-context");
const params = new URLSearchParams(location.search);
let widgetId = null;

const listing = {
  id: params.get("listingId") || "",
  name: params.get("listingName") || "",
  domain: params.get("listingDomain") || "",
  path: params.get("path") || ""
};

function resetTurnstile() {
  if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
}

function fillListingContext() {
  if (!listing.id && !listing.name && !listing.domain && !listing.path) return;
  contextPanel.classList.remove("hidden");
  const parts = [];
  if (listing.name) parts.push(listing.name);
  if (listing.domain) parts.push(listing.domain);
  contextPanel.querySelector("strong").textContent = parts.join(" — ") || "Listing report";
  contextPanel.querySelector("span").textContent = "The listing reference will be included privately with your message.";
  qs("#subject").value = listing.domain ? `Problem with listing: ${listing.domain}` : "Problem with a directory listing";
}

async function initialise() {
  fillListingContext();
  try {
    const config = await getConfig();
    if (!config.turnstileSiteKey) {
      setNotice(notice, "The contact form is temporarily unavailable because anti-spam protection is not configured.", "warning");
      submitButton.disabled = true;
      return;
    }
    if (!config.contactEnabled) {
      setNotice(notice, "The private email connection is not finished yet. The site owner needs to complete the one-time Email Service setup.", "warning");
      submitButton.disabled = true;
      return;
    }
    const renderWidget = () => {
      widgetId = window.turnstile.render(turnstileContainer, {
        sitekey: config.turnstileSiteKey,
        theme: "dark",
        action: "contact"
      });
    };
    if (window.turnstile) renderWidget();
    else window.addEventListener("load", renderWidget, { once: true });
  } catch (error) {
    setNotice(notice, error.message, "error");
    submitButton.disabled = true;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearNotice(notice);
  const token = window.turnstile && widgetId !== null ? window.turnstile.getResponse(widgetId) : "";
  if (!token) {
    setNotice(notice, "Please complete the anti-spam check.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending message…";
  const data = new FormData(form);
  try {
    const result = await api("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        subject: data.get("subject"),
        message: data.get("message"),
        company: data.get("company"),
        listingId: listing.id,
        listingName: listing.name,
        listingDomain: listing.domain,
        listingPath: listing.path,
        turnstileToken: token
      })
    });
    form.reset();
    fillListingContext();
    setNotice(notice, result.message, "success");
    resetTurnstile();
    notice.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    setNotice(notice, error.message, "error");
    resetTurnstile();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
  }
});

initialise();
