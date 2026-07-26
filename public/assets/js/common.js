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

export function create(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function siteCard(site) {
  const article = create("article", "site-card");
  const top = create("div", "site-card-top");
  top.append(create("div", "site-initial", initial(site.name)));
  const titleWrap = create("div");
  const title = create("h3", "", site.name);
  const domain = create("div", "domain", site.normalized_domain);
  titleWrap.append(title, domain);
  top.append(titleWrap);

  const description = create("p", "", site.description);
  const footer = create("div", "site-card-footer");
  const badge = create("span", "badge", site.category);
  const link = create("a", "arrow-link", "View listing →");
  link.href = `/site/${encodeURIComponent(site.slug)}`;
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

setupNavigation();
setupFooter();
