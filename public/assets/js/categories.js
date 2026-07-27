import { api, categorySlug, create, enhanceSelect, qs, siteCard } from "./common.js?v=1.5.0";

const categoryGrid = qs("#category-grid");
const categoryOverview = qs("#category-overview");
const siteGrid = qs("#directory-results");
const resultsSection = qs("#directory-results-section");
const title = qs("#results-title");
const pageTitle = qs("#category-page-title");
const pageLead = qs("#category-page-lead");
const searchInput = qs("#directory-query");
const categorySelect = qs("#category-filter");
const form = qs("#filter-form");
const pagination = qs("#pagination");

const params = new URLSearchParams(location.search);
const categoryPathMatch = location.pathname.match(/^\/category\/([^/]+)\/?$/);
const requestedSlug = categoryPathMatch ? decodeURIComponent(categoryPathMatch[1]).toLowerCase() : "";
const categoryNames = [...categorySelect.options].map((option) => option.value).filter(Boolean);
const pathCategory = categoryNames.find((name) => categorySlug(name) === requestedSlug) || "";

searchInput.value = params.get("q") || "";
categorySelect.value = pathCategory || params.get("category") || "";
enhanceSelect(categorySelect);
let currentPage = Math.max(1, Number(params.get("page") || 1));

function configureCategoryLanding(selectedCategory = categorySelect.value) {
  const meta = document.querySelector('meta[name="description"]');
  if (selectedCategory) {
    categoryOverview?.classList.add("hidden");
    pageTitle.textContent = `${selectedCategory} websites`;
    pageLead.textContent = `Browse independent ${selectedCategory.toLowerCase()} websites that passed the directory’s automatic checks.`;
    document.title = `${selectedCategory} Websites — WebLaunch Directory`;
    if (meta) meta.content = `Discover independent ${selectedCategory.toLowerCase()} websites in WebLaunch Directory.`;
  } else {
    categoryOverview?.classList.remove("hidden");
    pageTitle.textContent = "Explore the directory";
    pageLead.textContent = "Find independent websites by topic, project name or domain.";
    document.title = "Browse Website Categories — WebLaunch Directory";
    if (meta) meta.content = "Browse automatically checked independent websites by category or search the directory.";
  }
}

function renderCategoryCards(categories) {
  categoryGrid.replaceChildren();
  categories.forEach((category) => {
    const link = create("a", "category-card");
    link.href = `/category/${categorySlug(category.name)}`;
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

function updateBrowserUrl() {
  const url = new URL(location.href);
  const category = categorySelect.value;
  url.pathname = category ? `/category/${categorySlug(category)}` : "/categories.html";
  url.search = "";
  if (searchInput.value.trim()) url.searchParams.set("q", searchInput.value.trim());
  if (currentPage > 1) url.searchParams.set("page", String(currentPage));
  history.replaceState({}, "", url);
}

function changePage(page) {
  currentPage = page;
  loadSites();
  resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadSites() {
  siteGrid.innerHTML = '<div class="empty-state loading">Loading websites…</div>';
  const url = new URL("/api/sites", location.origin);
  if (searchInput.value.trim()) url.searchParams.set("q", searchInput.value.trim());
  if (categorySelect.value) url.searchParams.set("category", categorySelect.value);
  url.searchParams.set("page", String(currentPage));
  url.searchParams.set("limit", "18");
  configureCategoryLanding();
  updateBrowserUrl();

  try {
    const data = await api(url.pathname + url.search);
    siteGrid.replaceChildren();
    const context = categorySelect.value || (searchInput.value.trim() ? `Search: “${searchInput.value.trim()}”` : "All websites");
    title.textContent = `${context} (${data.pagination.total})`;
    if (!data.sites.length) {
      siteGrid.innerHTML = '<div class="empty-state">No websites match these filters yet.</div>';
    } else {
      data.sites.forEach((site) => siteGrid.append(siteCard(site)));
    }
    renderPagination(data.pagination);
  } catch (error) {
    siteGrid.innerHTML = '<div class="empty-state"></div>';
    siteGrid.firstElementChild.textContent = error.message;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentPage = 1;
  loadSites();
  resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});
categorySelect.addEventListener("change", () => {
  currentPage = 1;
  loadSites();
  resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

configureCategoryLanding(pathCategory || categorySelect.value);
Promise.all([api("/api/categories"), loadSites()])
  .then(([data]) => renderCategoryCards(data.categories))
  .catch(() => { categoryGrid.innerHTML = '<div class="empty-state">Categories could not be loaded.</div>'; });
