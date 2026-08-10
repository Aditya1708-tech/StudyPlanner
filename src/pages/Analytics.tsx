import React, { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { Task } from '../types';
import { 
  BarChart3, 
  Clock, 
  CheckSquare, 
  Flame, 
  BrainCircuit, 
  Sparkles,
  PieChart,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics: React.FC = () => {
  const { 
    studyHistory, 
    completionPercentage, 
    completedTasksCount,
    totalTasks,
    totalStudyHoursThisWeek,
    tasks
  } = useStudy();

  // Find max hours to scale the bar chart heights
  const maxHours = useMemo(() => {
    return Math.max(...studyHistory.map(h => h.hours), 6); // default max threshold at 6h
  }, [studyHistory]);

  // Compute subject breakdown for charts (memoized for performance)
  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    tasks.forEach((t: Task) => {
      if (t.completed) {
        counts[t.subject] = (counts[t.subject] || 0) + Number(t.estimatedHours || 1);
        total += Number(t.estimatedHours || 1);
      }
    });

    // Fallbacks if no tasks completed
    if (total === 0) {
      return [
        { subject: 'Chemistry', percentage: 40, hours: 4, color: 'bg-purple-500' },
        { subject: 'Mathematics', percentage: 30, hours: 3, color: 'bg-cyan-500' },
        { subject: 'Physics', percentage: 20, hours: 2, color: 'bg-blue-500' },
        { subject: 'Biology', percentage: 10, hours: 1, color: 'bg-pink-500' }
      ];
    }

    return Object.keys(counts).map(key => ({
      subject: key,
      hours: counts[key],
      percentage: Math.round((counts[key] / total) * 100),
      color: key === 'Chemistry' ? 'bg-purple-500' :
             key === 'Mathematics' ? 'bg-cyan-500' :
             key === 'Physics' ? 'bg-blue-500' :
             key === 'Biology' ? 'bg-pink-500' : 'bg-amber-500'
    })).sort((a, b) => b.hours - a.hours);
  }, [tasks]);

  // Custom AI Tips
  const aiInsights = [
    {
      title: "Peak Performance Hour",
      text: "Your task completion velocity is highest on Thursday afternoons. Consider scheduling your most complex Calculus worksheets in this block."
    },
    {
      title: "Course Distribution Alert",
      text: "You are spending 45% of your time on Chemistry prep due to the midterm in 3 days. Your Mathematics study hours are down by 15%; we recommend scheduling a 1-hour session on math after your midterm."
    },
    {
      title: "Consistency Booster",
      text: "Completing just one small task tomorrow will extend your study streak to 6 days. Regular daily review is proven to increase recall efficiency."
    }
  ];

  return (
    <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="md:pl-64 min-h-screen transition-all duration-300">
        {/* Switched from <main> to <div> since global landmark wraps routing shell */}
        <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">Analytics & Insights</h1>
            <p className="text-text-secondary dark:text-text-muted text-sm font-semibold">Visualize your study schedules, hourly logs, and AI diagnostic feedback.</p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Hours card */}
            <GlassCard hover={false} className="flex flex-col justify-between h-44">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/40 pb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase">Weekly Hours</span>
                <Clock className="w-4.5 h-4.5 text-brand-primary" />
              </div>
              <div className="my-auto pt-2">
                <h3 className="font-heading font-black text-4xl text-text-primary dark:text-text-primary leading-none">{totalStudyHoursThisWeek} hrs</h3>
                <p className="text-xs font-semibold text-text-secondary dark:text-text-muted mt-2 flex items-center gap-1">
                  <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +12%</span> vs last week
                </p>
              </div>
            </GlassCard>

            {/* Task completion rate card */}
            <GlassCard hover={false} className="flex flex-col justify-between h-44">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/40 pb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase">Task Completion</span>
                <CheckSquare className="w-4.5 h-4.5 text-cyan-500" />
              </div>
              <div className="my-auto pt-2">
                <h3 className="font-heading font-black text-4xl text-text-primary dark:text-text-primary leading-none">{completionPercentage}%</h3>
                <div className="w-full bg-bg-primary dark:bg-surface-primary h-1.5 mt-3 overflow-hidden border border-border-primary/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full" 
                  />
                </div>
                <p className="text-[10px] text-text-secondary font-semibold mt-2">{completedTasksCount} of {totalTasks} planner targets completed</p>
              </div>
            </GlassCard>

            {/* Streak Card */}
            <GlassCard hover={false} className="flex flex-col justify-between h-44">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/40 pb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase">Current Streak</span>
                <Flame className="w-4.5 h-4.5 text-orange-500" />
              </div>
              <div className="my-auto pt-2">
                <h3 className="font-heading font-black text-4xl text-text-primary dark:text-text-primary leading-none">5 Days</h3>
                <p className="text-xs font-semibold text-text-secondary dark:text-text-muted mt-2">
                  Top 8% of active learners this week! 🔥
                </p>
              </div>
            </GlassCard>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Weekly Hours Bar Chart */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/40 pb-4">
                <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-primary" />
                  <span>Weekly Study Log</span>
                </h3>
                <span className="text-xs font-semibold text-text-secondary">Hours per Day</span>
              </div>

              {/* Chart Plot Area with accessible landmarks */}
              <div 
                className="h-56 flex items-end justify-between px-2 pt-6 relative border-b border-border-primary/40 dark:border-border-primary/40"
                role="img"
                aria-label="Bar chart showing the study hours logged each day, ranging from Monday to Sunday"
              >
                {studyHistory.map((item, idx) => {
                  const pctHeight = (item.hours / maxHours) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      {/* Bar and Tooltip */}
                      <div className="w-8 sm:w-10 relative flex justify-center items-end h-40">
                        {/* Tooltip */}
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white dark:text-slate-100 text-[10px] px-2 py-1 rounded font-bold transition-all z-20 pointer-events-none">
                          {item.hours}h
                        </span>
                        {/* Bar fill */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pctHeight}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary-600/70 to-primary-500 group-hover:from-primary-500 group-hover:to-pink-500 transition-colors shadow-lg " 
                        />
                      </div>
                      
                      {/* Label */}
                      <span className="text-[10px] font-bold text-text-secondary dark:text-text-secondary">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Subject Distribution Progress Bars */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/40 pb-4">
                <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-pink-500" />
                  <span>Subject Time Distribution</span>
                </h3>
                <span className="text-xs font-semibold text-text-secondary">Based on completed tasks</span>
              </div>

              <div 
                className="space-y-4 py-2"
                role="table"
                aria-label="Distribution of study hours by subject course"
              >
                {subjectData.map((item, idx) => (
                  <div key={idx} className="space-y-2" role="row" aria-label={`${item.subject} time allocation`}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-750 dark:text-slate-255 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        {item.subject}
                      </span>
                      <span className="text-text-secondary">{item.hours} hrs ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-bg-primary dark:bg-surface-primary h-2 rounded-full overflow-hidden border border-border-primary/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

          {/* AI Insights & Performance Diagnostic Reports */}
          <GlassCard hover={false} className="space-y-6 border border-primary-500/20 bg-gradient-to-tr from-primary-600/5 to-transparent">
            <div className="flex items-center gap-2 border-b border-border-primary/20 dark:border-border-primary/40 pb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg ">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary">AI Diagnostic Insights</h3>
                <p className="text-[9px] uppercase font-bold text-brand-primary">Automated performance audits</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-border-primary/20 dark:border-border-primary/60 bg-surface-primary/20 dark:bg-surface-primary/20 space-y-2 hover:border-primary-500/20 hover:bg-surface-primary/40 dark:hover:bg-slate-900/35 transition-all"
                >
                  <h4 className="font-extrabold text-sm text-text-primary dark:text-slate-150 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                    {insight.title}
                  </h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted font-semibold leading-relaxed">
                    "{insight.text}"
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
