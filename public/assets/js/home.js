import { api, qs, siteCard } from "./common.js";

const grid = qs("#latest-sites");
const featuredGrid = qs("#featured-sites");
const featuredSection = qs("#featured-section");
const searchForm = qs("#directory-search");
const searchInput = qs("#search-input");
const totalStat = qs("#total-sites");

function renderSites(target, sites, emptyMessage) {
  target.replaceChildren();
  if (!sites.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyMessage;
    target.append(empty);
    return;
  }
  sites.forEach((site) => target.append(siteCard(site)));
}

async function loadHome() {
  try {
    const [latest, featured] = await Promise.all([
      api("/api/sites?limit=12"),
      api("/api/sites?featured=1&limit=6")
    ]);
    totalStat.textContent = String(latest.pagination.total);
    renderSites(grid, latest.sites, "No websites are listed yet. Be the first to submit one.");
    if (featured.sites.length) {
      renderSites(featuredGrid, featured.sites, "");
      featuredSection.classList.remove("hidden");
    }
  } catch (error) {
    renderSites(grid, [], error.message);
  }
}

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const target = new URL("/categories.html", location.origin);
  if (query) target.searchParams.set("q", query);
  location.href = target.toString();
});

loadHome();
