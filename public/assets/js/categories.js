import { api, categorySlug, create, enhanceSelect, qs, siteCard } from "./common.js?v=1.5.1";

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

const CATEGORY_ICONS = {
  "Artificial Intelligence": '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 9h6v6H9zM8 2v3M12 2v3M16 2v3M8 19v3M12 19v3M16 19v3M2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3"/>',
  "Business": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  "Developer Tools": '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  "Design": '<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="9.5" cy="6.5" r="1"/><circle cx="14" cy="6.5" r="1"/>',
  "Education": '<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6"/>',
  "Finance": '<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 21h22"/>',
  "Food & Recipes": '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M17 3c3 2 4 6 0 9"/>',
  "Health & Fitness": '<path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/><path d="M4 12h4l2-4 3 8 2-4h5"/>',
  "Marketing": '<path d="M3 11v2a2 2 0 0 0 2 2h2l4 4v-6l8-3V6l-8-3v6H5a2 2 0 0 0-2 2Z"/><path d="M19 8h2M20 4l1-1M20 12l1 1"/>',
  "News & Media": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h4M13 12h4M7 16h4M13 16h4"/>',
  "Productivity": '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3h6v4H9zM8 12l2 2 5-5M8 18h8"/>',
  "Shopping": '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  "Technology": '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  "Travel": '<path d="M22 2 9.5 14.5M22 2l-6 19-4.5-7.5L4 9l18-7Z"/>',
  "Writing & Blogging": '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.5 7.5 3 3M4 4h7M4 8h4"/>',
  "Other": '<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>'
};

function categoryIcon(name) {
  const wrapper = create("div", "category-icon");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = CATEGORY_ICONS[name] || CATEGORY_ICONS.Other;
  wrapper.append(svg);
  return wrapper;
}

function normaliseCategoryQuery(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(websites?|sites?|category|directory)\b/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryFromQuery(value) {
  const slug = normaliseCategoryQuery(value);
  return categoryNames.find((name) => categorySlug(name) === slug) || "";
}

const initialQuery = params.get("q") || "";
const initialQueryCategory = categoryFromQuery(initialQuery);
if (initialQueryCategory) {
  searchInput.value = "";
  categorySelect.value = initialQueryCategory;
} else if (initialQuery) {
  searchInput.value = initialQuery;
  categorySelect.value = "";
} else {
  searchInput.value = "";
  categorySelect.value = pathCategory || params.get("category") || "";
}

enhanceSelect(categorySelect);
let currentPage = Math.max(1, Number(params.get("page") || 1));

function refreshCategoryControl() {
  categorySelect._customSelect?.refresh?.();
}

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
    pageLead.textContent = "Find independent websites by topic, project name, description or domain.";
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
      categoryIcon(category.name),
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
  const query = searchInput.value.trim();
  const category = categorySelect.value;
  if (query) url.searchParams.set("q", query);
  if (category) url.searchParams.set("category", category);
  url.searchParams.set("page", String(currentPage));
  url.searchParams.set("limit", "18");
  configureCategoryLanding();
  updateBrowserUrl();

  try {
    const data = await api(url.pathname + url.search);
    siteGrid.replaceChildren();
    if (category) {
      title.textContent = `${category} websites`;
    } else if (query) {
      title.textContent = `Results for “${query}”`;
    } else {
      title.textContent = "All websites";
    }

    if (!data.sites.length) {
      const empty = create("div", "empty-state");
      if (category) {
        empty.textContent = `No ${category} websites have been added yet.`;
      } else if (query) {
        empty.textContent = `No websites matched “${query}”. Try a website name, domain, or related phrase.`;
      } else {
        empty.textContent = "No websites are listed yet.";
      }
      siteGrid.append(empty);
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
  const matchedCategory = categoryFromQuery(searchInput.value);
  if (matchedCategory) {
    searchInput.value = "";
    categorySelect.value = matchedCategory;
    refreshCategoryControl();
  } else if (searchInput.value.trim()) {
    // A text search always searches the full directory, not only the category
    // that may have been selected on a previous page.
    categorySelect.value = "";
    refreshCategoryControl();
  }
  currentPage = 1;
  loadSites();
  resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

categorySelect.addEventListener("change", () => {
  searchInput.value = "";
  currentPage = 1;
  loadSites();
  resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

configureCategoryLanding(categorySelect.value);
Promise.all([api("/api/categories"), loadSites()])
  .then(([data]) => renderCategoryCards(data.categories))
  .catch(() => { categoryGrid.innerHTML = '<div class="empty-state">Categories could not be loaded.</div>'; });
