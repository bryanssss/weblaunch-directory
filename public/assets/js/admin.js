import { api, create, formatDate, qs, qsa, setNotice } from "./common.js?v=1.5.0";

const loginPanel = qs("#admin-login");
const dashboard = qs("#admin-dashboard");
const loginForm = qs("#admin-login-form");
const keyInput = qs("#admin-key");
const loginNotice = qs("#login-notice");
const statsGrid = qs("#admin-stats");
const listingPanel = qs("#listing-management");
const contactPanel = qs("#contact-management");
const submissionList = qs("#submission-list");
const contactList = qs("#contact-list");
const listingSearchInput = qs("#admin-search");
const contactSearchInput = qs("#contact-search");
const logout = qs("#admin-logout");
let adminKey = sessionStorage.getItem("weblaunch_admin_key") || "";
let currentListingStatus = "approved";
let currentContactStatus = "open";
let currentView = "listings";

function headers() { return { authorization: `Bearer ${adminKey}` }; }

async function adminApi(path, options = {}) {
  return api(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
}

function renderStats(stats) {
  statsGrid.replaceChildren();
  [
    ["Live", stats.approved],
    ["Open messages", stats.openContacts],
    ["Suspended", stats.suspended],
    ["Reports", stats.reports],
    ["Rejected", stats.rejected],
    ["Featured", stats.featured],
    ["Legacy pending", stats.pending]
  ].forEach(([label, value]) => {
    const card = create("div", "stat");
    card.append(create("strong", "", String(value)), create("span", "", label));
    statsGrid.append(card);
  });
}

function actionButton(label, action, className = "secondary") {
  const button = create("button", `button ${className} small`, label);
  button.type = "button";
  button.dataset.action = action;
  return button;
}

function renderSubmission(item) {
  const card = create("article", "admin-card");
  const head = create("div", "admin-card-head");
  const left = create("div");
  left.append(create("h3", "", item.name), create("div", "domain", item.normalized_domain));
  head.append(left, create("span", `badge${item.featured ? " featured" : ""}`, item.status));
  const meta = create("div", "admin-meta");
  meta.append(
    create("span", "", item.category),
    create("span", "", `Added ${formatDate(item.created_at)}`),
    create("span", "", `${item.reports || 0} reports`)
  );
  const description = create("p", "muted", item.description);
  const link = create("a", "arrow-link", item.url);
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer nofollow";
  const actions = create("div", "admin-card-actions");
  if (item.status === "pending") actions.append(actionButton("Approve", "approve", ""), actionButton("Reject", "reject", "danger"));
  if (item.status === "approved") actions.append(actionButton(item.featured ? "Remove feature" : "Feature", item.featured ? "unfeature" : "feature"), actionButton("Suspend", "suspend", "warning"));
  if (["rejected", "suspended"].includes(item.status)) actions.append(actionButton("Restore", "restore", ""));
  if (Number(item.reports) > 0) actions.append(actionButton(`View reports (${item.reports})`, "view-reports"));
  actions.append(actionButton("Delete permanently", "delete", "danger"));

  actions.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "view-reports") {
      button.disabled = true;
      try {
        const data = await adminApi(`/api/admin/reports?siteId=${item.id}`);
        const text = data.reports.length
          ? data.reports.map((report, index) => `${index + 1}. ${report.reason} — ${formatDate(report.created_at)}${report.details ? `\n${report.details}` : ""}`).join("\n\n")
          : "No reports found.";
        alert(text);
      } catch (error) { alert(error.message); }
      finally { button.disabled = false; }
      return;
    }
    let reason = "";
    if (["reject", "suspend"].includes(action)) reason = prompt("Optional reason for the moderation record:") || "";
    if (action === "delete" && !confirm(`Permanently delete ${item.name}? This cannot be undone.`)) return;
    button.disabled = true;
    try {
      await adminApi(`/api/admin/submissions/${item.id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        ...(action === "delete" ? {} : { body: JSON.stringify({ action, reason }) })
      });
      await refreshDashboard();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  });

  card.append(head, meta, description, link, actions);
  if (item.rejection_reason) card.append(create("div", "notice warning", `Directory note: ${item.rejection_reason}`));
  return card;
}

function renderContactMessage(item) {
  const card = create("article", "admin-card contact-inbox-card");
  const head = create("div", "admin-card-head");
  const left = create("div");
  left.append(create("h3", "", item.subject), create("div", "domain", `From ${item.name}`));
  head.append(left, create("span", `badge${item.status === "resolved" ? " resolved" : ""}`, item.status));

  const meta = create("div", "admin-meta");
  const replyLink = create("a", "admin-reply-link", item.reply_email);
  replyLink.href = `mailto:${encodeURIComponent(item.reply_email)}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`;
  meta.append(replyLink, create("span", "", `Received ${formatDate(item.created_at)}`));
  if (item.resolved_at) meta.append(create("span", "", `Resolved ${formatDate(item.resolved_at)}`));

  const message = create("p", "contact-inbox-message", item.message);
  card.append(head, meta);

  if (item.listing_domain || item.listing_name || item.listing_path) {
    const context = create("div", "contact-inbox-context");
    context.append(create("strong", "", "Related listing"));
    const reference = create("span", "", [item.listing_name, item.listing_domain].filter(Boolean).join(" — ") || `Listing ${item.listing_id || ""}`);
    context.append(reference);
    if (item.listing_path) {
      const listingLink = create("a", "arrow-link", "Open listing page");
      listingLink.href = item.listing_path;
      listingLink.target = "_blank";
      listingLink.rel = "noopener noreferrer";
      context.append(listingLink);
    }
    card.append(context);
  }

  card.append(message);
  const actions = create("div", "admin-card-actions");
  const replyButton = create("a", "button secondary small", "Reply by email");
  replyButton.href = `mailto:${encodeURIComponent(item.reply_email)}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`;
  actions.append(replyButton);
  if (item.status === "open") actions.append(actionButton("Mark resolved", "resolve", ""));
  else actions.append(actionButton("Reopen", "reopen", ""));
  actions.append(actionButton("Delete permanently", "delete", "danger"));

  actions.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "delete" && !confirm("Permanently delete this contact message? This cannot be undone.")) return;
    button.disabled = true;
    try {
      await adminApi(`/api/admin/contacts/${item.id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        ...(action === "delete" ? {} : { body: JSON.stringify({ action }) })
      });
      await refreshDashboard();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  });

  card.append(actions);
  return card;
}

async function loadSubmissions() {
  submissionList.innerHTML = '<div class="empty-state loading">Loading listings…</div>';
  const url = new URL("/api/admin/submissions", location.origin);
  url.searchParams.set("status", currentListingStatus);
  if (listingSearchInput.value.trim()) url.searchParams.set("q", listingSearchInput.value.trim());
  try {
    const data = await adminApi(url.pathname + url.search);
    submissionList.replaceChildren();
    if (!data.submissions.length) submissionList.innerHTML = '<div class="empty-state">No listings in this section.</div>';
    data.submissions.forEach((item) => submissionList.append(renderSubmission(item)));
  } catch (error) {
    submissionList.innerHTML = '<div class="empty-state"></div>';
    submissionList.firstElementChild.textContent = error.message;
    if (/administrator key/i.test(error.message)) showLogin();
  }
}

async function loadContacts() {
  contactList.innerHTML = '<div class="empty-state loading">Loading contact messages…</div>';
  const url = new URL("/api/admin/contacts", location.origin);
  url.searchParams.set("status", currentContactStatus);
  if (contactSearchInput.value.trim()) url.searchParams.set("q", contactSearchInput.value.trim());
  try {
    const data = await adminApi(url.pathname + url.search);
    contactList.replaceChildren();
    if (!data.messages.length) contactList.innerHTML = '<div class="empty-state">No contact messages in this section.</div>';
    data.messages.forEach((item) => contactList.append(renderContactMessage(item)));
  } catch (error) {
    contactList.innerHTML = '<div class="empty-state"></div>';
    contactList.firstElementChild.textContent = error.message;
    if (/administrator key/i.test(error.message)) showLogin();
  }
}

function setView(view) {
  currentView = view;
  qsa(".admin-view-tab").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  listingPanel.classList.toggle("hidden", view !== "listings");
  contactPanel.classList.toggle("hidden", view !== "contacts");
  if (view === "contacts") loadContacts();
  else loadSubmissions();
}

async function refreshDashboard() {
  const stats = await adminApi("/api/admin/stats");
  renderStats(stats);
  if (currentView === "contacts") await loadContacts();
  else await loadSubmissions();
}

function showDashboard() {
  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
}
function showLogin() {
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminKey = keyInput.value.trim();
  try {
    const stats = await adminApi("/api/admin/stats");
    sessionStorage.setItem("weblaunch_admin_key", adminKey);
    renderStats(stats);
    showDashboard();
    setView("listings");
  } catch (error) {
    setNotice(loginNotice, error.message, "error");
  }
});

qsa(".admin-view-tab").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
qsa(".listing-status-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    qsa(".listing-status-tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    currentListingStatus = tab.dataset.status;
    loadSubmissions();
  });
});
qsa(".contact-status-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    qsa(".contact-status-tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    currentContactStatus = tab.dataset.status;
    loadContacts();
  });
});
qs("#admin-search-form").addEventListener("submit", (event) => { event.preventDefault(); loadSubmissions(); });
qs("#contact-search-form").addEventListener("submit", (event) => { event.preventDefault(); loadContacts(); });
logout.addEventListener("click", () => {
  sessionStorage.removeItem("weblaunch_admin_key");
  adminKey = "";
  keyInput.value = "";
  showLogin();
});

if (adminKey) {
  showDashboard();
  refreshDashboard().catch(() => showLogin());
} else showLogin();
