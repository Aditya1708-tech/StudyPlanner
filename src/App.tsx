import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StudyProvider } from './context/StudyContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/ui/OfflineBanner';
import RouteFocusManager from './components/layout/RouteFocusManager';

// Statically load critical path pages for instant first-paint
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AIPlanner from './pages/AIPlanner';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import CommandPalette from './components/ui/CommandPalette';
import FloatingTimer from './components/ui/FloatingTimer';
import DemoBanner from './components/ui/DemoBanner';
import { useAuth } from './context/AuthContext';

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
    className="min-h-screen bg-mesh flex flex-col items-center justify-center text-text-primary"
    role="status"
    aria-label="Loading page content"
  >
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-primary to-pink-500 animate-spin" />
      <div className="w-8 h-8 rounded-lg bg-surface-primary z-10" />
    </div>
  </div>
);

// Router routes content helper to access useLocation context
const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Unauthenticated routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Onboarding route (Guarded: must be authenticated, but onboardingCompleted is false) */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />

        {/* Authenticated protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/planner" 
          element={
            <ProtectedRoute>
              <AIPlanner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assistant" 
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subjects" 
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resources" 
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } 
        />

        {/* Unprotected health route */}
        <Route 
          path="/health" 
          element={
            <ProtectedRoute>
              <HealthCheck />
            </ProtectedRoute>
          } 
        />

        {/* Fallback route */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const { isDemoMode } = useAuth();
  
  return (
    <>
      <DemoBanner />
      <CommandPalette />
      <FloatingTimer />
      
      {/* Skip-to-content link for keyboard / screen-reader accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to Content
      </a>
      
      {/* Focuses page wrapper on location transitions */}
      <RouteFocusManager />
      
      {/* Single global landmark container for the active view. Shifts down if Demo Mode banner is active. */}
      <main 
        id="main-content" 
        tabIndex={-1} 
        className={`focus:outline-none flex-1 min-h-screen flex flex-col transition-all duration-300 ${
          isDemoMode ? 'pt-12' : ''
        }`}
      >
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </main>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <StudyProvider>
            <OfflineBanner />
            <Router>
              <AppContent />
            </Router>
          </StudyProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
