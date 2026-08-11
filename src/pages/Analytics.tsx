import React, { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { Task, ExtractedSyllabus } from '../types';
import { 
  BarChart3, 
  Clock, 
  CheckSquare, 
  Flame, 
  BrainCircuit, 
  Sparkles,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics: React.FC = () => {
  const { 
    studyHistory, 
    completionPercentage, 
    completedTasksCount,
    totalTasks,
    totalStudyHoursThisWeek,
    tasks,
    studyPlan,
    studyPlanMetadata
  } = useStudy();

  // 1. Calculate Syllabus Metrics
  const totalSyllabusTopics = useMemo(() => {
    return studyPlan.reduce((sum, d) => sum + d.tasks.length, 0);
  }, [studyPlan]);

  const completedSyllabusTopics = useMemo(() => {
    return studyPlan.reduce((sum, d) => sum + d.tasks.filter(t => t.completed).length, 0);
  }, [studyPlan]);

  const remainingSyllabusTopics = totalSyllabusTopics - completedSyllabusTopics;

  const totalSyllabusUnits = useMemo(() => {
    const syllabusesParsed = studyPlanMetadata?.syllabusesParsed || {};
    return Object.values(syllabusesParsed).reduce((sum, syl: any) => sum + (syl.units?.length || 0), 0);
  }, [studyPlanMetadata]);

  const completedSyllabusUnits = useMemo(() => {
    const syllabusesParsed = studyPlanMetadata?.syllabusesParsed || {};
    let completedCount = 0;
    
    Object.entries(syllabusesParsed).forEach(([subject, syllabus]: any) => {
      syllabus.units?.forEach((unit: any) => {
        const unitTopicTitles = unit.chapters.flatMap((ch: any) => ch.topics);
        const unitTasks = studyPlan.reduce((acc, d) => {
          const matched = d.tasks.filter(t => t.subject === subject && unitTopicTitles.some(ut => ut.toLowerCase() === t.topic?.toLowerCase() || t.title.toLowerCase().includes(ut.toLowerCase())));
          return [...acc, ...matched];
        }, [] as Task[]);
        if (unitTasks.length > 0 && unitTasks.every(t => t.completed)) {
          completedCount++;
        }
      });
    });
    return completedCount;
  }, [studyPlanMetadata, studyPlan]);

  const remainingSyllabusUnits = Math.max(0, totalSyllabusUnits - completedSyllabusUnits);

  const remainingHours = useMemo(() => {
    return studyPlan.reduce((sum, d) => {
      const pending = d.tasks.filter(t => !t.completed);
      return sum + pending.reduce((s, t) => s + t.estimatedHours, 0);
    }, 0);
  }, [studyPlan]);

  // Consistency score calculation (percent of active study days in current plan)
  const consistencyIndex = useMemo(() => {
    if (studyPlan.length === 0) return 0;
    const completedDays = studyPlan.filter(d => d.tasks.some(t => t.completed)).length;
    return Math.round((completedDays / Math.min(studyPlan.length, 7)) * 100);
  }, [studyPlan]);

  // 2. SVG Line Chart Forecast Data (Planned vs Actual progress)
  const forecastChartData = useMemo(() => {
    if (studyPlan.length === 0) return { plannedPath: '', actualPath: '', points: [], width: 500, height: 160 };
    const width = 500;
    const height = 160;
    const padding = 15;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const daysCount = Math.min(studyPlan.length, 10); // plot first 10 schedule checkpoints
    const stepX = chartW / (daysCount - 1 || 1);

    let accumCompleted = 0;
    const totalT = studyPlan.reduce((acc, d) => acc + d.tasks.length, 0) || 1;

    let plannedPath = `M ${padding} ${height - padding}`;
    let actualPath = `M ${padding} ${height - padding}`;
    const points: { x: number; y: number; actualY: number; plannedY: number; label: string }[] = [];

    for (let i = 0; i < daysCount; i++) {
      const day = studyPlan[i];
      const x = padding + i * stepX;

      const plannedProgressPct = i / (daysCount - 1 || 1);
      const plannedY = height - padding - plannedProgressPct * chartH;
      plannedPath += ` L ${x} ${plannedY}`;

      const completedOnDay = day.tasks.filter(t => t.completed).length;
      accumCompleted += completedOnDay;
      const actualProgressPct = Math.min(1.0, accumCompleted / totalT);
      const actualY = height - padding - actualProgressPct * chartH;
      actualPath += ` L ${x} ${actualY}`;

      points.push({
        x,
        y: actualY,
        actualY: Math.round(actualProgressPct * 100),
        plannedY: Math.round(plannedProgressPct * 100),
        label: day.date.substring(5) // MM-DD
      });
    }

    return { plannedPath, actualPath, points, width, height };
  }, [studyPlan]);

  // 3. Find max hours to scale the bar chart heights
  const maxHours = useMemo(() => {
    return Math.max(...studyHistory.map(h => h.hours), 6); 
  }, [studyHistory]);

  // 4. Compute subject breakdown for charts
  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    tasks.forEach((t: Task) => {
      if (t.completed) {
        counts[t.subject] = (counts[t.subject] || 0) + Number(t.estimatedHours || 1);
        total += Number(t.estimatedHours || 1);
      }
    });

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
      color: key.includes('Chem') ? 'bg-purple-500' :
             key.includes('Math') || key.includes('Calc') ? 'bg-cyan-500' :
             key.includes('Phys') ? 'bg-blue-500' :
             key.includes('Bio') ? 'bg-pink-500' : 'bg-amber-500'
    })).sort((a, b) => b.hours - a.hours);
  }, [tasks]);

  const aiInsights = [
    {
      title: "Milestone Forecast",
      text: studyPlanMetadata?.estimatedCompletionDate 
        ? `Your current syllabus coverage trajectory estimates total completion by ${studyPlanMetadata.estimatedCompletionDate}. This leaves comfortable buffer days prior to exam milestones.`
        : "Complete the setup parameter onboarding to forecast your exact curriculum completion date."
    },
    {
      title: "Peak Productivity Window",
      text: `Consistency Index is currently at ${consistencyIndex}%. Logging a short review block on off-days keeps your learning streak active and boosts active retention rates.`
    },
    {
      title: "Workload Estimation Audit",
      text: remainingHours > 0 
        ? `Remaining workload: ${remainingHours.toFixed(1)} hours. The study planner lists ${remainingSyllabusTopics} topics across ${remainingSyllabusUnits} units still to cover.`
        : "All parsed syllabus topics have been completed! Start taking timed mock tests to check recall."
    }
  ];

  return (
    <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">
              Analytics & Insights
            </h1>
            <p className="text-text-secondary dark:text-text-muted text-sm font-semibold">
              Track syllabus completion rates, planned vs actual progress, and workload forecasts.
            </p>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Hours card */}
            <GlassCard hover={false} className="flex flex-col justify-between h-44 text-left">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/45 pb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase">Weekly Hours</span>
                <Clock className="w-4.5 h-4.5 text-brand-primary" />
              </div>
              <div className="my-auto pt-2">
                <h3 className="font-heading font-black text-4xl text-text-primary dark:text-slate-100 leading-none">{totalStudyHoursThisWeek} hrs</h3>
                <p className="text-xs font-semibold text-text-secondary dark:text-text-muted mt-2 flex items-center gap-1">
                  <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +12%</span> vs last week
                </p>
              </div>
            </GlassCard>

            {/* Task completion rate card */}
            <GlassCard hover={false} className="flex flex-col justify-between h-44 text-left">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/45 pb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase">Syllabus Covered</span>
                <CheckSquare className="w-4.5 h-4.5 text-cyan-500" />
              </div>
              <div className="my-auto pt-2">
                <h3 className="font-heading font-black text-4xl text-text-primary dark:text-slate-100 leading-none">{completionPercentage}%</h3>
                <div className="w-full bg-bg-primary dark:bg-slate-800 h-1.5 mt-3 overflow-hidden border border-border-primary/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full" 
                  />
                </div>
                <p className="text-[10px] text-text-secondary font-semibold mt-2">
                  {completedSyllabusTopics} of {totalSyllabusTopics || totalTasks} syllabus topics covered
                </p>
              </div>
            </GlassCard>

            {/* Consistency index card */}
            <GlassCard hover={false} className="flex flex-col justify-between h-44 text-left">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/45 pb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase">Consistency Index</span>
                <Flame className="w-4.5 h-4.5 text-orange-500" />
              </div>
              <div className="my-auto pt-2">
                <h3 className="font-heading font-black text-4xl text-text-primary dark:text-slate-100 leading-none">{consistencyIndex}%</h3>
                <p className="text-xs font-semibold text-text-secondary dark:text-text-muted mt-2">
                  {consistencyIndex >= 70 ? 'Top 10% active learners! 🔥' : 'Log daily chapters to increase index'}
                </p>
              </div>
            </GlassCard>

          </div>

          {/* Syllabus-Aware Progress Details */}
          <GlassCard hover={false} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border border-border-primary">
            <div className="space-y-1.5 md:border-r border-border-primary/40 dark:border-slate-800 pr-4">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-primary" />
                <span>Units Complete</span>
              </span>
              <h4 className="font-heading font-black text-2xl text-text-primary dark:text-slate-100">
                {completedSyllabusUnits} <span className="text-sm text-text-secondary">/ {totalSyllabusUnits} Units</span>
              </h4>
              <p className="text-[10px] text-text-secondary">{remainingSyllabusUnits} remaining units to study</p>
            </div>

            <div className="space-y-1.5 md:border-r border-border-primary/40 dark:border-slate-800 pr-4">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-pink-500" />
                <span>Topics Complete</span>
              </span>
              <h4 className="font-heading font-black text-2xl text-text-primary dark:text-slate-100">
                {completedSyllabusTopics} <span className="text-sm text-text-secondary">/ {totalSyllabusTopics} Topics</span>
              </h4>
              <p className="text-[10px] text-text-secondary">{remainingSyllabusTopics} remaining topics to cover</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>Remaining Workload</span>
              </span>
              <h4 className="font-heading font-black text-2xl text-text-primary dark:text-slate-100">
                {remainingHours.toFixed(1)} <span className="text-sm text-text-secondary">Hours</span>
              </h4>
              <p className="text-[10px] text-text-secondary">Based on topic workload estimations</p>
            </div>
          </GlassCard>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Weekly Hours Bar Chart */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/45 pb-4">
                <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-primary" />
                  <span>Weekly Study Log</span>
                </h3>
                <span className="text-xs font-semibold text-text-secondary">Hours per Day</span>
              </div>

              <div 
                className="h-56 flex items-end justify-between px-2 pt-6 relative border-b border-border-primary/40 dark:border-border-primary/45"
                role="img"
                aria-label="Bar chart showing the study hours logged each day, ranging from Monday to Sunday"
              >
                {studyHistory.map((item, idx) => {
                  const pctHeight = (item.hours / maxHours) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-8 sm:w-10 relative flex justify-center items-end h-40">
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white dark:text-slate-100 text-[10px] px-2 py-1 rounded font-bold transition-all z-20 pointer-events-none">
                          {item.hours}h
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pctHeight}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary-600/70 to-primary-500 group-hover:from-primary-500 group-hover:to-pink-500 transition-colors shadow-lg " 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* SVG Forecast Engine Line Chart (Planned vs Actual progress) */}
            <GlassCard hover={false} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/45 pb-4">
                <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  <span>Forecast Engine Roadmap</span>
                </h3>
                <span className="text-xs font-semibold text-text-secondary">Planned vs Actual Progress</span>
              </div>

              <div className="h-56 relative flex flex-col justify-between pt-4">
                {studyPlan.length === 0 ? (
                  <p className="text-xs text-text-secondary italic my-auto">Timeline data unavailable. Configure study plan to check forecast.</p>
                ) : (
                  <>
                    <svg 
                      width="100%" 
                      height="150" 
                      viewBox={`0 0 ${forecastChartData.width} ${forecastChartData.height}`} 
                      className="overflow-visible"
                    >
                      {/* Grid Lines */}
                      <line x1="15" y1="15" x2={forecastChartData.width - 15} y2="15" stroke="currentColor" className="text-border-primary opacity-20" strokeDasharray="3" />
                      <line x1="15" y1="80" x2={forecastChartData.width - 15} y2="80" stroke="currentColor" className="text-border-primary opacity-20" strokeDasharray="3" />
                      <line x1="15" y1="145" x2={forecastChartData.width - 15} y2="145" stroke="currentColor" className="text-border-primary opacity-20" strokeDasharray="3" />

                      {/* Planned Line Path */}
                      <path 
                        d={forecastChartData.plannedPath} 
                        fill="none" 
                        stroke="#94a3b8" 
                        strokeWidth="2" 
                        strokeDasharray="4"
                        className="opacity-60" 
                      />

                      {/* Actual Line Path */}
                      <path 
                        d={forecastChartData.actualPath} 
                        fill="none" 
                        stroke="url(#gradActual)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="gradActual" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6D4AFF" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>

                      {/* Interactive Circles / Dots */}
                      {forecastChartData.points.map((pt, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="5" 
                            fill="#ec4899" 
                            stroke="#ffffff" 
                            strokeWidth="1.5" 
                          />
                          {/* Tooltip trigger hover area */}
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="15" 
                            fill="transparent" 
                          />
                        </g>
                      ))}
                    </svg>

                    <div className="flex justify-between px-3 text-[9px] font-bold text-text-secondary">
                      {forecastChartData.points.map((pt, idx) => (
                        <span key={idx}>{pt.label}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Chart Legend */}
              <div className="flex justify-center items-center gap-6 text-[10px] font-bold text-text-secondary pb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
                  <span>Planned Curve</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-gradient-to-r from-brand-primary to-pink-500 rounded" />
                  <span>Actual Progress</span>
                </span>
              </div>
            </GlassCard>

          </div>

          {/* Subject Distribution and AI Diagnostics combined row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Subject Distribution */}
            <GlassCard hover={false} className="lg:col-span-1 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-border-primary/20 dark:border-border-primary/45 pb-4">
                <h3 className="font-heading font-black text-base text-text-primary dark:text-text-primary flex items-center gap-2">
                  <PieChart className="w-4.5 h-4.5 text-brand-primary" />
                  <span>Subject Time share</span>
                </h3>
              </div>

              <div className="space-y-4 py-2" role="table" aria-label="Subject distribution share">
                {subjectData.map((item, idx) => (
                  <div key={idx} className="space-y-2" role="row" aria-label={`${item.subject} time allocation`}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-750 dark:text-slate-255 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        {item.subject}
                      </span>
                      <span className="text-text-secondary">{item.hours} hrs ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-bg-primary dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-border-primary/10">
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

            {/* AI Insights & Performance Diagnostic Reports */}
            <GlassCard hover={false} className="lg:col-span-2 space-y-6 border border-primary-500/20 bg-gradient-to-tr from-primary-600/5 to-transparent text-left">
              <div className="flex items-center gap-2 border-b border-border-primary/20 dark:border-border-primary/45 pb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center shadow-lg ">
                  <BrainCircuit className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-text-primary dark:text-text-primary">AI Diagnostic Insights</h3>
                  <p className="text-[8px] uppercase font-bold text-brand-primary">Automated performance reports</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl border border-border-primary/20 dark:border-slate-805 bg-surface-primary/20 space-y-2 hover:border-primary-500/20 transition-all"
                  >
                    <h4 className="font-extrabold text-xs text-text-primary dark:text-slate-150 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-primary" />
                      {insight.title}
                    </h4>
                    <p className="text-[11px] text-text-secondary dark:text-text-muted font-semibold leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
