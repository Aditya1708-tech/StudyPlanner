import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, X, UserPlus } from 'lucide-react';

const DemoBanner: React.FC = () => {
  const { isDemoMode, exitDemoMode } = useAuth();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleCreateAccount = () => {
    exitDemoMode();
    navigate('/register');
  };

  const handleExitDemo = () => {
    exitDemoMode();
    navigate('/');
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] bg-surface-primary/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-brand-primary/25 h-12 px-4 md:px-6 flex items-center justify-between shadow-md shadow-brand-primary/5 select-none"
      role="status"
      aria-label="Demo mode warning banner"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="shrink-0 flex items-center gap-1 bg-brand-primary/15 text-brand-primary dark:text-brand-primary border border-brand-primary/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Demo Mode</span>
        </span>
        <span className="hidden sm:inline text-xs font-semibold text-text-secondary dark:text-slate-300 truncate">
          You’re exploring a fully populated sample workspace. Your real data is safely preserved.
        </span>
        <span className="inline sm:hidden text-[10px] font-semibold text-text-secondary dark:text-slate-300 truncate">
          Exploring sample workspace.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateAccount}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-pink-500 hover:from-primary-500 hover:to-pink-400 text-white font-extrabold text-[10px] cursor-pointer shadow-sm transition-all"
        >
          <UserPlus className="w-3 h-3" />
          <span>Create Account</span>
        </button>
        <button
          onClick={handleExitDemo}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-primary hover:bg-border-primary/50 text-text-secondary dark:text-slate-200 border border-border-primary dark:border-border-primary font-bold text-[10px] cursor-pointer transition-colors"
        >
          <X className="w-3 h-3" />
          <span>Exit Demo</span>
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
