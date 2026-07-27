import { api, categorySlug, create, enhanceSelect, formatDate, getConfig, initial, qs, setNotice } from "./common.js";

const content = qs("#listing-content");
const reportOpen = qs("#report-open");
const reportDialog = qs("#report-dialog");
const reportClose = qs("#report-close");
const reportForm = qs("#report-form");
const reportNotice = qs("#report-notice");
const reportReason = qs("#report-reason");
let site = null;
reportOpen.classList.add("hidden");

function getSlug() {
  const pathMatch = location.pathname.match(/^\/site\/([^/]+)\/?$/);
  return pathMatch ? decodeURIComponent(pathMatch[1]) : new URLSearchParams(location.search).get("slug");
}

function renderSite(item) {
  document.title = `${item.name} — WebLaunch Directory`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = item.description;
  content.classList.remove("loading");
  content.replaceChildren();

  const main = create("div", "listing-panel");
  const titleRow = create("div", "listing-title-row");
  titleRow.append(create("div", "site-initial", initial(item.name)));
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
    ["Approved", formatDate(item.approved_at)],
    ["Website", item.normalized_domain]
  ];
  rows.forEach(([key, value]) => {
    const row = create("div", "meta-row");
    row.append(create("span", "", key), create("span", "", value));
    metaList.append(row);
  });
  const disclaimer = create("p", "muted", "Listings pass automated checks when submitted, but inclusion is not an endorsement. Automated screening can miss changes, so use your own judgement and report problems.");
  disclaimer.style.fontSize = ".86rem";
  aside.append(asideTitle, metaList, disclaimer);
  content.append(main, aside);
  reportOpen.classList.remove("hidden");
}

async function loadSite() {
  const slug = getSlug();
  if (!slug) {
    content.innerHTML = '<div class="empty-state">Listing not found.</div>';
    return;
  }
  try {
    const data = await api(`/api/sites/${encodeURIComponent(slug)}`);
    site = data.site;
    if (data.canonicalPath && location.pathname !== data.canonicalPath) {
      history.replaceState({}, "", data.canonicalPath);
    }
    renderSite(site);
  } catch (error) {
    content.innerHTML = '<div class="empty-state"></div>';
    content.firstElementChild.textContent = error.message;
  }
}

async function prepareReportForm() {
  try {
    const config = await getConfig();
    reportReason.innerHTML = '<option value="">Choose a reason</option>';
    config.reportReasons.forEach((reason) => {
      const option = document.createElement("option");
      option.value = reason;
      option.textContent = reason;
      reportReason.append(option);
    });
    enhanceSelect(reportReason);
  } catch { /* form will still fail safely */ }
}

reportOpen.addEventListener("click", () => {
  reportDialog.classList.remove("hidden");
  (reportReason._customSelect?.button || reportReason).focus();
});
reportClose.addEventListener("click", () => reportDialog.classList.add("hidden"));
reportDialog.addEventListener("click", (event) => {
  if (event.target === reportDialog) reportDialog.classList.add("hidden");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") reportDialog.classList.add("hidden");
});

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!site) return;
  const data = new FormData(reportForm);
  try {
    const result = await api("/api/report", {
      method: "POST",
      body: JSON.stringify({
        siteId: site.id,
        reason: data.get("reason"),
        details: data.get("details"),
        company: data.get("company")
      })
    });
    setNotice(reportNotice, result.message, "success");
    reportForm.reset();
  } catch (error) {
    setNotice(reportNotice, error.message, "error");
  }
});

loadSite();
prepareReportForm();
