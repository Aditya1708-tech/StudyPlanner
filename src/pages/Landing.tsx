import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  BookOpen 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import GlassCard from '../components/ui/GlassCard';

const Landing: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const featureList = [
    {
      icon: Brain,
      title: "AI Study Assistant",
      desc: "Instant explanations for complex subjects, custom study plans, and automated task generation directly in chat.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: CheckSquare,
      title: "Smart Task Planner",
      desc: "Organize tasks with subjects, priorities, and study hour estimations. Persists dynamically across your sessions.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: BarChart3,
      title: "Interactive Analytics",
      desc: "Visualize your weekly progress, study streaks, hours spent per course, and milestone completions with animated charts.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Calendar,
      title: "Exam Countdowns",
      desc: "Never miss a deadline. Input upcoming exams and get customized daily recommendations on what to study to prepare.",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Add your Tasks & Exams",
      desc: "Input your study assignments, homework, and test dates. Tag them with priorities and estimated workload."
    },
    {
      num: "02",
      title: "AI Creates Study Tips",
      desc: "Our resident AI Assistant recommends revision plans, answers concept queries, and proposes concrete study targets."
    },
    {
      num: "03",
      title: "Track & Complete Goals",
      desc: "Execute daily tasks, log your study hours, and monitor your success metrics via custom dynamic visual charts."
    }
  ];

  return (
    <div className="min-h-screen bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-panel border border-primary-500/20 text-primary-655 dark:text-primary-350 text-xs font-semibold mb-6 shadow-sm shadow-primary-500/5 animate-pulse-glow"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>Supercharged Academic Planner with Generative AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading font-black text-4xl sm:text-5xl md:text-7xl tracking-tight max-w-4xl leading-[1.08] mb-6 text-slate-900 dark:text-white"
        >
          Plan smarter. <br />
          Learn faster with <span className="text-gradient font-black">AI Planner.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-slate-600 dark:text-slate-350 text-base sm:text-lg md:text-xl max-w-2xl font-semibold leading-relaxed mb-10"
        >
          The next-generation dashboard that schedules your tasks, helps you prep for upcoming exams, and answers complex queries instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto"
        >
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/35 hover:-translate-y-0.5 transition-all duration-200 group active:scale-95 text-base cursor-pointer"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 hover:bg-white/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-250 font-bold transition-all text-base active:scale-95 cursor-pointer"
          >
            Explore Features
          </button>
        </motion.div>

        {/* Dashboard Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.5 }}
          className="w-full relative max-w-5xl rounded-3xl p-2.5 bg-gradient-to-tr from-primary-500/20 to-pink-500/20 border border-white/20 dark:border-white/5 shadow-2xl backdrop-blur-md"
        >
          <div className="rounded-2xl overflow-hidden glass-panel-heavy aspect-[16/9] border border-white/40 dark:border-white/10 relative flex flex-col">
            {/* Mock Dashboard Topbar */}
            <div className="h-10 bg-slate-255/50 dark:bg-slate-950/50 flex items-center px-4 justify-between border-b border-slate-200/40 dark:border-slate-850/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
              </div>
              <div className="w-48 h-5 bg-slate-100/60 dark:bg-slate-900/60 rounded-md text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold">
                studyai-planner.vercel.app/dashboard
              </div>
              <div className="w-6"></div>
            </div>
            
            {/* Mock Layout Split */}
            <div className="flex-1 flex overflow-hidden">
              {/* Mock Sidebar */}
              <div className="w-1/5 bg-slate-100/50 dark:bg-slate-900/35 border-r border-slate-200/30 dark:border-slate-850/30 p-3 flex flex-col gap-2.5">
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="w-full h-8 bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/20 rounded-lg"></div>
                <div className="w-5/6 h-7 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg"></div>
                <div className="w-4/5 h-7 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg"></div>
                <div className="w-5/6 h-7 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg"></div>
              </div>
              {/* Mock Body */}
              <div className="flex-1 p-5 text-left bg-slate-50/50 dark:bg-dark-900/40 grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="w-1/2 h-6 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                  <div className="h-28 bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-850/40 rounded-xl p-4 space-y-2">
                    <div className="w-1/3 h-4 bg-primary-500/20 rounded-md"></div>
                    <div className="w-5/6 h-3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    <div className="w-2/3 h-3 bg-slate-250 dark:bg-slate-700 rounded-md"></div>
                  </div>
                  <div className="h-32 bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-850/40 rounded-xl p-4 space-y-2.5">
                    <div className="w-1/4 h-4 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600"></div>
                      <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600"></div>
                      <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 space-y-4">
                  <div className="h-40 bg-gradient-to-tr from-primary-500/10 to-pink-500/10 border border-primary-500/20 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white"><Sparkles className="w-4 h-4" /></div>
                    <div className="space-y-1.5">
                      <div className="w-3/4 h-3.5 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                    </div>
                  </div>
                  <div className="h-24 bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-850/40 rounded-xl p-4 space-y-2">
                    <div className="w-1/2 h-3.5 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-primary-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 px-6 bg-slate-100/30 dark:bg-dark-900/10 border-y border-slate-200/30 dark:border-slate-800/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight mb-4 text-slate-900 dark:text-white">
              Unlock your peak potential.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold">
              StudyAI Planner comes loaded with all the tools necessary to stay organized, manage complex workloads, and leverage artificial intelligence.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {featureList.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <GlassCard key={idx} hover={true} className="flex gap-5 items-start p-8">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-lg shadow-primary-500/10 shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-800 dark:text-white mb-2">{feat.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold">{feat.desc}</p>
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tight mb-4 text-slate-900 dark:text-white">
            How it works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold">
            Get up and running in less than 2 minutes. Follow these simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-24 right-24 h-0.5 bg-gradient-to-r from-primary-400/20 via-pink-400/20 to-cyan-400/20 -translate-y-12 z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="z-10 flex flex-col items-center text-center relative group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center font-heading font-black text-2xl text-primary-500 mb-6 group-hover:scale-105 group-hover:border-primary-500/40 transition-all duration-300">
                {step.num}
              </div>
              <h3 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white mb-2">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
        <GlassCard 
          hover={false} 
          className="relative overflow-hidden bg-gradient-to-tr from-primary-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-10 md:p-16 border border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Glow spots */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-xl text-left space-y-4 relative z-10">
            <h2 className="font-heading font-black text-3xl md:text-5xl leading-tight">
              Ready to plan your <br />
              <span className="text-gradient font-black">next academic breakthrough?</span>
            </h2>
            <p className="text-slate-300 text-base md:text-lg font-semibold leading-relaxed">
              Create schedules, chat with our custom-built AI, track tasks, and monitor charts instantly. Completely free to study.
            </p>
          </div>

          <div className="shrink-0 relative z-10 w-full md:w-auto">
            <Link
              to="/dashboard"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-base shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Launch App Free</span>
              <Sparkles className="w-4.5 h-4.5 text-primary-600 animate-pulse" />
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 py-12 px-6 bg-slate-50/50 dark:bg-dark-950/20 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <span className="font-heading font-extrabold text-lg text-slate-800 dark:text-white">
              StudyAI<span className="text-primary-500">Planner</span>
            </span>
          </div>

          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold">
            &copy; {new Date().getFullYear()} StudyAI Planner. Built for students who want to excel.
          </p>

          <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 text-sm font-bold">
            <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
