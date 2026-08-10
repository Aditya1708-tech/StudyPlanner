import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import AnimatedPage from '../components/layout/AnimatedPage';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const { login, signInWithGoogle, resetPassword, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login / Forgot Password View toggle: 'login' | 'forgot'
  const [formMode, setFormMode] = useState<'login' | 'forgot'>('login');

  const [loading, setLoading] = useState(false);
  const [successMorph, setSuccessMorph] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (user) {
      if (user.onboardingCompleted) {
        navigate(from, { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, navigate, from]);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      setSuccessMorph(true);
      setTimeout(() => {
        // Redirection handled by useEffect hook
      }, 1000);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setFormMode('login');
    } catch (err) {
      // Toast handles error display
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMorph(true);
    } catch (err) {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: prefersReduced ? 0 : 50, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { x: prefersReduced ? 0 : -50, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-bg-primary flex font-sans text-text-primary dark:text-slate-100 overflow-hidden relative">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[140px] dark:bg-primary-950/20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[140px] dark:bg-pink-950/10 pointer-events-none" />

      {/* Main Container: Split Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 relative z-10 max-w-7xl mx-auto">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-6 flex flex-col justify-between p-8 sm:p-12 md:p-16">
          
          {/* Header Logo */}
          <Link to="/" className="flex items-center gap-2 group self-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white shadow-md  group-hover:rotate-6 transition-transform">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <span className="font-heading font-black text-lg tracking-tight">
              StudyAI<span className="text-brand-primary">Planner</span>
            </span>
          </Link>

          {/* Form Content Wrapper */}
          <div className="my-auto max-w-md w-full mx-auto py-10">
            <AnimatePresence mode="wait">
              {successMorph ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10 space-y-4"
                  key="success-splash"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="font-heading font-black text-2xl">Access Granted</h2>
                  <p className="text-xs text-text-secondary font-semibold">Preparing your personalized learning environment...</p>
                </motion.div>
              ) : formMode === 'login' ? (
                <motion.div
                  key="login-form"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 text-left"
                >
                  <div>
                    <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary dark:text-text-primary leading-tight">Welcome back</h1>
                    <p className="text-xs text-text-secondary font-semibold mt-1.5">Sign in to resume your study plans and streak schedules.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4.5">
                    
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="login-email" className="text-[10px] font-black uppercase text-text-muted tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-text-muted" />
                        <span>Email address</span>
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-text-primary"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label htmlFor="login-pass" className="text-[10px] font-black uppercase text-text-muted tracking-wider flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-text-muted" />
                          <span>Password</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={() => setFormMode('forgot')}
                          className="text-[10px] font-black uppercase text-brand-primary hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="login-pass"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-4 pr-11 py-3 rounded-xl bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-text-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-slate-650 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me row */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="remember-me-checkbox" className="flex items-center gap-2 text-xs font-semibold text-text-secondary dark:text-text-muted cursor-pointer select-none">
                        <input 
                          id="remember-me-checkbox"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-border-primary text-brand-primary focus:ring-primary-500"
                        />
                        <span>Remember my email</span>
                      </label>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </form>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-border-primary dark:border-border-primary"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-black uppercase text-text-muted tracking-widest">Or connect with</span>
                    <div className="flex-grow border-t border-border-primary dark:border-border-primary"></div>
                  </div>

                  {/* Google Login button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary hover:bg-bg-primary dark:hover:bg-slate-800 rounded-xl text-text-secondary dark:text-slate-255 font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Sign In</span>
                  </button>

                  <p className="text-center text-xs font-semibold text-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-primary hover:underline font-extrabold">
                      Register free
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-form"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 text-left"
                >
                  <button 
                    onClick={() => setFormMode('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-text-secondary hover:text-brand-primary cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to login</span>
                  </button>

                  <div>
                    <h1 className="font-heading font-black text-3xl text-text-primary dark:text-text-primary">Reset password</h1>
                    <p className="text-xs text-text-secondary font-semibold mt-1.5">Enter your email and we'll send a password recovery link.</p>
                  </div>

                  <form onSubmit={handleResetSubmit} className="space-y-4.5">
                    <div className="space-y-1.5">
                      <label htmlFor="reset-email" className="text-[10px] font-black uppercase text-text-muted tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-text-muted" />
                        <span>Email address</span>
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-primary dark:bg-surface-primary border border-border-primary dark:border-border-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-text-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Send Recovery Email</span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer credentials info */}
          <div className="text-[10px] font-black uppercase tracking-wider text-text-muted text-center lg:text-left">
            Built with React 19, TypeScript, and Firebase Auth
          </div>
        </div>

        {/* Right Side: Showcase Illustration Graphics */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 p-12 flex-col justify-between items-center text-center relative overflow-hidden">
          {/* Neon lights */}
          <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full flex justify-end">
            <Link to="/" className="text-xs text-text-muted hover:text-white font-extrabold flex items-center gap-1">
              <span>Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Central Mock Graphics layout with Framer Motion floating */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="w-full max-w-sm rounded-[32px] p-2 bg-gradient-to-tr from-primary-500/20 to-pink-500/20 border border-white/10 shadow-xl relative z-10"
          >
            <div className="rounded-[28px] overflow-hidden bg-slate-950/70 border border-white/5 p-6 text-left space-y-4">
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center shadow-lg"><Sparkles className="w-4.5 h-4.5" /></div>
                <div>
                  <div className="font-heading font-black text-xs text-white leading-none">AI Study operating system</div>
                  <span className="text-[7.5px] uppercase font-bold text-primary-400">Gemini Planner Pro</span>
                </div>
              </div>

              <div className="p-3 bg-surface-primary/5 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[8.5px] font-black uppercase text-text-muted">
                  <span>Calculus Study Plan</span>
                  <span className="text-emerald-450">Completed</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450" />
                  <span>Calculus limits revision block</span>
                </div>
              </div>

              {/* Dynamic checklist logs inside image */}
              <div className="flex justify-between items-center text-[10px] text-text-muted border-t border-white/5 pt-3">
                <span className="font-bold flex items-center gap-0.5">🔥 6 Days Active</span>
                <span className="font-black text-primary-400">42+ Tests Passed</span>
              </div>

            </div>
          </motion.div>

          <div className="space-y-2.5 max-w-xs relative z-10 text-white">
            <h2 className="font-heading font-black text-xl">Ace your semesters proactively.</h2>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              Plan weeks in advance, run offline timers, get structural AI revision guides, and stay consistent.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AnimatedPage>
);
};

export default Login;
