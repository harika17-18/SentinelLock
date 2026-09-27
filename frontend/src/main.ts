import "./style.css";
import { createIcons, icons } from "lucide";

const API_BASE_URL = "http://127.0.0.1:8000";

const TOKEN_KEY = "sentinellock_token";
const USER_KEY = "sentinellock_user";

/* =========================================================
   TYPES
========================================================= */

interface LoginResponse {
  access_token: string;
  token_type?: string;
  user?: {
    id?: number;
    full_name?: string;
    email?: string;
    role?: string;
  };
}

interface Incident {
  id: number;
  incident_reference: string;
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  risk_score: number;
  description: string;
  is_resolved: boolean;
  created_at: string;
}

interface Alert {
  id: number;
  incident_reference: string;
  priority: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

interface Device {
  id: number;
  device_name: string;
  device_identifier: string;
  device_type: string;
  is_active: boolean;
  created_at: string;
}

interface MoneyFlowItem {
  from: string;
  to: string;
  amount: number;
}

interface MoneyFlow {
  transaction_reference: string;
  transaction_type: string;
  sender: string;
  receiver: string;
  amount: number;
  status: string;
  flow: MoneyFlowItem[];
}

interface TransactionData {
  id: number;
  reference: string;
  type: string;
  amount: number;
  status: string;
  risk_score: number;
}

interface FlowChainItem {
  step: number;
  transaction_reference: string;
  from: string;
  to: string;
  amount: number;
}

interface MoneyFlowResponse {
  incident_reference: string;
  incident_id: number;
  transaction: TransactionData;
  money_flow: MoneyFlow;
  flow_chain: FlowChainItem[];
}

interface InvestigationEvent {
  event_type: string;
  reference: string;
  description: string;
  risk_score: number;
  timestamp: string;
}

interface InvestigationResponse {
  incident_reference: string;
  incident_id: number;
  timeline: InvestigationEvent[];
}

interface EvidenceItem {
  evidence_type: string;
  reference: string;
  description: string;
  source: string;
  collected_at: string;
  integrity_status: string;
}

interface EvidenceResponse {
  evidence_count: number;
  items: EvidenceItem[];
  status: string;
}

interface EvidenceApiResponse {
  incident_reference: string;
  incident_id: number;
  evidence: EvidenceResponse;
}

interface ReportResponse {
  report_type: string;
  incident_reference: string;
  generated_at: string;
  incident: Incident;
  timeline: InvestigationEvent[];
  money_flow: MoneyFlowResponse;
  evidence: EvidenceResponse;
  status: string;
}

interface ResponseAction {
  id: number;
  incident_reference: string;
  action: string;
  status: string;
  requires_authorization: boolean;
  requested_by: number;
  created_at: string;
}

interface ResponseActionResponse {
  message: string;
  incident: {
    id: number;
    incident_reference: string;
    severity: string;
    risk_score: number;
    status: string;
  };
  response: ResponseAction;
  requested_by: number;
}

/* =========================================================
   APP
========================================================= */

const app =
  document.querySelector<HTMLDivElement>("#app")!;

if (!app) {
  throw new Error("SentinelLock app container was not found.");
}

/* =========================================================
   HELPERS
========================================================= */

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  showLoginPage();
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatAmount(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function refreshIcons(): void {
  createIcons({ icons });
}

async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers
  });
}

/* =========================================================
   LOGIN PAGE
========================================================= */

function showLoginPage(): void {
  app.innerHTML = `
    <div class="login-page">

      <div class="login-container">

        <div class="login-brand">

          <div class="brand-icon">
            <i data-lucide="shield-check"></i>
          </div>

          <h1>SentinelLock</h1>

          <p>
            Real-Time Cybersecurity & Digital Forensics
          </p>

        </div>

        <div class="login-card">

          <div class="login-card-header">

            <h2>Welcome back</h2>

            <p>
              Sign in to access the security dashboard.
            </p>

          </div>

          <form id="login-form">

            <div class="form-group">

              <label for="email">
                Email
              </label>

              <div class="input-wrapper">

                <i data-lucide="mail"></i>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  required
                />

              </div>

            </div>

            <div class="form-group">

              <label for="password">
                Password
              </label>

              <div class="input-wrapper">

                <i data-lucide="lock"></i>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />

              </div>

            </div>

            <div id="login-error" class="login-error"></div>

            <button
              id="login-button"
              type="submit"
              class="login-button"
            >
              <i data-lucide="log-in"></i>
              <span>Sign In</span>
            </button>

          </form>

          <div class="login-security-note">

            <i data-lucide="shield"></i>

            <span>
              Protected by SentinelLock authentication
            </span>

          </div>

        </div>

      </div>

    </div>
  `;

  refreshIcons();

  const form =
    document.querySelector<HTMLFormElement>("#login-form");

  const button =
    document.querySelector<HTMLButtonElement>("#login-button");

  const error =
    document.querySelector<HTMLDivElement>("#login-error");

  if (!form || !button || !error) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const email =
      String(formData.get("email") || "").trim();

    const password =
      String(formData.get("password") || "");

    error.textContent = "";

    button.disabled = true;

    button.innerHTML = `
      <i data-lucide="loader-circle"></i>
      <span>Signing in...</span>
    `;

    refreshIcons();

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data =
        (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error("Login failed");
      }

      if (!data.access_token) {
        throw new Error(
          "Authentication token was not returned."
        );
      }

      localStorage.setItem(
        TOKEN_KEY,
        data.access_token
      );

      if (data.user) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(data.user)
        );
      }

      showDashboard(data.access_token);

    } catch (err) {
      console.error("Login failed:", err);

      error.textContent =
        "Login failed. Please check your email and password.";

      button.disabled = false;

      button.innerHTML = `
        <i data-lucide="log-in"></i>
        <span>Sign In</span>
      `;

      refreshIcons();
    }
  });
}

/* =========================================================
   DASHBOARD
========================================================= */

function showDashboard(token: string): void {

  app.innerHTML = `
    <div class="dashboard-layout">

      <aside class="sidebar">

        <div class="sidebar-brand">

          <div class="brand-icon">
            <i data-lucide="shield-check"></i>
          </div>

          <div>
            <strong>SentinelLock</strong>
            <span>Security Platform</span>
          </div>

          <button
            id="sidebar-close-button"
            class="sidebar-close-button"
            type="button"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <i data-lucide="panel-left-close"></i>
          </button>
        </div>

        <nav class="sidebar-nav">

          <a href="#" class="nav-item active" data-page="dashboard">
            <i data-lucide="layout-dashboard"></i>
            <span>Dashboard</span>
          </a>

          <a href="#" class="nav-item" data-page="incidents">
            <i data-lucide="triangle-alert"></i>
            <span>Incidents</span>
          </a>

          <a href="#" class="nav-item" data-page="alerts">
            <i data-lucide="bell"></i>
            <span>Alerts</span>
          </a>

          <a href="#" class="nav-item" data-page="devices">
            <i data-lucide="smartphone"></i>
            <span>Devices</span>
          </a>

          <a href="#" class="nav-item" data-page="transactions">
            <i data-lucide="arrow-left-right"></i>
            <span>Transactions</span>
          </a>

          <a href="#" class="nav-item" data-page="investigation">
            <i data-lucide="search"></i>
            <span>Investigation</span>
          </a>

          <a href="#" class="nav-item" data-page="evidence">
            <i data-lucide="file-search"></i>
            <span>Evidence</span>
          </a>

        </nav>

        <div class="sidebar-bottom">

          <div class="security-status">

            <div class="status-dot"></div>

            <div>
              <strong>System Active</strong>
              <span>Real-time monitoring</span>
            </div>

          </div>

          <button
            id="logout-button"
            class="logout-button"
          >
            <i data-lucide="log-out"></i>
            <span>Logout</span>
          </button>

        </div>

      </aside>

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>

            <p class="dashboard-label">
              SECURITY OPERATIONS
            </p>

            <h1>Security Dashboard</h1>

            <p class="dashboard-subtitle">
              Monitor devices, financial activity and security incidents.
            </p>

          </div>

          <div class="header-status">

            <span class="status-dot"></span>

            <span>LIVE MONITORING</span>

          </div>

        </header>

        <section class="stats-grid">

          <div class="stat-card">

            <div class="stat-icon">
              <i data-lucide="triangle-alert"></i>
            </div>

            <div>
              <span class="stat-label">
                Active Incidents
              </span>

              <strong id="active-incidents">
                --
              </strong>
            </div>

          </div>

          <div class="stat-card">

            <div class="stat-icon">
              <i data-lucide="bell"></i>
            </div>

            <div>
              <span class="stat-label">
                Alerts
              </span>

              <strong id="alert-count">
                --
              </strong>
            </div>

          </div>

          <div class="stat-card">

            <div class="stat-icon">
              <i data-lucide="smartphone"></i>
            </div>

            <div>
              <span class="stat-label">
                Monitored Devices
              </span>

              <strong id="device-count">
                --
              </strong>
            </div>

          </div>

          <div class="stat-card">

            <div class="stat-icon">
              <i data-lucide="activity"></i>
            </div>

            <div>
              <span class="stat-label">
                System Status
              </span>

              <strong>Active</strong>
            </div>

          </div>

        </section>

        <section class="dashboard-grid">

          <div class="dashboard-card incidents-card">

            <div class="card-header">

              <div>

                <h2>Recent Incidents</h2>

                <p>
                  Latest security incidents detected by SentinelLock.
                </p>

              </div>

              <button
                id="refresh-incidents"
                class="icon-button"
                title="Refresh incidents"
              >
                <i data-lucide="refresh-cw"></i>
              </button>

            </div>

            <div id="incidents-container">

              <div class="loading-state">

                <i data-lucide="loader-circle"></i>

                <span>
                  Loading incidents...
                </span>

              </div>

            </div>

          </div>

          <div class="dashboard-card system-card">

            <div class="card-header">

              <div>

                <h2>Security Pipeline</h2>

                <p>
                  SentinelLock detection workflow.
                </p>

              </div>

            </div>

            <div class="pipeline">

              <div class="pipeline-step">

                <div class="pipeline-icon">
                  <i data-lucide="radar"></i>
                </div>

                <div>
                  <strong>Detect</strong>
                  <span>Monitor suspicious activity</span>
                </div>

              </div>

              <div class="pipeline-line"></div>

              <div class="pipeline-step">

                <div class="pipeline-icon">
                  <i data-lucide="shield"></i>
                </div>

                <div>
                  <strong>Protect</strong>
                  <span>Assess security risk</span>
                </div>

              </div>

              <div class="pipeline-line"></div>

              <div class="pipeline-step">

                <div class="pipeline-icon">
                  <i data-lucide="bell-ring"></i>
                </div>

                <div>
                  <strong>Alert</strong>
                  <span>Generate security alerts</span>
                </div>

              </div>

              <div class="pipeline-line"></div>

              <div class="pipeline-step">

                <div class="pipeline-icon">
                  <i data-lucide="search"></i>
                </div>

                <div>
                  <strong>Investigate</strong>
                  <span>Build evidence timeline</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        <section class="dashboard-card architecture-card">

          <div class="card-header">

            <div>

              <h2>SentinelLock Architecture</h2>

              <p>
                Device events and financial events are correlated
                for risk-based incident analysis.
              </p>

            </div>

          </div>

          <div class="architecture-flow">

            <div class="architecture-box">

              <i data-lucide="smartphone"></i>

              <span>
                Device Events
              </span>

            </div>

            <i
              data-lucide="arrow-right"
              class="flow-arrow"
            ></i>

            <div class="architecture-box">

              <i data-lucide="credit-card"></i>

              <span>
                Transactions
              </span>

            </div>

            <i
              data-lucide="arrow-right"
              class="flow-arrow"
            ></i>

            <div class="architecture-box highlight">

              <i data-lucide="brain-circuit"></i>

              <span>
                Risk Analysis
              </span>

            </div>

            <i
              data-lucide="arrow-right"
              class="flow-arrow"
            ></i>

            <div class="architecture-box">

              <i data-lucide="triangle-alert"></i>

              <span>
                Incident
              </span>

            </div>

            <i
              data-lucide="arrow-right"
              class="flow-arrow"
            ></i>

            <div class="architecture-box">

              <i data-lucide="file-search"></i>

              <span>
                Investigation
              </span>

            </div>

          </div>

        </section>

        <footer class="dashboard-footer">

          <span>SentinelLock</span>

          <span>
            Real-Time Cybersecurity & Digital Forensics System
          </span>

        </footer>

      </main>

    </div>
  `;

  refreshIcons();

  setupDashboardEvents(token);

  loadDashboardStats();

  loadIncidents();
}

/* =========================================================
   DASHBOARD EVENTS
========================================================= */

function setupDashboardEvents(token: string): void {

    setupSidebarToggle();

  const logoutButton =
    document.querySelector<HTMLButtonElement>(
      "#logout-button"
    );

  logoutButton?.addEventListener(
    "click",
    logout
  );

  const refreshButton =
    document.querySelector<HTMLButtonElement>(
      "#refresh-incidents"
    );

  refreshButton?.addEventListener(
    "click",
    () => loadIncidents()
  );

  document
    .querySelectorAll<HTMLElement>(".nav-item")
    .forEach((item) => {

      item.addEventListener("click", (event) => {

        event.preventDefault();

        const page =
          item.dataset.page;

        if (!page) {
          return;
        }

        handleNavigation(
          page,
          token
        );

      });

    });
}

/* =========================================================
   NAVIGATION
========================================================= */

function handleNavigation(
  page: string,
  token: string
): void {

  switch (page) {

    case "dashboard":
      showDashboard(token);
      break;

    case "incidents":
      showIncidentsPage(token);
      break;

    case "alerts":
      showAlertsPage(token);
      break;

    case "devices":
      showDevicesPage(token);
      break;

    case "transactions":
      showTransactionsPage(token);
      break;

    case "investigation":
      showInvestigationHomePage(token);
      break;

    case "evidence":
      showEvidenceHomePage(token);
      break;

    default:
      showDashboard(token);
  }
}

/* =========================================================
   LOAD DASHBOARD STATS
========================================================= */

async function loadDashboardStats(): Promise<void> {

  try {

    const [
      incidentsResponse,
      alertsResponse,
      devicesResponse
    ] = await Promise.all([

      apiRequest(
        `${API_BASE_URL}/incidents`
      ),

      apiRequest(
        `${API_BASE_URL}/alerts`
      ),

      apiRequest(
        `${API_BASE_URL}/devices`
      )

    ]);

    if (
      incidentsResponse.status === 401 ||
      alertsResponse.status === 401 ||
      devicesResponse.status === 401
    ) {
      logout();
      return;
    }

    const incidentsData =
      await incidentsResponse.json();

    const alertsData =
      await alertsResponse.json();

    const devicesData =
      await devicesResponse.json();

    const incidents: Incident[] =
      Array.isArray(incidentsData)
        ? incidentsData
        : incidentsData.incidents || [];

    const alerts: Alert[] =
      Array.isArray(alertsData)
        ? alertsData
        : alertsData.alerts || [];

    const devices: Device[] =
      Array.isArray(devicesData)
        ? devicesData
        : devicesData.devices || [];

    const activeCount =
      incidents.filter(
        (incident) =>
          !incident.is_resolved &&
          incident.status !== "resolved"
      ).length;

    const activeElement =
      document.querySelector<HTMLElement>(
        "#active-incidents"
      );

    const alertElement =
      document.querySelector<HTMLElement>(
        "#alert-count"
      );

    const deviceElement =
      document.querySelector<HTMLElement>(
        "#device-count"
      );

    if (activeElement) {
      activeElement.textContent =
        String(activeCount);
    }

    if (alertElement) {
      alertElement.textContent =
        String(alerts.length);
    }

    if (deviceElement) {
      deviceElement.textContent =
        String(devices.length);
    }

  } catch (error) {

    console.error(
      "Failed to load dashboard statistics:",
      error
    );

  }
}

/* =========================================================
   LOAD INCIDENTS
========================================================= */

async function loadIncidents(): Promise<void> {

  const container =
    document.querySelector<HTMLDivElement>(
      "#incidents-container"
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="loading-state">
      <i data-lucide="loader-circle"></i>
      <span>Loading incidents...</span>
    </div>
  `;

  refreshIcons();

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load incidents: ${response.status}`
      );
    }

    const data =
      await response.json();

    const incidents: Incident[] =
      Array.isArray(data)
        ? data
        : data.incidents || [];

    renderIncidents(incidents);

  } catch (error) {

    console.error(
      "Failed to load incidents:",
      error
    );

    container.innerHTML = `
      <div class="error-state">

        <i data-lucide="circle-alert"></i>

        <div>

          <strong>
            Unable to load incidents
          </strong>

          <span>
            Make sure the SentinelLock backend is running.
          </span>

        </div>

      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   RENDER INCIDENTS
========================================================= */

function renderIncidents(
  incidents: Incident[]
): void {

  const container =
    document.querySelector<HTMLDivElement>(
      "#incidents-container"
    );

  if (!container) {
    return;
  }

  if (!incidents.length) {

    container.innerHTML = `
      <div class="empty-state">

        <i data-lucide="shield-check"></i>

        <strong>
          No incidents detected
        </strong>

        <span>
          SentinelLock has not detected any incidents yet.
        </span>

      </div>
    `;

    refreshIcons();

    return;
  }

  const recentIncidents =
    incidents.slice(0, 5);

  container.innerHTML =
    recentIncidents
      .map((incident) => {

        const severity =
          String(
            incident.severity || "low"
          ).toLowerCase();

        return `
          <div
            class="incident-row clickable-incident"
            data-incident-id="${incident.id}"
          >

            <div class="incident-main">

              <div class="incident-icon ${severity}">

                <i data-lucide="triangle-alert"></i>

              </div>

              <div class="incident-info">

                <strong>
                  ${escapeHtml(
                    incident.title ||
                    "Security Incident"
                  )}
                </strong>

                <span>
                  ${escapeHtml(
                    incident.incident_reference
                  )}
                </span>

                <small>
                  ${formatDate(
                    incident.created_at
                  )}
                </small>

              </div>

            </div>

            <div class="incident-meta">

              <span
                class="severity-badge ${severity}"
              >
                ${escapeHtml(
                  severity.toUpperCase()
                )}
              </span>

              <span class="risk-score">
                Risk ${incident.risk_score}
              </span>

            </div>

          </div>
        `;

      })
      .join("");

  refreshIcons();

  container
    .querySelectorAll<HTMLElement>(
      ".clickable-incident"
    )
    .forEach((row) => {

      row.addEventListener(
        "click",
        () => {

          const id =
            Number(
              row.dataset.incidentId
            );

          if (id) {
            showIncidentDetails(
              getToken() || "",
              id
            );
          }

        }
      );

    });
}

/* =========================================================
   INCIDENT MANAGEMENT PAGE
========================================================= */

function showIncidentsPage(
  token: string
): void {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("incidents")}

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>

            <p class="dashboard-label">
              SECURITY OPERATIONS
            </p>

            <h1>Incidents</h1>

            <p class="dashboard-subtitle">
              Review and investigate security incidents.
            </p>

          </div>

        </header>

        <section class="dashboard-card">

          <div class="card-header">

            <div>

              <h2>Incident Management</h2>

              <p>
                Select an incident to view details.
              </p>

            </div>

            <button
              id="back-dashboard"
              class="secondary-button"
            >
              <i data-lucide="arrow-left"></i>
              Dashboard
            </button>

          </div>

          <div id="incident-management-list">

            <div class="loading-state">

              <i data-lucide="loader-circle"></i>

              <span>
                Loading incidents...
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  document
    .querySelector<HTMLButtonElement>(
      "#back-dashboard"
    )
    ?.addEventListener(
      "click",
      () => showDashboard(token)
    );

  loadIncidentManagementPage(token);
}

/* =========================================================
   INCIDENT MANAGEMENT DATA
========================================================= */

async function loadIncidentManagementPage(
  token: string
): Promise<void> {

  const container =
    document.querySelector<HTMLDivElement>(
      "#incident-management-list"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    const data =
      await response.json();

    const incidents: Incident[] =
      Array.isArray(data)
        ? data
        : data.incidents || [];

    if (!incidents.length) {

      container.innerHTML = `
        <div class="empty-state">

          <i data-lucide="shield-check"></i>

          <strong>
            No incidents available
          </strong>

          <span>
            There are currently no incidents.
          </span>

        </div>
      `;

      refreshIcons();

      return;
    }

    container.innerHTML =
      incidents
        .map((incident) => {

          const severity =
            String(
              incident.severity || "low"
            ).toLowerCase();

          return `
            <div
              class="incident-row clickable-incident"
              data-incident-id="${incident.id}"
            >

              <div class="incident-main">

                <div class="incident-icon ${severity}">

                  <i data-lucide="triangle-alert"></i>

                </div>

                <div class="incident-info">

                  <strong>
                    ${escapeHtml(
                      incident.title
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      incident.incident_reference
                    )}
                  </span>

                  <small>
                    ${formatDate(
                      incident.created_at
                    )}
                  </small>

                </div>

              </div>

              <div class="incident-meta">

                <span
                  class="severity-badge ${severity}"
                >
                  ${escapeHtml(
                    severity.toUpperCase()
                  )}
                </span>

                <span class="risk-score">
                  Risk ${incident.risk_score}
                </span>

              </div>

            </div>
          `;

        })
        .join("");

    refreshIcons();

    container
      .querySelectorAll<HTMLElement>(
        ".clickable-incident"
      )
      .forEach((row) => {

        row.addEventListener(
          "click",
          () => {

            const id =
              Number(
                row.dataset.incidentId
              );

            if (id) {
              showIncidentDetails(
                token,
                id
              );
            }

          }
        );

      });

  } catch (error) {

    console.error(
      "Failed to load incident management page:",
      error
    );

    container.innerHTML = `
      <div class="error-state">
        <i data-lucide="circle-alert"></i>
        <strong>Unable to load incidents</strong>
      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   INCIDENT DETAILS
========================================================= */

async function requestIncidentResponse(
  incidentId: number
): Promise<void> {

  const button =
    document.querySelector<HTMLButtonElement>(
      "#response-button"
    );

  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <i data-lucide="loader-circle"></i>
      Generating Response...
    `;
    refreshIcons();
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents/${incidentId}/response`,
        {
          method: "POST"
        }
      );

    if (response.status === 401) {
      logout();
      return;
    }

    const data =
      (await response.json()) as
        | ResponseActionResponse
        | { detail?: string };

    if (!response.ok) {
      throw new Error(
        "detail" in data && data.detail
          ? String(data.detail)
          : `Response request failed: ${response.status}`
      );
    }

    const result =
      data as ResponseActionResponse;

    const action =
      result.response?.action || "review";

    const status =
      result.response?.status || "pending";

    const authorization =
      result.response?.requires_authorization
        ? "Authorization required"
        : "Authorization not required";

    document
      .querySelector<HTMLElement>(
        "#response-result"
      )
      ?.remove();

    const notice =
      document.createElement("div");

    notice.id = "response-result";
    notice.className = "empty-state";

    notice.innerHTML = `
      <div class="response-result-icon">
        <i data-lucide="shield-check"></i>
      </div>

      <div class="response-result-content">
        <strong>
          Response recommendation generated
        </strong>

        <p>
          Recommended action:
          <b>${escapeHtml(action)}</b>
          · Status:
          <b>${escapeHtml(status)}</b>
          · ${escapeHtml(authorization)}
        </p>
      </div>
    `;

    const actionRow =
      document.querySelector<HTMLElement>(
        "#incident-details-container .action-row"
      );

    if (actionRow) {
      actionRow.before(notice);
    }

    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <i data-lucide="shield-check"></i>
        Response Generated
      `;
    }

    refreshIcons();

  } catch (error) {

    console.error(
      "Failed to generate incident response:",
      error
    );

    document
      .querySelector<HTMLElement>(
        "#response-result"
      )
      ?.remove();

    const notice =
      document.createElement("div");

    notice.id = "response-result";
    notice.className = "error-state";

    notice.innerHTML = `
      <div class="response-result-icon">
        <i data-lucide="circle-alert"></i>
      </div>

      <div class="response-result-content">
        <strong>
          Unable to generate response
        </strong>

        <p>
          Please make sure the SentinelLock backend is running
          and try again.
        </p>
      </div>
    `;

    const actionRow =
      document.querySelector<HTMLElement>(
        "#incident-details-container .action-row"
      );

    if (actionRow) {
      actionRow.before(notice);
    }

    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <i data-lucide="shield-check"></i>
        Response
      `;
    }

    refreshIcons();
  }
}


async function showIncidentDetails(
  token: string,
  incidentId: number
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("incidents")}

      <main class="dashboard-main">

        <div id="incident-details-container">

          <div class="loading-state">

            <i data-lucide="loader-circle"></i>

            <span>
              Loading incident details...
            </span>

          </div>

        </div>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#incident-details-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents/${incidentId}`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load incident: ${response.status}`
      );
    }

    const incident =
      (await response.json()) as Incident;

    const severity =
      String(
        incident.severity || "low"
      ).toLowerCase();

    container.innerHTML = `
      <header class="dashboard-header">

        <div>

          <p class="dashboard-label">
            INCIDENT MANAGEMENT
          </p>

          <h1>
            Incident Details
          </h1>

          <p class="dashboard-subtitle">
            Review incident information and investigation actions.
          </p>

        </div>

      </header>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              ${escapeHtml(
                incident.title
              )}
            </h2>

            <p>
              ${escapeHtml(
                incident.incident_reference
              )}
            </p>

          </div>

          <span
            class="severity-badge ${severity}"
          >
            ${escapeHtml(
              severity.toUpperCase()
            )}
          </span>

        </div>

        <div class="detail-grid">

          <div class="detail-item">

            <span>
              Incident Reference
            </span>

            <strong>
              ${escapeHtml(
                incident.incident_reference
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Incident Type
            </span>

            <strong>
              ${escapeHtml(
                incident.incident_type
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Status
            </span>

            <strong>
              ${escapeHtml(
                incident.status
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Risk Score
            </span>

            <strong>
              ${incident.risk_score}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Created
            </span>

            <strong>
              ${formatDate(
                incident.created_at
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Resolved
            </span>

            <strong>
              ${incident.is_resolved
                ? "Yes"
                : "No"}
            </strong>

          </div>

        </div>

        <div class="description-box">

          <h3>Description</h3>

          <p>
            ${escapeHtml(
              incident.description
            )}
          </p>

        </div>

        <div class="action-row">

          <button
            id="investigate-button"
           class="primary-button"s
          >
            <i data-lucide="search"></i>
            Investigate Incident
          </button>
          <button
            id="response-button"
            class="secondary-button"
          >
            <i data-lucide="shield-check"></i>
            Response
          </button>
          <button
            id="money-flow-button"
            class="secondary-button"
          >
            <i data-lucide="arrow-right-left"></i>
            Money Flow

          </button>

          <button
            id="evidence-button"
            class="secondary-button"
          >
            <i data-lucide="file-search"></i>
            Evidence
          </button>

          <button
            id="report-button"
            class="secondary-button"
          >
            <i data-lucide="file-text"></i>
            Report
          </button>

          <button
            id="back-incidents"
            class="secondary-button"
          >
            <i data-lucide="arrow-left"></i>
            Back
          </button>

        </div>

      </section>
    `;

    refreshIcons();

    document
      .querySelector<HTMLButtonElement>(
        "#investigate-button"
      )
      ?.addEventListener(
        "click",
        () =>
          showInvestigationPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#response-button"
      )
      ?.addEventListener(
        "click",
        () =>
          requestIncidentResponse(
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#money-flow-button"
      )
      ?.addEventListener(
        "click",
        () =>
          showMoneyFlowPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#evidence-button"
      )
      ?.addEventListener(
        "click",
        () =>
          showEvidencePage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#report-button"
      )
      ?.addEventListener(
        "click",
        () =>
          showReportPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#back-incidents"
      )
      ?.addEventListener(
        "click",
        () =>
          showIncidentsPage(token)
      );

  } catch (error) {

    console.error(
      "Failed to load incident details:",
      error
    );

    container.innerHTML = `
      <div class="error-state">

        <i data-lucide="circle-alert"></i>

        <strong>
          Unable to load incident details
        </strong>

      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   INVESTIGATION PAGE
========================================================= */

async function showInvestigationPage(
  token: string,
  incidentId: number
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("investigation")}

      <main class="dashboard-main">

        <div id="investigation-container">

          <div class="loading-state">

            <i data-lucide="loader-circle"></i>

            <span>
              Loading investigation timeline...
            </span>

          </div>

        </div>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#investigation-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents/${incidentId}/investigation`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Investigation request failed: ${response.status}`
      );
    }

    const data =
      (await response.json()) as InvestigationResponse;

    const timeline =
      data.timeline || [];

    container.innerHTML = `
      <header class="dashboard-header">

        <div>

          <p class="dashboard-label">
            DIGITAL FORENSICS
          </p>

          <h1>
            Investigation Timeline
          </h1>

          <p class="dashboard-subtitle">
            Reconstructed sequence of security and financial events.
          </p>

        </div>

      </header>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              ${escapeHtml(
                data.incident_reference ||

                `INCIDENT-${incidentId}`
              )}
            </h2>

            <p>
              Evidence timeline
            </p>

          </div>

          <span class="status-badge">
            ${timeline.length} Events
          </span>

        </div>

        <div class="timeline">

          ${
            timeline.length
              ? timeline
                  .map(
                    (event) => `
                      <div class="timeline-item">

                        <div class="timeline-marker">
                          <i data-lucide="circle-dot"></i>
                        </div>

                        <div class="timeline-content">

                          <div class="timeline-header">

                            <strong>
                              ${escapeHtml(
                                event.event_type
                              )}
                            </strong>

                            <span>
                              Risk ${event.risk_score}
                            </span>

                          </div>

                          <p>
                            ${escapeHtml(
                              event.description
                            )}
                          </p>

                          <small>
                            ${escapeHtml(
                              event.reference
                            )}
                            ·
                            ${formatDate(
                              event.timestamp
                            )}
                          </small>

                        </div>

                      </div>
                    `
                  )
                  .join("")
              : `
                  <div class="empty-state">
                    <i data-lucide="file-search"></i>
                    <strong>No timeline events</strong>
                    <span>
                      No investigation events were found.
                    </span>
                  </div>
                `
          }

        </div>

        <div class="action-row">

          <button
            id="money-flow-from-investigation"
            class="primary-button"
          >
            <i data-lucide="arrow-right-left"></i>
            View Money Flow
          </button>

          <button
            id="evidence-from-investigation"
            class="secondary-button"
          >
            <i data-lucide="file-search"></i>
            View Evidence
          </button>

          <button
            id="report-from-investigation"
            class="secondary-button"
          >
            <i data-lucide="file-text"></i>
            View Report
          </button>

          <button
            id="back-incident-details"
            class="secondary-button"
          >
            <i data-lucide="arrow-left"></i>
            Back to Incident
          </button>

        </div>

      </section>
    `;

    refreshIcons();

    document
      .querySelector<HTMLButtonElement>(
        "#money-flow-from-investigation"
      )
      ?.addEventListener(
        "click",
        () =>
          showMoneyFlowPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#evidence-from-investigation"
      )
      ?.addEventListener(
        "click",
        () =>
          showEvidencePage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#report-from-investigation"
      )
      ?.addEventListener(
        "click",
        () =>
          showReportPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#back-incident-details"
      )
      ?.addEventListener(
        "click",
        () =>
          showIncidentDetails(
            token,
            incidentId
          )
      );

  } catch (error) {

    console.error(
      "Failed to load investigation:",
      error
    );

    container.innerHTML = `
      <div class="error-state">
        <i data-lucide="circle-alert"></i>
        <strong>
          Unable to load investigation
        </strong>
      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   MONEY FLOW PAGE
========================================================= */

async function showMoneyFlowPage(
  token: string,
  incidentId: number
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("investigation")}

      <main class="dashboard-main">

        <div id="money-flow-container">

          <div class="loading-state">

            <i data-lucide="loader-circle"></i>

            <span>
              Loading money flow...
            </span>

          </div>

        </div>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#money-flow-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents/${incidentId}/money-flow`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Money flow request failed: ${response.status}`
      );
    }

    /*
      IMPORTANT:
      Backend response is:

      {
        incident_reference,
        incident_id,
        transaction,
        money_flow,
        flow_chain
      }

      The actual transaction flow is inside:

      data.money_flow.flow
    */

    const data =
      (await response.json()) as MoneyFlowResponse;

    const moneyFlow =
      data.money_flow;

    const transaction =
      data.transaction;

    const flowChain =
      data.flow_chain || [];

    const flowItems =
      moneyFlow?.flow || [];

    container.innerHTML = `
      <header class="dashboard-header">

        <div>

          <p class="dashboard-label">
            FINANCIAL FORENSICS
          </p>

          <h1>
            Money Flow
          </h1>

          <p class="dashboard-subtitle">
            Reconstructed financial transaction flow for the incident.
          </p>

        </div>

      </header>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Transaction Flow
            </h2>

            <p>
              ${escapeHtml(
                data.incident_reference
              )}
            </p>

          </div>

          <span class="status-badge">
            ${escapeHtml(
              transaction?.status ||
              moneyFlow?.status ||
              "Unknown"
            )}
          </span>

        </div>

        <div class="detail-grid">

          <div class="detail-item">

            <span>
              Transaction Reference
            </span>

            <strong>
              ${escapeHtml(
                transaction?.reference ||
                moneyFlow?.transaction_reference ||
                "N/A"
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Transaction Type
            </span>

            <strong>
              ${escapeHtml(
                transaction?.type ||
                moneyFlow?.transaction_type ||
                "N/A"
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Amount
            </span>

            <strong>
              ${formatAmount(
                transaction?.amount ||
                moneyFlow?.amount ||
                0
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Risk Score
            </span>

            <strong>
              ${transaction?.risk_score ?? 0}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Sender
            </span>

            <strong>
              ${escapeHtml(
                moneyFlow?.sender ||
                "N/A"
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Receiver
            </span>

            <strong>
              ${escapeHtml(
                moneyFlow?.receiver ||
                "N/A"
              )}
            </strong>

          </div>

        </div>

      </section>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Money Movement
            </h2>

            <p>
              Source-to-destination transaction path.
            </p>

          </div>

        </div>

        <div class="money-flow-visual">

          ${
            flowItems.length
              ? flowItems
                  .map(
                    (item) => `
                      <div class="money-flow-step">

                        <div class="money-flow-node">

                          <i data-lucide="user"></i>

                          <strong>
                            ${escapeHtml(
                              item.from
                            )}
                          </strong>

                        </div>

                        <div class="money-flow-arrow">

                          <span>
                            ${formatAmount(
                              item.amount
                            )}
                          </span>

                          <i data-lucide="arrow-right"></i>

                        </div>

                        <div class="money-flow-node">

                          <i data-lucide="building-2"></i>

                          <strong>
                            ${escapeHtml(
                              item.to
                            )}
                          </strong>

                        </div>

                      </div>
                    `
                  )
                  .join("")
              : `
                  <div class="empty-state">

                    <i data-lucide="wallet-cards"></i>

                    <strong>
                      No money flow available
                    </strong>

                    <span>
                      No financial transactions were found for this incident.
                    </span>

                  </div>
                `
          }

        </div>

      </section>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Flow Chain
            </h2>

            <p>
              Ordered transaction movement.
            </p>

          </div>

        </div>

        ${
          flowChain.length
            ? `
              <div class="table-wrapper">

                <table class="data-table">

                  <thead>

                    <tr>
                      <th>Step</th>
                      <th>Transaction</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                    </tr>

                  </thead>

                  <tbody>

                    ${flowChain
                      .map(
                        (item) => `
                          <tr>

                            <td>
                              ${item.step}
                            </td>

                            <td>
                              ${escapeHtml(
                                item.transaction_reference
                              )}
                            </td>

                            <td>
                              ${escapeHtml(
                                item.from
                              )}
                            </td>

                            <td>
                              ${escapeHtml(
                                item.to
                              )}
                            </td>

                            <td>
                              ${formatAmount(
                                item.amount
                              )}
                            </td>

                          </tr>
                        `
                      )
                      .join("")}

                  </tbody>

                </table>

              </div>
            `
            : `
              <div class="empty-state">
                <strong>
                  No flow chain available
                </strong>
              </div>
            `
        }

        <div class="action-row">

          <button
            id="back-to-investigation"
            class="secondary-button"
          >
            <i data-lucide="arrow-left"></i>
            Back to Investigation
          </button>

          <button
            id="money-flow-evidence"
            class="secondary-button"
          >
            <i data-lucide="file-search"></i>
            Evidence
          </button>

          <button
            id="money-flow-report"
            class="secondary-button"
          >
            <i data-lucide="file-text"></i>
            Report
          </button>

        </div>

      </section>
    `;

    refreshIcons();

    document
      .querySelector<HTMLButtonElement>(
        "#back-to-investigation"
      )
      ?.addEventListener(
        "click",
        () =>
          showInvestigationPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#money-flow-evidence"
      )
      ?.addEventListener(
        "click",
        () =>
          showEvidencePage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#money-flow-report"
      )
      ?.addEventListener(
        "click",
        () =>
          showReportPage(
            token,
            incidentId
          )
      );

  } catch (error) {

    console.error(
      "Failed to load money flow:",
      error
    );

    container.innerHTML = `
      <div class="error-state">

        <i data-lucide="circle-alert"></i>

        <strong>
          Unable to load money flow
        </strong>

        <span>
          Please make sure the backend is running.
        </span>

      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   EVIDENCE PAGE
========================================================= */

async function showEvidencePage(
  token: string,
  incidentId: number
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("evidence")}

      <main class="dashboard-main">

        <div id="evidence-container">

          <div class="loading-state">

            <i data-lucide="loader-circle"></i>

            <span>
              Loading evidence...
            </span>

          </div>

        </div>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#evidence-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents/${incidentId}/evidence`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Evidence request failed: ${response.status}`
      );
    }

    const data =
      (await response.json()) as EvidenceApiResponse;

    const evidence =
      data.evidence;

    const items =
      evidence?.items || [];

    container.innerHTML = `
      <header class="dashboard-header">

        <div>

          <p class="dashboard-label">
            DIGITAL FORENSICS
          </p>

          <h1>
            Evidence
          </h1>

          <p class="dashboard-subtitle">
            Evidence collected for investigation.
          </p>

        </div>

      </header>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Evidence Package
            </h2>

            <p>
              ${escapeHtml(
                data.incident_reference
              )}
            </p>

          </div>

          <span class="status-badge">
            ${evidence.evidence_count} Items
          </span>

        </div>

        ${
          items.length
            ? `
              <div class="evidence-list">

                ${items
                  .map(
                    (item) => `
                      <div class="evidence-item">

                        <div class="evidence-icon">

                          <i data-lucide="file-check-2"></i>

                        </div>

                        <div class="evidence-content">

                          <strong>
                            ${escapeHtml(
                              item.evidence_type
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              item.reference
                            )}
                          </span>

                          <p>
                            ${escapeHtml(
                              item.description
                            )}
                          </p>

                          <small>
                            Source:
                            ${escapeHtml(
                              item.source
                            )}
                            ·
                            Collected:
                            ${formatDate(
                              item.collected_at
                            )}
                          </small>

                        </div>

                        <span class="status-badge">
                          ${escapeHtml(
                            item.integrity_status
                          )}
                        </span>

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
            : `
              <div class="empty-state">

                <i data-lucide="file-search"></i>

                <strong>
                  No evidence found
                </strong>

              </div>
            `
        }

        <div class="action-row">

          <button
            id="evidence-back"
            class="secondary-button"
          >
            <i data-lucide="arrow-left"></i>
            Back to Investigation
          </button>

          <button
            id="evidence-report"
            class="primary-button"
          >
            <i data-lucide="file-text"></i>
            View Report
          </button>

        </div>

      </section>
    `;

    refreshIcons();

    document
      .querySelector<HTMLButtonElement>(
        "#evidence-back"
      )
      ?.addEventListener(
        "click",
        () =>
          showInvestigationPage(
            token,
            incidentId
          )
      );

    document
      .querySelector<HTMLButtonElement>(
        "#evidence-report"
      )
      ?.addEventListener(
        "click",
        () =>
          showReportPage(
            token,
            incidentId
          )
      );

  } catch (error) {

    console.error(
      "Failed to load evidence:",
      error
    );

    container.innerHTML = `
      <div class="error-state">

        <i data-lucide="circle-alert"></i>

        <strong>
          Unable to load evidence
        </strong>

      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   REPORT PAGE
========================================================= */

async function showReportPage(
  token: string,
  incidentId: number
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("evidence")}

      <main class="dashboard-main">

        <div id="report-container">

          <div class="loading-state">

            <i data-lucide="loader-circle"></i>

            <span>
              Generating investigation report...
            </span>

          </div>

        </div>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#report-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/incidents/${incidentId}/report`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Report request failed: ${response.status}`
      );
    }

    const rawReport = await response.json();

    const data = rawReport as ReportResponse;

    const incident = data.incident;

    const timeline = data.timeline || [];

    // Normalize money-flow data from the report endpoint.
    // The backend may return the reconstructed flow directly or nested.
    const rawMoneyFlow = data.money_flow as any;
    const moneyFlow = rawMoneyFlow?.money_flow
      ? rawMoneyFlow
      : {
          ...rawMoneyFlow,
          transaction: rawMoneyFlow?.transaction || {
            reference: rawMoneyFlow?.transaction_reference || "N/A",
            type: rawMoneyFlow?.transaction_type || "N/A",
            amount: rawMoneyFlow?.amount ?? 0,
            status: rawMoneyFlow?.status || "N/A"
          },
          money_flow: {
            transaction_reference: rawMoneyFlow?.transaction_reference || "N/A",
            transaction_type: rawMoneyFlow?.transaction_type || "N/A",
            sender: rawMoneyFlow?.sender || "N/A",
            receiver: rawMoneyFlow?.receiver || "N/A",
            amount: rawMoneyFlow?.amount ?? 0,
            status: rawMoneyFlow?.status || "N/A"
          }
        };

    const evidence = data.evidence || {
      incident_reference: data.incident_reference,
      incident_id: incident?.id || incidentId,
      evidence_count: 0,
      items: [],
      status: "no_evidence"
    };

    container.innerHTML = `
      <header class="dashboard-header">

        <div>

          <p class="dashboard-label">
            DIGITAL FORENSICS REPORT
          </p>

          <h1>
            Investigation Report
          </h1>

          <p class="dashboard-subtitle">
            Consolidated incident, timeline, money-flow and evidence report.
          </p>

        </div>

      </header>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              ${escapeHtml(
                data.incident_reference
              )}
            </h2>

            <p>
              Generated:
              ${formatDate(
                data.generated_at
              )}
            </p>

          </div>

          <span class="status-badge">
            ${escapeHtml(
              data.status
            )}
          </span>

        </div>

        <div class="detail-grid">

          <div class="detail-item">

            <span>
              Incident
            </span>

            <strong>
              ${escapeHtml(
                incident.title
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Severity
            </span>

            <strong>
              ${escapeHtml(
                incident.severity
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Status
            </span>

            <strong>
              ${escapeHtml(
                incident.status
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Risk Score
            </span>

            <strong>
              ${incident.risk_score}
            </strong>

          </div>

        </div>

      </section>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Investigation Timeline
            </h2>

            <p>
              ${timeline.length} events recorded.
            </p>

          </div>

        </div>

        <div class="timeline">

          ${
            timeline.length
              ? timeline
                  .map(
                    (event) => `
                      <div class="timeline-item">

                        <div class="timeline-marker">
                          <i data-lucide="circle-dot"></i>
                        </div>

                        <div class="timeline-content">

                          <strong>
                            ${escapeHtml(
                              event.event_type
                            )}
                          </strong>

                          <p>
                            ${escapeHtml(
                              event.description
                            )}
                          </p>

                          <small>
                            ${escapeHtml(
                              event.reference
                            )}
                            ·
                            Risk ${event.risk_score}
                            ·
                            ${formatDate(
                              event.timestamp
                            )}
                          </small>

                        </div>

                      </div>
                    `
                  )
                  .join("")
              : `
                  <div class="empty-state">
                    No timeline events.
                  </div>
                `
          }

        </div>

      </section>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Financial Activity
            </h2>

            <p>
              Money-flow reconstruction.
            </p>

          </div>

        </div>

        <div class="detail-grid">

          <div class="detail-item">

            <span>
              Transaction
            </span>

            <strong>
              ${escapeHtml(
                moneyFlow?.transaction?.reference ||
                moneyFlow?.money_flow?.transaction_reference ||
                "N/A"
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Type
            </span>

            <strong>
              ${escapeHtml(
                moneyFlow?.transaction?.type ||
                moneyFlow?.money_flow?.transaction_type ||
                "N/A"
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Amount
            </span>

            <strong>
              ${formatAmount(
                moneyFlow?.transaction?.amount ??
                moneyFlow?.money_flow?.amount ??
                0
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Sender
            </span>

            <strong>
              ${escapeHtml(
                moneyFlow?.money_flow?.sender ||
                "N/A"
              )}
            </strong>

          </div>

          <div class="detail-item">

            <span>
              Receiver
            </span>

            <strong>
              ${escapeHtml(
                moneyFlow?.money_flow?.receiver ||
                "N/A"
              )}
            </strong>

          </div>

        </div>

      </section>

      <section class="dashboard-card">

        <div class="card-header">

          <div>

            <h2>
              Evidence Summary
            </h2>

            <p>
              ${Array.isArray(evidence.items)
                ? evidence.items.length
                : evidence.evidence_count || 0}
              evidence items included.
            </p>

          </div>

          <span class="status-badge">
            ${escapeHtml(
              evidence.status || "ready_for_investigation"
            )}
          </span>

        </div>

        <div class="evidence-list">

          ${
            evidence.items
              .map(
                (item) => `
                  <div class="evidence-item">

                    <div class="evidence-icon">
                      <i data-lucide="file-check-2"></i>
                    </div>

                    <div class="evidence-content">

                      <strong>
                        ${escapeHtml(
                          item.evidence_type
                        )}
                      </strong>

                      <span>
                        ${escapeHtml(
                          item.reference
                        )}
                      </span>

                      <p>
                        ${escapeHtml(
                          item.description
                        )}
                      </p>

                    </div>

                    <span class="status-badge">
                      ${escapeHtml(
                        item.integrity_status
                      )}
                    </span>

                  </div>
                `
              )
              .join("")
          }

        </div>

        <div class="action-row">

          <button
            id="report-back"
            class="secondary-button"
          >
            <i data-lucide="arrow-left"></i>
            Back to Investigation
          </button>

        </div>

      </section>
    `;

    refreshIcons();

    document
      .querySelector<HTMLButtonElement>(
        "#report-back"
      )
      ?.addEventListener(
        "click",
        () =>
          showInvestigationPage(
            token,
            incidentId
          )
      );

  } catch (error) {

    console.error(
      "Failed to load report:",
      error
    );

    container.innerHTML = `
      <div class="error-state">

        <i data-lucide="circle-alert"></i>

        <strong>
          Unable to generate investigation report
        </strong>

      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   SIDEBAR
========================================================= */

function getSidebar(
  activePage: string
): string {

  return `
    <aside class="sidebar">

      <div class="sidebar-brand">

        <div class="brand-icon">
          <i data-lucide="shield-check"></i>
        </div>

        <div class="sidebar-brand-text">
          <strong>SentinelLock</strong>
          <span>Security Platform</span>
        </div>

        <button
          id="sidebar-close-button"
          class="sidebar-close-button"
          type="button"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <i data-lucide="panel-left-close"></i>
        </button>

      </div>


      <nav class="sidebar-nav">

        <a
          href="#"
          class="nav-item ${
            activePage === "dashboard"
              ? "active"
              : ""
          }"
          data-page="dashboard"
        >
          <i data-lucide="layout-dashboard"></i>
          <span>Dashboard</span>
        </a>


        <a
          href="#"
          class="nav-item ${
            activePage === "incidents"
              ? "active"
              : ""
          }"
          data-page="incidents"
        >
          <i data-lucide="triangle-alert"></i>
          <span>Incidents</span>
        </a>


        <a
          href="#"
          class="nav-item ${
            activePage === "alerts"
              ? "active"
              : ""
          }"
          data-page="alerts"
        >
          <i data-lucide="bell"></i>
          <span>Alerts</span>
        </a>


        <a
          href="#"
          class="nav-item ${
            activePage === "devices"
              ? "active"
              : ""
          }"
          data-page="devices"
        >
          <i data-lucide="smartphone"></i>
          <span>Devices</span>
        </a>


        <a
          href="#"
          class="nav-item ${
            activePage === "transactions"
              ? "active"
              : ""
          }"
          data-page="transactions"
        >
          <i data-lucide="arrow-left-right"></i>
          <span>Transactions</span>
        </a>


        <a
          href="#"
          class="nav-item ${
            activePage === "investigation"
              ? "active"
              : ""
          }"
          data-page="investigation"
        >
          <i data-lucide="search"></i>
          <span>Investigation</span>
        </a>


        <a
          href="#"
          class="nav-item ${
            activePage === "evidence"
              ? "active"
              : ""
          }"
          data-page="evidence"
        >
          <i data-lucide="file-search"></i>
          <span>Evidence</span>
        </a>

      </nav>


      <div class="sidebar-bottom">

        <div class="security-status">

          <div class="status-dot"></div>

          <div>
            <strong>System Active</strong>
            <span>Real-time monitoring</span>
          </div>

        </div>


        <button
          id="logout-button"
          class="logout-button"
          type="button"
        >
          <i data-lucide="log-out"></i>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  `;
}


function setupSidebarToggle(): void {

  const layout = document.querySelector<HTMLElement>(".dashboard-layout");
  const sidebar = document.querySelector<HTMLElement>(".sidebar");
  const closeButton = document.querySelector<HTMLButtonElement>("#sidebar-close-button");

  if (!layout || !sidebar || !closeButton) return;

  let openButton = document.querySelector<HTMLButtonElement>("#sidebar-open-button");
  if (!openButton) {
    openButton = document.createElement("button");
    openButton.id = "sidebar-open-button";
    openButton.className = "sidebar-open-button";
    openButton.type = "button";
    openButton.setAttribute("aria-label", "Open sidebar");
    openButton.title = "Open sidebar";
    openButton.innerHTML = `<i data-lucide="panel-left-open"></i>`;
    document.body.appendChild(openButton);
  }

  let overlay = document.querySelector<HTMLElement>(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  // A new page creates a new layout. Reset controls left by the previous page.
  layout.classList.remove("sidebar-collapsed", "sidebar-open");
  openButton.classList.remove("visible");
  overlay.classList.remove("visible");

  if (window.innerWidth <= 760) {
    openButton.classList.add("visible");
  }

  const closeSidebar = (): void => {
    if (window.innerWidth <= 760) {
      layout.classList.remove("sidebar-open");
      overlay?.classList.remove("visible");
      openButton?.classList.add("visible");
      return;
    }
    layout.classList.add("sidebar-collapsed");
    openButton?.classList.add("visible");
  };

  const openSidebar = (): void => {
    if (window.innerWidth <= 760) {
      layout.classList.add("sidebar-open");
      overlay?.classList.add("visible");
      openButton?.classList.remove("visible");
      return;
    }
    layout.classList.remove("sidebar-collapsed");
    openButton?.classList.remove("visible");
  };

  closeButton.onclick = closeSidebar;
  openButton.onclick = openSidebar;
  overlay.onclick = closeSidebar;

  document.querySelectorAll<HTMLElement>(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 760) {
        layout.classList.remove("sidebar-open");
        overlay?.classList.remove("visible");
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      layout.classList.remove("sidebar-open");
      overlay?.classList.remove("visible");
    }
  });

  refreshIcons();
}



function setupSidebarNavigation(
  token: string
): void {

  setupSidebarToggle();

  document.querySelectorAll<HTMLElement>(".nav-item").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const page = item.dataset.page;
      if (page) handleNavigation(page, token);
    });
  });

  document
    .querySelector<HTMLButtonElement>("#logout-button")
    ?.addEventListener("click", logout);
}



/* =========================================================
   ALERTS PAGE
========================================================= */

async function showAlertsPage(
  token: string
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("alerts")}

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>

            <p class="dashboard-label">
              SECURITY ALERTS
            </p>

            <h1>
              Alerts
            </h1>

            <p class="dashboard-subtitle">
              Security alerts generated by SentinelLock.
            </p>

          </div>

        </header>

        <section class="dashboard-card">

          <div id="alerts-container">

            <div class="loading-state">

              <i data-lucide="loader-circle"></i>

              <span>
                Loading alerts...
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#alerts-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/alerts`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    const data =
      await response.json();

    const alerts: Alert[] =
      Array.isArray(data)
        ? data
        : data.alerts || [];

    if (!alerts.length) {

      container.innerHTML = `
        <div class="empty-state">

          <i data-lucide="bell-off"></i>

          <strong>
            No alerts available
          </strong>

        </div>
      `;

      refreshIcons();

      return;
    }

    container.innerHTML =
      alerts
        .map(
          (alert) => `
            <div class="incident-row">

              <div class="incident-main">

                <div class="incident-icon">

                  <i data-lucide="bell"></i>

                </div>

                <div class="incident-info">

                  <strong>
                    ${escapeHtml(
                      alert.title
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      alert.incident_reference
                    )}
                  </span>

                  <small>
                    ${escapeHtml(
                      alert.message
                    )}
                  </small>

                </div>

              </div>

              <div class="incident-meta">

                <span class="severity-badge">
                  ${escapeHtml(
                    alert.priority.toUpperCase()
                  )}
                </span>

              </div>

            </div>
          `
        )
        .join("");

    refreshIcons();

  } catch (error) {

    console.error(
      "Failed to load alerts:",
      error
    );

    container.innerHTML = `
      <div class="error-state">
        <strong>
          Unable to load alerts
        </strong>
      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   DEVICES PAGE
========================================================= */

async function showDevicesPage(
  token: string
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("devices")}

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>

            <p class="dashboard-label">
              DEVICE SECURITY
            </p>

            <h1>
              Monitored Devices
            </h1>

            <p class="dashboard-subtitle">
              Devices registered with SentinelLock.
            </p>

          </div>

        </header>

        <section class="dashboard-card">

          <div id="devices-container">

            <div class="loading-state">

              <i data-lucide="loader-circle"></i>

              <span>
                Loading devices...
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#devices-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/devices`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    const data =
      await response.json();

    const devices: Device[] =
      Array.isArray(data)
        ? data
        : data.devices || [];

    if (!devices.length) {

      container.innerHTML = `
        <div class="empty-state">

          <i data-lucide="smartphone"></i>

          <strong>
            No devices registered
          </strong>

        </div>
      `;

      refreshIcons();

      return;
    }

    container.innerHTML =
      devices
        .map(
          (device) => `
            <div class="incident-row">

              <div class="incident-main">

                <div class="incident-icon">

                  <i data-lucide="smartphone"></i>

                </div>

                <div class="incident-info">

                  <strong>
                    ${escapeHtml(
                      device.device_name
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      device.device_identifier
                    )}
                  </span>

                  <small>
                    ${escapeHtml(
                      device.device_type
                    )}
                  </small>

                </div>

              </div>

              <div class="incident-meta">

                <span class="status-badge">
                  ${
                    device.is_active
                      ? "ACTIVE"
                      : "INACTIVE"
                  }
                </span>

              </div>

            </div>
          `
        )
        .join("");

    refreshIcons();

  } catch (error) {

    console.error(
      "Failed to load devices:",
      error
    );

    container.innerHTML = `
      <div class="error-state">
        <strong>
          Unable to load devices
        </strong>
      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   TRANSACTIONS PAGE
========================================================= */

async function showTransactionsPage(
  token: string
): Promise<void> {

  app.innerHTML = `
    <div class="dashboard-layout">

      ${getSidebar("transactions")}

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>

            <p class="dashboard-label">
              FINANCIAL MONITORING
            </p>

            <h1>
              Transactions
            </h1>

            <p class="dashboard-subtitle">
              Financial activity monitored by SentinelLock.
            </p>

          </div>

        </header>

        <section class="dashboard-card">

          <div id="transactions-container">

            <div class="loading-state">

              <i data-lucide="loader-circle"></i>

              <span>
                Loading transactions...
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  `;

  refreshIcons();

  setupSidebarNavigation(token);

  const container =
    document.querySelector<HTMLDivElement>(
      "#transactions-container"
    );

  if (!container) {
    return;
  }

  try {

    const response =
      await apiRequest(
        `${API_BASE_URL}/transactions`
      );

    if (response.status === 401) {
      logout();
      return;
    }

    const data =
      await response.json();

    const transactions =
      Array.isArray(data)
        ? data
        : data.transactions || [];

    if (!transactions.length) {

      container.innerHTML = `
        <div class="empty-state">

          <i data-lucide="credit-card"></i>

          <strong>
            No transactions available
          </strong>

        </div>
      `;

      refreshIcons();

      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">

        <table class="data-table">

          <thead>

            <tr>

              <th>Reference</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Risk</th>

            </tr>

          </thead>

          <tbody>

            ${transactions
              .map(
                (transaction: any) => `
                  <tr>

                    <td>
                      ${escapeHtml(
                        transaction.transaction_reference ||
                        transaction.reference ||
                        "N/A"
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        transaction.transaction_type ||
                        transaction.type ||
                        "N/A"
                      )}
                    </td>

                    <td>
                      ${formatAmount(
                        transaction.amount || 0
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        transaction.status ||
                        "N/A"
                      )}
                    </td>

                    <td>
                      ${transaction.risk_score ?? 0}
                    </td>

                  </tr>
                `
              )
              .join("")}

          </tbody>

        </table>

      </div>
    `;

    refreshIcons();

  } catch (error) {

    console.error(
      "Failed to load transactions:",
      error
    );

    container.innerHTML = `
      <div class="error-state">

        <strong>
          Unable to load transactions
        </strong>

      </div>
    `;

    refreshIcons();
  }
}

/* =========================================================
   INVESTIGATION HOME
========================================================= */

function showInvestigationHomePage(
  token: string
): void {

  showIncidentsPage(token);
}

/* =========================================================
   EVIDENCE HOME
========================================================= */

function showEvidenceHomePage(
  token: string
): void {

  showIncidentsPage(token);
}

/* =========================================================
   START APPLICATION
========================================================= */

function startApplication(): void {

  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  if (token) {

    showDashboard(token);

  } else {

    showLoginPage();

  }
}

startApplication();
