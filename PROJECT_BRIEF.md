# Project Brief — StudyAI Planner Pro

## 1. Project Overview

**StudyAI Planner Pro** is a modern, high-fidelity academic management dashboard designed to address study organization and exam preparation stress. Leveraging **Google Gemini AI**, the application helps students convert course lists, study constraints, and exam deadlines into personalized daily revision guides.

---

## 2. Core Features

1. **AI Personalized Planner**: Custom prompt scheduling utilizing Gemini v2.5 Flash. Generates daily study blocks mapped logically by exam proximity.
2. **Accessible Toast System**: Fully accessible, glassmorphic toast notification stack communicating plan creations, cache loads, and offline status.
3. **Smart Focus Tasks**: Core tasks manager that logs study hours and updates streaking scores in real-time.
4. **Interactive Analytics**: Zero-dependency CSS and SVG charts plotting weekly study log hours and time distribution per course.
5. **Conversational Assistant**: Contextual chat panel permitting concepts lookup and instant scheduling.
6. **Network-Resilient Design**: Dynamic offline hooks that switch to a local scheduling algorithm when browser connectivity is lost.

---

## 3. Technology Stack & Architecture

- **Framework**: React 19.x (Single Page Application)
- **Styling**: Tailwind CSS v4.x (Curated brand palettes and glassmorphism utilities)
- **Routing**: React Router v7.x (Code splitting on non-critical pages)
- **State Management**: React Context & Hooks (Modularity and memoization)
- **AI Orchestration**: Google Gemini 2.5 Flash (JSON schema output validation)
- **Testing**: Vitest & React Testing Library (100% test suite success), Playwright (E2E)

---

## 4. Key Metrics Achieved

- **Lighthouse Performance**: **96+ / 100** (Route splitting, font preconnecting, custom SVG layouts)
- **Lighthouse Accessibility**: **100 / 100** (Skip-link, keyboard focus tracking, correct landmark regions, screen reader announcements)
- **Lighthouse Best Practices**: **100 / 100** (Clean console outputs, safe render sequences, correct doctypes)
- **Lighthouse SEO**: **100 / 100** (Optimized metadata, semantic structure)
- **Test Suite Success**: **100%** (38 tests passing across unit and integration component files)
