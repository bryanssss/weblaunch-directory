import { api, create, qs, siteCard } from "./common.js";

const categoryGrid = qs("#category-grid");
const siteGrid = qs("#directory-results");
const title = qs("#results-title");
const searchInput = qs("#directory-query");
const categorySelect = qs("#category-filter");
const form = qs("#filter-form");
const pagination = qs("#pagination");

const params = new URLSearchParams(location.search);
searchInput.value = params.get("q") || "";
categorySelect.value = params.get("category") || "";
let currentPage = Math.max(1, Number(params.get("page") || 1));

function renderCategoryCards(categories) {
  categoryGrid.replaceChildren();
  categories.forEach((category) => {
    const link = create("a", "category-card");
    link.href = `/categories.html?category=${encodeURIComponent(category.name)}`;
    link.append(
      create("div", "category-icon", category.name.charAt(0)),
      create("strong", "", category.name),
      create("span", "", `${category.count} ${category.count === 1 ? "website" : "websites"}`)
    );
    categoryGrid.append(link);
  });
}

function renderPagination(data) {
  pagination.replaceChildren();
  if (data.pages <= 1) return;
  const previous = create("button", "button secondary small", "← Previous");
  previous.disabled = data.page <= 1;
  const label = create("span", "muted", `Page ${data.page} of ${data.pages}`);
  const next = create("button", "button secondary small", "Next →");
  next.disabled = data.page >= data.pages;
  previous.addEventListener("click", () => changePage(data.page - 1));
  next.addEventListener("click", () => changePage(data.page + 1));
  pagination.append(previous, label, next);
}

function changePage(page) {
  currentPage = page;
  loadSites();
  document.querySelector("#directory-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadSites() {
  siteGrid.innerHTML = '<div class="empty-state loading">Loading websites…</div>';
  const url = new URL("/api/sites", location.origin);
  if (searchInput.value.trim()) url.searchParams.set("q", searchInput.value.trim());
  if (categorySelect.value) url.searchParams.set("category", categorySelect.value);
  url.searchParams.set("page", String(currentPage));
  url.searchParams.set("limit", "18");

  const browserUrl = new URL(location.href);
  browserUrl.search = url.search;
  history.replaceState({}, "", browserUrl);

  try {
    const data = await api(url.pathname + url.search);
    siteGrid.replaceChildren();
    const context = categorySelect.value || (searchInput.value.trim() ? `Search: “${searchInput.value.trim()}”` : "All websites");
    title.textContent = `${context} (${data.pagination.total})`;
    if (!data.sites.length) {
      siteGrid.innerHTML = '<div class="empty-state">No approved websites match these filters.</div>';
    } else {
      data.sites.forEach((site) => siteGrid.append(siteCard(site)));
    }
    renderPagination(data.pagination);
  } catch (error) {
    siteGrid.innerHTML = `<div class="empty-state"></div>`;
    siteGrid.firstElementChild.textContent = error.message;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentPage = 1;
  loadSites();
});
categorySelect.addEventListener("change", () => { currentPage = 1; loadSites(); });

Promise.all([api("/api/categories"), loadSites()])
  .then(([data]) => renderCategoryCards(data.categories))
  .catch(() => { categoryGrid.innerHTML = '<div class="empty-state">Categories could not be loaded.</div>'; });
