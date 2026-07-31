# Prompts Used During Development

Below are the exact prompts provided by the user in this pair-programming session to construct **StudyAI Planner**.

---

## Prompt 1: Initial Requirements (System Design & Page Outlines)

```text
You are an expert Frontend Engineer.

Build a production-quality React application called "StudyAI Planner".

The goal is to create a modern AI-powered study planning dashboard.

Tech requirements:
- React with Vite
- Tailwind CSS
- React Router
- Framer Motion animations
- Lucide React icons

Design requirements:
- Premium SaaS style
- Clean modern UI
- Responsive on mobile/tablet/desktop
- Use glassmorphism cards
- Smooth animations
- Professional typography
- Dark/light theme support


Pages:

1. Landing Page (/)

Create:
- Navbar
- Hero section:
  "Plan smarter. Learn faster with AI."
- Feature cards
- How it works section
- CTA section
- Footer


2. Dashboard (/dashboard)

Create:
- Sidebar navigation
- Welcome header
- Today's study tasks
- Progress cards
- AI recommendation card
- Upcoming exams section


3. AI Assistant (/assistant)

Create:
- Chat UI similar to ChatGPT
- User and AI message bubbles
- Input box
- Send button
- Typing animation


4. Tasks (/tasks)

Create:
- Add task functionality
- Delete task
- Mark complete
- Priority badges
- Save data using localStorage


5. Analytics (/analytics)

Create:
- Weekly progress cards
- Study statistics
- Animated progress bars


Code quality requirements:
- Component-based architecture
- Reusable components
- Clean folder structure
- Proper state management
- No unnecessary dependencies
- Add comments where logic is complex


After generating code:
Explain:
1. Architecture decisions
2. Components created
3. Improvements that a developer should manually review.
```

---

## Prompt 2: Configuration Approval & Deliverables Specification

```text
Use the recommended configuration:

* Tailwind CSS v4
* React with JavaScript (ES6+)

Proceed with the full implementation of StudyAI Planner using the architecture you proposed. Prioritize a polished, production-quality UI, responsive design, reusable components, smooth Framer Motion animations, localStorage persistence, and clean React best practices.

After implementation, also generate:

1. A README.md with setup and deployment instructions.
2. A `prompts-used.md` file containing the exact prompts used during development.
3. An `ai-assistance-summary.md` file explaining how AI assisted during implementation and what manual improvements were made afterward.
4. A `manual-improvements.md` file listing specific refactoring, accessibility improvements, performance optimizations, and code quality changes performed after reviewing AI-generated code.

Ensure the project is ready to deploy directly to Vercel and can be submitted as a complete internship assignment.
```
