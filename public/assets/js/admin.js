import { api, create, formatDate, qs, qsa, setNotice } from "./common.js";

const loginPanel = qs("#admin-login");
const dashboard = qs("#admin-dashboard");
const loginForm = qs("#admin-login-form");
const keyInput = qs("#admin-key");
const loginNotice = qs("#login-notice");
const statsGrid = qs("#admin-stats");
const list = qs("#submission-list");
const searchInput = qs("#admin-search");
const logout = qs("#admin-logout");
let adminKey = sessionStorage.getItem("weblaunch_admin_key") || "";
let currentStatus = "approved";

function headers() { return { authorization: `Bearer ${adminKey}` }; }

async function adminApi(path, options = {}) {
  return api(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
}

function renderStats(stats) {
  statsGrid.replaceChildren();
  [
    ["Live", stats.approved], ["Suspended", stats.suspended], ["Reports", stats.reports],
    ["Rejected", stats.rejected], ["Featured", stats.featured], ["Legacy pending", stats.pending]
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
  link.href = item.url; link.target = "_blank"; link.rel = "noopener noreferrer nofollow";
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
      await loadDashboard();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  });

  card.append(head, meta, description, link, actions);
  if (item.rejection_reason) card.append(create("div", "notice warning", `Directory note: ${item.rejection_reason}`));
  return card;
}

async function loadSubmissions() {
  list.innerHTML = '<div class="empty-state loading">Loading listings…</div>';
  const url = new URL("/api/admin/submissions", location.origin);
  url.searchParams.set("status", currentStatus);
  if (searchInput.value.trim()) url.searchParams.set("q", searchInput.value.trim());
  try {
    const data = await adminApi(url.pathname + url.search);
    list.replaceChildren();
    if (!data.submissions.length) list.innerHTML = '<div class="empty-state">No listings in this section.</div>';
    data.submissions.forEach((item) => list.append(renderSubmission(item)));
  } catch (error) {
    list.innerHTML = '<div class="empty-state"></div>';
    list.firstElementChild.textContent = error.message;
    if (/administrator key/i.test(error.message)) showLogin();
  }
}

async function loadDashboard() {
  const stats = await adminApi("/api/admin/stats");
  renderStats(stats);
  await loadSubmissions();
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
    await loadSubmissions();
  } catch (error) {
    setNotice(loginNotice, error.message, "error");
  }
});

qsa(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    qsa(".admin-tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    currentStatus = tab.dataset.status;
    loadSubmissions();
  });
});
qs("#admin-search-form").addEventListener("submit", (event) => { event.preventDefault(); loadSubmissions(); });
logout.addEventListener("click", () => {
  sessionStorage.removeItem("weblaunch_admin_key");
  adminKey = "";
  keyInput.value = "";
  showLogin();
});

if (adminKey) {
  showDashboard();
  loadDashboard().catch(() => showLogin());
} else showLogin();
