# CS 331 (Software Engineering Lab)
# Assignment 6 — User Interface Design & Implementation
**Project: Automated CI/CD Pipeline with Intelligent Failure Recovery**

---

## Part I — Choose an Appropriate UI for Your Software Engineering Project and Justify Your Choice

---

### 1.1 Introduction

A User Interface (UI) is the point of interaction between the user and a software system. Selecting the right UI style is critical because it directly affects usability, efficiency, and how effectively users can accomplish their tasks. For the **Automated CI/CD Pipeline with Intelligent Failure Recovery** system, the UI must serve two distinct user roles — the **Developer** and the **Admin** — and must support real-time operations including pipeline monitoring, failure visualization, log viewing, and recovery management.

---

### 1.2 UI Styles Evaluated

Before making a selection, the following standard UI styles were considered and compared:

| UI Style | Description | Suitability for CI/CD System |
|---|---|---|
| **Command Language Interface (CLI)** | Users type text commands to interact with the system | Suitable for advanced developers only; not practical for Admin monitoring or visual reporting |
| **Menu-Based Interface** | Users navigate through structured menus to perform actions | Too slow for real-time pipeline monitoring; cannot show live status updates |
| **Form-Based Interface** | Users fill in forms to submit data or configure settings | Useful only for configuration pages; insufficient as the primary interface |
| **Direct Manipulation Interface (DMI)** | Users interact visually with graphical elements, buttons, charts, status indicators, and real-time panels | **Best fit** — supports visual monitoring, one-click actions, live stage tracking, and reporting |
| **Natural Language Interface** | Users type or speak commands in plain language | Impractical for a pipeline control system; introduces high ambiguity and unpredictability |

---

### 1.3 Selected UI Style

> **Direct Manipulation Interface (DMI) implemented as a Web-Based Dashboard**

The **Direct Manipulation Interface** is selected as the most appropriate UI style for this system. In a DMI, users interact directly with visible on-screen objects — such as pipeline stages, build status cards, log outputs, and action buttons — rather than typing commands or navigating menus.

The interface is implemented as a **React-based web dashboard** with a sidebar navigation, real-time status panels, data tables, form-based configuration, and interactive log viewer.

---

### 1.4 Justification

#### A. Two Distinct User Roles

The system serves two types of users with different needs:

- **Developer** — needs to trigger pipelines, track build progress, and view test logs
- **Admin** — needs to monitor the overall system health, view failure reports, manage recovery settings, and generate historical reports

A dashboard-based DMI satisfies both roles simultaneously. The Admin gets high-level KPIs and charts while the Developer gets build-specific details and live log output. No other UI style — CLI, menu-based, or form-based — provides this flexibility in a single interface.

#### B. Real-Time Monitoring Requirement

CI/CD pipelines are time-critical. A DMI dashboard supports:

- **Live pipeline stage flow visualization** — shows exactly which stage is running (Commit → Build → Test → Deploy → Analyze → Recovery → Report)
- **Animated status indicators** — running stages pulse with a glowing border animation
- **Color-coded badges** — green for success, red for failure, yellow for warning, cyan for active

These features are impossible to implement in a CLI or menu-based interface where users must type commands to check status rather than seeing it instantly.

#### C. Intelligent Failure Recovery Visualization

The `FailureAnalyzer` and `RecoveryManager` components require visual representation of:

- Failure type distributions (Test Failures, Build Errors, Deploy Errors, Network Timeouts)
- Recovery action history (retry vs rollback outcomes)
- Configuration controls for recovery behavior

A DMI dashboard with progress bars, classification badges, and notification panels makes this information instantly interpretable. A CLI interface would require parsing raw text output to understand the same information.

#### D. Reduced Cognitive Load

The DMI reduces cognitive load through consistent visual encoding throughout the entire interface:

- 🟢 Green = Success
- 🔴 Red = Failure
- 🟡 Yellow = Warning / Retry
- 🔵 Cyan = Active / Running

Users never need to memorize commands or navigate deep menu trees. This directly satisfies the Non-Functional Requirement defined in the SRS: *"Simple UI and clear error messages."*

#### E. Mapping to All Functional Requirements

| Functional Requirement | UI Feature Implementing It |
|---|---|
| FR1 — Source Code Integration | Run Pipeline modal with branch and repository selector |
| FR2 — Automated Build | Build Manager page with artifact listing and success rate |
| FR3 — Automated Testing | Live Logs page with color-coded test output and step simulation |
| FR4 — Automated Deployment | Pipeline stage flow and deployment status tracking |
| FR5 — Failure Detection | Failure Analyzer page with type classification |
| FR6 — Intelligent Analysis | Visual failure distribution bars and badges |
| FR7 — Automated Recovery | Recovery Manager page with retry/rollback actions |
| FR8 — Notification System | Notification panel on Dashboard and real-time toast messages |
| FR9 — Monitoring & Reporting | Reports page with bar chart and report generation form |

---

### 1.5 Conclusion for Part I

The **Direct Manipulation Interface** implemented as a **React web-based dashboard** is the optimal UI choice for the Automated CI/CD Pipeline system. It satisfies all functional and non-functional requirements, serves both the Developer and Admin user roles, provides real-time pipeline visibility, and enables immediate interaction with the failure recovery system. No other UI paradigm offers the same combination of usability, visual clarity, and real-time capability for this type of system.

---
---

## Part II — Implement the UI Code Components and Show the User Interactions with Your Software

---

### 2.1 Technology Stack

The UI is implemented using **React + Vite** — the industry-standard frontend stack in 2026. The project is fully component-based, matching the modular architecture defined in the SRS and UML class diagram.

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | Component-based UI framework |
| **Vite** | 5.3.1 | Fast build tool and development server |
| **Recharts** | 2.12.7 | Bar chart for Reports page |
| **Lucide React** | 0.383.0 | Icon library |
| **React Router DOM** | 6.23.0 | Client-side routing |
| **Google Fonts** | — | Syne (headings) + Space Mono (code/logs) |

---

### 2.2 Project File Structure

```
cicd-dashboard/
├── index.html                  ← Browser entry point
├── package.json                ← Dependencies and scripts
├── vite.config.js              ← Vite build configuration
└── src/
    ├── main.jsx                ← React app launcher
    ├── App.jsx                 ← Main controller (routing, toasts, modal)
    ├── index.css               ← Global CSS variables and animations
    ├── data/
    │   └── mockData.js         ← All application data
    ├── components/
    │   ├── UI.jsx              ← Reusable component library
    │   ├── Topbar.jsx          ← Top navigation bar
    │   ├── Sidebar.jsx         ← Left sidebar navigation
    │   ├── PipelineFlow.jsx    ← Animated pipeline stage visualizer
    │   ├── RunModal.jsx        ← Trigger pipeline modal
    │   └── ToastContainer.jsx  ← Toast notification system
    └── pages/
        ├── Dashboard.jsx       ← Home page with KPIs and overview
        ├── Pipelines.jsx       ← Full pipeline run history
        ├── Builds.jsx          ← Build manager and artifacts
        ├── Logs.jsx            ← Live log viewer
        ├── Failures.jsx        ← Failure analyzer
        ├── Recovery.jsx        ← Recovery manager
        ├── Reports.jsx         ← Analytics and report generation
        └── Settings.jsx        ← System configuration
```

**Total: 21 files across 4 directories**

---

### 2.3 Component Descriptions

#### Global Components (always visible)

**`Topbar.jsx`**
- Displays the application logo, system status badge, and Run Pipeline button
- Admin avatar displayed on the right
- Clicking Run Pipeline opens the `RunModal`

**`Sidebar.jsx`**
- Left navigation with 8 pages grouped into 3 sections: Main, Recovery, Admin
- Active page highlighted with cyan left border
- Calls `onNavigate()` in App.jsx to switch pages

**`RunModal.jsx`**
- Modal dialog for triggering a new pipeline run
- Fields: Repository URL, Branch selector, Environment selector, Trigger note
- Calls `onTrigger()` which fires toast notifications

**`ToastContainer.jsx`**
- Fixed position bottom-right notification system
- Toasts slide in from the right and auto-dismiss after 3.5 seconds
- Color-coded borders: green (success), red (danger), cyan (info), yellow (warning)

**`UI.jsx` — Reusable Component Library**

| Component | Purpose |
|---|---|
| `Badge` | Colored status pills — Running, Passed, Failed, Warning |
| `StatCard` | KPI number cards with colored accent top border |
| `Card` + `CardHeader` | Dark bordered container with title and optional right action |
| `Btn` | Button with 3 variants: primary (cyan), outline, danger |
| `DataTable` | Reusable table with hover row highlight |
| `ProgressBar` | Animated colored fill bar |
| `FormField` + `Input` + `Select` | Form elements with focus border highlight |
| `NotifItem` | Notification row with colored left border |
| `Grid` | Responsive CSS grid layout wrapper |

---

#### Page Components

**`Dashboard.jsx`**
- 4 KPI stat cards: Total Runs, Successful, Failed, Avg Recovery Time
- Live pipeline stage flow visualization (`PipelineFlow.jsx`)
- Recent pipeline runs table with status badges
- Notifications panel with 4 color-coded alerts

**`PipelineFlow.jsx`**
- Visualizes all 8 pipeline stages: Code Commit → Fetch Source → Build → Testing → Deploy → Analyze → Recovery → Report
- Done stages show green ✓ with green connector
- Running stage has animated glowing cyan border (`spinBorder` CSS animation)
- Idle stages are dimmed at 50% opacity

**`Pipelines.jsx`**
- Full pipeline history table with 7 columns: Build #, Branch, Commit hash, Triggered By, Status, Duration, Action
- Branch filter dropdown to filter by main / dev / feature
- Failed builds show Retry button; others show Logs button

**`Builds.jsx`**
- 3 KPI cards: Build Success Rate, Average Build Time, Artifacts Stored
- Animated progress bar showing 91% success rate
- Build history table with artifact file names

**`Logs.jsx`**
- Live terminal-style log viewer with dark background
- Color-coded log levels: INFO (cyan), OK (green), WARN (yellow), ERROR (red)
- Simulate Step button appends new log lines interactively
- Auto-scrolls to latest log entry
- Stage breakdown table showing each pipeline stage duration

**`Failures.jsx`**
- Failure type distribution with animated progress bars
- Recent failures table with type classification badges
- 3 summary stat cards: Total Failures, Auto-Recovered, Manual Intervention

**`Recovery.jsx`**
- Recovery action history (auto-retry, rollback, manual intervention)
- Recovery configuration form: Max Retry Attempts, Retry Delay, Fallback Action
- 4 stat cards: Total Retries, Successful Retry, Rollbacks, Avg MTTR

**`Reports.jsx`**
- Interactive bar chart using Recharts showing weekly passed/failed builds per day
- Custom tooltip styled to match dashboard theme
- Report generation form: Report Type, Date Range, Format (PDF/CSV/JSON)
- 4 summary KPI cards

**`Settings.jsx`**
- Git Integration section: Repository URL, Branch, Webhook Secret
- Notification Settings: Email, Slack Webhook, Alert level
- Security Settings: Authentication type, Session timeout, RBAC Role, Encryption

---

### 2.4 User Interactions

The following table shows all major user interactions implemented in the dashboard:

| User | Action | UI Element | System Response |
|---|---|---|---|
| Admin | Opens dashboard | Browser loads `localhost:5173` | Dashboard page loads with live pipeline status and KPIs |
| Admin | Clicks sidebar item | Sidebar nav item | Page changes instantly with fade-up animation |
| Admin | Clicks Run Pipeline | Topbar button | Modal opens with branch/environment form |
| Developer | Selects branch and submits | RunModal form | Toast: "Pipeline #144 triggered on main!" |
| Admin | Views pipeline status | Dashboard stage flow | Animated pipeline showing current running stage |
| Admin | Filters pipelines by branch | Pipelines page dropdown | Table updates to show only matching runs |
| Admin | Clicks Retry on failed build | Pipelines page Retry button | Toast: "Retrying build #141..." |
| Admin | Opens Logs page | Sidebar → Logs | Live log viewer with color-coded terminal output |
| Developer | Clicks Simulate Step | Logs page button | New log line appends with timestamp and color |
| Admin | Views failure distribution | Failures page | Progress bars showing failure type percentages |
| Admin | Clicks Rollback | Failures page action | Toast: "Rolling back #138" |
| Admin | Saves recovery config | Recovery page form | Toast: "Recovery config saved!" |
| Admin | Generates report | Reports page form | Toast: "Report generated: Pipeline Summary" |
| Admin | Saves Git settings | Settings page | Toast: "Git settings saved!" |
| Admin | Saves notification config | Settings page | Toast: "Notifications configured!" |

---

### 2.6 Summary

The implemented React + Vite dashboard fully covers all 9 functional requirements of the Automated CI/CD Pipeline system across 8 dedicated pages and 21 source files. The Direct Manipulation Interface paradigm enables both Developer and Admin users to interact with the system efficiently, with real-time visual feedback for every action and clear representation of pipeline health, failure analysis, and recovery status.

The component-based architecture directly mirrors the modular design defined in the UML Class Diagram — each page corresponds to a class (`BuildManager`, `FailureAnalyzer`, `RecoveryManager`, `ReportGenerator`) and each reusable UI component demonstrates the **Separation of Concerns** principle from the Layered Architecture design.

---
