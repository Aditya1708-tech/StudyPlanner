import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  CheckSquare, 
  BarChart3, 
  Calendar as CalendarIcon, 
  BookOpen,
  Clock,
  Play,
  Pause,
  Flame,
  CheckCircle2,
  Smartphone,
  Award,
  Zap,
  XCircle,
  FileText
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import GlassCard from '../components/ui/GlassCard';

// Hook for counting up stats dynamically
const Counter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 1500 }) => {
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
  const prefersReduced = useReducedMotion();

  // 1. Hero Workflow Animation Step Cycle
  const [heroWorkflowStep, setHeroWorkflowStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroWorkflowStep(prev => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const heroWorkflowSteps = [
    { title: "Upload Syllabus", icon: FileText, desc: "Drop course outline" },
    { title: "AI Analyzes Workload", icon: Brain, desc: "Parses exam timelines" },
    { title: "Plan Appears", icon: CalendarIcon, desc: "Generates custom map" },
    { title: "Tasks Ready", icon: CheckSquare, desc: "Ready to focus" }
  ];

  // 2. Interactive Dashboard Preview Mock States
  const [mockTasks, setMockTasks] = useState([
    { id: 1, title: "Review Organic Chem reactions", subject: "Chemistry", time: "1.5h", priority: "High", completed: false },
    { id: 2, title: "Solve Calculus Taylor series", subject: "Mathematics", time: "2.0h", priority: "Medium", completed: true },
    { id: 3, title: "Biology Chapter 7 models review", subject: "Biology", time: "1.0h", priority: "Low", completed: false }
  ]);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins

  // Mock Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const toggleMockTask = (id: number) => {
    setMockTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = mockTasks.filter(t => t.completed).length;
  const totalCount = mockTasks.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rSecs).padStart(2, '0')}`;
  };

  // 3. Core Features List
  const featureList = [
    {
      icon: Brain,
      title: "AI Study Planner",
      desc: "Generative scheduler that maps structural daily revision paths targeting upcoming exam deadlines.",
      color: "from-purple-500 to-indigo-500",
      outcome: "Weeks of revision mapped in seconds."
    },
    {
      icon: CheckSquare,
      title: "Smart Task Scheduling",
      desc: "Task manager integrating priorities and cognitive workload estimates, persisting dynamically.",
      color: "from-pink-500 to-rose-500",
      outcome: "Always know exactly what to do first."
    },
    {
      icon: Clock,
      title: "Focus Timer Widget",
      desc: "Floating Pomodoro tool that directly auto-logs active revision hours to your context.",
      color: "from-cyan-500 to-blue-500",
      outcome: "Build consistent habits session by session."
    },
    {
      icon: BarChart3,
      title: "Study Analytics",
      desc: "Clean tracking of streaks, weekly achievements, and subject distribution charts.",
      color: "from-amber-500 to-orange-500",
      outcome: "Clear proof of your daily dedication."
    },
    {
      icon: CalendarIcon,
      title: "Calendar Integration",
      desc: "Interactive monthly planners displaying exams, revision tasks, and logged hours synchronously.",
      color: "from-emerald-500 to-teal-500",
      outcome: "Say goodbye to scheduling conflicts."
    },
    {
      icon: Sparkles,
      title: "AI Chat Assistant",
      desc: "Instant breakdown of complex reaction mechanisms, formulas, or essay topics.",
      color: "from-violet-500 to-fuchsia-500",
      outcome: "A dedicated academic coach on call."
    },
    {
      icon: Smartphone,
      title: "Offline-Ready",
      desc: "Full cache storage lets you review plans and log focus sessions even without web connections.",
      color: "from-blue-500 to-indigo-500",
      outcome: "Uninterrupted focus anywhere."
    },
    {
      icon: Award,
      title: "Accessibility First",
      desc: "Semantic HTML layouts, screen-reader parameters, and keyboard navigations integrated natively.",
      color: "from-rose-500 to-red-500",
      outcome: "Fully usable by every student."
    }
  ];

  // 4. Testimonials
  const testimonials = [
    {
      quote: "Before StudyAI, I'd reactively cram the night before midterms and feel completely overwhelmed. The AI generated plan spread the math review modules over 3 weeks. I aced my exam stress-free.",
      author: "Sarah L.",
      major: "Pre-Med, University of Washington",
      avatarBg: "bg-purple-100 dark:bg-purple-955 text-purple-650"
    },
    {
      quote: "The combination of the floating Pomodoro widget and streak tracking kept me focused. Auto-logging my study blocks directly binds my tasks completed to actual hours logged.",
      author: "Marcus K.",
      major: "Computer Science, UT Austin",
      avatarBg: "bg-blue-100 dark:bg-blue-955 text-blue-650"
    },
    {
      quote: "Creating calendars on paper just didn't work. Having a plan that recalibrates based on when my chemistry assessments are scheduled saves me hours of planning every weekend.",
      author: "Elena R.",
      major: "Chemical Engineering, Georgia Tech",
      avatarBg: "bg-emerald-100 dark:bg-emerald-955 text-emerald-650"
    }
  ];

  // Motion animation parameters (respect prefers-reduced-motion)
  const fadeUpVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: prefersReduced ? 0 : 0.08 }
    }
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-655 dark:text-primary-350 text-xs font-semibold shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>Built with React + TypeScript + Gemini AI</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="font-heading font-black text-4xl sm:text-5xl md:text-7xl tracking-tight max-w-4xl leading-[1.08] text-slate-900 dark:text-white"
        >
          Study smarter. <br />
          Stay consistent. <span className="text-gradient font-black">Ace every exam.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ delay: 0.15 }}
          className="text-slate-550 dark:text-slate-350 text-base sm:text-lg md:text-xl max-w-3xl font-semibold leading-relaxed"
        >
          An AI-powered study operating system that builds personalized revision schedules, tracks real progress, logs study sessions, and keeps you focused every day.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4"
        >
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold shadow-xl shadow-primary-500/20 hover:-translate-y-0.5 transition-all duration-200 group active:scale-95 text-base cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('preview');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 hover:bg-white/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-250 font-bold transition-all text-base active:scale-95 cursor-pointer"
          >
            See Live Demo
          </button>
        </motion.div>

        {/* 4. Lightweight animated workflow directly inside the hero section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl pt-8 pb-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-white/35 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-sm relative">
            {heroWorkflowSteps.map((step, idx) => {
              const IconComp = step.icon;
              const isActive = heroWorkflowStep === idx;
              
              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center relative ${
                    isActive 
                      ? 'bg-white dark:bg-slate-950 border-primary-500/30 shadow-lg shadow-primary-500/5 scale-102' 
                      : 'bg-transparent border-transparent opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                    isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-850 text-slate-400'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight">{step.title}</h4>
                  <p className="text-[10px] text-slate-550 mt-1 font-semibold">{step.desc}</p>

                  {/* Flow arrow pointer on desktop */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 text-slate-300 dark:text-slate-750 font-extrabold z-10 pointer-events-none">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 2. Interactive Product Preview Container */}
        <motion.div
          id="preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.5 }}
          className="w-full relative max-w-5xl rounded-3xl p-3 bg-gradient-to-tr from-primary-500/10 to-pink-500/10 border border-white/20 dark:border-white/5 shadow-2xl backdrop-blur-md pt-8 animate-float"
        >
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 border border-slate-750 text-[10px] font-black uppercase text-slate-350 tracking-wider z-20">
            Interactive Live Sandbox Demo
          </span>

          <div className="rounded-2xl overflow-hidden glass-panel-heavy border border-white/40 dark:border-white/10 flex flex-col min-h-[460px] text-left">
            
            {/* Top Bar Mock */}
            <div className="h-10 bg-slate-100/50 dark:bg-slate-950/50 flex items-center px-4 justify-between border-b border-slate-200/40 dark:border-slate-850/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold tracking-tight">
                demo_sandbox_preview.tsx
              </div>
              <div className="w-6"></div>
            </div>

            {/* Content Mock Dashboard */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50/20 dark:bg-slate-950/30">
              
              {/* Left Mock Panel: Checklist & Progress */}
              <div className="md:col-span-2 space-y-6">
                <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4 hover:scale-[1.01] transition-transform">
                  <div className="flex items-center justify-between border-b border-slate-200/40 pb-2">
                    <div>
                      <h4 className="font-heading font-black text-sm text-slate-850 dark:text-white">Today's Agenda</h4>
                      <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Toggle Checkboxes to Test Live Progress</p>
                    </div>
                    <span className="text-xs font-black text-primary-500">{completedCount}/{totalCount} Completed</span>
                  </div>

                  <div className="space-y-2.5">
                    {mockTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-850 flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => toggleMockTask(task.id)}
                            aria-label={`Toggle test task ${task.title}`}
                            className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                              task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-350 dark:border-slate-650'
                            }`}
                          >
                            {task.completed && <span className="text-[10px]">✓</span>}
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-805 dark:text-slate-200'}`}>
                              {task.title}
                            </p>
                            <span className="text-[8px] font-black uppercase text-slate-455">{task.subject}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                            task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>{task.priority}</span>
                          <span className="text-[10px] text-slate-450 font-semibold">{task.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Progress Indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-450">
                      <span>Calculated Completion Rate</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                      <div 
                        style={{ width: `${progressPct}%` }}
                        className="h-full bg-gradient-to-r from-primary-600 to-pink-500 rounded-full transition-all duration-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Calendar / Schedule preview strip */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">AI Scheduler Recommendation</span>
                    <p className="text-xs font-bold text-slate-805 dark:text-slate-200">Calculus Chemistry exam countdown indicates critical focus required</p>
                  </div>
                  <Link to="/dashboard" className="px-3 py-1.5 bg-primary-500/10 text-primary-555 dark:text-primary-350 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-primary-500/20 transition-all">
                    Test Live
                  </Link>
                </div>
              </div>

              {/* Right Mock Panel: Focus Timer & Streak */}
              <div className="space-y-6">
                
                {/* Focus Timer Sandbox Widget */}
                <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4 hover:scale-[1.01] transition-transform text-center flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider border-b border-slate-200/40 pb-1 w-full block">Focus Timer Demo</span>
                  
                  <div className="py-2">
                    <span className={`font-heading font-black text-3xl tracking-tight text-slate-900 dark:text-white ${timerRunning ? 'animate-pulse' : ''}`}>
                      {formatTime(timeLeft)}
                    </span>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-450 mt-1">
                      {timerRunning ? "Timer Ticking Down" : "Timer Paused"}
                    </p>
                  </div>

                  <div className="flex gap-2 w-full justify-center">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow ${
                        timerRunning 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-primary-500 text-white'
                      }`}
                    >
                      {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                      <span>{timerRunning ? "Pause" : "Start"}</span>
                    </button>
                    <button
                      onClick={() => { setTimerRunning(false); setTimeLeft(25 * 60); }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 rounded-xl transition-all cursor-pointer text-xs"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Active Streak Card with Flame scale interaction */}
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-orange-500/10 via-pink-500/5 to-transparent border border-orange-500/20 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider">Active Streak</span>
                    <h4 className="font-heading font-black text-2xl text-slate-855 dark:text-white leading-none">6 Days</h4>
                    <p className="text-[9px] font-semibold text-slate-500">Streak stays hot 🔥</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl animate-bounce">
                    <Flame className="w-6 h-6" />
                  </div>
                </div>

              </div>

            </div>

          </div>
        </motion.div>

      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-28 px-6 bg-slate-100/30 dark:bg-slate-900/10 border-y border-slate-200/30 dark:border-slate-800/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight text-slate-900 dark:text-white">
              Unlock your peak potential.
            </h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm sm:text-base font-semibold leading-relaxed">
              StudyAI Planner comes loaded with all the tools necessary to stay organized, manage complex workloads, and leverage artificial intelligence.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featureList.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <GlassCard key={idx} hover={true} className="p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-lg flex items-center justify-center shrink-0`}>
                      <IconComp className="w-5.5 h-5.5" />
                    </div>
                    <h3 className="font-heading font-black text-base text-slate-800 dark:text-white">{feat.title}</h3>
                    <p className="text-slate-550 dark:text-slate-450 text-[11px] leading-relaxed font-semibold">{feat.desc}</p>
                  </div>
                  <div className="border-t border-slate-200/40 dark:border-slate-850/40 pt-2.5">
                    <span className="text-[10px] font-black uppercase text-primary-500 tracking-wider">{feat.outcome}</span>
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 3. New Custom Section: "Built for students who are tired of studying reactively" */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <GlassCard 
          hover={false} 
          className="bg-gradient-to-tr from-primary-600/10 via-pink-500/5 to-transparent border border-primary-500/20 p-8 md:p-14 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        >
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-655 dark:text-primary-350 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Study Proactively</span>
            </div>
            
            <h2 className="font-heading font-black text-2xl md:text-4xl text-slate-900 dark:text-white leading-tight">
              Built for students who are tired of studying reactively.
            </h2>
            
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              Reactive studying means cramming the night before, losing track of exam weights, guessing which subjects need attention, and studying under stress. 
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              StudyAI changes the paradigm. By parsing dates and weights, it structures a balanced workload weeks in advance. If you miss a task, the engine recalibrates dynamically to maintain stability.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link to="/dashboard" className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 transition-all shadow-md">
                Launch Dashboard
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Reactive card */}
            <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <XCircle className="w-5 h-5 shrink-0" />
                <h4 className="font-bold text-xs">Reactive Cramming</h4>
              </div>
              <ul className="text-[10px] text-slate-500 font-semibold space-y-2 list-disc list-inside">
                <li>Panicked midnight revision sessions</li>
                <li>Losing track of exam count down weights</li>
                <li>Unbalanced study density causing burnout</li>
                <li>Zero metrics or analytics on study hours</li>
              </ul>
            </div>

            {/* Proactive card */}
            <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h4 className="font-bold text-xs">Proactive Planning</h4>
              </div>
              <ul className="text-[10px] text-slate-550 font-semibold space-y-2 list-disc list-inside">
                <li>Structured daily workload schedules</li>
                <li>Clear milestone targets calculated</li>
                <li>Consistent Pomodoro active logs</li>
                <li>Dynamic recalibration when plans slip</li>
              </ul>
            </div>

          </div>
        </GlassCard>
      </section>

      {/* 1. Authentic Product Capability Metrics (Counter Blocks) */}
      <section className="py-16 md:py-20 px-6 bg-slate-100/20 dark:bg-slate-900/5 border-t border-slate-200/30 dark:border-slate-800/20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h3 className="font-heading font-black text-2xl md:text-3xl text-slate-900 dark:text-white">Authentic Capability Metrics</h3>
            <p className="text-slate-550 dark:text-slate-450 text-xs font-semibold">Engineered with performance, accessibility, and architectural durability in mind.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            
            {/* Stat 1 */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto"><Brain className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-none">AI-First</h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Planning Strategy</p>
            </div>

            {/* Stat 2 */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto"><Smartphone className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-855 dark:text-white leading-none">100%</h4>
              <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider">Offline-Ready Cache</p>
            </div>

            {/* Stat 3 */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto"><Award className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-none">
                <Counter target={100} />
              </h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Accessibility Target</p>
            </div>

            {/* Stat 4 */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto"><CheckSquare className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-none">
                <Counter target={42} suffix="+" />
              </h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Automated Tests</p>
            </div>

            {/* Stat 5 */}
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center col-span-2 md:col-span-1 space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto"><Zap className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-base text-slate-850 dark:text-white leading-none pt-1">Production</h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Ready Architecture</p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto text-center space-y-16">
        <div className="space-y-3">
          <h2 className="font-heading font-black text-3xl md:text-5xl text-slate-900 dark:text-white">Student Testimonials</h2>
          <p className="text-slate-550 dark:text-slate-450 text-sm font-semibold">Real results from university students who restructured their schedules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <GlassCard key={idx} hover={true} className="p-7 text-left flex flex-col justify-between space-y-6">
              <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold italic leading-relaxed">
                "{test.quote}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${test.avatarBg} flex items-center justify-center font-black text-xs shrink-0`}>
                  {test.author[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">{test.author}</h4>
                  <p className="text-[9px] text-slate-450 font-bold">{test.major}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Why It Works Comparison Section */}
      <section className="py-20 md:py-28 px-6 bg-slate-100/30 dark:bg-slate-900/10 border-y border-slate-200/30 dark:border-slate-800/20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-black text-3xl md:text-5xl text-slate-900 dark:text-white">Why It Works</h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm font-semibold">How StudyAI Planner compares to traditional study structures.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <table className="w-full text-left border-collapse min-w-[500px]" role="table" aria-label="Feature Comparison Matrix">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-4 text-xs font-black uppercase text-slate-450">Feature Capability</th>
                  <th className="p-4 text-xs font-black uppercase text-primary-500 text-center">StudyAI Planner Pro</th>
                  <th className="p-4 text-xs font-black uppercase text-slate-500 text-center">Traditional Methods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-xs font-semibold">
                <tr>
                  <td className="p-4 text-slate-800 dark:text-white font-bold">AI scheduling</td>
                  <td className="p-4 text-center text-emerald-500 font-extrabold">✓ Generative plan output</td>
                  <td className="p-4 text-center text-slate-400">✗ Manual calendars only</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 dark:text-white font-bold">Revision planning</td>
                  <td className="p-4 text-center text-emerald-500 font-extrabold">✓ Automatic exam countdown balance</td>
                  <td className="p-4 text-center text-slate-400">✗ Hard to map workload curves</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 dark:text-white font-bold">Progress tracking</td>
                  <td className="p-4 text-center text-emerald-500 font-extrabold">✓ Dynamic task completion rates</td>
                  <td className="p-4 text-center text-slate-400">✗ Simple check marks on paper</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 dark:text-white font-bold">Study analytics</td>
                  <td className="p-4 text-center text-emerald-500 font-extrabold">✓ Real logged history charts</td>
                  <td className="p-4 text-center text-slate-400">✗ None</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 dark:text-white font-bold">Streak tracking</td>
                  <td className="p-4 text-center text-emerald-500 font-extrabold">✓ Active daily reset metrics</td>
                  <td className="p-4 text-center text-slate-400">✗ Manual tracking required</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 dark:text-white font-bold">Calendar awareness</td>
                  <td className="p-4 text-center text-emerald-500 font-extrabold">✓ Interactive monthly display</td>
                  <td className="p-4 text-center text-slate-400">✗ Isolated date logs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AI Workflow Section */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-heading font-black text-3xl md:text-5xl text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-slate-550 dark:text-slate-400 text-sm font-semibold">Get up and running in less than 2 minutes. Follow these simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-24 right-24 h-0.5 bg-gradient-to-r from-primary-400/20 via-pink-400/20 to-cyan-400/20 -translate-y-12 z-0" />

          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="z-10 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center font-heading font-black text-2xl text-primary-500 mb-6 group-hover:scale-105 transition-all">
              01
            </div>
            <h3 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white mb-2">Configure Subjects & Exams</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              Input subjects and exams countdown milestones. Tag details directly inside the onboarding pane or curriculum manager.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="z-10 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center font-heading font-black text-2xl text-primary-500 mb-6 group-hover:scale-105 transition-all">
              02
            </div>
            <h3 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white mb-2">AI Compiles Custom Plan</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              Run the AI Planner optimization algorithm to partition large-scale syllabus items into structural, bite-sized revision blocks.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="z-10 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center font-heading font-black text-2xl text-primary-500 mb-6 group-hover:scale-105 transition-all">
              03
            </div>
            <h3 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white mb-2">Track & Log Focus Goals</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              Log focused revisions with the Pomodoro widget, check off calendar items daily, and watch stats increase on the dynamic dashboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
        <GlassCard 
          hover={false} 
          className="relative overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-10 md:p-16 border border-primary-500/20 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-xl text-left space-y-4 relative z-10">
            <h2 className="font-heading font-black text-3xl md:text-5xl leading-tight">
              Your next study <br />
              <span className="text-gradient font-black">breakthrough starts today.</span>
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed">
              Create dynamic schedules, run offline study logs, check visual progress widgets, and consult the AI Coach. Built for your success.
            </p>
          </div>

          <div className="shrink-0 relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <Sparkles className="w-4.5 h-4.5 text-primary-600 animate-pulse" />
            </Link>
            <Link
              to="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-slate-700 bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Generate My First AI Plan
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 py-12 px-6 bg-slate-50/50 dark:bg-slate-950/20 transition-colors">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/40 dark:border-slate-850/40 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span className="font-heading font-extrabold text-lg text-slate-855 dark:text-white">
                StudyAI<span className="text-primary-500">Planner</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 text-xs font-extrabold">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">GitHub</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Contact</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase text-slate-450 tracking-wider">
            <p>&copy; {new Date().getFullYear()} StudyAI Planner Pro. All rights reserved.</p>
            <p>Built with React, TypeScript, Tailwind, and Gemini AI</p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;
