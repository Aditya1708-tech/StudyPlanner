import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  BookOpen, 
  Sparkles, 
  User, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useStudy();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully.", "success");
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const showUnavailable = (name: string) => {
    showToast(`${name} is available for registered enterprise accounts.`, "info");
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 rounded-full glass-panel px-6 py-2.5 flex items-center justify-between transition-colors duration-300 border border-border-primary/50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform">
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary flex items-center gap-1.5">
          StudyAI<span className="text-brand-primary">Planner</span>
        </span>
      </Link>

      {/* Nav Links: Conditional based on Auth status */}
      <div className="hidden md:flex items-center gap-6">
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/planner" 
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors"
            >
              AI Planner
            </Link>
            <Link 
              to="/analytics" 
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors"
            >
              Analytics
            </Link>
            <Link 
              to="/health"
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors"
            >
              Health Check
            </Link>
          </>
        ) : (
          <>
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => showUnavailable('Pricing Plan Details')}
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => showUnavailable('API Documentation')}
              className="text-xs font-black uppercase text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
            >
              Docs
            </button>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-border-primary/50 hover:bg-bg-primary/50 text-text-secondary transition-all active:scale-95 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-primary" />}
        </button>

        {/* Auth CTAs */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary border border-border-primary/50">
              <User className="w-3.5 h-3.5 text-brand-primary" />
              <span>{user.displayName || 'Student'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full border border-rose-200/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-black uppercase text-text-secondary hover:text-text-primary px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="relative inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-primary to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all duration-200 group active:scale-95"
            >
              <span>Get Started</span>
              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
