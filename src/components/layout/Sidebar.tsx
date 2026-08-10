import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  CheckSquare, 
  BarChart3, 
  Sun, 
  Moon, 
  BookOpen, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  Calendar,
  Library
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useStudy();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Planner', path: '/planner', icon: SparklesIcon },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'AI Assistant', path: '/assistant', icon: MessageSquarePlus },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Health Check', path: '/health', icon: Activity },
    { name: 'Resources', path: '/resources', icon: Library }
  ];

  function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
        <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
      </svg>
    );
  }

  const handleMobileLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel px-4 flex items-center justify-between z-40 border-b border-slate-200/50 dark:border-slate-800/40">
        <Link to="/" className="flex items-center gap-2" aria-label="StudyAI Planner Homepage">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-base text-slate-850 dark:text-white">
            StudyAI
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-350 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle Dark/Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary-600" />}
          </button>
          
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-650 dark:text-slate-350 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation Drawer">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            role="presentation"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-xs h-full bg-slate-50 dark:bg-dark-950 p-6 flex flex-col justify-between border-r border-slate-200/50 dark:border-slate-800/50 shadow-2xl z-10 transition-transform duration-300">
            <div>
              {/* Logo / Title */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2" onClick={handleMobileLinkClick} aria-label="StudyAI Planner Homepage">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-extrabold text-lg text-slate-800 dark:text-white">
                    StudyAI <span className="text-primary-500">Planner</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="space-y-1.5" aria-label="Mobile Navigation Links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleMobileLinkClick}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500/10 to-pink-500/5 border border-primary-500/20 text-primary-655 dark:text-primary-400'
                          : 'text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-655 dark:text-primary-400' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Bottom utilities */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 space-y-4">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-650 dark:text-slate-350 text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
                aria-label="Toggle theme color"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-primary-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 px-4">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-350 font-extrabold text-sm border border-primary-500/10">
                  AS
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">Aditya S.</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Student Space</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col justify-between fixed top-0 left-0 bottom-0 z-30 h-screen border-r border-slate-200/40 dark:border-slate-800/40 glass-panel transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Desktop Sidebar Navigation"
      >
        <div>
          {/* Header */}
          <div className={`flex items-center h-20 px-6 border-b border-slate-250/20 dark:border-slate-800/40 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <Link to="/" className="flex items-center gap-2.5" aria-label="StudyAI Planner Homepage">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              {!collapsed && (
                <span className="font-heading font-black text-lg tracking-tight text-slate-850 dark:text-white">
                  StudyAI<span className="text-primary-500">Planner</span>
                </span>
              )}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5 mt-4" aria-label="Sidebar Menu Links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all group relative min-h-[44px] ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/10 to-pink-500/5 border border-primary-500/20 text-primary-655 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-100/50 dark:hover:text-white dark:hover:bg-slate-800/30'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-primary-655 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-350'
                  }`} />
                  {!collapsed && <span>{item.name}</span>}
                  
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-24 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 bg-slate-900 text-white dark:bg-slate-850 dark:text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-md font-normal pointer-events-none whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom */}
        <div className="p-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4 bg-slate-100/10 dark:bg-slate-900/10">
          {/* Collapse/Expand Toggle (Floater) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex items-center justify-center w-full py-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer min-h-[40px] focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-150/60 dark:hover:bg-slate-800/40 text-slate-655 dark:text-slate-350 text-sm font-semibold transition-colors cursor-pointer min-h-[44px] ${collapsed ? 'justify-center' : ''}`}
            aria-label="Toggle theme color mode"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                {!collapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-primary-600 shrink-0" />
                {!collapsed && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* User profile info */}
          <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/70 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-extrabold text-sm shrink-0 shadow-sm shadow-primary-500/5">
              AS
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate leading-tight">Aditya S.</div>
                <div className="text-[10px] text-slate-550 dark:text-slate-400 truncate uppercase font-bold tracking-wider">Premium Student</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
