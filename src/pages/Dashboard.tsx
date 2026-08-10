import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
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
    togglePlanTaskComplete
  } = useStudy();

  const [showExamForm, setShowExamForm] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  // Local state for subjects onboarding input
  const [obSubject, setObSubject] = useState('');

  // Interactive Mini Calendar month and day selection
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(currentDateStr));
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState(currentDateStr);

  // Chart view tab state: '7D' | '30D' | '90D'
  const [chartTab, setChartTab] = useState<'7D' | '30D' | '90D'>('7D');

  const examNameInputRef = useRef<HTMLInputElement>(null);
  const addExamButtonRef = useRef<HTMLButtonElement>(null);

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

    const taskCount = todayAllTasks.length;
    const pendingCount = todayAllTasks.filter(t => !t.completed).length;

    if (nextExam) {
      const daysLeft = getDaysRemaining(nextExam.date);
      const isUrgent = daysLeft <= 3;
      
      let text = `You have ${taskCount} task${taskCount !== 1 ? 's' : ''} scheduled for today and ${pendingCount} pending items. `;
      if (isUrgent) {
        text += `Your "${nextExam.name}" is coming up in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! I highly recommend focusing on ${nextExam.subject} today. Spend some time reviewing core reaction mechanisms or integrals.`;
      } else {
        text += `Your next milestone is "${nextExam.name}" in ${daysLeft} days. I recommend tackling high priority tasks for ${nextExam.subject} to spread out your prep workload.`;
      }
      return text;
    }

    return `You have ${taskCount} task${taskCount !== 1 ? 's' : ''} scheduled today. Ensure you log study sessions to keep your ${streakCount}-day streak active!`;
  }, [plannerInput.subjects, exams, studyPlan, todayAllTasks, nextExam, streakCount]);

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
      // 4 weekly blocks
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

    // 90D view: 3 monthly blocks
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

  return (
    <div className="min-h-screen bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      <Sidebar />
      
      <div className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="pt-20 md:pt-8 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 dark:text-white"
              >
                {getGreeting()}, Aditya!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-550 dark:text-slate-400 text-sm font-semibold"
              >
                {new Date(currentDateStr).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start"
            >
              <kbd className="px-2 py-0.5 border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-950 text-[10px] font-extrabold rounded text-slate-450 dark:text-slate-500">
                Ctrl + K
              </kbd>
              <span>Quick Add Actions</span>
            </motion.div>
          </div>

          {/* Premium Onboarding Card */}
          {showOnboarding && (
            <GlassCard hover={false} className="border border-primary-500/20 bg-gradient-to-tr from-primary-600/5 to-transparent p-6 space-y-5">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-850 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <span>Welcome to StudyAI Planner Pro!</span>
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold mt-1">Let's set up your personalized scheduler in three quick steps:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1: Add Subject */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  hasSubjects 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      hasSubjects ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'
                    }`}>
                      {hasSubjects ? '✓' : '1'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">Add Academic Subjects</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mb-3">Configure subjects you are enrolled in.</p>
                  
                  {!hasSubjects ? (
                    <form onSubmit={handleAddSubjectOnboarding} className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Calculus"
                        value={obSubject}
                        onChange={(e) => setObSubject(e.target.value)}
                        className="flex-1 text-[10px] px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-white"
                      />
                      <button type="submit" className="px-2 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-extrabold cursor-pointer">
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
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      hasExams ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'
                    }`}>
                      {hasExams ? '✓' : '2'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">Add Exams Countdown</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mb-3">Log milestone exam dates for calculation.</p>
                  
                  {!hasExams ? (
                    <button
                      onClick={() => setShowExamForm(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg text-[10px] font-bold cursor-pointer"
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
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      hasPlan ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'
                    }`}>
                      {hasPlan ? '✓' : '3'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">Generate AI Study Plan</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mb-3">Run optimization models to structure sessions.</p>
                  
                  {!hasPlan ? (
                    <Link
                      to="/planner"
                      className="inline-block px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-[10px] font-extrabold cursor-pointer"
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

          {/* Metric Cards (Top Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Today's Tasks */}
            <GlassCard hover={true} className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Today's Tasks</span>
                <h3 className="font-heading font-black text-2xl text-slate-850 dark:text-white leading-tight">
                  {todayCompletedTasksCount} / {todayTotalTasksCount}
                </h3>
                <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-450">
                  {todayTotalTasksCount > 0 
                    ? `${Math.round((todayCompletedTasksCount / todayTotalTasksCount) * 100)}% complete`
                    : 'No tasks scheduled'
                  }
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-primary-500/10 text-primary-500">
                <CheckSquare className="w-5.5 h-5.5" />
              </div>
            </GlassCard>

            {/* Card 2: Study Time Today */}
            <GlassCard hover={true} className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Study Time Today</span>
                <h3 className="font-heading font-black text-2xl text-slate-850 dark:text-white leading-tight">
                  {todayStudyHoursStr} h
                </h3>
                <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-450">Active focus time today</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-505">
                <Clock className="w-5.5 h-5.5" />
              </div>
            </GlassCard>

            {/* Card 3: Current Streak */}
            <GlassCard hover={true} className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Current Streak</span>
                <h3 className="font-heading font-black text-2xl text-slate-850 dark:text-white leading-tight">
                  {streakCount} Day{streakCount !== 1 ? 's' : ''}
                </h3>
                <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-450">
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
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Next Exam</span>
                <h3 className="font-heading font-black text-lg text-slate-850 dark:text-white leading-tight truncate">
                  {nextExam ? nextExam.subject : 'None'}
                </h3>
                <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-450 truncate">
                  {nextExam ? `${nextExam.name} (${getDaysRemaining(nextExam.date)}d)` : 'Ready to customize'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500">
                <CalendarIcon className="w-5.5 h-5.5" />
              </div>
            </GlassCard>

          </div>

          {/* Weekly Progress Bar Block (Separate panel below metrics) */}
          <GlassCard hover={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Weekly Progress</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Your cumulative task and session accomplishment rate over the last 7 days.
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-1 max-w-md w-full sm:justify-end">
              <span className="font-heading font-black text-2xl text-slate-900 dark:text-white shrink-0">
                {overallProgress}%
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850/60">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-primary-600 to-pink-500 rounded-full" 
                />
              </div>
            </div>
          </GlassCard>

          {/* Core Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2 Cols wide): Today's Agenda, Focus Tasks, Insights Chart */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Today's Agenda (scheduled tasks + study sessions) */}
              <GlassCard hover={false} className="p-6 space-y-5">
                <div className="border-b border-slate-200/40 dark:border-slate-850/40 pb-3 flex items-center justify-between">
                  <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-5.5 h-5.5 text-primary-500" />
                    <span>Today's Agenda</span>
                  </h2>
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Current Day view</span>
                </div>

                <div className="space-y-3">
                  {todayAllTasks.length === 0 && todayLoggedSessions.length === 0 ? (
                    <div className="text-center py-6 text-slate-450 dark:text-slate-500 font-semibold">
                      Your schedule is clear today. Generate an AI study plan or add a custom task.
                    </div>
                  ) : (
                    <>
                      {/* Tasks Agenda List */}
                      {todayAllTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-850/40 bg-white/20 dark:bg-slate-900/20">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (!task.isGenerated) {
                                  toggleTaskComplete(task.id);
                                } else {
                                  togglePlanTaskComplete(currentDateStr, task.id);
                                }
                              }}
                              aria-label={`Toggle completion of ${task.title}`}
                              className={`w-5.5 h-5.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-350 dark:border-slate-650'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <div>
                              <p className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-550 dark:text-slate-400">
                                  {task.subject}
                                </span>
                                {'isGenerated' in task && task.isGenerated && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-primary-500/10 rounded text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>AI Revision</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-450 flex items-center gap-0.5">
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
                              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                Logged {session.subject} Study Session
                              </p>
                              <p className="text-[9px] font-semibold text-slate-450">
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

              {/* Focus Tasks (Sorted by priority) */}
              <GlassCard hover={false} className="p-6 space-y-5">
                <div className="border-b border-slate-200/40 dark:border-slate-850/40 pb-3 flex items-center justify-between">
                  <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5.5 h-5.5 text-primary-500" />
                    <span>Focus Tasks for Today</span>
                  </h2>
                  <Link to="/tasks" className="text-xs font-bold text-primary-655 hover:underline flex items-center gap-0.5">
                    <span>View All Tasks</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {todayAllTasks.length === 0 ? (
                    <div className="text-center py-6 text-slate-450 dark:text-slate-500 font-semibold">
                      Your schedule is clear today. Generate an AI study plan or add a custom task.
                    </div>
                  ) : (
                    // Sort high, then medium, then low
                    [...todayAllTasks]
                      .sort((a, b) => {
                        const prioWeight = { High: 3, Medium: 2, Low: 1 };
                        return prioWeight[b.priority] - prioWeight[a.priority];
                      })
                      .map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-850/40 bg-white/10 dark:bg-slate-950/20">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (!task.isGenerated) {
                                  toggleTaskComplete(task.id);
                                } else {
                                  togglePlanTaskComplete(currentDateStr, task.id);
                                }
                              }}
                              aria-label={`Toggle completion of ${task.title}`}
                              className={`w-5.5 h-5.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-350 dark:border-slate-650'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <div>
                              <p className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-450' : 'text-slate-800 dark:text-slate-200'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-250/50 dark:bg-slate-800 rounded text-slate-500">
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
                          
                          <span className="text-[10px] font-bold text-slate-450 flex items-center gap-0.5">
                            <Clock className="w-3.5 h-3.5" /> {task.estimatedHours}h
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </GlassCard>

              {/* Study Insights Chart (7D, 30D, 90D tabs) */}
              <GlassCard hover={false} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-4 gap-4">
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    <span>Study Insights</span>
                  </h3>
                  
                  {/* Tabs */}
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-950 p-1 self-start">
                    {(['7D', '30D', '90D'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setChartTab(tab)}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                          chartTab === tab 
                            ? 'bg-white dark:bg-slate-900 text-primary-655 dark:text-primary-350 shadow'
                            : 'text-slate-500 hover:text-slate-700'
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
                    <div className="h-56 flex flex-col items-center justify-center text-slate-450 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Clock className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold">Log a study session to populate your insights chart!</p>
                    </div>
                  ) : (
                    <div 
                      className="h-56 flex items-end justify-between px-2 pt-6 relative border-b border-slate-200/40 dark:border-slate-850/40"
                      role="img"
                      aria-label="Insights chart showing study hours aggregations"
                    >
                      {chartData.map((item, idx) => {
                        const pctHeight = (item.hours / maxChartHours) * 100;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-7 sm:w-9 relative flex justify-center items-end h-40">
                              <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-900 dark:bg-slate-850 border border-slate-700 text-white dark:text-slate-100 text-[10px] px-2 py-1 rounded font-bold transition-all z-20 pointer-events-none">
                                {item.hours}h
                              </span>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${pctHeight}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.05 }}
                                className="w-full rounded-t-lg bg-gradient-to-t from-primary-600/70 to-primary-500 group-hover:from-primary-500 group-hover:to-pink-500 transition-colors shadow-lg shadow-primary-500/5" 
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">{item.label}</span>
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
              <GlassCard 
                hover={true} 
                className="relative overflow-hidden bg-gradient-to-tr from-primary-600/10 via-pink-500/5 to-transparent border border-primary-500/20 p-6 space-y-4"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/10">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-850 dark:text-white">AI assistant</h3>
                    <p className="text-[10px] uppercase font-bold text-primary-500">Study Strategy Recommendation</p>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-655 dark:text-slate-350 leading-relaxed">
                  "{aiAssistantText}"
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all"
                  >
                    <span>Launch AI Planner</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/assistant"
                    className="text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors flex items-center"
                  >
                    AI Chat
                  </Link>
                </div>
              </GlassCard>

              {/* Interactive Mini Calendar */}
              <GlassCard hover={false} className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-3">
                  <h3 className="font-heading font-black text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
                    <CalendarIcon className="w-4.5 h-4.5 text-primary-500" />
                    <span>Study Calendar</span>
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-pointer">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs font-bold text-slate-800 dark:text-white mb-2">
                  {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <span key={idx} className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{day}</span>
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
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center p-0.5 relative cursor-pointer text-[10px] font-bold border transition-colors ${
                          isSelected 
                            ? 'bg-primary-500 border-primary-500 text-white shadow' 
                            : isToday
                              ? 'bg-primary-100/50 dark:bg-primary-950/20 border-primary-500/30 text-slate-800 dark:text-white font-extrabold'
                              : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
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
                <div className="border-t border-slate-200/40 dark:border-slate-850/40 pt-3 mt-3">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block mb-2">
                    Agenda: {new Date(selectedCalendarDateStr).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                  </span>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedCalendarExams.map(exam => (
                      <div key={exam.id} className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-800 dark:text-rose-200 text-[10px] font-bold">
                        Exam: {exam.name}
                      </div>
                    ))}
                    
                    {selectedCalendarCustomTasks.map(task => (
                      <div key={task.id} className="p-2 rounded border border-slate-200/50 dark:border-slate-805/60 text-[10px] font-semibold text-slate-700 dark:text-slate-350 flex justify-between">
                        <span className={task.completed ? 'line-through text-slate-400' : ''}>{task.title}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-450">{task.subject}</span>
                      </div>
                    ))}

                    {selectedCalendarRevisionTasks.map(task => (
                      <div key={task.id} className="p-2 rounded bg-primary-500/5 border border-primary-500/10 text-[10px] font-semibold text-slate-700 dark:text-slate-350 flex justify-between">
                        <span className={task.completed ? 'line-through text-slate-400' : ''}>{task.title}</span>
                        <span className="text-[8px] uppercase font-bold text-primary-500">Revision</span>
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
                      <span className="text-[10px] font-semibold text-slate-450">Clear schedule</span>
                    )}
                  </div>
                </div>

              </GlassCard>

              {/* Upcoming Exams Countdown */}
              <GlassCard hover={false} className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-3">
                  <h2 className="font-heading font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CalendarIcon className="w-4.5 h-4.5 text-pink-500" />
                    <span>Upcoming Exams</span>
                  </h2>
                  <button 
                    onClick={() => setShowExamForm(!showExamForm)}
                    ref={addExamButtonRef}
                    aria-label="Toggle add exam form"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-950 text-slate-500 hover:text-primary-500 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showExamForm && (
                  <form onSubmit={handleAddExamSubmit} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
                    <div>
                      <label htmlFor="exam-name" className="text-[9px] font-bold text-slate-450 uppercase">Exam Name</label>
                      <input 
                        id="exam-name"
                        ref={examNameInputRef}
                        type="text" 
                        required
                        placeholder="e.g. Chemistry Assessment"
                        value={newExamName}
                        onChange={(e) => setNewExamName(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-805 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="exam-subject" className="text-[9px] font-bold text-slate-450 uppercase">Subject</label>
                        <select
                          id="exam-subject"
                          value={newExamSubject}
                          onChange={(e) => setNewExamSubject(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-805 dark:text-white"
                        >
                          <option>General</option>
                          {plannerInput.subjects.map(s => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="exam-date" className="text-[9px] font-bold text-slate-450 uppercase">Date</label>
                        <input 
                          id="exam-date"
                          type="date" 
                          required
                          value={newExamDate}
                          onChange={(e) => setNewExamDate(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-805 dark:text-white"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-lg text-[10px] font-extrabold cursor-pointer hover:-translate-y-0.5 transition-all"
                    >
                      Add Exam Countdown
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {exams.length === 0 ? (
                    <div className="text-center py-4 text-slate-450 dark:text-slate-500 font-semibold">
                      Add your first exam to receive personalized study planning.
                    </div>
                  ) : (
                    exams.map(exam => {
                      const daysLeft = getDaysRemaining(exam.date);
                      const isUrgent = daysLeft <= 3;
                      
                      return (
                        <div key={exam.id} className="group relative flex items-start justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-850/60 bg-white/30 dark:bg-slate-900/30">
                          <div className="space-y-1">
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded">
                              {exam.subject}
                            </span>
                            <h4 className="font-bold text-xs text-slate-805 dark:text-slate-200 mt-1">{exam.name}</h4>
                            <p className="text-[9px] font-semibold text-slate-450">{exam.date}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            <div className={`px-2 py-1 rounded-lg flex flex-col items-center justify-center font-heading ${
                              isUrgent 
                                ? 'bg-rose-500/10 text-rose-500' 
                                : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
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
  );
};

export default Dashboard;
