import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, getAuthService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  
  // Demo Mode extensions
  isDemoMode: boolean;
  startDemoMode: () => void;
  exitDemoMode: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = React.useMemo(() => getAuthService(), []);

  // Demo mode state tracks if the active session is a mock demo
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('is_demo_mode') === 'true';
  });

  // Listen to auth state transitions
  useEffect(() => {
    if (isDemoMode) {
      setUser({
        uid: 'demo-user-123',
        email: 'demo@studyai.pro',
        displayName: 'Demo Student',
        onboardingCompleted: true
      });
      setLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChanged((fbUser) => {
      setUser(fbUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authService, isDemoMode]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const authUser = await authService.login(email, password);
      setUser(authUser);
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      showToast("Logged in successfully! Welcome back.", "success");
    } catch (e: any) {
      showToast(e.message || "Login failed. Check your credentials.", "error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authUser = await authService.register(email, password);
      setUser(authUser);
      showToast("Account created successfully! Welcome.", "success");
    } catch (e: any) {
      showToast(e.message || "Registration failed. Try again.", "error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      showToast("Logged out successfully.", "info");
    } catch (e: any) {
      showToast("Logout failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      showToast("Password reset email sent. Check your inbox.", "success");
    } catch (e: any) {
      showToast(e.message || "Failed to send reset email.", "error");
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const authUser = await authService.signInWithGoogle();
      setUser(authUser);
      showToast("Authenticated with Google successfully!", "success");
    } catch (e: any) {
      showToast(e.message || "Google authentication failed.", "error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const setOnboardingCompleted = async (completed: boolean) => {
    try {
      await authService.setOnboardingCompleted(completed);
      if (user) {
        setUser({ ...user, onboardingCompleted: completed });
      }
    } catch (e) {
      console.error("Failed to set onboarding complete", e);
    }
  };

  // Start demo mode workspace session
  const startDemoMode = () => {
    localStorage.setItem('is_demo_mode', 'true');
    setIsDemoMode(true);
    setUser({
      uid: 'demo-user-123',
      email: 'demo@studyai.pro',
      displayName: 'Demo Student',
      onboardingCompleted: true
    });
  };

  // Exit demo mode workspace session
  const exitDemoMode = () => {
    localStorage.removeItem('is_demo_mode');
    setIsDemoMode(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        signInWithGoogle,
        setOnboardingCompleted,
        isDemoMode,
        startDemoMode,
        exitDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
