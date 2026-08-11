import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import AnimatedPage from '../components/layout/AnimatedPage';
import Spotlight from '../components/ui/Spotlight';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ArrowRight,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bookmark,
  CheckSquare
} from 'lucide-react';

// Count-Up animation helper component
const CountUp: React.FC<{ target: number; decimals?: number; suffix?: string }> = ({ target, decimals = 0, suffix = '' }) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test') {
    return <span>{target.toFixed(decimals)}{suffix}</span>;
  }

  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }
    
    const duration = 800; // ms
    const steps = 25;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out quad
      const current = start + (end - start) * (progress * (2 - progress));
      
      if (step >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toFixed(decimals)}{suffix}</span>;
};

const Dashboard: React.FC = () => {
  const { 
    tasks, 
    toggleTaskComplete, 
    exams, 
    addExam,
    deleteExam,
    studySessions,
    streakCount,
    overallProgress,
    currentDateStr,
    plannerInput,
    addSubject,
    studyPlan,
    togglePlanTaskComplete,
    studyPlanMetadata
  } = useStudy();

  const [showExamForm, setShowExamForm] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  const [isLoading, setIsLoading] = useState(() => typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test' ? false : true);
  
  // Confetti trigger tasks states
  const [confettiActiveTaskId, setConfettiActiveTaskId] = useState<string | null>(null);

  // Local state for subjects onboarding input
  const [obSubject, setObSubject] = useState('');

  // Interactive Mini Calendar month and day selection
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(currentDateStr));
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState(currentDateStr);

  // Chart view tab state: '7D' | '30D' | '90D'
  const [chartTab, setChartTab] = useState<'7D' | '30D' | '90D'>('7D');

  const examNameInputRef = useRef<HTMLInputElement>(null);
  const addExamButtonRef = useRef<HTMLButtonElement>(null);

  // Simulated Loader mount delay
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // Autofocus exam name when form opens
  useEffect(() => {
    if (showExamForm) {
      setTimeout(() => {
        examNameInputRef.current?.focus();
      }, 50);
    }
  }, [showExamForm]);

  // Set default subject for new exam form
  useEffect(() => {
    if (plannerInput.subjects.length > 0) {
      setNewExamSubject(plannerInput.subjects[0]);
    } else {
      setNewExamSubject('General');
    }
  }, [plannerInput.subjects]);

  // Greetings calculation
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDaysRemaining = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date(currentDateStr);
    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Today's custom tasks + AI plan tasks
  const todayCustomTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === currentDateStr);
  }, [tasks, currentDateStr]);

  const todayPlanTasks = useMemo(() => {
    return studyPlan.find(d => d.date === currentDateStr)?.tasks || [];
  }, [studyPlan, currentDateStr]);

  const todayAllTasks = useMemo(() => {
    return [...todayCustomTasks, ...todayPlanTasks];
  }, [todayCustomTasks, todayPlanTasks]);

  const todayCompletedTasksCount = useMemo(() => {
    return todayAllTasks.filter(t => t.completed).length;
  }, [todayAllTasks]);

  const todayTotalTasksCount = todayAllTasks.length;

  // Study hours logged today
  const todayStudyHoursStr = useMemo(() => {
    const todayMinutes = studySessions
      .filter(s => s.date === currentDateStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return (todayMinutes / 60).toFixed(1);
  }, [studySessions, currentDateStr]);

  // Next upcoming exam
  const nextExam = useMemo(() => {
    const upcoming = exams
      .filter(e => new Date(e.date).getTime() >= new Date(currentDateStr).getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [exams, currentDateStr]);

  // Handler for completing a task and triggering confetti celebration
  const handleToggleTask = (task: any) => {
    const willBeCompleted = !task.completed;
    if (willBeCompleted) {
      setConfettiActiveTaskId(task.id);
      setTimeout(() => setConfettiActiveTaskId(null), 800);
    }
    if (!task.isGenerated) {
      toggleTaskComplete(task.id);
    } else {
      togglePlanTaskComplete(currentDateStr, task.id);
    }
  };

  // Handler for adding subject in onboarding card
  const handleAddSubjectOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obSubject.trim()) return;
    addSubject(obSubject.trim());
    setObSubject('');
  };

  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName || !newExamDate) return;
    addExam({
      name: newExamName,
      subject: newExamSubject || 'General',
      date: newExamDate,
      location: 'Seminar Room'
    });
    setNewExamName('');
    setNewExamDate('');
    setShowExamForm(false);
    setTimeout(() => {
      addExamButtonRef.current?.focus();
    }, 50);
  };

  // Onboarding completion checks
  const hasSubjects = plannerInput.subjects.length > 0;
  const hasExams = exams.length > 0;
  const hasPlan = studyPlan.length > 0;
  const showOnboarding = !hasSubjects || !hasExams || !hasPlan;

  const totalGeneratedTasks = useMemo(() => {
    return studyPlan.reduce((acc, day) => acc + day.tasks.length, 0);
  }, [studyPlan]);

  const completedGeneratedTasks = useMemo(() => {
    return studyPlan.reduce((acc, day) => acc + day.tasks.filter(t => t.completed).length, 0);
  }, [studyPlan]);
  
  const completionPercent = useMemo(() => {
    return totalGeneratedTasks > 0 ? Math.round((completedGeneratedTasks / totalGeneratedTasks) * 100) : 0;
  }, [totalGeneratedTasks, completedGeneratedTasks]);

  // Dynamic AI study assistant text
  const aiAssistantText = useMemo(() => {
    if (plannerInput.subjects.length === 0) {
      return "Welcome! I recommend setting up your academic subjects first. Once added, log your exams and I will build a tailored learning strategy.";
    }
    if (exams.length === 0) {
      return "Subjects set up! Add your upcoming exams countdowns so I can map out priority review schedules before assessment dates.";
    }
    if (studyPlan.length === 0) {
      return "Nice job. You have configured your subjects and exams. Run the AI Planner now to generate daily revision blocks and structured schedules.";
    }

    const remainingPct = 100 - completionPercent;
    
    // Find next upcoming topic
    let upcomingTopic = "N/A";
    const pendingTasks = studyPlan.reduce((acc, d) => {
      return [...acc, ...d.tasks.filter(t => !t.completed)];
    }, [] as Task[]);
    if (pendingTasks.length > 0) {
      upcomingTopic = pendingTasks[0].topic || pendingTasks[0].title;
    }

    // Completion Forecast message
    const estCompletion = studyPlanMetadata?.estimatedCompletionDate || '';
    let forecastMsg = "";
    if (estCompletion) {
      const completionDate = new Date(estCompletion);
      const today = new Date(currentDateStr);
      const daysDiff = Math.ceil((completionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nextExam) {
        const examDate = new Date(nextExam.date);
        const bufferDays = Math.ceil((examDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (bufferDays >= 0) {
          forecastMsg = `Estimated to finish all topics on ${estCompletion} (${bufferDays} buffer days before exam).`;
        } else {
          forecastMsg = `⚠️ Attention: Your current study pace finishes the syllabus ${Math.abs(bufferDays)} days AFTER your exam. We suggest increasing your daily available study hours.`;
        }
      } else {
        forecastMsg = `Estimated syllabus completion date is ${estCompletion} (in ${daysDiff} days).`;
      }
    }

    // Recommendation track check
    let recommendation = "";
    const today = new Date(currentDateStr);
    const overdueCount = studyPlan.reduce((acc, d) => {
      const dDate = new Date(d.date);
      if (dDate < today) {
        return acc + d.tasks.filter(t => !t.completed).length;
      }
      return acc;
    }, 0);

    if (overdueCount > 0) {
      recommendation = `⚠️ You are behind by ${overdueCount} study topic${overdueCount !== 1 ? 's' : ''}. We recommend adding an extra 1.5h revision slot today to catch up!`;
    } else {
      recommendation = `✅ On Track! You have completed all scheduled topics. Study "${upcomingTopic}" next to maintain consistency.`;
    }

    return `Syllabus Remaining: ${remainingPct}%. Upcoming Review Target: "${upcomingTopic}". ${forecastMsg} ${recommendation}`;
  }, [plannerInput.subjects, exams, studyPlan, studyPlanMetadata, nextExam, streakCount, completionPercent, currentDateStr]);

  // Derived calendar grid logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDayIndex = getFirstDayOfMonth(calendarMonth);
    
    const blanks = Array(firstDayIndex).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return [...blanks, ...days];
  }, [calendarMonth]);

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Helper to format date string
  const formatCalendarDate = (dayNum: number) => {
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const day = String(dayNum).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCalendarDayIndicators = (dateStr: string) => {
    const hasExam = exams.some(e => e.date === dateStr);
    const hasSession = studySessions.some(s => s.date === dateStr);
    const hasRevision = studyPlan.some(d => d.date === dateStr);
    return { hasExam, hasSession, hasRevision };
  };

  // Selected Day agenda details (for mini calendar selection)
  const selectedCalendarExams = exams.filter(e => e.date === selectedCalendarDateStr);
  const selectedCalendarSessions = studySessions.filter(s => s.date === selectedCalendarDateStr);
  const selectedCalendarCustomTasks = tasks.filter(t => t.dueDate === selectedCalendarDateStr);
  const selectedCalendarRevisionTasks = studyPlan.find(d => d.date === selectedCalendarDateStr)?.tasks || [];

  // Today's Agenda (permanent block)
  const todayLoggedSessions = useMemo(() => {
    return studySessions.filter(s => s.date === currentDateStr);
  }, [studySessions, currentDateStr]);

  // Dynamic Insights chart data
  const chartData = useMemo(() => {
    if (chartTab === '7D') {
      const last7Days: { label: string; hours: number }[] = [];
      const temp = new Date(currentDateStr);
      for (let i = 0; i < 7; i++) {
        const dateStr = temp.toISOString().split('T')[0];
        const mins = studySessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.durationMinutes, 0);
        const dayName = temp.toLocaleDateString('default', { weekday: 'short' });
        last7Days.push({ label: dayName, hours: Number((mins / 60).toFixed(1)) });
        temp.setDate(temp.getDate() - 1);
      }
      return last7Days.reverse();
    }

    if (chartTab === '30D') {
      const weeklyBlocks: { label: string; hours: number }[] = [];
      const temp = new Date(currentDateStr);
      for (let w = 0; w < 4; w++) {
        let blockMins = 0;
        for (let d = 0; d < 7; d++) {
          const dateStr = temp.toISOString().split('T')[0];
          blockMins += studySessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.durationMinutes, 0);
          temp.setDate(temp.getDate() - 1);
        }
        weeklyBlocks.push({ label: `Wk ${4 - w}`, hours: Number((blockMins / 60).toFixed(1)) });
      }
      return weeklyBlocks.reverse();
    }

    const monthlyBlocks: { label: string; hours: number }[] = [];
    const temp = new Date(currentDateStr);
    for (let m = 0; m < 3; m++) {
      let blockMins = 0;
      const monthLabel = temp.toLocaleDateString('default', { month: 'short' });
      for (let d = 0; d < 30; d++) {
        const dateStr = temp.toISOString().split('T')[0];
        blockMins += studySessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.durationMinutes, 0);
        temp.setDate(temp.getDate() - 1);
      }
      monthlyBlocks.push({ label: monthLabel, hours: Number((blockMins / 60).toFixed(1)) });
    }
    return monthlyBlocks.reverse();
  }, [chartTab, studySessions, currentDateStr]);

  const maxChartHours = Math.max(...chartData.map(d => d.hours), 5);

  // SKELETON RENDER FUNCTIONS
  const renderMetricSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <GlassCard hover={false} key={i} className="flex items-center justify-between p-5 animate-pulse">
          <div className="space-y-2.5 w-2/3">
            <div className="h-2.5 bg-border-primary/60 dark:bg-slate-800 rounded-full w-20" />
            <div className="h-6 bg-border-primary/80 dark:bg-slate-700 rounded-full w-16" />
            <div className="h-2 bg-border-primary/40 dark:bg-slate-800/60 rounded-full w-24" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-border-primary/50 dark:bg-slate-800" />
        </GlassCard>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <GlassCard hover={false} className="p-6 space-y-5 animate-pulse">
      <div className="border-b border-border-primary/40 dark:border-border-primary/40 pb-3 flex items-center justify-between">
        <div className="h-5 bg-border-primary/80 dark:bg-slate-700 rounded-full w-32" />
        <div className="h-3 bg-border-primary/40 dark:bg-slate-800 rounded-full w-16" />
      </div>
      <div className="space-y-3.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border-primary/40 dark:border-border-primary/45 bg-surface-primary/10 dark:bg-bg-primary/20">
            <div className="flex items-center gap-3 w-2/3">
              <div className="w-5.5 h-5.5 rounded bg-border-primary/60 dark:bg-slate-800 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-3 bg-border-primary/70 dark:bg-slate-700 rounded w-5/6" />
                <div className="h-2 bg-border-primary/40 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
            <div className="h-3 bg-border-primary/50 dark:bg-slate-800 rounded w-8" />
          </div>
        ))}
      </div>
    </GlassCard>
  );

  const renderCalendarSkeleton = () => (
    <GlassCard hover={false} className="p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-border-primary/40 dark:border-border-primary/40 pb-3">
        <div className="h-4 bg-border-primary/80 dark:bg-slate-700 rounded w-24" />
        <div className="h-5 bg-border-primary/40 dark:bg-slate-800 rounded w-14" />
      </div>
      <div className="h-4 bg-border-primary/60 dark:bg-slate-800 rounded w-32 mx-auto" />
      <div className="grid grid-cols-7 gap-1 text-center">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-border-primary/30 dark:bg-slate-800" />
        ))}
      </div>
    </GlassCard>
  );

  const renderAISkeleton = () => (
    <GlassCard hover={false} className="relative overflow-hidden bg-gradient-to-tr from-primary-600/5 via-pink-500/5 to-transparent border border-primary-500/20 p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-border-primary/60 dark:bg-slate-800" />
        <div className="space-y-1.5 w-1/2">
          <div className="h-4 bg-border-primary/80 dark:bg-slate-700 rounded" />
          <div className="h-2 bg-border-primary/40 dark:bg-slate-800 rounded w-3/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-border-primary/50 dark:bg-slate-800 rounded" />
        <div className="h-3 bg-border-primary/50 dark:bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-border-primary/40 dark:bg-slate-800 rounded w-2/3" />
      </div>
    </GlassCard>
  );

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300 font-sans relative">
        <Spotlight />
        <Sidebar />
        
        <div className="md:pl-64 min-h-screen transition-all duration-300">
          <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary"
              >
                {getGreeting()}, Aditya!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-text-secondary dark:text-text-muted text-sm font-semibold"
              >
                {new Date(currentDateStr).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-primary/60 dark:bg-surface-primary border border-border-primary text-xs font-semibold text-text-secondary self-start"
            >
              <kbd className="px-2 py-0.5 border border-border-primary bg-bg-primary text-[10px] font-extrabold rounded text-text-muted">
                Ctrl + K
              </kbd>
              <span>Quick Add Actions</span>
            </motion.div>
          </div>

          {/* Premium Onboarding Card */}
          {showOnboarding && (
            <GlassCard hover={false} className="border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 to-transparent p-6 space-y-5">
              <div>
                <h2 className="font-heading font-black text-lg text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <span>Welcome to StudyAI Planner Pro!</span>
                </h2>
                <p className="text-xs text-text-secondary dark:text-text-muted font-semibold mt-1">Let's set up your personalized scheduler in three quick steps:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1: Add Subject */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  hasSubjects 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                    : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      hasSubjects ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-white'
                    }`}>
                      {hasSubjects ? '✓' : '1'}
                    </span>
                    <h3 className="font-bold text-xs text-text-primary">Add Academic Subjects</h3>
                  </div>
                  <p className="text-[10px] text-text-secondary font-semibold mb-3">Configure subjects you are enrolled in.</p>
                  
                  {!hasSubjects ? (
                    <form onSubmit={handleAddSubjectOnboarding} className="flex gap-1.5">
                      <label htmlFor="onboarding-subject-input" className="sr-only">Onboarding Subject Name</label>
                      <input
                        id="onboarding-subject-input"
                        type="text"
                        required
                        placeholder="e.g. Calculus"
                        value={obSubject}
                        onChange={(e) => setObSubject(e.target.value)}
                        className="flex-1 text-[10px] px-2 py-1.5 rounded-lg bg-surface-primary dark:bg-bg-primary border border-border-primary text-text-primary"
                      />
                      <button type="submit" className="px-2 py-1.5 bg-brand-primary text-white rounded-lg text-[10px] font-extrabold cursor-pointer">
                        Add
                      </button>
                    </form>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Configured</span>
                  )}
                </div>

                {/* Step 2: Add Exam */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  hasExams 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                    : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      hasExams ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-white'
                    }`}>
                      {hasExams ? '✓' : '2'}
                    </span>
                    <h3 className="font-bold text-xs text-text-primary">Add Exams Countdown</h3>
                  </div>
                  <p className="text-[10px] text-text-secondary font-semibold mb-3">Log milestone exam dates for calculation.</p>
                  
                  {!hasExams ? (
                    <button
                      onClick={() => setShowExamForm(true)}
                      className="px-3 py-1.5 bg-bg-primary text-text-secondary rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Configure Exam
                    </button>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Milestones Added</span>
                  )}
                </div>

                {/* Step 3: Generate AI Plan */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  hasPlan 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                    : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      hasPlan ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-white'
                    }`}>
                      {hasPlan ? '✓' : '3'}
                    </span>
                    <h3 className="font-bold text-xs text-text-primary">Generate AI Study Plan</h3>
                  </div>
                  <p className="text-[10px] text-text-secondary font-semibold mb-3">Run optimization models to structure sessions.</p>
                  
                  {!hasPlan ? (
                    <Link
                      to="/planner"
                      className="inline-block px-3 py-1.5 bg-brand-primary text-white rounded-lg text-[10px] font-extrabold cursor-pointer"
                    >
                      AI Planner
                    </Link>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Roadmap Generated</span>
                  )}
                </div>

              </div>
            </GlassCard>
          )}

          {/* Metric Cards (Top Grid with Skeletons support) */}
          {isLoading ? renderMetricSkeletons() : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Today's Tasks */}
              <GlassCard hover={true} className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted dark:text-text-secondary uppercase tracking-widest">Today's Tasks</span>
                  <h3 className="font-heading font-black text-2xl text-text-primary leading-tight">
                    {typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test' ? (
                      `${todayCompletedTasksCount} / ${todayTotalTasksCount}`
                    ) : (
                      <><CountUp target={todayCompletedTasksCount} /> / <CountUp target={todayTotalTasksCount} /></>
                    )}
                  </h3>
                  <p className="text-[10px] font-semibold text-text-muted">
                    {todayTotalTasksCount > 0 
                      ? `${Math.round((todayCompletedTasksCount / todayTotalTasksCount) * 100)}% complete`
                      : 'No tasks scheduled'
                    }
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <CheckSquare className="w-5.5 h-5.5" />
                </div>
              </GlassCard>

              {/* Card 2: Study Time Today */}
              <GlassCard hover={true} className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted dark:text-text-secondary uppercase tracking-widest">Study Time Today</span>
                  <h3 className="font-heading font-black text-2xl text-text-primary leading-tight">
                    {typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test' ? (
                      `${todayStudyHoursStr} h`
                    ) : (
                      <CountUp target={parseFloat(todayStudyHoursStr)} decimals={1} suffix=" h" />
                    )}
                  </h3>
                  <p className="text-[10px] font-semibold text-text-muted">Active focus time today</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <Clock className="w-5.5 h-5.5" />
                </div>
              </GlassCard>

              {/* Card 3: Current Streak */}
              <GlassCard hover={true} className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted dark:text-text-secondary uppercase tracking-widest">Current Streak</span>
                  <h3 className="font-heading font-black text-2xl text-text-primary leading-tight">
                    {typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test' ? (
                      `${streakCount} Day${streakCount !== 1 ? 's' : ''}`
                    ) : (
                      <><CountUp target={streakCount} /> Day{streakCount !== 1 ? 's' : ''}</>
                    )}
                  </h3>
                  <p className="text-[10px] font-semibold text-text-muted">
                    {streakCount > 0 ? 'Keep it active! 🔥' : 'Log a session to start'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500">
                  <Flame className="w-5.5 h-5.5" />
                </div>
              </GlassCard>

              {/* Card 4: Next Exam */}
              <GlassCard hover={true} className="flex items-center justify-between p-5">
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] font-bold text-text-muted dark:text-text-secondary uppercase tracking-widest">Next Exam</span>
                  <h3 className="font-heading font-black text-lg text-text-primary leading-tight truncate">
                    {nextExam ? nextExam.subject : 'None'}
                  </h3>
                  <p className="text-[10px] font-semibold text-text-muted truncate">
                    {nextExam ? `${nextExam.name} (${getDaysRemaining(nextExam.date)}d)` : 'Ready to customize'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500">
                  <CalendarIcon className="w-5.5 h-5.5" />
                </div>
              </GlassCard>

            </div>
          )}

          {/* Weekly Progress Bar Block (Separate panel below metrics) */}
          <GlassCard hover={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted dark:text-text-secondary">Weekly Progress</span>
              <p className="text-xs font-bold text-text-primary">
                Your cumulative task and session accomplishment rate over the last 7 days.
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-1 max-w-md w-full sm:justify-end">
              <span className="font-heading font-black text-2xl text-text-primary shrink-0">
                <CountUp target={overallProgress} />%
              </span>
              <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-primary/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-primary-600 to-pink-500 rounded-full" 
                />
              </div>
            </div>
          </GlassCard>

          {/* Syllabus Roadmap Insight Panel */}
          {studyPlan.length > 0 && (
            <GlassCard hover={false} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 to-transparent">
              <div className="space-y-1 md:border-r border-border-primary/50 dark:border-slate-800 pr-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted dark:text-text-secondary">Upcoming Review Target</span>
                <h4 className="font-heading font-black text-sm text-text-primary dark:text-slate-100 truncate">
                  {studyPlan.reduce((acc, d) => [...acc, ...d.tasks.filter(t => !t.completed)], [] as Task[])[0]?.topic || 'Syllabus Complete! 🎉'}
                </h4>
                <p className="text-[10px] font-semibold text-text-secondary dark:text-text-muted">Next scheduled topic</p>
              </div>

              <div className="space-y-1 md:border-r border-border-primary/50 dark:border-slate-800 pr-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted dark:text-text-secondary">Syllabus Remaining</span>
                <h4 className="font-heading font-black text-sm text-text-primary dark:text-slate-100 flex items-center gap-1.5">
                  <span>{100 - completionPercent}%</span>
                  <span className="text-[10px] font-semibold text-text-muted">({completionPercent}% completed)</span>
                </h4>
                <div className="h-1.5 w-full bg-bg-primary dark:bg-slate-800 rounded-full overflow-hidden border border-border-primary/20 mt-1">
                  <div className="h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted dark:text-text-secondary">Milestone Forecast</span>
                <h4 className="font-heading font-black text-xs text-text-primary dark:text-slate-100 truncate">
                  {studyPlanMetadata?.estimatedCompletionDate ? `Finish on ${studyPlanMetadata.estimatedCompletionDate}` : 'Timeline pending'}
                </h4>
                <p className="text-[9.5px] font-semibold text-brand-primary leading-tight">
                  {nextExam && studyPlanMetadata?.estimatedCompletionDate ? (
                    (() => {
                      const buffer = Math.ceil((new Date(nextExam.date).getTime() - new Date(studyPlanMetadata.estimatedCompletionDate).getTime()) / (1000 * 60 * 60 * 24));
                      return buffer >= 0 ? `✓ ${buffer} buffer days prior to exam` : `⚠️ Overdue: finishes ${Math.abs(buffer)} days after exam`;
                    })()
                  ) : 'Continuous study track'}
                </p>
              </div>
            </GlassCard>
          )}

          {/* Core Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2 Cols wide): Today's Agenda, Focus Tasks, Insights Chart */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Today's Agenda (scheduled tasks + study sessions) */}
              {isLoading ? renderListSkeleton() : (
                <GlassCard hover={false} className="p-6 space-y-5">
                  <div className="border-b border-border-primary/40 pb-3 flex items-center justify-between">
                    <h2 className="font-heading font-black text-xl text-text-primary flex items-center gap-2">
                      <Bookmark className="w-5.5 h-5.5 text-brand-primary" />
                      <span>Today's Agenda</span>
                    </h2>
                    <span className="text-[10px] font-bold text-text-muted dark:text-text-secondary uppercase">Current Day view</span>
                  </div>

                  <div className="space-y-3">
                    {todayAllTasks.length === 0 && todayLoggedSessions.length === 0 ? (
                      <div className="text-center py-10 px-4 text-text-secondary border border-dashed border-border-primary/60 rounded-2xl bg-surface-primary/10">
                        <CheckCircle2 className="w-8 h-8 text-brand-primary mx-auto mb-3 opacity-60" />
                        <h3 className="font-heading font-black text-sm text-text-primary">All Tasks Completed!</h3>
                        <p className="text-[10px] text-text-muted mt-1 max-w-xs mx-auto">Your agenda is fully clear. Generate an AI study plan or add a custom task.</p>
                      </div>
                    ) : (
                      <>
                        {/* Tasks Agenda List */}
                        {todayAllTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border-primary/50 bg-surface-primary/20">
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleTask(task)}
                                aria-label={`Toggle completion of ${task.title}`}
                                className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all relative ${
                                  task.completed 
                                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                    : 'border-border-primary hover:border-brand-primary bg-bg-primary'
                                }`}
                              >
                                {task.completed && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                                  </motion.div>
                                )}
                                
                                {/* Confetti burst celebration */}
                                {confettiActiveTaskId === task.id && (
                                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                                    {[...Array(8)].map((_, i) => {
                                      const angle = (i * 360) / 8;
                                      const radians = (angle * Math.PI) / 180;
                                      const x = Math.cos(radians) * 35;
                                      const y = Math.sin(radians) * 35;
                                      const colors = ['#6D4AFF', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
                                      const color = colors[i % colors.length];

                                      return (
                                        <motion.div
                                          key={i}
                                          initial={{ scale: 0.8, opacity: 1, x: 0, y: 0 }}
                                          animate={{ scale: 0, opacity: 0, x, y }}
                                          transition={{ duration: 0.6, ease: "easeOut" }}
                                          className="w-1.5 h-1.5 rounded-full absolute"
                                          style={{ backgroundColor: color }}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </motion.button>
                              <div>
                                <p className={`text-xs font-bold ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-bg-primary rounded text-text-secondary">
                                    {task.subject}
                                  </span>
                                  {'isGenerated' in task && task.isGenerated && (
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-primary/10 rounded text-brand-primary flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span>AI Revision</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-text-muted flex items-center gap-0.5">
                              <Clock className="w-3.5 h-3.5" /> {task.estimatedHours}h
                            </span>
                          </div>
                        ))}

                        {/* Logged study sessions lists */}
                        {todayLoggedSessions.map(session => (
                          <div key={session.id} className="flex items-center justify-between p-3.5 rounded-xl border border-cyan-500/10 bg-cyan-500/5">
                            <div className="flex items-center gap-3">
                              <div className="w-5.5 h-5.5 rounded bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-text-primary">
                                  Logged {session.subject} Study Session
                                </p>
                                <p className="text-[9px] font-semibold text-text-muted">
                                  {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                              {(session.durationMinutes / 60).toFixed(1)} h
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Focus Tasks (Sorted by priority with skeleton loaders support) */}
              {isLoading ? renderListSkeleton() : (
                <GlassCard hover={false} className="p-6 space-y-5">
                  <div className="border-b border-border-primary/40 pb-3 flex items-center justify-between">
                    <h2 className="font-heading font-black text-xl text-text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-5.5 h-5.5 text-brand-primary" />
                      <span>Focus Tasks for Today</span>
                    </h2>
                    <Link to="/tasks" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-0.5">
                      <span>View All Tasks</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {todayAllTasks.length === 0 ? (
                      <div className="text-center py-10 px-4 text-text-secondary border border-dashed border-border-primary/60 rounded-2xl bg-surface-primary/10">
                        <CheckSquare className="w-8 h-8 text-brand-primary mx-auto mb-3 opacity-60" />
                        <h3 className="font-heading font-black text-sm text-text-primary">Clear Schedule</h3>
                        <p className="text-[10px] text-text-muted mt-1 max-w-xs mx-auto">All study task countdowns have been processed successfully.</p>
                      </div>
                    ) : (
                      // Sort high, then medium, then low
                      [...todayAllTasks]
                        .sort((a, b) => {
                          const prioWeight = { High: 3, Medium: 2, Low: 1 };
                          return prioWeight[b.priority] - prioWeight[a.priority];
                        })
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border-primary/40 bg-surface-primary/10">
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleTask(task)}
                                aria-label={`Toggle completion of ${task.title}`}
                                className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all relative ${
                                  task.completed 
                                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                    : 'border-border-primary hover:border-brand-primary bg-bg-primary'
                                }`}
                              >
                                {task.completed && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                                  </motion.div>
                                )}
                                
                                {/* Confetti burst celebration */}
                                {confettiActiveTaskId === task.id && (
                                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                                    {[...Array(8)].map((_, i) => {
                                      const angle = (i * 360) / 8;
                                      const radians = (angle * Math.PI) / 180;
                                      const x = Math.cos(radians) * 35;
                                      const y = Math.sin(radians) * 35;
                                      const colors = ['#6D4AFF', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
                                      const color = colors[i % colors.length];

                                      return (
                                        <motion.div
                                          key={i}
                                          initial={{ scale: 0.8, opacity: 1, x: 0, y: 0 }}
                                          animate={{ scale: 0, opacity: 0, x, y }}
                                          transition={{ duration: 0.6, ease: "easeOut" }}
                                          className="w-1.5 h-1.5 rounded-full absolute"
                                          style={{ backgroundColor: color }}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </motion.button>
                              <div>
                                <p className={`text-xs font-semibold ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-border-primary/50 rounded text-text-secondary">
                                    {task.subject}
                                  </span>
                                  <span className={`text-[9px] font-black uppercase ${
                                    task.priority === 'High' ? 'text-rose-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <span className="text-[10px] font-bold text-text-muted flex items-center gap-0.5">
                              <Clock className="w-3.5 h-3.5" /> {task.estimatedHours}h
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Study Insights Chart (7D, 30D, 90D tabs) */}
              <GlassCard hover={false} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-primary/40 pb-4 gap-4">
                  <h2 className="font-heading font-black text-lg text-text-primary flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-primary" />
                    <span>Study Insights</span>
                  </h2>
                  
                  {/* Tabs */}
                  <div className="flex rounded-lg bg-bg-primary p-1 self-start">
                    {(['7D', '30D', '90D'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setChartTab(tab)}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                          chartTab === tab 
                            ? 'bg-surface-primary text-brand-primary shadow'
                            : 'text-text-secondary hover:text-text-secondary'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plot area */}
                <div className="space-y-4">
                  {studySessions.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center text-text-secondary dark:text-text-muted border border-dashed border-border-primary/60 rounded-2xl bg-surface-primary/10 px-4 text-center">
                      <Clock className="w-8 h-8 text-brand-primary mb-3 opacity-60" />
                      <h3 className="font-heading font-black text-sm text-text-primary font-bold">No Study Data Yet</h3>
                      <p className="text-[10px] text-text-muted mt-1 max-w-xs mx-auto">Track dynamic focus sessions to populate interactive chart metrics.</p>
                    </div>
                  ) : (
                    <div 
                      className="h-56 flex items-end justify-between px-2 pt-6 relative border-b border-border-primary/40"
                      role="img"
                      aria-label="Insights chart showing study hours aggregations"
                    >
                      {chartData.map((item, idx) => {
                        const pctHeight = (item.hours / maxChartHours) * 100;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-7 sm:w-9 relative flex justify-center items-end h-40">
                              <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-900 dark:bg-bg-primary border border-border-primary text-white text-[10px] px-2 py-1 rounded font-bold transition-all z-20 pointer-events-none">
                                {item.hours}h
                              </span>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${pctHeight}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.05 }}
                                className="w-full rounded-t-lg bg-gradient-to-t from-primary-600/70 to-primary-500 group-hover:from-primary-500 group-hover:to-pink-500 transition-colors shadow-lg" 
                              />
                            </div>
                            <span className="text-[10px] font-bold text-text-muted dark:text-text-secondary">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </GlassCard>

            </div>

            {/* Right Column: Mini Calendar, AI Study Assistant, Upcoming Exams */}
            <div className="space-y-8">
              
              {/* AI Study Assistant Card */}
              {isLoading ? renderAISkeleton() : (
                <GlassCard 
                  hover={true} 
                  className="relative overflow-hidden bg-gradient-to-tr from-brand-primary/10 via-pink-500/5 to-transparent border border-brand-primary/20 p-6 space-y-4"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="font-heading font-extrabold text-lg text-text-primary">AI assistant</h2>
                      <p className="text-[10px] uppercase font-bold text-brand-primary">Study Strategy Recommendation</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                    "{aiAssistantText}"
                  </p>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      to="/planner"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-xs shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <span>Launch AI Planner</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/assistant"
                      className="text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors flex items-center"
                    >
                      AI Chat
                    </Link>
                  </div>
                </GlassCard>
              )}

              {/* Interactive Mini Calendar */}
              {isLoading ? renderCalendarSkeleton() : (
                <GlassCard hover={false} className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border-primary/40 pb-3">
                    <h2 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5">
                      <CalendarIcon className="w-4.5 h-4.5 text-brand-primary" />
                      <span>Study Calendar</span>
                    </h2>
                    <div className="flex gap-1">
                      <button onClick={handlePrevMonth} aria-label="Previous month" className="p-1 rounded bg-bg-primary text-text-secondary cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleNextMonth} aria-label="Next month" className="p-1 rounded bg-bg-primary text-text-secondary cursor-pointer">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center text-xs font-bold text-text-primary mb-2">
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                      <span key={idx} className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{day}</span>
                    ))}
                    
                    {calendarDays.map((day, idx) => {
                      if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />;
                      const dateKey = formatCalendarDate(day);
                      const indicators = getCalendarDayIndicators(dateKey);
                      const isSelected = selectedCalendarDateStr === dateKey;
                      const isToday = currentDateStr === dateKey;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedCalendarDateStr(dateKey)}
                          aria-label={`${day} ${calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center p-0.5 relative cursor-pointer text-[10px] font-bold border transition-colors ${
                            isSelected 
                              ? 'bg-brand-primary border-brand-primary text-white shadow' 
                              : isToday
                                ? 'bg-primary-100/50 dark:bg-primary-950/20 border-brand-primary/30 text-text-primary font-extrabold'
                                : 'bg-transparent border-transparent hover:bg-bg-primary text-text-secondary dark:text-slate-200'
                          }`}
                        >
                          <span>{day}</span>
                          {/* Dot indicator */}
                          <div className="absolute bottom-0.5 flex gap-0.5">
                            {indicators.hasExam && <span className="w-1 h-1 rounded-full bg-rose-500" />}
                            {indicators.hasSession && <span className="w-1 h-1 rounded-full bg-cyan-500" />}
                            {indicators.hasRevision && <span className="w-1 h-1 rounded-full bg-purple-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Day Agenda details sub-pane */}
                  <div className="border-t border-border-primary/40 pt-3 mt-3">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                      Agenda: {new Date(selectedCalendarDateStr).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </span>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedCalendarExams.map(exam => (
                        <div key={exam.id} className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-800 dark:text-rose-200 text-[10px] font-bold text-left">
                          Exam: {exam.name}
                        </div>
                      ))}
                      
                      {selectedCalendarCustomTasks.map(task => (
                        <div key={task.id} className="p-2 rounded border border-border-primary/50 text-[10px] font-semibold text-text-secondary flex justify-between">
                          <span className={task.completed ? 'line-through text-text-muted' : ''}>{task.title}</span>
                          <span className="text-[9px] uppercase font-bold text-text-muted">{task.subject}</span>
                        </div>
                      ))}

                      {selectedCalendarRevisionTasks.map(task => (
                        <div key={task.id} className="p-2 rounded bg-brand-primary/5 border border-brand-primary/10 text-[10px] font-semibold text-text-secondary flex justify-between">
                          <span className={task.completed ? 'line-through text-text-muted' : ''}>{task.title}</span>
                          <span className="text-[8px] uppercase font-bold text-brand-primary">Revision</span>
                        </div>
                      ))}

                      {selectedCalendarSessions.map(session => (
                        <div key={session.id} className="p-2 rounded bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex justify-between">
                          <span>Study Session</span>
                          <span>{(session.durationMinutes / 60).toFixed(1)}h</span>
                        </div>
                      ))}

                      {selectedCalendarExams.length === 0 && 
                       selectedCalendarCustomTasks.length === 0 && 
                       selectedCalendarRevisionTasks.length === 0 && 
                       selectedCalendarSessions.length === 0 && (
                        <span className="text-[10px] font-semibold text-text-muted">Clear schedule</span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Upcoming Exams Milestone Tracker */}
              <GlassCard hover={false} className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-primary/40 pb-3">
                  <h2 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5">
                    <CalendarIcon className="w-4.5 h-4.5 text-brand-primary" />
                    <span>Upcoming Exams</span>
                  </h2>
                  
                  <button 
                    ref={addExamButtonRef}
                    onClick={() => setShowExamForm(!showExamForm)} 
                    className="p-1 rounded bg-bg-primary text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
                    aria-label="Toggle add exam form"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showExamForm && (
                  <form onSubmit={handleAddExamSubmit} className="p-3.5 rounded-xl border border-border-primary bg-bg-primary space-y-3">
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="exam-name" className="text-[9px] font-bold text-text-muted uppercase">Exam Name</label>
                        <input 
                          id="exam-name"
                          ref={examNameInputRef}
                          type="text" 
                          required
                          placeholder="e.g. Midterm 1" 
                          value={newExamName}
                          onChange={(e) => setNewExamName(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 rounded-lg bg-surface-primary border border-border-primary focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="exam-subject" className="text-[9px] font-bold text-text-muted uppercase">Subject</label>
                        <select
                          id="exam-subject"
                          value={newExamSubject}
                          onChange={(e) => setNewExamSubject(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 rounded-lg bg-surface-primary border border-border-primary focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-primary"
                        >
                          {plannerInput.subjects.length > 0 ? (
                            plannerInput.subjects.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))
                          ) : (
                            <option value="General">General</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="exam-date" className="text-[9px] font-bold text-text-muted uppercase">Date</label>
                        <input 
                          id="exam-date"
                          type="date" 
                          required
                          value={newExamDate}
                          onChange={(e) => setNewExamDate(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 rounded-lg bg-surface-primary border border-border-primary focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-primary"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-gradient-to-r from-brand-primary to-pink-500 text-white rounded-lg text-[10px] font-extrabold cursor-pointer hover:-translate-y-0.5 transition-all"
                    >
                      Add Exam Countdown
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {exams.length === 0 ? (
                    <div className="text-center py-6 px-4 text-text-secondary border border-dashed border-border-primary/60 rounded-2xl bg-surface-primary/10">
                      <CalendarIcon className="w-8 h-8 text-brand-primary mx-auto mb-3 opacity-60" />
                      <h3 className="font-heading font-black text-sm text-text-primary">No Exams Added</h3>
                      <p className="text-[10px] text-text-muted mt-1 max-w-xs mx-auto">Add upcoming exams to map out prioritization countdown schedules.</p>
                    </div>
                  ) : (
                    exams.map(exam => {
                      const daysLeft = getDaysRemaining(exam.date);
                      const isUrgent = daysLeft <= 3;
                      
                      return (
                        <div key={exam.id} className="group relative flex items-start justify-between p-3.5 rounded-xl border border-border-primary/50 bg-surface-primary/30">
                          <div className="space-y-1 text-left">
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded">
                              {exam.subject}
                            </span>
                            <h3 className="font-bold text-xs text-text-primary mt-1">{exam.name}</h3>
                            <p className="text-[9px] font-semibold text-text-muted">{exam.date}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            <div className={`px-2 py-1 rounded-lg flex flex-col items-center justify-center font-heading ${
                              isUrgent 
                                ? 'bg-rose-500/10 text-rose-500' 
                                : 'bg-bg-primary text-text-secondary'
                            }`}>
                              <span className="text-xs font-black leading-none">{daysLeft > 0 ? daysLeft : 0}</span>
                              <span className="text-[7px] font-black uppercase leading-none mt-0.5">days</span>
                            </div>
                            <button
                              onClick={() => deleteExam(exam.id)}
                              aria-label={`Delete exam countdown for ${exam.name}`}
                              className="opacity-0 group-hover:opacity-100 text-[9px] text-red-500 hover:underline font-bold transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </GlassCard>

            </div>

          </div>

        </div>
      </div>
    </div>
  </AnimatedPage>
);
};

export default Dashboard;
