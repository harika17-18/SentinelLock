import "./style.css";
import { createIcons } from "lucide";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="app-shell">

    <aside class="sidebar" id="sidebar">

      <div class="sidebar-brand">
        <div class="brand-icon">
          <i data-lucide="shield-check"></i>
        </div>

        <div>
          <h1>SentinelLock</h1>
          <span>Security Platform</span>
        </div>
      </div>

      <nav class="sidebar-nav">

        <p class="nav-label">MONITORING</p>

        <a href="#" class="nav-item active">
          <i data-lucide="layout-dashboard"></i>
          <span>Overview</span>
        </a>

        <a href="#" class="nav-item">
          <i data-lucide="smartphone"></i>
          <span>Devices</span>
        </a>

        <a href="#" class="nav-item">
          <i data-lucide="credit-card"></i>
          <span>Transactions</span>
        </a>

        <a href="#" class="nav-item">
          <i data-lucide="alert-triangle"></i>
          <span>Alerts</span>
          <span class="alert-count">0</span>
        </a>

        <p class="nav-label">INVESTIGATION</p>

        <a href="#" class="nav-item">
          <i data-lucide="search"></i>
          <span>Investigations</span>
        </a>

        <a href="#" class="nav-item">
          <i data-lucide="bar-chart-3"></i>
          <span>Analytics</span>
        </a>

        <a href="#" class="nav-item">
          <i data-lucide="folder-open"></i>
          <span>Evidence</span>
        </a>

        <p class="nav-label">SYSTEM</p>

        <a href="#" class="nav-item">
          <i data-lucide="settings"></i>
          <span>Settings</span>
        </a>

      </nav>

      <div class="sidebar-footer">

        <div class="footer-status">

          <span class="status-dot"></span>

          <div>
            <strong>System Online</strong>
            <small>All services operational</small>
          </div>

        </div>

      </div>

    </aside>


    <div class="main-area">

      <header class="topbar">

        <button class="menu-button" id="menu-button">
          <i data-lucide="menu"></i>
        </button>

        <div class="topbar-title">

          <span>REAL-TIME SECURITY PLATFORM</span>

          <strong>Security Dashboard</strong>

        </div>

        <div class="system-status">

          <span class="status-dot"></span>

          System Online

        </div>

      </header>


      <main class="dashboard">


        <!-- DASHBOARD HEADER -->

        <section class="dashboard-header">

          <div>

            <p class="eyebrow">
              SECURITY CENTER
            </p>

            <h2>
              Security Dashboard
            </h2>

            <p class="dashboard-description">
              Monitor devices, transactions, security events,
              and active incidents from one centralized environment.
            </p>

          </div>


          <div class="dashboard-risk">

            <span class="status-dot"></span>

            <div>

              <small>OVERALL RISK</small>

              <strong>Low</strong>

            </div>

          </div>

        </section>


        <!-- CORE METRICS -->

        <section class="dashboard-grid">


          <div class="dashboard-card">

            <div class="dashboard-card-header">

              <div class="dashboard-card-icon">
                <i data-lucide="smartphone"></i>
              </div>

              <span>DEVICES</span>

            </div>

            <strong class="metric-value">0</strong>

            <p>
              Devices currently monitored
            </p>

          </div>


          <div class="dashboard-card">

            <div class="dashboard-card-header">

              <div class="dashboard-card-icon">
                <i data-lucide="credit-card"></i>
              </div>

              <span>TRANSACTIONS</span>

            </div>

            <strong class="metric-value">0</strong>

            <p>
              Transactions analyzed
            </p>

          </div>


          <div class="dashboard-card">

            <div class="dashboard-card-header">

              <div class="dashboard-card-icon warning">
                <i data-lucide="alert-triangle"></i>
              </div>

              <span>ACTIVE ALERTS</span>

            </div>

            <strong class="metric-value">0</strong>

            <p>
              No active security alerts
            </p>

          </div>


          <div class="dashboard-card">

            <div class="dashboard-card-header">

              <div class="dashboard-card-icon success">
                <i data-lucide="shield-check"></i>
              </div>

              <span>PROTECTION</span>

            </div>

            <strong class="metric-value">
              Active
            </strong>

            <p>
              Continuous monitoring enabled
            </p>

          </div>


        </section>


        <!-- MONITORING AREA -->

        <section class="monitoring-grid">


          <div class="panel">

            <div class="panel-header">

              <div>

                <h3>Recent Security Events</h3>

                <p>
                  Latest events detected by SentinelLock
                </p>

              </div>

              <span class="panel-status">
                LIVE
              </span>

            </div>


            <div class="empty-state">

              <div class="empty-icon">
                <i data-lucide="activity"></i>
              </div>

              <strong>No security events</strong>

              <p>
                Security events will appear here
                when monitoring activity begins.
              </p>

            </div>

          </div>


          <div class="panel">

            <div class="panel-header">

              <div>

                <h3>Active Incidents</h3>

                <p>
                  Incidents requiring investigation
                </p>

              </div>

              <span class="panel-status">
                0 OPEN
              </span>

            </div>


            <div class="empty-state">

              <div class="empty-icon">
                <i data-lucide="shield-check"></i>
              </div>

              <strong>No active incidents</strong>

              <p>
                Detected incidents will be
                displayed here for investigation.
              </p>

            </div>

          </div>


        </section>


        <!-- INVESTIGATION -->

        <section class="investigation-panel">

          <div class="panel-header">

            <div>

              <h3>Investigation Center</h3>

              <p>
                Trace suspicious activity and reconstruct
                financial event timelines.
              </p>

            </div>

            <button class="secondary-button">

              <i data-lucide="search"></i>

              Open Investigation

            </button>

          </div>


          <div class="investigation-flow">

            <div class="flow-item">

              <div class="flow-icon">
                <i data-lucide="smartphone"></i>
              </div>

              <span>Device Activity</span>

            </div>


            <div class="flow-line"></div>


            <div class="flow-item">

              <div class="flow-icon">
                <i data-lucide="credit-card"></i>
              </div>

              <span>Transactions</span>

            </div>


            <div class="flow-line"></div>


            <div class="flow-item">

              <div class="flow-icon">
                <i data-lucide="activity"></i>
              </div>

              <span>Risk Analysis</span>

            </div>


            <div class="flow-line"></div>


            <div class="flow-item">

              <div class="flow-icon">
                <i data-lucide="folder-open"></i>
              </div>

              <span>Evidence</span>

            </div>

          </div>

        </section>


      </main>

    </div>

  </div>
`;

createIcons();


const menuButton =
  document.querySelector<HTMLButtonElement>("#menu-button");

const sidebar =
  document.querySelector<HTMLElement>("#sidebar");


menuButton?.addEventListener("click", () => {

  sidebar?.classList.toggle("open");

});