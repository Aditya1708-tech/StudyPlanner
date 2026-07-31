# 🎓 StudyAI Planner ✨

> The ultimate AI-powered study dashboard. Schedule your calendar, chat with a concept explainer, log your hours, and review stats with a gorgeous glassmorphic interface.

[![Vite](https://img.shields.io/badge/Vite-8B5CF6?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4.0-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🚀 Experience the App

StudyAI Planner is a **production-quality React application** designed as an all-in-one organizer for course materials, tasks, exam dates, and revision tracking. It features a premium, responsive glassmorphic design that adapts beautifully to mobile, tablet, and desktop screens.

| 🖥️ Page | 📝 Description | ⚡ Features |
| :--- | :--- | :--- |
| **Landing Page** | Immersive SaaS marketing page | Floating glass navbar, feature catalog grid, how-it-works progression, and interactive simulator mockup. |
| **Control Dashboard** | Central student workstation | Completion tracker, active streaks widget, focus checklists, upcoming exam indicators, and dynamic study suggestions. |
| **AI Assistant Chat** | ChatGPT-style dialogue console | Course concept explainer, prompt template selectors, jumping dot load states, and **inline task creators**. |
| **Planner & Tasks** | Category-filtered target organizer | Subject tags, due-date counters, priority levels, estimated study time logs, and spring animations. |
| **Insights & Analytics** | Visual diagnostics panel | Semiautomatic weekly logs chart, subject breakdown gauges, and generative study productivity suggestions. |

## Health Check

A simple health-check page is available at `/health`.

It fetches sample JSON data from:

https://jsonplaceholder.typicode.com/todos/1

This demonstrates client-side data fetching and verifies that external API requests are working correctly in the deployed application.

---

## 🎨 Premium Design System

We engineered the application to provide a state-of-the-art visual experience:
*   **Glassmorphism**: Backdrop blur elements (`blur(16px)` to `blur(24px)`) coupled with semi-transparent boundaries for cards, fields, and headers.
*   **Dual Mode Support**: Full light/dark mode adaptation with automatic client local storage persistence.
*   **Aesthetic Mesh Backgrounds**: Custom-coded radial gradients in the style of modern SaaS headers.
*   **Micro-Animations**: Custom hover transformations, floating widgets, and smooth slide-in lists built with Framer Motion.

---

## 📁 Directory Architecture

The repository uses a clean, component-based layout:

```text
StudyPlanner/
├── 📁 public/               # Static assets & icons
├── 📁 src/
│   ├── 📁 components/       # Reusable layout and ui containers
│   │   ├── 📁 layout/       # Navbar (landing site) & Sidebar (dashboard menu)
│   │   └── 📁 ui/           # GlassCard container
│   ├── 📁 context/          # StudyContext state hub (LocalStorage pipeline)
│   ├── 📁 pages/            # Page layouts (Landing, Dashboard, Assistant, Tasks, Analytics)
│   ├── 📁 styles/           # index.css with custom design tokens
│   ├── 📄 App.jsx           # Routing configuration
│   └── 📄 main.jsx          # App anchor root
├── 📄 index.html            # Core document with SEO meta details
├── 📄 vite.config.js        # Vite + Tailwind v4 setup
└── 📄 package.json          # Dependency list
```

---

## ⚙️ Setup & Local Run

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Steps

1.  **Clone & Enter Workspace**:
    ```bash
    git clone https://github.com/Aditya1708-tech/StudyPlanner.git
    cd StudyPlanner
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Once started, navigate to `http://localhost:5173`.

### Production Build
Verify code compilation and asset bundling:
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` folder.

---

## ☁️ Deploying to Vercel

The application is completely optimized for **one-click deployment to Vercel**:

1.  **Push your commits to GitHub**:
    ```bash
    git add .
    git commit -m "feat: complete study planner design system and features"
    git push origin main
    ```
2.  **Import to Vercel**:
    *   Sign in to your [Vercel Dashboard](https://vercel.com).
    *   Click **Add New** > **Project** and select this repository.
    *   Vercel automatically detects the Vite config and configures the build preset.
3.  **Click Deploy** 🚀. Your dashboard is ready!