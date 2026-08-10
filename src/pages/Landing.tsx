import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
  const prefersReduced = useReducedMotion();

  // 1. Live AI Planning Simulator states
  const [simPhase, setSimPhase] = useState(0); // 0: Idle/Typing, 1: AI Compiling, 2: Blocks Appearing, 3: Completed/Progress
  const [simInput, setSimInput] = useState('');
  const [simTasks, setSimTasks] = useState<{ id: number; title: string; time: string; completed: boolean }[]>([]);
  const [simProgress, setSimProgress] = useState(0);

  useEffect(() => {
    let timer: any = null;

    const runSimulationLoop = () => {
      // Phase 0: Type subject name
      setSimPhase(0);
      setSimTasks([]);
      setSimProgress(0);
      let subjectText = "Chemistry Exam & Calculus syllabus";
      let currentIndex = 0;
      setSimInput('');

      const typingInterval = setInterval(() => {
        if (currentIndex < subjectText.length) {
          setSimInput(prev => prev + subjectText.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          
          // Phase 1: AI Compiling loader
          setTimeout(() => {
            setSimPhase(1);

            // Phase 2: Blocks Appearing
            setTimeout(() => {
              setSimPhase(2);
              setSimTasks([
                { id: 1, title: "Review Chemistry reaction mechanisms", time: "1.5h", completed: false },
                { id: 2, title: "Solve Calculus Taylor series problems", time: "2.0h", completed: false }
              ]);

              // Phase 3: Progress calculating / tasks ticking
              setTimeout(() => {
                setSimPhase(3);
                // Complete task 1
                setSimTasks(prev => prev.map((t, idx) => idx === 0 ? { ...t, completed: true } : t));
                setSimProgress(50);

                setTimeout(() => {
                  // Complete task 2
                  setSimTasks(prev => prev.map((t, idx) => idx === 1 ? { ...t, completed: true } : t));
                  setSimProgress(100);

                  // Keep completed state visible for a few seconds, then restart loop
                  setTimeout(() => {
                    runSimulationLoop();
                  }, 4000);

                }, 1800);
              }, 1800);
            }, 2000);
          }, 1000);
        }
      }, 50);
    };

    runSimulationLoop();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);



  // 3. Testimonials
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

  // Motion animation variants (respect prefers-reduced-motion)
  const fadeUpVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.65, ease: "easeOut" as const }
    }
  };



  return (
    <div className="min-h-screen bg-[#F6F7FB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden font-sans relative">
      
      {/* Background Layer (Translucent blurred orbs & gradients for depth) */}
      <div className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-[10%] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[140px] dark:bg-primary-950/20" />
        <div className="absolute top-[100px] right-[5%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] dark:bg-pink-950/15" />
        <div className="absolute top-[500px] left-[25%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] dark:bg-cyan-950/10" />
      </div>

      <Navbar />

      {/* Split Hero Layout */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-36 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial & Credibility */}
          <div className="lg:col-span-5 space-y-7 text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-655 dark:text-primary-350 text-xs font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>StudyAI Planner Pro v2.0</span>
            </motion.div>

            {/* Editorial Title */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="space-y-1 font-heading font-black text-5xl sm:text-6xl tracking-tight leading-[1.05] text-slate-900 dark:text-white"
            >
              <h2>Study smarter.</h2>
              <h2>Stay consistent.</h2>
              <h2 className="text-gradient">Ace every exam.</h2>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ delay: 0.12 }}
              className="text-slate-550 dark:text-slate-400 text-sm sm:text-base font-semibold leading-relaxed max-w-xl"
            >
              An AI-powered study operating system that builds personalized revision schedules, tracks real progress, logs study sessions, and keeps you focused every day.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ delay: 0.22 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto"
            >
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold shadow-lg shadow-primary-500/10 hover:-translate-y-0.5 active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-250 font-bold transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                See Live Demo
              </button>
            </motion.div>

            {/* Technology Credibility Section (Real Project Stack) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ delay: 0.32 }}
              className="pt-6 border-t border-slate-200/50 dark:border-slate-850/40 space-y-3"
            >
              <span className="text-[10px] font-black uppercase text-slate-450 tracking-widest block">Credible Technology Stack</span>
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40">React 19</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40">TypeScript</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40">Tailwind CSS v4</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40">Framer Motion</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40">Gemini AI</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40">Vite + Vercel</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Layered Dashboard Preview with Live AI Simulator */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            
            {/* Background glowing rings */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-pink-500/5 rounded-[32px] blur-3xl pointer-events-none z-0" />

            {/* Main Floating Dashboard card */}
            <motion.div
              id="preview"
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 40, damping: 12, delay: 0.2 }}
              className="w-full relative rounded-[32px] p-2 bg-gradient-to-tr from-primary-500/20 to-pink-500/20 border border-white/20 dark:border-white/5 shadow-2xl backdrop-blur-md z-10 hover:shadow-primary-500/5 hover:scale-[1.005] transition-all duration-300"
            >
              <div className="rounded-[28px] overflow-hidden glass-panel-heavy border border-white/40 dark:border-white/10 flex flex-col min-h-[480px]">
                
                {/* Header Sandbox Bar */}
                <div className="h-11 bg-slate-100/50 dark:bg-slate-950/50 flex items-center px-5 justify-between border-b border-slate-200/40 dark:border-slate-850/40">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  
                  <span className="px-2.5 py-0.5 rounded-md bg-primary-500/10 text-primary-655 dark:text-primary-350 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
                    <span>Live AI Simulator</span>
                  </span>
                  
                  <div className="w-6"></div>
                </div>

                {/* Live simulation panel body */}
                <div className="flex-1 p-6 space-y-6 bg-slate-50/20 dark:bg-slate-950/30 flex flex-col justify-between">
                  
                  {/* Phase 0: Inputs typing */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="sim-in" className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Configure Curriculum Subject</label>
                        <span className="text-[9px] font-black text-slate-450">Step 1: Parse syllabus</span>
                      </div>
                      <div className="relative">
                        <input
                          id="sim-in"
                          type="text"
                          readOnly
                          value={simInput}
                          placeholder="e.g. Calculus syllabus"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none"
                        />
                        {simPhase === 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 animate-pulse text-xs">|</span>}
                      </div>
                    </div>

                    {/* Phase 1: Processing Animation */}
                    {simPhase === 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/20 text-center space-y-2 flex flex-col items-center py-6"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center animate-spin">
                          <Brain className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-black text-slate-805 dark:text-slate-200">Gemini AI parsing exam weights and schedules...</p>
                        <p className="text-[9px] text-slate-450 font-semibold">Creating cognitive workload distribution curves...</p>
                      </motion.div>
                    )}

                    {/* Phase 2 & 3: Scheduled blocks appear */}
                    {(simPhase === 2 || simPhase === 3) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2.5"
                      >
                        <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">AI Personalized Revision Plan</span>
                        {simTasks.map(task => (
                          <motion.div
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={task.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 shadow-sm"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-350 dark:border-slate-650'
                              }`}>
                                {task.completed && <span className="text-[8px]">✓</span>}
                              </div>
                              <span className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-450 font-bold">{task.time}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Phase 3: Progress rate chart updates */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-200/40 dark:border-slate-850/40">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450">
                      <span>Live Progress Tracking</span>
                      <span>{simProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                      <div 
                        style={{ width: `${simProgress}%` }}
                        className="h-full bg-gradient-to-r from-primary-600 to-pink-500 rounded-full transition-all duration-700" 
                      />
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>

            {/* Extra floating chips for layered depth */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 z-20 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-805 shadow-xl backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white"
            >
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              <span>Pomodoro Log Active</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -right-6 z-20 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-805 shadow-xl backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-orange-500"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Streak Active 🔥</span>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Workflow Section (visual connected workflow) */}
      <section id="how-it-works" className="py-28 md:py-36 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Scheduler Pipeline</span>
          <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight text-slate-900 dark:text-white">How it works</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Transforming unstructured syllabi into productive focus schedules instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          
          {/* Animated custom SVG connecting pipeline line */}
          <div className="hidden md:block absolute top-20 left-32 right-32 h-0.5 bg-gradient-to-r from-primary-400/20 via-pink-400/20 to-cyan-400/20 z-0" />

          {/* Card 1 */}
          <div className="flex flex-col items-center text-center space-y-4 group relative z-10">
            <div className="w-16 h-16 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center font-heading font-black text-2xl text-primary-500 group-hover:scale-105 transition-all">
              01
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-850 dark:text-white">Add Subjects & Exams</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              Input curriculum courses and critical deadline dates inside the Curriculum onboarding assistant.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center text-center space-y-4 group relative z-10">
            <div className="w-16 h-16 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center font-heading font-black text-2xl text-pink-500 group-hover:scale-105 transition-all">
              02
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-855 dark:text-white">AI Compiles schedule</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              The Gemini model slices workloads into dynamic blocks, prioritizing exam counts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center text-center space-y-4 group relative z-10">
            <div className="w-16 h-16 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center font-heading font-black text-2xl text-cyan-500 group-hover:scale-105 transition-all">
              03
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-850 dark:text-white">Track Progress Daily</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              Complete scheduled tasks, log hours with the focus clock, and visualize streaking analytics.
            </p>
          </div>

        </div>
      </section>

      {/* Features Section (Bento Grid Layout) */}
      <section id="features" className="py-28 md:py-36 px-6 bg-slate-100/30 dark:bg-slate-900/10 border-y border-slate-200/30 dark:border-slate-800/20 z-10 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Core Capabilities</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight text-slate-900 dark:text-white">Built for High Performance</h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm font-semibold">Everything you need to structured learning, consolidated in a single grid.</p>
          </div>

          {/* Bento Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: AI Study Planner (Double Width) */}
            <div className="md:col-span-2 p-7 rounded-[32px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                <h3 className="font-heading font-black text-xl text-slate-850 dark:text-white">AI Personalized Planner</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-lg">
                  Generates full multi-week revision maps tailored to your exact curriculum, exam weights, and remaining prep days.
                </p>
              </div>

              {/* Visual Plan Mock inside card */}
              <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450">
                  <span>Calculus Study Plan</span>
                  <span className="text-primary-500">Scheduled</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Day 1: Derivatives and Core Limits revision block</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Day 2: Advanced Integration pathways exercise</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Focus Timer (Single) */}
            <div className="p-7 rounded-[32px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                <h3 className="font-heading font-black text-xl text-slate-850 dark:text-white">Focus Timer</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  Floating customizable Pomodoro timer directly logging sessions to context storage.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center text-sm font-black text-cyan-600 dark:text-cyan-400">
                25:00 Focus Block
              </div>
            </div>

            {/* Bento Card 3: Smart Task Scheduling (Single) */}
            <div className="p-7 rounded-[32px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center"><CheckSquare className="w-5 h-5" /></div>
                <h3 className="font-heading font-black text-xl text-slate-855 dark:text-white">Smart Tasks</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  Organize tasks with subjects, weights, priorities, and workloads.
                </p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/50">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Physics Practice Paper</span>
                <span className="text-[9px] font-black uppercase text-rose-500">High</span>
              </div>
            </div>

            {/* Bento Card 4: AI Chat Assistant (Double Width) */}
            <div className="md:col-span-2 p-7 rounded-[32px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
                <h3 className="font-heading font-black text-xl text-slate-850 dark:text-white">AI Assistant Chat</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  Instant academic Coach to review reaction mechanisms, break down complex concepts, and generate tasks.
                </p>
              </div>

              {/* Chat Simulation Mock */}
              <div className="p-3.5 rounded-2xl bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 text-[11px] font-semibold space-y-2">
                <div className="flex gap-2">
                  <span className="font-black text-primary-500">Student:</span>
                  <span className="text-slate-700 dark:text-slate-300">Explain electrophilic additions in Organic Chemistry.</span>
                </div>
                <div className="flex gap-2 border-t border-slate-200/40 pt-1.5">
                  <span className="font-black text-pink-500">AI Coach:</span>
                  <span className="text-slate-705 dark:text-slate-350">Organic Chemistry Chapter 4 covers electrophilic additions. I've scheduled a practice session tomorrow.</span>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Offline capability & AA accessibility (Single) */}
            <div className="p-7 rounded-[32px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between space-y-6 hover:scale-[1.005] transition-transform">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Smartphone className="w-5 h-5" /></div>
                <h3 className="font-heading font-black text-xl text-slate-850 dark:text-white">Offline Sync</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  Service workers cache configuration data, allowing you to track schedules and run timers completely offline.
                </p>
              </div>
              <div className="flex gap-2 items-center justify-center text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Indexed Cache Standby</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Proactive study section */}
      <section className="py-28 md:py-36 px-6 max-w-7xl mx-auto z-10 relative">
        <GlassCard 
          hover={false} 
          className="bg-gradient-to-tr from-primary-600/15 via-pink-500/5 to-transparent border border-primary-500/20 p-8 md:p-16 rounded-[32px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-655 dark:text-primary-350 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Proactive Strategy</span>
            </div>
            
            <h2 className="font-heading font-black text-3xl md:text-4xl text-slate-900 dark:text-white leading-tight">
              Built for students who are tired of studying reactively.
            </h2>
            
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              Cramming a vast syllabus the night before leads to stress, exhaustion, and sub-optimal grades. StudyAI structures a balanced load weeks in advance, dynamic scheduling automatically adjusts.
            </p>

            <div className="pt-2">
              <Link to="/dashboard" className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md">
                Launch Dashboard
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Reactive Box */}
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
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

            {/* Proactive Box */}
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
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

      {/* Authentic Stats counters section */}
      <section className="py-20 md:py-24 px-6 bg-slate-100/20 dark:bg-slate-900/5 border-t border-slate-200/30 dark:border-slate-800/20 z-10 relative">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h3 className="font-heading font-black text-2xl md:text-3xl text-slate-900 dark:text-white">Authentic Capability Specifications</h3>
            <p className="text-slate-550 dark:text-slate-455 text-xs font-semibold">Real statistics representing the architectural durability of this dashboard.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto"><Brain className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-none">AI-First</h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Planning Engine</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto"><Smartphone className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-855 dark:text-white leading-none">100%</h4>
              <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider">Offline Cache</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto"><Award className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-none">
                <Counter target={100} />
              </h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Accessibility Score</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto"><CheckSquare className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-none">
                <Counter target={42} suffix="+" />
              </h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Automated Tests</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60 text-center col-span-2 md:col-span-1 space-y-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto"><Zap className="w-5 h-5" /></div>
              <h4 className="font-heading font-black text-base text-slate-850 dark:text-white leading-none pt-1">Production</h4>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Ready State</p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 md:py-36 px-6 max-w-7xl mx-auto text-center space-y-16 z-10 relative">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Student Reviews</span>
          <h2 className="font-heading font-black text-3xl md:text-5xl text-slate-900 dark:text-white">What Students Say</h2>
          <p className="text-slate-550 dark:text-slate-450 text-sm font-semibold">Real results from university students who restructured their schedules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <GlassCard key={idx} hover={true} className="p-8 text-left flex flex-col justify-between space-y-6">
              <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold italic leading-relaxed">
                "{test.quote}"
              </p>
              
              <div className="flex items-center gap-3 border-t border-slate-200/40 dark:border-slate-850/40 pt-4">
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

      {/* Why It Works Comparison Grid */}
      <section className="py-28 md:py-36 px-6 bg-slate-100/30 dark:bg-slate-900/10 border-y border-slate-200/30 dark:border-slate-800/20 z-10 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Feature Matrix</span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-slate-900 dark:text-white">Why It Works</h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm font-semibold">How StudyAI Planner Pro compares to traditional static study systems.</p>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <table className="w-full text-left border-collapse min-w-[600px]" role="table" aria-label="Feature Comparison Matrix">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-4 text-xs font-black uppercase text-slate-455">Feature Capability</th>
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

      {/* Dramatic Final CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="relative overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-white rounded-[32px] p-10 md:p-20 border border-primary-500/20 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Subtle overlay glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-500/15 rounded-full blur-[120px] pointer-events-none" />

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
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider shadow-2xl transition-all cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <Sparkles className="w-4 h-4 text-primary-600 animate-pulse" />
            </Link>
            <Link
              to="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4.5 rounded-2xl border border-slate-700 bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Generate My First AI Plan
            </Link>
          </div>

        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 py-16 px-6 bg-slate-50/50 dark:bg-slate-950/20 transition-colors z-10 relative">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/40 dark:border-slate-850/40 pb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span className="font-heading font-extrabold text-lg text-slate-855 dark:text-white">
                StudyAI<span className="text-primary-500">Planner</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 text-xs font-extrabold">
              <a href="https://github.com/Aditya1708-tech/StudyPlanner" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">GitHub</a>
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
