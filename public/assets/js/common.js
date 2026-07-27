export const state = { config: null };

export async function getConfig() {
  if (state.config) return state.config;
  const response = await fetch("/api/config");
  if (!response.ok) throw new Error("Site configuration could not be loaded.");
  state.config = await response.json();
  return state.config;
}

export async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  let data = {};
  try { data = await response.json(); } catch { /* no JSON */ }
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export function qs(selector, root = document) { return root.querySelector(selector); }
export function qsa(selector, root = document) { return [...root.querySelectorAll(selector)]; }

export function formatDate(value) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function initial(name) {
  return String(name || "W").trim().charAt(0).toUpperCase();
}

export function categorySlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function create(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}


export function siteIcon(site, extraClass = "") {
  const wrapper = create("div", `site-initial site-icon ${extraClass}`.trim());
  const fallback = create("span", "site-icon-fallback", initial(site?.name));
  const image = create("img", "site-favicon");
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "no-referrer";
  image.src = `/api/favicon?domain=${encodeURIComponent(site?.normalized_domain || "")}`;
  image.addEventListener("load", () => wrapper.classList.add("has-favicon"), { once: true });
  image.addEventListener("error", () => image.remove(), { once: true });
  wrapper.append(fallback, image);
  return wrapper;
}

export function listingPath(site) {
  const domain = String(site?.normalized_domain || "").trim().toLowerCase().replace(/^www\./, "");
  if (domain) return `/site.html?domain=${encodeURIComponent(domain)}`;
  const id = Number(site?.id || 0);
  if (Number.isInteger(id) && id > 0) return `/site.html?id=${id}`;
  return "/categories.html";
}

export function siteCard(site) {
  const article = create("article", "site-card");
  const top = create("div", "site-card-top");
  top.append(siteIcon(site));
  const titleWrap = create("div");
  const listingHref = listingPath(site);
  const title = create("h3");
  const titleLink = create("a", "site-title-link", site.name);
  titleLink.href = listingHref;
  title.append(titleLink);
  const domain = create("div", "domain", site.normalized_domain);
  titleWrap.append(title, domain);
  top.append(titleWrap);

  const description = create("p", "", site.description);
  const footer = create("div", "site-card-footer");
  const badge = create("a", "badge", site.category);
  badge.href = `/category/${categorySlug(site.category)}`;
  const link = create("a", "arrow-link", "View listing →");
  link.href = listingHref;
  link.setAttribute("aria-label", `View ${site.name}`);
  footer.append(badge, link);
  article.append(top, description, footer);
  if (Number(site.featured) === 1) {
    const featured = create("span", "badge featured", "★ Featured");
    article.insertBefore(featured, description);
    featured.style.marginBottom = "14px";
  }
  return article;
}

export function setNotice(element, message, type = "") {
  element.className = `notice ${type}`.trim();
  element.textContent = message;
  element.classList.remove("hidden");
}

export function clearNotice(element) {
  element.textContent = "";
  element.className = "notice hidden";
}

const enhancedSelects = new Set();

function closeCustomSelect(select) {
  const control = select?._customSelect;
  if (!control) return;
  control.wrapper.classList.remove("open", "open-up");
  control.button.setAttribute("aria-expanded", "false");
}

function closeOtherSelects(except) {
  enhancedSelects.forEach((select) => {
    if (select !== except) closeCustomSelect(select);
  });
}

export function enhanceSelect(select) {
  if (!select || select.dataset.customSelectReady === "true") return select?._customSelect;
  select.dataset.customSelectReady = "true";
  select.classList.add("select-native");

  const wrapper = create("div", "custom-select");
  select.parentNode.insertBefore(wrapper, select);
  wrapper.append(select);

  const button = create("button", "custom-select-button");
  button.type = "button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  const buttonText = create("span", "custom-select-value");
  const arrow = create("span", "custom-select-arrow");
  arrow.setAttribute("aria-hidden", "true");
  button.append(buttonText, arrow);

  const menu = create("div", "custom-select-menu hidden");
  menu.setAttribute("role", "listbox");
  wrapper.append(button, menu);

  const control = { wrapper, button, buttonText, menu, refresh: null };
  select._customSelect = control;
  enhancedSelects.add(select);

  function updateButton() {
    const option = select.options[select.selectedIndex];
    buttonText.textContent = option?.textContent || "Choose an option";
    button.classList.toggle("placeholder", !select.value);
    qsa(".custom-select-option", menu).forEach((item) => {
      const selected = item.dataset.value === select.value;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-selected", String(selected));
    });
  }

  function refresh() {
    menu.replaceChildren();
    [...select.options].forEach((option) => {
      const item = create("button", "custom-select-option", option.textContent);
      item.type = "button";
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      item.disabled = option.disabled;
      if (!option.value) item.classList.add("placeholder-option");
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        updateButton();
        closeCustomSelect(select);
        button.focus();
      });
      menu.append(item);
    });
    updateButton();
  }
  control.refresh = refresh;

  button.addEventListener("click", () => {
    const willOpen = !wrapper.classList.contains("open");
    closeOtherSelects(select);
    if (!willOpen) {
      closeCustomSelect(select);
      return;
    }
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    wrapper.classList.toggle("open-up", spaceBelow < 280 && spaceAbove > spaceBelow);
    wrapper.classList.add("open");
    menu.classList.remove("hidden");
    button.setAttribute("aria-expanded", "true");
    const selected = menu.querySelector(".custom-select-option.selected:not(:disabled)");
    (selected || menu.querySelector(".custom-select-option:not(:disabled)"))?.scrollIntoView({ block: "nearest" });
  });

  button.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key) && !wrapper.classList.contains("open")) {
      event.preventDefault();
      button.click();
    }
  });

  select.addEventListener("change", () => {
    wrapper.classList.remove("invalid");
    updateButton();
  });
  select.addEventListener("invalid", (event) => {
    event.preventDefault();
    wrapper.classList.add("invalid");
    button.focus();
  });
  if (select.required) button.setAttribute("aria-required", "true");
  select.form?.addEventListener("reset", () => setTimeout(() => {
    wrapper.classList.remove("invalid");
    updateButton();
  }, 0));
  refresh();
  return control;
}

function setupNavigation() {
  const toggle = qs("[data-nav-toggle]");
  const links = qs("[data-nav-links]");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function setupFooter() {
  qsa("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
}

document.addEventListener("click", (event) => {
  enhancedSelects.forEach((select) => {
    if (!select._customSelect.wrapper.contains(event.target)) closeCustomSelect(select);
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") enhancedSelects.forEach(closeCustomSelect);
});

setupNavigation();
setupFooter();
