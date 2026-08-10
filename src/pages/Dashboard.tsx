import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { Exam } from '../types';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ArrowRight,
  Plus
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    tasks, 
    toggleTaskComplete, 
    exams, 
    addExam,
    deleteExam,
    completionPercentage, 
    completedTasksCount,
    totalTasks,
    totalStudyHoursThisWeek
  } = useStudy();

  const [showExamForm, setShowExamForm] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('Chemistry');
  const [newExamDate, setNewExamDate] = useState('');

  const examNameInputRef = useRef<HTMLInputElement>(null);
  const addExamButtonRef = useRef<HTMLButtonElement>(null);

  // Manage focus when opening the exam form modal
  useEffect(() => {
    if (showExamForm) {
      setTimeout(() => {
        examNameInputRef.current?.focus();
      }, 50);
    }
  }, [showExamForm]);

  // Get dynamic greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get today's date string
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Filter today's tasks
  const todayTasks = tasks.filter(t => t.dueDate === todayStr || !t.completed).slice(0, 3);

  // Calculate days remaining for an exam
  const getDaysRemaining = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    // Reset hours
    examDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName || !newExamDate) return;
    
    addExam({
      name: newExamName,
      subject: newExamSubject,
      date: newExamDate,
      location: 'Main Hall'
    });

    setNewExamName('');
    setNewExamDate('');
    setShowExamForm(false);

    // Focus restoration back to the trigger button
    setTimeout(() => {
      addExamButtonRef.current?.focus();
    }, 50);
  };

  const stats = [
    { 
      name: 'Task Completion', 
      value: `${completionPercentage}%`, 
      sub: `${completedTasksCount}/${totalTasks} tasks complete`, 
      icon: CheckCircle2, 
      color: 'text-emerald-500 bg-emerald-500/10' 
    },
    { 
      name: 'Hours Studied', 
      value: `${totalStudyHoursThisWeek}h`, 
      sub: 'Logged this week', 
      icon: Clock, 
      color: 'text-primary-500 bg-primary-500/10' 
    },
    { 
      name: 'Active Streak', 
      value: '5 Days', 
      sub: 'Keep it going! 🔥', 
      icon: Flame, 
      color: 'text-orange-500 bg-orange-500/10' 
    }
  ];

  return (
    <div className="min-h-screen bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      
      <div className="md:pl-64 min-h-screen transition-all duration-300">
        {/* Switched from <main> to <div> since global landmark wraps routing shell */}
        <div className="pt-20 md:pt-8 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
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
                Welcome to your study control center. You have {tasks.filter(t => !t.completed).length} pending tasks today.
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel border border-primary-500/10 text-xs font-semibold text-primary-655 dark:text-primary-350 self-start"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Next Exam: {exams.length > 0 ? `${exams[0].subject} in ${getDaysRemaining(exams[0].date)} days` : 'No upcoming exams'}</span>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={idx} hover={true} delay={idx * 0.05} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{stat.name}</span>
                    <h3 className="font-heading font-black text-3xl text-slate-850 dark:text-white leading-tight">{stat.value}</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.sub}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.color} shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col (2 Columns wide): Tasks & Recommendations */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Today's Tasks */}
              <GlassCard hover={false} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
                  <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    <span>Focus Tasks for Today</span>
                  </h2>
                  <Link to="/tasks" className="text-xs font-bold text-primary-655 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <span>View all tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {todayTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-550 font-medium">
                      All caught up! Add tasks in the <Link to="/tasks" className="text-primary-500 underline font-bold">Planner</Link> to schedule your study time.
                    </div>
                  ) : (
                    todayTasks.map((task) => (
                      <motion.div 
                        key={task.id}
                        layoutId={`task-${task.id}`}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          task.completed 
                            ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/20 opacity-60' 
                            : 'bg-white/40 dark:bg-slate-900/40 border-slate-250/20 dark:border-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            aria-label={`Toggle completion of ${task.title}`}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer min-h-[32px] min-w-[32px] focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                              task.completed 
                                ? 'bg-primary-500 border-primary-500 text-white' 
                                : 'border-slate-350 dark:border-slate-650 hover:border-primary-500 bg-transparent'
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                          </button>
                          <div>
                            <p className={`font-semibold text-sm ${task.completed ? 'line-through text-slate-500 dark:text-slate-500 font-medium' : 'text-slate-800 dark:text-slate-200'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2.5 mt-1">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {task.subject}
                              </span>
                              <span className={`text-[10px] font-bold ${
                                task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                              }`}>
                                {task.priority} Priority
                              </span>
                              <span className="text-[10px] font-semibold text-slate-450 flex items-center gap-0.5">
                                <Clock className="w-3.5 h-3.5" /> {task.estimatedHours}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* AI Recommendation */}
              <GlassCard 
                hover={true} 
                className="relative overflow-hidden bg-gradient-to-tr from-primary-600/10 via-pink-500/5 to-transparent border border-primary-500/20 p-8 space-y-4"
              >
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/10">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-850 dark:text-white">AI Assistant Insight</h3>
                    <p className="text-[10px] uppercase font-bold text-primary-500">Personalized Strategy</p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-655 dark:text-slate-350 leading-relaxed">
                  "You have a <strong className="text-slate-800 dark:text-white font-bold">Chemistry Midterm Exam</strong> scheduled in 3 days. Statistics show that reviewing Organic Chemistry synthetics 48 hours beforehand boosts recall by 25%. We recommend launching a focused study planner config."
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all min-h-[44px]"
                  >
                    <span>Launch AI Planner</span>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </Link>
                  <Link
                    to="/assistant"
                    className="text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors min-h-[44px] flex items-center"
                  >
                    AI Chat Assistant
                  </Link>
                </div>
              </GlassCard>

            </div>

            {/* Right Col: Upcoming Exams & Countdown */}
            <div className="space-y-8">
              
              {/* Exams Countdowns */}
              <GlassCard hover={false} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
                  <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    <span>Upcoming Exams</span>
                  </h2>
                  <button 
                    onClick={() => setShowExamForm(!showExamForm)}
                    ref={addExamButtonRef}
                    aria-label="Toggle add exam form"
                    className="p-2.5 rounded-lg bg-slate-100 hover:bg-primary-50 dark:bg-slate-800/60 dark:hover:bg-primary-950 text-slate-500 hover:text-primary-500 transition-all active:scale-95 cursor-pointer min-h-[40px] focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showExamForm && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleAddExamSubmit} 
                    className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div>
                      <label htmlFor="exam-name" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Exam Name</label>
                      <input 
                        id="exam-name"
                        ref={examNameInputRef}
                        type="text" 
                        required
                        placeholder="e.g. Calculus Midterm"
                        value={newExamName}
                        onChange={(e) => setNewExamName(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-white min-h-[40px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="exam-subject" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Subject</label>
                        <select
                          id="exam-subject"
                          value={newExamSubject}
                          onChange={(e) => setNewExamSubject(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-white min-h-[40px]"
                        >
                          <option>Chemistry</option>
                          <option>Mathematics</option>
                          <option>Biology</option>
                          <option>Physics</option>
                          <option>Literature</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="exam-date" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Date</label>
                        <input 
                          id="exam-date"
                          type="date" 
                          required
                          value={newExamDate}
                          onChange={(e) => setNewExamDate(e.target.value)}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-white min-h-[40px]"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-lg text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer min-h-[40px] focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      Add Exam Countdown
                    </button>
                  </motion.form>
                )}

                <div className="space-y-4">
                  {exams.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-500 font-semibold">
                      No exams logged. Nice job!
                    </div>
                  ) : (
                    exams.map((exam: Exam) => {
                      const daysLeft = getDaysRemaining(exam.date);
                      const isUrgent = daysLeft <= 3;
                      
                      return (
                        <div key={exam.id} className="group relative flex items-start justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-850/60 bg-white/30 dark:bg-slate-900/30">
                          <div className="space-y-1.5">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              exam.subject === 'Chemistry' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
                              exam.subject === 'Mathematics' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300' :
                              exam.subject === 'Physics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-955/50 dark:text-amber-300'
                            }`}>
                              {exam.subject}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{exam.name}</h4>
                            <p className="text-[10px] font-semibold text-slate-500">{exam.location} • {exam.date}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            <div className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center font-heading ${
                              isUrgent 
                                ? 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 animate-pulse' 
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-655 dark:text-slate-400'
                            }`}>
                              <span className="text-sm font-black leading-none">{daysLeft > 0 ? daysLeft : 0}</span>
                              <span className="text-[8px] font-black uppercase leading-none mt-0.5">days</span>
                            </div>
                            <button
                              onClick={() => deleteExam(exam.id)}
                              aria-label={`Delete exam countdown for ${exam.name}`}
                              className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 hover:underline font-bold transition-all cursor-pointer min-h-[30px]"
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
