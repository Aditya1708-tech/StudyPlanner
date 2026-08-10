import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/ui/OfflineBanner';
import RouteFocusManager from './components/layout/RouteFocusManager';

// Statically load critical path pages for instant first-paint
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AIPlanner from './pages/AIPlanner';
import Tasks from './pages/Tasks';
import CommandPalette from './components/ui/CommandPalette';
import FloatingTimer from './components/ui/FloatingTimer';

// Explicitly lazy load non-critical routes for code splitting and package size optimization
const Assistant = lazy(() => import('./pages/Assistant'));
const Analytics = lazy(() => import('./pages/Analytics'));
const HealthCheck = lazy(() => import('./pages/HealthCheck'));
const Subjects = lazy(() => import('./pages/Subjects'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Resources = lazy(() => import('./pages/Resources'));

// Screen-reader accessible loading fallback
const PageLoader: React.FC = () => (
  <div 
    className="min-h-screen bg-mesh flex flex-col items-center justify-center text-slate-850 dark:text-slate-100"
    role="status"
    aria-label="Loading page content"
  >
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary-600 to-pink-500 animate-spin" />
      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 z-10" />
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <StudyProvider>
          <OfflineBanner />
          <Router>
            <CommandPalette />
            <FloatingTimer />
            {/* Skip-to-content link for keyboard / screen-reader accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to Content
            </a>
            
            {/* Focuses page wrapper on location transitions */}
            <RouteFocusManager />
            
            {/* Single global landmark container for the active view */}
            <main id="main-content" tabIndex={-1} className="focus:outline-none flex-1 min-h-screen flex flex-col">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/planner" element={<AIPlanner />} />
                  <Route path="/assistant" element={<Assistant />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/health" element={<HealthCheck />} />
                  <Route path="/subjects" element={<Subjects />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/resources" element={<Resources />} />
                  {/* Fallback route */}
                  <Route path="*" element={<Landing />} />
                </Routes>
              </Suspense>
            </main>
          </Router>
        </StudyProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

