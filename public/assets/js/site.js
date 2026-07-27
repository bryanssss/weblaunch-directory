import { api, categorySlug, create, formatDate, qs, siteIcon } from "./common.js";

const content = qs("#listing-content");
const reportLink = qs("#report-link");
let site = null;

function getLookup() {
  const params = new URLSearchParams(location.search);
  const queryId = Number.parseInt(params.get("id") || "", 10);
  if (Number.isInteger(queryId) && queryId > 0) return { id: queryId };

  const pathMatch = location.pathname.match(/^\/site\/([^/]+)\/?$/);
  const key = pathMatch ? decodeURIComponent(pathMatch[1]) : params.get("slug") || "";
  const idMatch = key.match(/^(\d+)(?:-|$)/);
  if (idMatch) return { id: Number(idMatch[1]), key };
  return key ? { key } : {};
}

function setReportLink(item = null) {
  const target = new URL("/contact", location.origin);
  target.searchParams.set("type", "listing-report");
  target.searchParams.set("path", location.pathname + location.search);
  if (item) {
    target.searchParams.set("listingId", String(item.id));
    target.searchParams.set("listingName", item.name);
    target.searchParams.set("listingDomain", item.normalized_domain);
  }
  reportLink.href = target.pathname + target.search;
}

function renderSite(item) {
  document.title = `${item.name} — WebLaunch Directory`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = item.description;
  content.classList.remove("loading");
  content.replaceChildren();

  const main = create("div", "listing-panel");
  const titleRow = create("div", "listing-title-row");
  titleRow.append(siteIcon(item, "large"));
  const headingWrap = create("div");
  const badge = create("span", "badge", item.category);
  const heading = create("h1", "", item.name);
  heading.style.fontSize = "clamp(2.4rem, 6vw, 4.8rem)";
  heading.style.maxWidth = "none";
  const domain = create("div", "domain", item.normalized_domain);
  headingWrap.append(badge, heading, domain);
  titleRow.append(headingWrap);

  const description = create("p", "lead", item.description);
  description.style.marginTop = "28px";
  const actions = create("div", "hero-actions");
  const visit = create("a", "button", "Visit website ↗");
  visit.href = item.url;
  visit.target = "_blank";
  visit.rel = "noopener noreferrer nofollow ugc";
  const category = create("a", "button secondary", `More in ${item.category}`);
  category.href = `/category/${categorySlug(item.category)}`;
  actions.append(visit, category);
  main.append(titleRow, description, actions);

  const aside = create("aside", "side-panel");
  const asideTitle = create("h3", "", "Listing details");
  const metaList = create("div", "meta-list");
  const rows = [
    ["Category", item.category],
    ["Published", formatDate(item.approved_at)],
    ["Website", item.normalized_domain]
  ];
  rows.forEach(([key, value]) => {
    const row = create("div", "meta-row");
    row.append(create("span", "", key), create("span", "", value));
    metaList.append(row);
  });
  const disclaimer = create("p", "muted", "Listings pass automated checks when submitted, but inclusion is not an endorsement. Websites can change after publication, so use your own judgement and report problems.");
  disclaimer.style.fontSize = ".86rem";
  aside.append(asideTitle, metaList, disclaimer);
  content.append(main, aside);
  setReportLink(item);
}

async function loadSite() {
  const lookup = getLookup();
  setReportLink();
  if (!lookup.id && !lookup.key) {
    content.innerHTML = '<div class="empty-state">Listing not found.</div>';
    return;
  }

  const endpoint = new URL("/api/site", location.origin);
  if (lookup.id) endpoint.searchParams.set("id", String(lookup.id));
  else endpoint.searchParams.set("key", lookup.key);

  try {
    const data = await api(endpoint.pathname + endpoint.search);
    site = data.site;
    if (data.canonicalPath && location.pathname !== data.canonicalPath) {
      history.replaceState({}, "", data.canonicalPath);
    }
    renderSite(site);
  } catch (error) {
    content.classList.remove("loading");
    content.innerHTML = '<div class="empty-state"></div>';
    content.firstElementChild.textContent = error.message;
    setReportLink();
  }
}

loadSite();
