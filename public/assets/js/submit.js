import { api, clearNotice, enhanceSelect, getConfig, qs, setNotice } from "./common.js";

const form = qs("#submission-form");
const notice = qs("#form-notice");
const submitButton = qs("#submit-button");
const category = qs("#category");
const description = qs("#description");
const counter = qs("#description-count");
const turnstileContainer = qs("#turnstile-container");
let widgetId = null;

function resetTurnstile() {
  if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
}

async function initialise() {
  try {
    const config = await getConfig();
    category.innerHTML = '<option value="">Choose a category</option>';
    config.categories.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      category.append(option);
    });
    enhanceSelect(category);
    if (!config.turnstileSiteKey) {
      setNotice(notice, "The site owner has not connected Turnstile yet, so submissions are temporarily disabled.", "warning");
      submitButton.disabled = true;
      return;
    }
    const renderWidget = () => {
      widgetId = window.turnstile.render(turnstileContainer, {
        sitekey: config.turnstileSiteKey,
        theme: "dark",
        action: "submit-site"
      });
    };
    if (window.turnstile) renderWidget();
    else window.addEventListener("load", renderWidget, { once: true });
  } catch (error) {
    setNotice(notice, error.message, "error");
    submitButton.disabled = true;
  }
}

description.addEventListener("input", () => { counter.textContent = `${description.value.length}/350`; });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearNotice(notice);
  const token = window.turnstile && widgetId !== null ? window.turnstile.getResponse(widgetId) : "";
  if (!token) {
    setNotice(notice, "Please complete the anti-spam check.", "error");
    return;
  }
  submitButton.disabled = true;
  submitButton.textContent = "Running automatic checks…";
  const data = new FormData(form);
  const payload = {
    name: data.get("name"),
    url: data.get("url"),
    email: data.get("email"),
    category: data.get("category"),
    description: data.get("description"),
    ownership: data.get("ownership") === "on",
    rules: data.get("rules") === "on",
    company: data.get("company"),
    turnstileToken: token
  };
  try {
    const result = await api("/api/submit", { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    counter.textContent = "0/350";
    setNotice(notice, result.message, "success");
    if (result.path || result.slug) {
      const liveLink = document.createElement("a");
      liveLink.className = "notice-link";
      liveLink.href = result.path || `/site/${encodeURIComponent(result.slug)}`;
      liveLink.textContent = "View the live listing →";
      notice.append(document.createElement("br"), liveLink);
    }
    resetTurnstile();
    notice.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    setNotice(notice, error.message, "error");
    resetTurnstile();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Check and publish website";
  }
});

initialise();
