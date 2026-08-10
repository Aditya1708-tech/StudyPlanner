import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRouteLoader: React.FC = () => (
  <div 
    className="min-h-screen bg-[#F7F8FC] dark:bg-slate-950 flex flex-col items-center justify-center text-slate-850 dark:text-slate-100"
    role="status"
    aria-label="Verifying authentication session"
  >
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#6D4AFF] to-pink-500 animate-spin" />
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 z-10" />
    </div>
  </div>
);

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <ProtectedRouteLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to dashboard if onboarding is already completed and user tries to access /onboarding
  if (user.onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
