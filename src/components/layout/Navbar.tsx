import React from 'react';
import { Link } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import { Sun, Moon, Sparkles, BookOpen } from 'lucide-react';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useStudy();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 rounded-2xl glass-panel px-6 py-4 flex items-center justify-between transition-colors duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:rotate-6 transition-transform">
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="font-heading font-extrabold text-xl tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
          StudyAI<span className="text-primary-500 dark:text-primary-300">Planner</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => scrollToSection('features')} 
          className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors cursor-pointer"
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection('how-it-works')} 
          className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors cursor-pointer"
        >
          How It Works
        </button>
        <Link 
          to="/dashboard" 
          className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors"
        >
          Dashboard
        </Link>
        <Link 
          to="/health"
          className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors"
        >
          Health Check
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200/50 hover:bg-slate-100/50 dark:border-slate-800/40 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary-600" />}
        </button>

        {/* CTA */}
        <Link
          to="/dashboard"
          className="relative inline-flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 hover:-translate-y-0.5 transition-all duration-200 group active:scale-95"
        >
          <span>Launch Dashboard</span>
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
