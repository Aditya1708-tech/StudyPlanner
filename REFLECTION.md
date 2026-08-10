# Engineering Reflection — StudyAI Planner Pro

This reflection documents the key architectural highlights, technical challenges, and resolutions encountered during the development of the **StudyAI Planner Pro** frontend capstone project.

---

## 1. Architectural Successes

### State Modularity & Centralization
By coupling state logic into a unified [StudyContext.tsx](file:///d:/Aditya/Web/Projects/StudyPlanner/src/context/StudyContext.tsx), we established a clean, single source of truth. Features like the **AI Assistant** and the **AI Planner** can create, modify, and delete tasks without direct cross-component dependencies. This state separation ensures that analytics aggregators automatically rebuild when task checkmarks are toggled.

### Resilient Engineering (API Fail-Safes)
One of the key achievements of this implementation is the fallback design pattern:
- **API Cache**: Caching payloads in localStorage avoids costly API rebuild charges.
- **Local Fallback Schedulers**: If network connectivity drops or Gemini returns server errors, the system gracefully degrades to a deterministic local scheduling algorithm.

---

## 2. Key Engineering Challenges & Resolutions

### Challenge 1: Tailwind v4 Theme & Custom Glassmorphism Colors
- **Problem**: Tailwind v4 introduces unified CSS-based configuration. Overwriting background cards with transparent, blurred panels while maintaining high contrast in both dark and light modes created contrast violations in WCAG audits (text contrast falling below `4.5:1` in light mode).
- **Resolution**:
  - We modified [index.css](file:///d:/Aditya/Web/Projects/StudyPlanner/src/index.css) to override default slate text variables and force contrast.
  - We introduced custom background color weight boundaries (`text-slate-655`, `text-slate-850`, etc.) to guarantee text colors are weighted heavily enough against light-themed card backgrounds.

### Challenge 2: React State Side-effects & Render Warnings
- **Problem**: During Sprint 3 E2E testing, we encountered the warning:
  `Cannot update a component (ToastProvider) while rendering a different component (StudyProvider).`
  This was caused by calling `showToast()` inside state setter mapping callbacks (e.g. `setTasks(prev => { showToast(...); return prev; })`), which React executes during its render phase.
- **Resolution**:
  We refactored all action handlers (such as `toggleTheme`, `toggleTaskComplete`, and `deleteTask` in [StudyContext.tsx](file:///d:/Aditya/Web/Projects/StudyPlanner/src/context/StudyContext.tsx)) to find targets and trigger the `showToast` alerts *outside* of state setter calls, executing updates cleanly and in order.

### Challenge 3: Vitest Component Tests & jsdom Environment Limitations
- **Problem**: When running component tests in Vitest with the `jsdom` environment, two issues emerged:
  1. `TypeError: window.matchMedia is not a function`: `jsdom` lacks support for checking prefers-color-scheme.
  2. `AnimatePresence` unmounting: Calling close buttons did not immediately remove items from the DOM, causing assertions like `expect().not.toBeInTheDocument()` to fail due to exit animation delays.
- **Resolution**:
  - We defined a global `window.matchMedia` mock inside the test suites' `beforeAll` blocks.
  - We refactored assertions checking for unmounted elements (such as toasts or offline banners) to wrap in Vitest `waitFor` helper blocks, giving Framer Motion transitions enough time to unmount.

---

## 3. Future Scalability Rationale

If this application transitions into a multi-tenant SaaS product:
1. **Serverless API Proxy**: The Gemini API request pipeline should be moved behind a secure serverless backend proxy (Vercel Serverless Functions) to hide the API key from browser inspection.
2. **Database Integration**: LocalStorage state persistence should be replaced by a secure database (PostgreSQL/Supabase) to support multi-device syncing and permanent logs.
3. **Advanced Analytics**: Integrate charting tools (Recharts/Chart.js) to support visual zoom-ins and custom revision block breakdown calendars.
