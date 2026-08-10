import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div 
        className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 w-[90%] max-w-sm pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';
            const isSuccess = toast.type === 'success';

            // WCAG AA role and live region mapping
            const role = isError ? 'alert' : 'status';
            const ariaLive = isError ? 'assertive' : 'polite';

            let Icon = Info;
            let themeClasses = '';

            if (isSuccess) {
              Icon = CheckCircle2;
              themeClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/5';
            } else if (isError) {
              Icon = AlertCircle;
              themeClasses = 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 shadow-red-500/5';
            } else if (isWarning) {
              Icon = AlertTriangle;
              themeClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-amber-500/5';
            } else {
              Icon = Info;
              themeClasses = 'bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400 shadow-primary-500/5';
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                role={role}
                aria-live={ariaLive}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel border shadow-xl ${themeClasses}`}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs font-semibold leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors cursor-pointer"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
