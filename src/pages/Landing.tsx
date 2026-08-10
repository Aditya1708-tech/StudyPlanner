import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DemoLoader from '../components/ui/DemoLoader';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  CheckSquare, 
  BookOpen,
  Clock,
  Flame,
  CheckCircle2,
  Smartphone,
  Award,
  Zap,
  XCircle,
  MessageSquare
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import GlassCard from '../components/ui/GlassCard';
import AnimatedPage from '../components/layout/AnimatedPage';
import Spotlight from '../components/ui/Spotlight';
import useTilt from '../hooks/useTilt';
import useMagnetic from '../hooks/useMagnetic';
import useParallax from '../hooks/useParallax';
import { fadeUp, staggerContainer, staggerItem, buttonTap } from '../lib/motion';

// Animated Stats Counter component
const Counter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 1200 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setCount(target);
      return;
    }

    let isMounted = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTime: number | null = null;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            if (isMounted) {
              setCount(Math.floor(percentage * target));
            }

            if (percentage < 1) {
              window.requestAnimationFrame(animate);
            }
          };

          window.requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [target, duration, prefersReduced]);

  return <span ref={countRef}>{count}{suffix}</span>;
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, startDemoMode } = useAuth();
  const [showDemoLoader, setShowDemoLoader] = useState(false);

  const handleTryDemo = () => {
    startDemoMode();
    setShowDemoLoader(true);
  };

  const getStartedPath = user 
    ? (user.onboardingCompleted ? '/dashboard' : '/onboarding') 
    : '/register';

  // 1. Live AI Simulator Stepper Animation
  const [simStep, setSimStep] = useState(0); // 0 to 5
  const [typedText, setTypedText] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const simulatorSteps = [
    "Analyze syllabus",
    "Estimate workload",
    "Allocate study blocks",
    "Create revision strategy",
    "Generate daily schedule"
  ];

  // Simulator animation logic
  useEffect(() => {
    let textTimer: any = null;
    let stepTimer: any = null;

    const runStep = (stepIdx: number) => {
      if (stepIdx >= simulatorSteps.length) {
        stepTimer = setTimeout(() => {
          setSimStep(0);
          setCompletedSteps([]);
          setProgress(0);
          setTypedText('');
          runStep(0);
        }, 4000);
        return;
      }

      setSimStep(stepIdx);
      const targetText = simulatorSteps[stepIdx];
      let currentLength = 0;
      setTypedText('');

      // Typewriter effect
      textTimer = setInterval(() => {
        if (currentLength < targetText.length) {
          setTypedText(targetText.slice(0, currentLength + 1));
          currentLength++;
        } else {
          clearInterval(textTimer);
          
          // Complete step and trigger progress addition
          stepTimer = setTimeout(() => {
            setCompletedSteps(prev => [...prev, stepIdx]);
            setProgress((stepIdx + 1) * 20);
            
            // Start next step
            setTimeout(() => {
              runStep(stepIdx + 1);
            }, 600);
          }, 800);
        }
      }, 40);
    };

    runStep(0);

    return () => {
      clearInterval(textTimer);
      clearTimeout(stepTimer);
    };
  }, []);

  // 3D Card mouse-follow tilt mechanics from custom hook
  const { ref: cardRef, onMouseMove, onMouseLeave, style: tiltStyle, glareStyle } = useTilt({ maxRotation: 6, glare: true });

  // Parallax elements
  const orb1Parallax = useParallax(-0.06);
  const orb2Parallax = useParallax(0.04);
  const floatTimerParallax = useParallax(-0.08);
  const floatStreakParallax = useParallax(0.08);

  // Magnetic CTAs
  const getStartedMagnetic = useMagnetic(0.25);
  const demoMagnetic = useMagnetic(0.2);

  // Testimonials
  const testimonials = [
    {
      quote: "Before StudyAI, I'd reactively cram the night before midterms and feel completely overwhelmed. The AI generated plan spread the math review modules over 3 weeks. I aced my exam stress-free.",
      author: "Sarah L.",
      major: "Pre-Med, University of Washington",
      avatarBg: "bg-primary-50 text-brand-primary dark:bg-slate-900"
    },
    {
      quote: "The combination of the floating Pomodoro widget and streak tracking kept me focused. Auto-logging my study blocks directly binds my tasks completed to actual hours logged.",
      author: "Marcus K.",
      major: "Computer Science, UT Austin",
      avatarBg: "bg-primary-50 text-brand-primary dark:bg-slate-900"
    },
    {
      quote: "Creating calendars on paper just didn't work. Having a plan that recalibrates based on when my chemistry assessments are scheduled saves me hours of planning every weekend.",
      author: "Elena R.",
      major: "Chemical Engineering, Georgia Tech",
      avatarBg: "bg-primary-50 text-brand-primary dark:bg-slate-900"
    }
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 overflow-x-hidden font-sans relative">
        
        {/* Spotlight system */}
        <Spotlight />

        {/* Background Mesh Gradients with Parallax Orbs */}
        <div className="absolute top-0 inset-x-0 h-[1200px] pointer-events-none overflow-hidden z-0">
          <motion.div 
            style={orb1Parallax}
            className="absolute top-[-200px] left-[10%] w-[700px] h-[700px] bg-brand-primary/8 rounded-full blur-[140px]" 
          />
          <motion.div 
            style={orb2Parallax}
            className="absolute top-[100px] right-[5%] w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[140px]" 
          />
        </div>

        <Navbar />

        {/* Split Hero Section */}
        <section className="relative pt-40 pb-28 md:pt-48 md:pb-40 px-6 max-w-7xl mx-auto z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center"
          >
            
            {/* Left Column: Editorial Info */}
            <div className="lg:col-span-5 space-y-8 text-left">
              {/* Badge */}
              <motion.div
                variants={staggerItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-xs font-semibold shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>StudyAI Planner Pro v2.5</span>
              </motion.div>

              {/* Editorial Title */}
              <motion.h1
                variants={staggerItem}
                className="space-y-2 font-heading font-black text-5xl sm:text-6xl tracking-tight leading-[1.05] text-text-primary"
              >
                <span className="block">Study smarter.</span>
                <span className="block">Stay consistent.</span>
                <span className="block text-gradient">Ace every exam.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={staggerItem}
                className="text-text-secondary text-sm sm:text-base font-semibold leading-relaxed max-w-xl"
              >
                An AI-powered study operating system that builds personalized revision schedules, tracks real progress, logs study sessions, and keeps you focused every day.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={staggerItem}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto"
              >
                {user ? (
                  <>
                    <motion.div ref={getStartedMagnetic.ref} style={getStartedMagnetic.style}>
                      <motion.div {...buttonTap}>
                        <Link
                          to={getStartedPath}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold shadow-lg shadow-brand-primary/20 hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wider cursor-pointer"
                        >
                          <span>Launch Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    </motion.div>

                    <motion.div ref={demoMagnetic.ref} style={demoMagnetic.style}>
                      <motion.div {...buttonTap}>
                        <button
                          onClick={handleTryDemo}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full border border-border-primary bg-surface-primary/45 hover:bg-surface-primary/80 text-text-primary font-bold transition-all text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Try Demo Mode
                        </button>
                      </motion.div>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div ref={getStartedMagnetic.ref} style={getStartedMagnetic.style}>
                      <motion.div {...buttonTap}>
                        <button
                          onClick={handleTryDemo}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold shadow-lg shadow-brand-primary/20 hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wider cursor-pointer font-sans"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Try Demo</span>
                        </button>
                      </motion.div>
                    </motion.div>

                    <motion.div ref={demoMagnetic.ref} style={demoMagnetic.style}>
                      <motion.div {...buttonTap}>
                        <Link
                          to="/register"
                          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full border border-border-primary bg-surface-primary/45 hover:bg-surface-primary/80 text-text-primary font-bold transition-all text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Get Started
                        </Link>
                      </motion.div>
                    </motion.div>

                    <Link
                      to="/login"
                      className="text-xs uppercase tracking-wider font-extrabold text-text-secondary hover:text-brand-primary px-4 py-2 cursor-pointer transition-colors"
                    >
                      Login
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Credibility section */}
              <motion.div
                variants={staggerItem}
                className="pt-8 border-t border-border-primary space-y-3"
              >
                <span className="text-[10px] font-black uppercase text-text-muted tracking-widest block">Credible Technology Stack</span>
                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <span className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-primary">React 19</span>
                  <span className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-primary">TypeScript</span>
                  <span className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-primary">Tailwind CSS v4</span>
                  <span className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-primary">Framer Motion</span>
                  <span className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-primary">Gemini AI</span>
                  <span className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-primary">Vite + Vercel</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Layered Dashboard Sandbox Preview with Live AI Simulator */}
            <motion.div 
              variants={fadeUp}
              className="lg:col-span-7 relative flex justify-center items-center"
            >
              {/* Radial background blur glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/15 to-pink-500/10 rounded-3xl blur-3xl pointer-events-none z-0" />

              {/* Floating Pomodoro Timer card */}
              <motion.div
                style={floatTimerParallax}
                className="absolute top-[-30px] left-[-30px] hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-surface-primary/90 border border-border-primary shadow-xl backdrop-blur-md z-30 w-44"
              >
                <div className="w-10 h-10 rounded-full border-2 border-brand-primary flex items-center justify-center text-[10px] font-black text-brand-primary animate-pulse">
                  25:00
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black text-text-primary uppercase tracking-wider">Focus Timer</div>
                  <span className="text-[9px] text-text-secondary font-semibold">Active Session</span>
                </div>
              </motion.div>

              {/* Floating Streaks card */}
              <motion.div
                style={floatStreakParallax}
                className="absolute bottom-[-30px] right-[-10px] hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-surface-primary/90 border border-border-primary shadow-xl backdrop-blur-md z-30 w-44"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Flame className="w-5.5 h-5.5 fill-orange-500" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black text-text-primary uppercase tracking-wider">Active Streak</div>
                  <span className="text-[9px] text-orange-500 font-extrabold">🔥 7 Days Active</span>
                </div>
              </motion.div>

              <div
                id="preview"
                ref={cardRef}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={tiltStyle}
                className="w-full relative rounded-3xl p-2.5 bg-gradient-to-tr from-brand-primary/20 to-pink-500/20 border border-border-primary shadow-2xl backdrop-blur-md z-10 transition-shadow duration-300 cursor-default overflow-hidden"
              >
                {/* Glare sheen element */}
                <div className="pointer-events-none absolute inset-0 z-20" style={glareStyle} />

                {/* Dashboard Sandbox Simulation Body (with Split Layout Sidebar + Content) */}
                <div className="rounded-[20px] overflow-hidden bg-surface-primary border border-border-primary flex flex-row min-h-[500px] relative z-10">
                  
                  {/* Mock Sidebar Left Panel */}
                  <div className="hidden sm:flex w-40 bg-bg-primary border-r border-border-primary/80 flex-col p-4 justify-between select-none">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white"><BookOpen className="w-3.5 h-3.5" /></div>
                        <span className="font-heading font-black text-xs text-text-primary">StudyAI</span>
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="px-2 py-1.5 rounded-lg bg-surface-primary border border-border-primary/30 text-[9px] font-bold text-brand-primary flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          <span>Dashboard</span>
                        </div>
                        <div className="px-2 py-1.5 rounded-lg text-[9px] font-bold text-text-muted hover:text-text-secondary flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                          <span>AI Planner</span>
                        </div>
                        <div className="px-2 py-1.5 rounded-lg text-[9px] font-bold text-text-muted hover:text-text-secondary flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                          <span>Calendar</span>
                        </div>
                        <div className="px-2 py-1.5 rounded-lg text-[9px] font-bold text-text-muted hover:text-text-secondary flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                          <span>Analytics</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[7.5px] font-black text-text-muted uppercase tracking-wider text-left border-t border-border-primary/50 pt-3">
                      v1.2.0 Production
                    </div>
                  </div>

                  {/* Main Preview Sandbox Content */}
                  <div className="flex-1 flex flex-col min-h-[500px]">
                    {/* Header Sandbox Bar */}
                    <div className="h-12 bg-bg-primary/50 flex items-center px-6 justify-between border-b border-border-primary">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400"></span>
                      </div>
                      
                      <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-brand-primary/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                        <span>Live AI Simulator</span>
                      </span>
                      
                      <div className="w-6"></div>
                    </div>

                    {/* Dashboard Sandbox Simulation Body */}
                    <div className="flex-1 p-6 space-y-6 flex flex-col justify-between">
                      
                      {/* Actual Dashboard Metric Cards Row */}
                      <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
                        
                        {/* Metric 1 */}
                        <div className="p-3.5 rounded-xl border border-border-primary bg-bg-primary text-left space-y-1">
                          <span className="text-[8px] font-black text-text-muted uppercase tracking-wider block">Today's Tasks</span>
                          <div className="text-xs font-heading font-black text-text-primary leading-none mt-1">
                            {simStep >= 5 ? "0 / 2" : "2 Pending"}
                          </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="p-3.5 rounded-xl border border-border-primary bg-bg-primary text-left space-y-1">
                          <span className="text-[8px] font-black text-text-muted uppercase tracking-wider block">Study Time</span>
                          <div className="text-xs font-heading font-black text-text-primary leading-none mt-1">
                            {simStep >= 5 ? "3.5 h" : "0.0 h"}
                          </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="p-3.5 rounded-xl border border-border-primary bg-bg-primary text-left space-y-1">
                          <span className="text-[8px] font-black text-text-muted uppercase tracking-wider block">Streak</span>
                          <div className="text-xs font-heading font-black text-orange-500 flex items-center gap-0.5 leading-none mt-1">
                            <span>7 Days</span>
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                          </div>
                        </div>

                        {/* Metric 4 */}
                        <div className="p-3.5 rounded-xl border border-border-primary bg-bg-primary text-left space-y-1">
                          <span className="text-[8px] font-black text-text-muted uppercase tracking-wider block">Next Exam</span>
                          <div className="text-xs font-heading font-black text-brand-secondary truncate leading-none mt-1">
                            {simStep >= 3 ? "Chemistry" : "None"}
                          </div>
                        </div>

                      </div>

                      {/* Simulator Stepper Log */}
                      <div className="space-y-3.5 flex-1 py-4 text-left">
                        <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">AI Planning Core Pipeline</span>
                        
                        {/* Active Stepper Tracker */}
                        <div className="space-y-2">
                          {simulatorSteps.map((stepStr, idx) => {
                            const isCompleted = completedSteps.includes(idx);
                            const isActive = simStep === idx;

                            return (
                              <div 
                                key={idx}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                                  isCompleted 
                                    ? 'bg-brand-success/5 border-brand-success/20 text-brand-success' 
                                    : isActive 
                                      ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary font-bold scale-[1.01]' 
                                      : 'bg-bg-primary/50 border-border-primary text-text-muted'
                                }`}
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                    isCompleted 
                                      ? 'bg-brand-success text-white border border-brand-success' 
                                      : isActive 
                                        ? 'bg-brand-primary text-white animate-pulse border border-brand-primary' 
                                        : 'bg-bg-primary border border-border-primary text-text-muted'
                                  }`}>
                                    {isCompleted ? "✓" : `0${idx + 1}`}
                                  </span>
                                  
                                  <span className="flex items-center gap-0.5">
                                    {isActive ? (
                                      <>
                                        <span>{typedText}</span>
                                        <span className="w-1 h-3.5 bg-brand-primary animate-pulse inline-block" />
                                      </>
                                    ) : (
                                      <span>{stepStr}</span>
                                    )}
                                  </span>
                                </div>

                                {isCompleted && (
                                  <motion.span 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[10px] font-black uppercase text-brand-success"
                                  >
                                    Ready
                                  </motion.span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="space-y-2 pt-3 border-t border-border-primary text-left">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-text-muted">
                          <span>Schedule Compilation</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-primary rounded-full overflow-hidden border border-border-primary">
                          <div 
                            style={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full transition-all duration-500" 
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* Spacing & Pipeline layout */}
        <section id="how-it-works" className="py-24 md:py-32 px-6 max-w-7xl mx-auto z-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Scheduler Pipeline</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight text-text-primary">How it works</h2>
            <p className="text-text-secondary text-sm font-semibold">Transforming unstructured syllabi into productive focus schedules instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-20 left-32 right-32 h-0.5 bg-gradient-to-r from-brand-primary/10 via-pink-500/10 to-brand-secondary/10 z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 group relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-surface-primary border border-border-primary shadow-lg flex items-center justify-center font-heading font-black text-2xl text-brand-primary group-hover:scale-105 transition-all">
                01
              </div>
              <h3 className="font-heading font-extrabold text-lg text-text-primary">Add Subjects & Exams</h3>
              <p className="text-text-secondary text-xs font-semibold leading-relaxed max-w-xs">
                Input curriculum courses and critical deadline dates inside the Onboarding assistant.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 group relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-surface-primary border border-border-primary shadow-lg flex items-center justify-center font-heading font-black text-2xl text-pink-500 group-hover:scale-105 transition-all">
                02
              </div>
              <h3 className="font-heading font-extrabold text-lg text-text-primary">AI Compiles Schedule</h3>
              <p className="text-text-secondary text-xs font-semibold leading-relaxed max-w-xs">
                The Gemini model slices workloads into dynamic blocks, prioritizing exam counts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 group relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-surface-primary border border-border-primary shadow-lg flex items-center justify-center font-heading font-black text-2xl text-brand-secondary group-hover:scale-105 transition-all">
                03
              </div>
              <h3 className="font-heading font-extrabold text-lg text-text-primary">Track Progress Daily</h3>
              <p className="text-text-secondary text-xs font-semibold leading-relaxed max-w-xs">
                Complete scheduled tasks, log hours with the focus clock, and visualize streaking analytics.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 md:py-32 px-6 bg-surface-primary/20 border-y border-border-primary z-10 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Core Capabilities</span>
              <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight text-text-primary">Built for High Performance</h2>
              <p className="text-text-secondary text-sm font-semibold">Everything you need to structured learning, consolidated in a single grid.</p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Bento Card 1 */}
              <div className="md:col-span-2 p-8 rounded-3xl bg-surface-primary border border-border-primary shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                  <h3 className="font-heading font-black text-xl text-text-primary">AI Personalized Planner</h3>
                  <p className="text-text-secondary text-xs font-semibold max-w-lg">
                    Generates full multi-week revision maps tailored to your exact curriculum, exam weights, and remaining prep days.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-bg-primary border border-border-primary space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-muted">
                    <span>Calculus Study Plan</span>
                    <span className="text-brand-primary font-bold">Scheduled</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs font-semibold text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-brand-primary" />
                    <span>Day 1: Derivatives and Core Limits revision block</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs font-semibold text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Day 2: Advanced Integration pathways exercise</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 2 */}
              <div className="p-8 rounded-3xl bg-surface-primary border border-border-primary shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                  <h3 className="font-heading font-black text-xl text-text-primary">Focus Timer</h3>
                  <p className="text-text-secondary text-xs font-semibold">
                    Floating customizable Pomodoro timer directly logging sessions to context storage.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-brand-secondary/5 border border-brand-secondary/10 text-center text-xs font-black text-brand-secondary">
                  25:00 Focus Block
                </div>
              </div>

              {/* Bento Card 3 */}
              <div className="p-8 rounded-3xl bg-surface-primary border border-border-primary shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center"><CheckSquare className="w-5 h-5" /></div>
                  <h3 className="font-heading font-black text-xl text-text-primary">Smart Tasks</h3>
                  <p className="text-text-secondary text-xs font-semibold">
                    Organize tasks with subjects, weights, priorities, and workloads.
                  </p>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-bg-primary border border-border-primary">
                  <span className="text-xs font-bold text-text-primary">Physics Practice Paper</span>
                  <span className="text-[9px] font-black uppercase text-brand-warning">High</span>
                </div>
              </div>

              {/* Bento Card 4 */}
              <div className="md:col-span-2 p-8 rounded-3xl bg-surface-primary border border-border-primary shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
                  <h3 className="font-heading font-black text-xl text-text-primary">AI Assistant Chat</h3>
                  <p className="text-text-secondary text-xs font-semibold">
                    Instant academic Coach to review reaction mechanisms, break down complex concepts, and generate tasks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bg-primary border border-border-primary text-[11px] font-semibold space-y-2">
                  <div className="flex gap-2">
                    <span className="font-black text-brand-primary">Student:</span>
                    <span className="text-text-secondary">Explain electrophilic additions in Organic Chemistry.</span>
                  </div>
                  <div className="flex gap-2 border-t border-border-primary pt-2">
                    <span className="font-black text-pink-500">AI Coach:</span>
                    <span className="text-text-secondary">Organic Chemistry Chapter 4 covers electrophilic additions. I've scheduled a practice session tomorrow.</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 5 */}
              <div className="p-8 rounded-3xl bg-surface-primary border border-border-primary shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-success/10 text-brand-success flex items-center justify-center"><Smartphone className="w-5 h-5" /></div>
                  <h3 className="font-heading font-black text-xl text-text-primary">Offline Sync</h3>
                  <p className="text-text-secondary text-xs font-semibold">
                    Service workers cache configuration data, allowing you to track schedules and run timers completely offline.
                  </p>
                </div>
                <div className="flex gap-2 items-center justify-center text-[10px] font-black uppercase text-brand-success bg-brand-success/5 border border-brand-success/10 py-2 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                  <span>Indexed Cache Standby</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Proactive Philosophy */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto z-10 relative">
          <GlassCard 
            hover={false} 
            className="bg-gradient-to-tr from-brand-primary/10 via-pink-500/5 to-transparent border border-brand-primary/20 p-8 md:p-16 rounded-[32px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Proactive Strategy</span>
              </div>
              
              <h2 className="font-heading font-black text-3xl md:text-4xl text-text-primary leading-tight">
                Built for students who are tired of studying reactively.
              </h2>
              
              <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                Cramming a vast syllabus the night before leads to stress, exhaustion, and sub-optimal grades. StudyAI structures a balanced load weeks in advance, dynamic scheduling automatically adjusts.
              </p>

              <div className="pt-2">
                <Link to={getStartedPath} className="px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md">
                  Launch Dashboard
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3 text-left">
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-xs">Reactive Cramming</h3>
                </div>
                <ul className="text-[10px] text-text-secondary font-semibold space-y-2 list-disc list-inside">
                  <li>Panicked midnight revision sessions</li>
                  <li>Losing track of exam count down weights</li>
                  <li>Unbalanced study density causing burnout</li>
                  <li>Zero metrics or analytics on study hours</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-brand-success/20 bg-brand-success/5 space-y-3 text-left">
                <div className="flex items-center gap-2 text-brand-success">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-xs">Proactive Planning</h3>
                </div>
                <ul className="text-[10px] text-text-secondary font-semibold space-y-2 list-disc list-inside">
                  <li>Structured daily workload schedules</li>
                  <li>Clear milestone targets calculated</li>
                  <li>Consistent Pomodoro active logs</li>
                  <li>Dynamic recalibration when plans slip</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Stats counters */}
        <section className="py-20 md:py-24 px-6 bg-surface-primary/10 border-t border-border-primary z-10 relative">
          <div className="max-w-7xl mx-auto text-center space-y-12">
            <div className="space-y-3">
              <h3 className="font-heading font-black text-2xl md:text-3xl text-text-primary">Authentic Capability Specifications</h3>
              <p className="text-text-muted text-xs font-semibold">Real statistics representing the architectural durability of this dashboard.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              
              <div className="p-5 rounded-2xl bg-surface-primary border border-border-primary text-center space-y-1">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto"><Brain className="w-5 h-5" /></div>
                <h4 className="font-heading font-black text-xl text-text-primary leading-none">AI-First</h4>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Planning Engine</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-primary border border-border-primary text-center space-y-1">
                <div className="w-9 h-9 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center mx-auto"><Smartphone className="w-5 h-5" /></div>
                <h4 className="font-heading font-black text-xl text-text-primary leading-none">100%</h4>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Offline Cache</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-primary border border-border-primary text-center space-y-1">
                <div className="w-9 h-9 rounded-xl bg-brand-success/10 text-brand-success flex items-center justify-center mx-auto"><Award className="w-5 h-5" /></div>
                <h4 className="font-heading font-black text-xl text-text-primary leading-none">
                  <Counter target={100} />
                </h4>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Accessibility Score</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-primary border border-border-primary text-center space-y-1">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto"><CheckSquare className="w-5 h-5" /></div>
                <h4 className="font-heading font-black text-xl text-text-primary leading-none">
                  <Counter target={42} suffix="+" />
                </h4>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Automated Tests</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-primary border border-border-primary text-center col-span-2 md:col-span-1 space-y-1">
                <div className="w-9 h-9 rounded-xl bg-brand-warning/10 text-brand-warning flex items-center justify-center mx-auto"><Zap className="w-5 h-5" /></div>
                <h4 className="font-heading font-black text-base text-text-primary leading-none pt-1">Production</h4>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Ready State</p>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto text-center space-y-16 z-10 relative">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Student Reviews</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-text-primary">What Students Say</h2>
            <p className="text-text-secondary text-sm font-semibold">Real results from university students who restructured their schedules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <GlassCard key={idx} hover={true} className="p-8 text-left flex flex-col justify-between space-y-6">
                <p className="text-xs text-text-secondary font-semibold italic leading-relaxed">
                  "{test.quote}"
                </p>
                
                <div className="flex items-center gap-3 border-t border-border-primary pt-4">
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-brand-primary dark:bg-slate-900 flex items-center justify-center font-black text-xs shrink-0">
                    {test.author[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-text-primary">{test.author}</h3>
                    <p className="text-[9px] text-text-muted font-bold">{test.major}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Matrix comparison */}
        <section className="py-24 md:py-32 px-6 bg-surface-primary/30 border-y border-border-primary z-10 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Feature Matrix</span>
              <h2 className="font-heading font-black text-3xl md:text-5xl text-text-primary">Why It Works</h2>
              <p className="text-text-secondary text-sm font-semibold">How StudyAI Planner Pro compares to traditional static study systems.</p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border-primary bg-surface-primary/70 backdrop-blur-xl">
              <table className="w-full text-left border-collapse min-w-[600px]" role="table" aria-label="Feature Comparison Matrix">
                <thead>
                  <tr className="border-b border-border-primary bg-bg-primary/50">
                    <th className="p-4 text-xs font-black uppercase text-text-secondary">Feature Capability</th>
                    <th className="p-4 text-xs font-black uppercase text-brand-primary text-center">StudyAI Planner Pro</th>
                    <th className="p-4 text-xs font-black uppercase text-text-secondary text-center">Traditional Methods</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary text-xs font-semibold">
                  <tr>
                    <td className="p-4 text-text-primary font-bold">AI scheduling</td>
                    <td className="p-4 text-center text-brand-success font-extrabold">✓ Generative plan output</td>
                    <td className="p-4 text-center text-text-muted">✗ Manual calendars only</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Revision planning</td>
                    <td className="p-4 text-center text-brand-success font-extrabold">✓ Automatic exam countdown balance</td>
                    <td className="p-4 text-center text-text-muted">✗ Hard to map workload curves</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Progress tracking</td>
                    <td className="p-4 text-center text-brand-success font-extrabold">✓ Dynamic task completion rates</td>
                    <td className="p-4 text-center text-text-muted">✗ Simple check marks on paper</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Study analytics</td>
                    <td className="p-4 text-center text-brand-success font-extrabold">✓ Real logged history charts</td>
                    <td className="p-4 text-center text-text-muted">✗ None</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Streak tracking</td>
                    <td className="p-4 text-center text-brand-success font-extrabold">✓ Active daily reset metrics</td>
                    <td className="p-4 text-center text-text-muted">✗ Manual tracking required</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Calendar awareness</td>
                    <td className="p-4 text-center text-brand-success font-extrabold">✓ Interactive monthly display</td>
                    <td className="p-4 text-center text-text-muted">✗ Isolated date logs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 max-w-7xl mx-auto z-10 relative">
          <div className="relative overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-white rounded-[32px] p-10 md:p-20 border border-brand-primary/20 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-primary/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl text-left space-y-5 relative z-10">
              <h2 className="font-heading font-black text-3xl md:text-5xl leading-tight">
                Your next study <br />
                <span className="text-gradient font-black">breakthrough starts today.</span>
              </h2>
              <p className="text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
                Create dynamic plans, run offline study logs, check visual progress, and consult the AI coach. Built for your absolute academic success.
              </p>
            </div>

            <div className="shrink-0 relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <Link
                to={getStartedPath}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider shadow-2xl transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4.5 rounded-full border border-slate-700 bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Access Account Login
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-primary py-16 px-6 bg-surface-primary/10 transition-colors z-10 relative">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border-primary pb-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <span className="font-heading font-extrabold text-lg text-text-primary">
                  StudyAI<span className="text-brand-primary">Planner</span>
                </span>
              </div>
              <div className="flex items-center gap-6 text-text-muted text-xs font-extrabold">
                <a href="https://github.com/Aditya1708-tech/StudyPlanner" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">GitHub</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Documentation</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase text-text-muted tracking-wider">
              <p>&copy; {new Date().getFullYear()} StudyAI Planner Pro. All rights reserved.</p>
              <p>Built with React, TypeScript, Tailwind, and Gemini AI</p>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showDemoLoader && (
            <DemoLoader onComplete={() => navigate('/dashboard')} />
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
};

export default Landing;
