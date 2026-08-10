import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import AnimatedPage from '../components/layout/AnimatedPage';
import Spotlight from '../components/ui/Spotlight';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarPage: React.FC = () => {
  const { 
    tasks, 
    exams, 
    studyPlan, 
    studySessions, 
    currentDateStr,
    toggleTaskComplete,
    togglePlanTaskComplete
  } = useStudy();

  const [currentMonth, setCurrentMonth] = useState(() => new Date(currentDateStr));
  const [selectedDateStr, setSelectedDateStr] = useState(currentDateStr);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Helper to format date string
  const formatDateKey = (dayNum: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const day = String(dayNum).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Derived properties for a day
  const getDayData = (dateKey: string) => {
    const hasExam = exams.some(e => e.date === dateKey);
    const hasSession = studySessions.some(s => s.date === dateKey);
    const hasRevision = studyPlan.some(d => d.date === dateKey);
    const dayTasks = [
      ...tasks.filter(t => t.dueDate === dateKey),
      ...(studyPlan.find(d => d.date === dateKey)?.tasks || [])
    ];

    return {
      hasExam,
      hasSession,
      hasRevision,
      hasTasks: dayTasks.length > 0,
      dayTasks
    };
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentMonth);
  const blankDays = Array(firstDayIndex).fill(null);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Selected Day items
  const selectedDayExams = exams.filter(e => e.date === selectedDateStr);
  const selectedDaySessions = studySessions.filter(s => s.date === selectedDateStr);
  const selectedDayCustomTasks = tasks.filter(t => t.dueDate === selectedDateStr);
  const selectedDayRevisionTasks = studyPlan.find(d => d.date === selectedDateStr)?.tasks || [];

  const monthYearLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300 relative">
        <Spotlight />
        <Sidebar />
        
        <div className="md:pl-64 min-h-screen transition-all duration-300">
          <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">Study Calendar</h1>
            <p className="text-text-secondary dark:text-text-muted text-sm font-semibold">Track exams, coordinate revision blocks, and log study sessions interactively.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calendar Main Grid (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard hover={false} className="p-6">
                
                {/* Calendar Month Header */}
                <div className="flex items-center justify-between border-b border-border-primary/40 dark:border-border-primary/40 pb-4 mb-6">
                  <h3 className="font-heading font-black text-xl text-text-primary dark:text-text-primary flex items-center gap-2">
                    <CalendarIcon className="w-5.5 h-5.5 text-brand-primary" />
                    <span>{monthYearLabel}</span>
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevMonth}
                      aria-label="Previous Month"
                      className="p-2 rounded-xl bg-bg-primary hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-950/30 text-text-secondary hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      aria-label="Next Month"
                      className="p-2 rounded-xl bg-bg-primary hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-950/30 text-text-secondary hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekdays Label */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                  {weekdays.map(day => (
                    <span key={day} className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{day}</span>
                  ))}
                </div>

                {/* Grid Cells */}
                <div className="grid grid-cols-7 gap-2">
                  {blankDays.map((_, idx) => (
                    <div key={`blank-${idx}`} className="aspect-square bg-transparent" />
                  ))}

                  {monthDays.map(day => {
                    const dateKey = formatDateKey(day);
                    const dayData = getDayData(dateKey);
                    const isSelected = selectedDateStr === dateKey;
                    const isToday = currentDateStr === dateKey;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDateStr(dateKey)}
                        className={`aspect-square rounded-2xl border flex flex-col justify-between p-2.5 transition-all text-left group cursor-pointer focus:ring-2 focus:ring-primary-500 ${
                          isSelected 
                            ? 'bg-brand-primary border-primary-500 text-white shadow-lg ' 
                            : isToday
                              ? 'bg-primary-100/40 dark:bg-primary-950/20 border-primary-500/30 text-text-primary dark:text-text-primary'
                              : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/50 dark:border-border-primary/40 hover:bg-surface-primary dark:hover:bg-slate-850/60 text-text-primary dark:text-slate-200'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : isToday ? 'text-brand-primary dark:text-brand-primary font-extrabold' : 'text-text-secondary'}`}>
                          {day}
                        </span>

                        {/* Event indicator dots */}
                        <div className="flex gap-1 mt-auto">
                          {dayData.hasExam && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-surface-primary' : 'bg-rose-500 animate-pulse'}`} title="Exam Scheduled" />
                          )}
                          {dayData.hasSession && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-surface-primary' : 'bg-cyan-500'}`} title="Study Session Logged" />
                          )}
                          {dayData.hasRevision && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-surface-primary' : 'bg-purple-500'}`} title="Revision Tasks" />
                          )}
                          {dayData.hasTasks && !dayData.hasRevision && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-surface-primary' : 'bg-blue-400'}`} title="Custom Tasks Due" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap gap-4 border-t border-border-primary/40 dark:border-border-primary/40 pt-4 mt-6 text-[10px] font-bold text-text-muted dark:text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Exams</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>Study Sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>AI Revision Days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Custom Tasks</span>
                  </div>
                </div>

              </GlassCard>
            </div>

            {/* Selected Date Details Panel (1 Col) */}
            <div className="space-y-6">
              <GlassCard hover={false} className="h-full flex flex-col justify-between p-6">
                <div>
                  <div className="border-b border-border-primary/40 dark:border-border-primary/40 pb-4 mb-4">
                    <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary">Agenda details</h3>
                    <p className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">
                      {new Date(selectedDateStr).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDateStr}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-5"
                    >
                      {/* 1. Exams Scheduled */}
                      {selectedDayExams.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Exams ({selectedDayExams.length})</h4>
                          <div className="space-y-2">
                            {selectedDayExams.map(exam => (
                              <div key={exam.id} className="p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 space-y-1">
                                <div className="font-extrabold text-sm flex items-center justify-between">
                                  <span>{exam.name}</span>
                                </div>
                                <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
                                  <span>{exam.subject}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {exam.location}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Tasks Grid (Custom + AI Plan) */}
                      {(selectedDayCustomTasks.length > 0 || selectedDayRevisionTasks.length > 0) ? (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase text-brand-primary tracking-wider">Tasks</h4>
                          <div className="space-y-2">
                            {/* Custom tasks */}
                            {selectedDayCustomTasks.map(task => (
                              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-border-primary/50 dark:border-border-primary/40 bg-surface-primary/30 dark:bg-surface-primary/30">
                                <div className="flex items-center gap-2.5">
                                  <button
                                    onClick={() => toggleTaskComplete(task.id)}
                                    aria-label={`Toggle completion of ${task.title}`}
                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                      task.completed ? 'bg-brand-primary border-primary-500 text-white' : 'border-slate-350 dark:border-slate-650'
                                    }`}
                                  >
                                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                  <div>
                                    <p className={`text-xs font-semibold ${task.completed ? 'line-through text-text-muted' : 'text-text-primary dark:text-slate-200'}`}>{task.title}</p>
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-bg-primary/60 dark:bg-slate-800 rounded text-text-secondary mt-1 inline-block">{task.subject}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Revision plan tasks */}
                            {selectedDayRevisionTasks.map(task => (
                              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-primary-500/10 bg-brand-primary/5">
                                <div className="flex items-center gap-2.5">
                                  <button
                                    onClick={() => togglePlanTaskComplete(selectedDateStr, task.id)}
                                    aria-label={`Toggle completion of ${task.title}`}
                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                      task.completed ? 'bg-brand-primary border-primary-500 text-white' : 'border-primary-500/30'
                                    }`}
                                  >
                                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                  <div>
                                    <p className={`text-xs font-semibold ${task.completed ? 'line-through text-text-muted' : 'text-text-primary dark:text-slate-200'}`}>{task.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-brand-primary/10 rounded text-brand-primary dark:text-brand-primary">Revision</span>
                                      <span className="text-[9px] font-semibold text-text-muted flex items-center gap-0.5"><Clock className="w-3 h-3" /> {task.estimatedHours}h</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* 3. Study Sessions Logged */}
                      {selectedDaySessions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase text-cyan-500 tracking-wider">Logged Study Time</h4>
                          <div className="space-y-2">
                            {selectedDaySessions.map(session => (
                              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5">
                                <div className="flex items-center gap-2.5">
                                  <Clock className="w-4 h-4 text-cyan-500" />
                                  <div>
                                    <p className="text-xs font-bold text-text-primary dark:text-slate-200">{session.subject} Session</p>
                                    <p className="text-[9px] font-semibold text-text-muted">Logged at {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">{(session.durationMinutes / 60).toFixed(1)}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty state selected date */}
                      {selectedDayExams.length === 0 && 
                       selectedDayCustomTasks.length === 0 && 
                       selectedDayRevisionTasks.length === 0 && 
                       selectedDaySessions.length === 0 && (
                        <div className="text-center py-12 text-text-muted dark:text-text-secondary">
                          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold">Your agenda is completely clear on this date.</p>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
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

export default CalendarPage;
