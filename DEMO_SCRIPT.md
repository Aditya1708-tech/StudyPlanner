# Demonstration Script — StudyAI Planner Pro

This script guides an evaluator or reviewer through the key user journeys, accessibility features, and performance configurations of **StudyAI Planner Pro**.

---

## Part 1: Accessibility & Navigation (Keyboard/Screen Reader)

1. **Bypass Navigation Check**:
   - Open the landing page (`http://localhost:5173`).
   - Press the `Tab` key once.
   - **Observe**: A premium gradient **Skip to Content** button slides into view at the top center of the screen.
   - Press `Enter`. Focus is immediately routed to the global main body container, bypassing the header.
2. **Tab Navigation Check**:
   - Press `Tab` to navigate down to **Start Planning Now** and press `Enter`.
   - **Observe**: React Router transitions to the Dashboard page.
   - Press `Tab` and notice the focus outline follows a highly visible, purple focus ring (`focus-visible`).
3. **Responsive Mobile Menu Check**:
   - Shrink the browser window to mobile size (`< 768px`).
   - Press `Tab` to select the hamburger icon, and press `Space` to open the overlay drawer.
   - **Observe**: The overlay drawer opens. Link heights are at least `44px` for easy tap control. Pressing `Escape` closes the drawer.

---

## Part 2: Dashboard Widgets & Modal Focus

1. **Widgets Render Check**:
   - Inspect the Dashboard. Observe the stats widgets for **Task Completion**, **Hours Studied**, and **Active Streak** displaying responsive animations.
2. **Modal Focus Management**:
   - Navigate to the **Upcoming Exams** block and select the `+` button.
   - **Observe**: The "Add Exam" form expands. Focus is immediately shifted to the **Exam Name** text field.
   - Type a mock exam, select the date, and press `Enter` to submit.
   - **Observe**: A success toast alert slides into the top right, and focus is restored back to the `+` trigger button.

---

## Part 3: Staged AI Generation & Caching

1. **Course Constraints**:
   - Navigate to the **AI Planner** page.
   - Click the **Load Sample & Generate Plan** CTA.
   - **Observe**:
     - The page displays a staged progressive loader checklist with status descriptions.
     - Stepper items check off sequentially: *Analyzing syllabus* -> *Estimating workload* -> *Building revision schedule* -> *Optimizing daily plan*.
     - The loading progress bar fills up programmatically.
     - Screen readers announce the status transitions via `aria-live`.
2. **AI Schedule Maps**:
   - Once loading finishes, a success toast appears.
   - Verify the day-by-day revision maps render subject categories, estimated hours, and revision subtopics blocks.
3. **Caching Validation**:
   - Click the **Regenerate Study Plan** button.
   - **Observe**: The schedule loads instantly, and a toast notifications message reads: *"Study plan loaded from cache"*. The cache was hit because the inputs matched.

---

## Part 4: Conversational Chat & Tasks Integration

1. **Assistant Queries**:
   - Navigate to the **AI Assistant** page.
   - Click the quick prompt template: **Calculus Prep**.
   - **Observe**:
     - The chat input submits, and a typing bubble appears.
     - The assistant responds with Calculus concepts, accompanied by a custom suggested review task card.
2. **Adding to Planner**:
   - Click the **Add to Planner** button on the suggested task card.
   - **Observe**:
     - A success toast is displayed.
     - The button updates to a checked "Scheduled" state and disables, preventing double submissions.
     - Navigate to the **Tasks Planner** page to see the task successfully synced in the list.

---

## Part 5: Offline Mode Connectivity Test

1. **Network Disconnection**:
   - Select the **Network** tab in browser DevTools and toggle **Offline**.
   - **Observe**:
     - A red connection offline banner slides in at the top.
2. **Fallback Generation**:
   - Go to **AI Planner** and click **Regenerate Study Plan**.
   - **Observe**:
     - The staged stepper loader animates.
     - Once complete, a warning toast alert reads: *"Offline fallback plan generated"*.
     - The local scheduling algorithm generates a valid study map matching subject parameters.
