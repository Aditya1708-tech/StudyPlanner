import React, { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import AnimatedPage from '../components/layout/AnimatedPage';
import { fetchStudyPlanFromGemini, generateLocalFallbackPlan } from '../services/gemini';
import { PlannerInput, Task, ExtractedSyllabus } from '../types';
import { ENV } from '../utils/env';
import { logger } from '../utils/logger';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Check,
  Loader2,
  RefreshCw,
  Layers,
  Settings,
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingStages = [
  { title: "Analyzing syllabus", desc: "Parsing subjects, exam timelines, and content hierarchies" },
  { title: "Estimating workload", desc: "Assessing hours needed and calculating task densities" },
  { title: "Building revision schedule", desc: "Constructing date-bound milestones and review targets" },
  { title: "Optimizing daily plan", desc: "Injecting synthesis intervals and leveling daily workload" }
];

const AIPlanner: React.FC = () => {
  const { 
    plannerInput, 
    savePlannerInput, 
    studyPlan, 
    setStudyPlan, 
    studyPlanMetadata,
    setStudyPlanMetadata,
    togglePlanTaskComplete,
    diagnostics,
    triggerDiagnosticsCheck
  } = useStudy();
  
  const { showToast } = useToast();

  // Local form states (using labels that align with the vitest unit tests)
  const [subjects, setSubjects] = useState<string[]>(() => plannerInput?.subjects || []);
  const [examDates, setExamDates] = useState<Record<string, string>>(() => plannerInput?.examDates || {});
  const [dailyHours, setDailyHours] = useState<number>(() => plannerInput?.availability?.dailyHours || plannerInput?.dailyHours || 4);
  const [preferredTime, setPreferredTime] = useState<'Morning' | 'Afternoon' | 'Evening'>(() => plannerInput?.availability?.preferredTime || 'Morning');
  const [sessionLength, setSessionLength] = useState<number>(() => plannerInput?.availability?.sessionLength || 50);
  const [weeklyOffDay, setWeeklyOffDay] = useState<string>(() => plannerInput?.availability?.weeklyOffDay || 'Sunday');
  
  // Adding subject local states
  const [newSubject, setNewSubject] = useState<string>('');
  const [newExamDate, setNewExamDate] = useState<string>('');

  // Diagnostics panel testing status
  const [testingDiagnostics, setTestingDiagnostics] = useState<boolean>(false);

  // Call states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleTestDiagnostics = async () => {
    setTestingDiagnostics(true);
    await triggerDiagnosticsCheck();
    setTestingDiagnostics(false);
    showToast("Gemini Diagnostics completed", "info");
  };

  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubject.trim() || !newExamDate) {
      setError("Please fill out both Subject and Date fields.");
      return;
    }
    
    const subjectClean = newSubject.trim();
    if (subjects.includes(subjectClean)) {
      setError("Subject already exists!");
      showToast("Subject already exists in list", "warning");
      return;
    }

    setSubjects(prev => [...prev, subjectClean]);
    setExamDates(prev => ({ ...prev, [subjectClean]: newExamDate }));
    setNewSubject('');
    setNewExamDate('');
    setError(null);
    showToast(`Subject "${subjectClean}" added`, "success");
  };

  const handleRemoveSubject = (subject: string) => {
    setSubjects(prev => prev.filter(s => s !== subject));
    setExamDates(prev => {
      const copy = { ...prev };
      delete copy[subject];
      return copy;
    });
    showToast(`Subject "${subject}" removed`, "info");
  };

  const handleGeneratePlanWithData = async (inputData: PlannerInput) => {
    setLoading(true);
    setLoadingStage(0);
    setError(null);

    let apiSuccess = false;
    let apiResult: any = null;
    let apiError: any = null;

    const apiPromise = fetchStudyPlanFromGemini(inputData)
      .then(res => {
        apiSuccess = true;
        apiResult = res;
      })
      .catch(err => {
        apiError = err;
      });

    for (let stage = 0; stage < 4; stage++) {
      setLoadingStage(stage);
      await new Promise(resolve => setTimeout(resolve, 900));
    }

    await apiPromise;

    if (apiSuccess && apiResult) {
      setStudyPlan(apiResult.schedule);
      setStudyPlanMetadata(apiResult.metadata);
      savePlannerInput(inputData);
      showToast('AI study plan generated successfully!', 'success');
    } else {
      // Offline / API fail fallback
      const fallback = generateLocalFallbackPlan(inputData);
      setStudyPlan(fallback.schedule);
      setStudyPlanMetadata(fallback.metadata);
      savePlannerInput(inputData);
      showToast('Local fallback plan generated successfully', 'warning');
    }

    setLoading(false);
  };

  const handleGeneratePlan = () => {
    if (loading) return;

    if (subjects.length === 0) {
      setError("Please add at least one subject and exam date before generating.");
      showToast("No subjects configured", "warning");
      return;
    }

    const inputData: PlannerInput = {
      subjects,
      syllabuses: plannerInput?.syllabuses || {},
      exams: subjects.reduce((acc, sub) => {
        acc[sub] = {
          date: examDates[sub],
          type: plannerInput?.exams?.[sub]?.type || 'University',
          difficulty: plannerInput?.exams?.[sub]?.difficulty || 'Medium',
          priority: plannerInput?.exams?.[sub]?.priority || 'Medium'
        };
        return acc;
      }, {} as any),
      availability: {
        dailyHours,
        preferredTime,
        sessionLength,
        weeklyOffDay
      },
      examDates
    };

    handleGeneratePlanWithData(inputData);
  };

  // Helper method for unit tests
  const handleLoadSampleAndGenerate = () => {
    const mockSubjects = ['Chemistry', 'Calculus'];
    const today = new Date();
    const chemDate = new Date(today);
    chemDate.setDate(today.getDate() + 4);
    const calcDate = new Date(today);
    calcDate.setDate(today.getDate() + 12);
    
    const mockDates = {
      'Chemistry': chemDate.toISOString().split('T')[0],
      'Calculus': calcDate.toISOString().split('T')[0]
    };
    
    setSubjects(mockSubjects);
    setExamDates(mockDates);
    
    const inputData: PlannerInput = {
      subjects: mockSubjects,
      syllabuses: mockSubjects.reduce((acc, sub) => {
        const text = sub === 'Chemistry'
          ? `Molecular Orbital Theory. Coordination Chemistry. Crystal Field Theory.`
          : `Partial Derivatives. Lagrange Multipliers. Multiple Integrals. Greens Theorem.`;
        acc[sub] = {
          subject: sub,
          fileName: `${sub}_Syllabus.txt`,
          fileSize: 1024,
          extractedText: text
        };
        return acc;
      }, {} as any),
      exams: mockSubjects.reduce((acc, sub) => {
        acc[sub] = {
          date: mockDates[sub],
          type: sub === 'Chemistry' ? 'Midterm' : 'Final',
          difficulty: 'Hard',
          priority: 'High'
        };
        return acc;
      }, {} as any),
      availability: {
        dailyHours,
        preferredTime,
        sessionLength,
        weeklyOffDay
      },
      examDates: mockDates
    };
    
    handleGeneratePlanWithData(inputData);
  };

  // Syllabus Progress subcomponent calculations
  const progressData = useMemo(() => {
    return subjects.map(subject => {
      const subjectTasks = studyPlan.reduce((acc, d) => {
        return [...acc, ...d.tasks.filter(t => t.subject === subject)];
      }, [] as Task[]);
      
      const total = subjectTasks.length;
      const completed = subjectTasks.filter(t => t.completed).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const hoursRemaining = subjectTasks
        .filter(t => !t.completed)
        .reduce((sum, t) => sum + t.estimatedHours, 0);

      return {
        subject,
        total,
        completed,
        pct,
        hoursRemaining
      };
    });
  }, [subjects, studyPlan]);

  // Topic Roadmap Folder Expand States
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const toggleUnit = (unitKey: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitKey]: !prev[unitKey] }));
  };

  const roadmapData = useMemo(() => {
    const syllabusesParsed = studyPlanMetadata?.syllabusesParsed || {};
    return Object.entries(syllabusesParsed).map(([subject, syllabus]) => {
      const parsedSyllabus = syllabus as ExtractedSyllabus;
      return {
        subject,
        units: parsedSyllabus.units.map(unit => {
          const unitTasks = studyPlan.reduce((acc, d) => {
            const matched = d.tasks.filter(t => 
              t.subject === subject && 
              unit.chapters.some(ch => ch.topics.some(top => top.toLowerCase() === t.topic?.toLowerCase() || t.title.toLowerCase().includes(top.toLowerCase())))
            );
            return [...acc, ...matched.map(t => ({ ...t, date: d.date }))];
          }, [] as (Task & { date: string })[]);

          return {
            unitName: unit.unitName,
            chapters: unit.chapters.map(ch => ({
              chapterName: ch.chapterName,
              topics: ch.topics.map(top => {
                const matchedTask = unitTasks.find(t => t.topic?.toLowerCase() === top.toLowerCase() || t.title.toLowerCase().includes(top.toLowerCase()));
                return {
                  topicName: top,
                  task: matchedTask
                };
              })
            })),
            practicals: parsedSyllabus.practicals || [],
            revisions: parsedSyllabus.revisions || []
          };
        })
      };
    });
  }, [studyPlanMetadata, studyPlan]);

  // Daily Timeline states
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const activeDay = studyPlan[selectedDayIndex];

  const handleNextDay = () => {
    setSelectedDayIndex(prev => Math.min(studyPlan.length - 1, prev + 1));
  };

  const handlePrevDay = () => {
    setSelectedDayIndex(prev => Math.max(0, prev - 1));
  };

  const sessionSlots = useMemo(() => {
    if (!activeDay) return { morning: [], afternoon: [], evening: [], revision: [] };
    const morning: Task[] = [];
    const afternoon: Task[] = [];
    const evening: Task[] = [];
    const revision: Task[] = [];

    activeDay.tasks.forEach((task, idx) => {
      if (task.sessionType === 'Revision' || task.title.toLowerCase().includes('revision') || task.title.toLowerCase().includes('review')) {
        revision.push(task);
      } else {
        if (idx === 0) morning.push(task);
        else if (idx === 1) afternoon.push(task);
        else evening.push(task);
      }
    });

    return { morning, afternoon, evening, revision };
  }, [activeDay]);

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const totalGeneratedTasks = useMemo(() => {
    return studyPlan.reduce((acc, day) => acc + day.tasks.length, 0);
  }, [studyPlan]);

  const completedGeneratedTasks = useMemo(() => {
    return studyPlan.reduce((acc, day) => acc + day.tasks.filter(t => t.completed).length, 0);
  }, [studyPlan]);
  
  const completionPercent = useMemo(() => {
    return totalGeneratedTasks > 0 ? Math.round((completedGeneratedTasks / totalGeneratedTasks) * 100) : 0;
  }, [totalGeneratedTasks, completedGeneratedTasks]);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300">
        <Sidebar />

        <div className="md:pl-64 min-h-screen transition-all duration-300">
          <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Header - EXACT string needed for unit tests */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">
                  AI Personalized Planner
                </h1>
                <p className="text-slate-655 dark:text-text-muted text-sm font-semibold">
                  Personalized topic-by-topic timelines parsed from your syllabus and balanced against available study constraints.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Diagnostics, Progress, Parameter config */}
              <div className="space-y-6 lg:col-span-1">
                
                {/* Gemini Diagnostics Panel */}
                <GlassCard hover={false} className="p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border-primary/45 pb-3">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <h3 className="font-heading font-extrabold text-sm text-text-primary dark:text-text-primary">Gemini Diagnostics</h3>
                  </div>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between font-bold text-text-secondary dark:text-text-muted">
                      <span>API Key Status</span>
                      <span className={diagnostics.apiKeyDetected ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>
                        {diagnostics.apiKeyDetected ? "Detected" : "Demo Mock Mode"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-text-secondary dark:text-text-muted">
                      <span>Model Reachable</span>
                      <span className={diagnostics.modelReachable ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                        {diagnostics.modelReachable ? "Online & Reachable" : "Offline / Mocked"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-text-secondary dark:text-text-muted">
                      <span>Network Reach</span>
                      <span className={diagnostics.networkAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                        {diagnostics.networkAvailable ? "Available" : "Offline"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-text-secondary dark:text-text-muted">
                      <span>Last Ping Status</span>
                      <span className={`uppercase font-black ${
                        diagnostics.lastStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' : diagnostics.lastStatus === 'failure' ? 'text-red-500' : 'text-text-muted'
                      }`}>
                        {diagnostics.lastStatus}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-text-secondary dark:text-text-muted">
                      <span>Response Latency</span>
                      <span className="font-mono">{diagnostics.lastResponseTime ? `${diagnostics.lastResponseTime} ms` : "N/A"}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleTestDiagnostics}
                    disabled={testingDiagnostics}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-primary hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-text-secondary hover:text-brand-primary dark:text-slate-350 text-xs font-black border border-border-primary dark:border-border-primary cursor-pointer active:scale-98 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingDiagnostics ? "animate-spin" : ""}`} />
                    <span>{testingDiagnostics ? "Pinging Model..." : "Test Connection"}</span>
                  </button>
                </GlassCard>

                {/* Syllabus Progress Card */}
                {studyPlan.length > 0 && (
                  <GlassCard hover={false} className="p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-border-primary/45 pb-3">
                      <Layers className="w-4 h-4 text-brand-primary" />
                      <h3 className="font-heading font-extrabold text-sm text-text-primary dark:text-text-primary">Syllabus Progress</h3>
                    </div>
                    <div className="space-y-4">
                      {progressData.map(data => (
                        <div key={data.subject} className="space-y-1.5 text-xs text-left">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-text-primary dark:text-slate-200">{data.subject}</span>
                            <span className="text-[10px] text-text-secondary dark:text-text-muted">{data.completed}/{data.total} topics ({data.pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-bg-primary dark:bg-slate-800 rounded-full overflow-hidden border border-border-primary/10">
                            <div 
                              className="h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full" 
                              style={{ width: `${data.pct}%` }}
                            />
                          </div>
                          <p className="text-[9.5px] text-text-muted dark:text-text-secondary font-semibold">{data.hoursRemaining.toFixed(1)} study hours remaining</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Study Parameters Quick Configuration Form (linked to labels for unit tests) */}
                <GlassCard hover={false} className="p-5 space-y-5">
                  <div className="flex items-center gap-2 border-b border-border-primary/45 pb-3">
                    <Settings className="w-4 h-4 text-brand-primary" />
                    <h3 className="font-heading font-extrabold text-sm text-text-primary dark:text-text-primary">Scheduler Settings</h3>
                  </div>
                  
                  <div className="space-y-4 text-left">
                    <div>
                      <label htmlFor="add-course-subject" className="block text-[10px] font-black uppercase text-text-muted mb-1">
                        Add Course Subject
                      </label>
                      <input
                        id="add-course-subject"
                        type="text"
                        placeholder="e.g. Biology 101"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-primary dark:bg-slate-800 border border-border-primary dark:border-slate-700 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="exam-deadline-date" className="block text-[10px] font-black uppercase text-text-muted mb-1">
                        Exam Deadline Date
                      </label>
                      <input
                        id="exam-deadline-date"
                        type="date"
                        value={newExamDate}
                        onChange={(e) => setNewExamDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-primary dark:bg-slate-800 border border-border-primary dark:border-slate-700 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleAddSubject}
                        className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-bg-primary hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-border-primary dark:border-slate-700 text-text-secondary dark:text-slate-300 text-xs font-extrabold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    {subjects.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-black uppercase text-text-muted">Configured Subjects:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {subjects.map(sub => (
                            <span 
                              key={sub}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-bold text-brand-primary"
                            >
                              <span>{sub}</span>
                              <span className="text-[9px] text-text-muted font-normal">(Exam: {examDates[sub]})</span>
                              <button onClick={() => handleRemoveSubject(sub)} className="hover:text-rose-500 cursor-pointer">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border-primary/40 dark:border-slate-800 pt-3">
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="daily-study-availability" className="block text-[10px] font-black uppercase text-text-muted">
                          Daily Study Availability
                        </label>
                        <span className="text-xs font-bold text-brand-primary">{dailyHours}h</span>
                      </div>
                      <input
                        id="daily-study-availability"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={dailyHours}
                        onChange={(e) => setDailyHours(Number(e.target.value))}
                        className="w-full accent-brand-primary cursor-pointer h-1.5 bg-bg-primary dark:bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleGeneratePlan}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-xs shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Regenerate Study Plan</span>
                    </button>

                    <button
                      onClick={handleLoadSampleAndGenerate}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-bg-primary hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-border-primary dark:border-slate-700 text-text-secondary dark:text-slate-350 text-xs font-black cursor-pointer active:scale-98 transition-all"
                    >
                      <span>Load Sample & Generate Plan</span>
                    </button>
                  </div>
                </GlassCard>

              </div>

              {/* Right Column: Loading stages OR Daily Timeline & Roadmap Folders */}
              <div className="space-y-6 lg:col-span-2">
                
                {loading ? (
                  <GlassCard hover={false} className="p-8 flex flex-col justify-center space-y-8 min-h-[450px]">
                    <div className="text-center space-y-2 animate-fadeIn">
                      {/* Title exact mapping for test case assertion */}
                      <h3 className="font-heading font-black text-xl text-text-primary dark:text-text-primary">
                        Formulating Revision Schedule...
                      </h3>
                      <p className="text-xs text-text-secondary dark:text-text-muted font-semibold max-w-md mx-auto">
                        Scheduler Pipeline Status
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-2 animate-bounce">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-primary-500/25 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary-650 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        <Sparkles className="w-5 h-5 text-brand-primary" />
                      </div>
                    </div>

                    <div className="w-full max-w-md mx-auto space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-primary-650 dark:text-brand-primary uppercase tracking-wide">
                        <span>Compiler pipeline</span>
                        <span>{Math.min(100, (loadingStage + 1) * 25)}%</span>
                      </div>
                      <div className="w-full bg-bg-primary dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-border-primary/10">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(loadingStage + 1) * 25}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    <div className="max-w-md w-full mx-auto grid grid-cols-1 gap-3.5 pt-4">
                      {loadingStages.map((stage, idx) => {
                        const isCompleted = idx < loadingStage;
                        const isActive = idx === loadingStage;

                        return (
                          <div 
                            key={idx}
                            className={`flex items-start gap-4 p-3 rounded-xl border transition-colors ${
                              isActive 
                                ? 'bg-brand-primary/5 border-primary-500/25 shadow-sm'
                                : isCompleted
                                ? 'bg-emerald-500/5 border-emerald-500/15 opacity-70'
                                : 'bg-transparent border-border-primary/20 dark:border-border-primary/10 opacity-40'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : isActive ? (
                                <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-white animate-pulse">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-350 dark:border-slate-750" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className={`text-xs font-black leading-tight ${
                                isActive ? 'text-brand-primary dark:text-brand-primary' : isCompleted ? 'text-text-primary dark:text-slate-200' : 'text-text-muted'
                              }`}>
                                {stage.title}
                              </p>
                              <p className="text-[10px] text-text-secondary mt-0.5 font-semibold">
                                {stage.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                ) : studyPlan.length === 0 ? (
                  <GlassCard hover={false} className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[450px] bg-gradient-to-tr from-slate-50/10 via-primary-500/5 to-transparent">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-500 to-indigo-650 text-white flex items-center justify-center shadow-xl">
                      <CalendarIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-2.5 max-w-md">
                      <h2 className="font-heading font-black text-xl md:text-2xl text-text-primary dark:text-text-primary leading-tight">
                        AI Study Schedule Generator
                      </h2>
                      <p className="text-xs text-slate-655 dark:text-text-muted font-semibold leading-relaxed">
                        Transform course content and exam dates into a structured roadmap using the Gemini API.
                      </p>
                    </div>
                  </GlassCard>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Interactive Daily Timeline */}
                    {activeDay && (
                      <GlassCard hover={false} className="p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-border-primary/45 pb-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-pink-500" />
                            <h2 className="font-heading font-black text-base text-text-primary dark:text-text-primary">
                              Plan Progress Tracker
                            </h2>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={handlePrevDay} 
                              disabled={selectedDayIndex === 0}
                              className="p-1 rounded hover:bg-bg-primary cursor-pointer disabled:opacity-30 text-text-secondary text-xs"
                              title="Previous day"
                            >
                              ◀
                            </button>
                            <span className="text-[10px] font-black text-brand-primary px-2 bg-brand-primary/5 py-1 rounded">
                              Day {selectedDayIndex + 1} of {studyPlan.length}
                            </span>
                            <button 
                              onClick={handleNextDay} 
                              disabled={selectedDayIndex === studyPlan.length - 1}
                              className="p-1 rounded hover:bg-bg-primary cursor-pointer disabled:opacity-30 text-text-secondary text-xs"
                              title="Next day"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        <div className="text-left">
                          <h3 className="text-xs font-black text-text-muted">{formatDate(activeDay.date)}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Morning Session */}
                          <div className="p-4 rounded-2xl border border-border-primary/50 bg-surface-primary/20 text-left space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Morning Session
                            </span>
                            {sessionSlots.morning.length === 0 ? (
                              <p className="text-[10px] text-text-secondary italic pl-1">Rest or general review</p>
                            ) : (
                              sessionSlots.morning.map(task => (
                                <div key={task.id} className="flex items-center justify-between gap-3 p-2 bg-surface-primary/60 dark:bg-bg-primary/30 border border-border-primary/40 rounded-xl shadow-sm">
                                  <div className="overflow-hidden">
                                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary dark:text-slate-200'}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[8.5px] font-black uppercase text-brand-primary">{task.subject}</span>
                                      <span className="text-[9px] font-semibold text-text-muted flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" /> {task.estimatedHours}h
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => togglePlanTaskComplete(activeDay.date, task.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer shrink-0 min-h-[28px] min-w-[28px] transition-all focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-350 dark:border-slate-750 bg-transparent"
                                    }`}
                                  >
                                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Afternoon Session */}
                          <div className="p-4 rounded-2xl border border-border-primary/50 bg-surface-primary/20 text-left space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-650 dark:text-blue-400">
                              Afternoon Session
                            </span>
                            {sessionSlots.afternoon.length === 0 ? (
                              <p className="text-[10px] text-text-secondary italic pl-1">Rest or general review</p>
                            ) : (
                              sessionSlots.afternoon.map(task => (
                                <div key={task.id} className="flex items-center justify-between gap-3 p-2 bg-surface-primary/60 dark:bg-bg-primary/30 border border-border-primary/40 rounded-xl shadow-sm">
                                  <div className="overflow-hidden">
                                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary dark:text-slate-200'}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[8.5px] font-black uppercase text-brand-primary">{task.subject}</span>
                                      <span className="text-[9px] font-semibold text-text-muted flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" /> {task.estimatedHours}h
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => togglePlanTaskComplete(activeDay.date, task.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer shrink-0 min-h-[28px] min-w-[28px] transition-all focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-350 dark:border-slate-750 bg-transparent"
                                    }`}
                                  >
                                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Evening Session */}
                          <div className="p-4 rounded-2xl border border-border-primary/50 bg-surface-primary/20 text-left space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
                              Evening Session
                            </span>
                            {sessionSlots.evening.length === 0 ? (
                              <p className="text-[10px] text-text-secondary italic pl-1">Rest or general review</p>
                            ) : (
                              sessionSlots.evening.map(task => (
                                <div key={task.id} className="flex items-center justify-between gap-3 p-2 bg-surface-primary/60 dark:bg-bg-primary/30 border border-border-primary/40 rounded-xl shadow-sm">
                                  <div className="overflow-hidden">
                                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary dark:text-slate-200'}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[8.5px] font-black uppercase text-brand-primary">{task.subject}</span>
                                      <span className="text-[9px] font-semibold text-text-muted flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" /> {task.estimatedHours}h
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => togglePlanTaskComplete(activeDay.date, task.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer shrink-0 min-h-[28px] min-w-[28px] transition-all focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-350 dark:border-slate-750 bg-transparent"
                                    }`}
                                  >
                                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Revision Block */}
                          <div className="p-4 rounded-2xl border border-border-primary/50 bg-surface-primary/20 text-left space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400">
                              Revision Block
                            </span>
                            {sessionSlots.revision.length === 0 ? (
                              <p className="text-[10px] text-text-secondary italic pl-1">Rest or general review</p>
                            ) : (
                              sessionSlots.revision.map(task => (
                                <div key={task.id} className="flex items-center justify-between gap-3 p-2 bg-surface-primary/60 dark:bg-bg-primary/30 border border-border-primary/40 rounded-xl shadow-sm">
                                  <div className="overflow-hidden">
                                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary dark:text-slate-200'}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[8.5px] font-black uppercase text-brand-primary">{task.subject}</span>
                                      <span className="text-[9px] font-semibold text-text-muted flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" /> {task.estimatedHours}h
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => togglePlanTaskComplete(activeDay.date, task.id)}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer shrink-0 min-h-[28px] min-w-[28px] transition-all focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-350 dark:border-slate-750 bg-transparent"
                                    }`}
                                  >
                                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    )}

                    {/* Expandable Topic Roadmap tree */}
                    {roadmapData.length > 0 && (
                      <GlassCard hover={false} className="p-6 space-y-6 text-left">
                        <div className="flex items-center gap-2 border-b border-border-primary/45 pb-3">
                          <BookOpen className="w-5 h-5 text-brand-primary" />
                          <h2 className="font-heading font-extrabold text-base text-text-primary dark:text-slate-100">Extracted Syllabus Roadmap</h2>
                        </div>

                        <div className="space-y-6">
                          {roadmapData.map(subData => (
                            <div key={subData.subject} className="space-y-3">
                              <h3 className="text-xs font-black text-brand-primary border-l-4 border-brand-primary pl-2 uppercase tracking-wide">
                                {subData.subject} Curriculum Tree
                              </h3>

                              <div className="space-y-2.5 pl-2 border-l border-border-primary/40 dark:border-border-primary/20">
                                {subData.units.map((unit, uIdx) => {
                                  const unitKey = `${subData.subject}-${unit.unitName}-${uIdx}`;
                                  const isExpanded = !!expandedUnits[unitKey];

                                  return (
                                    <div key={unitKey} className="space-y-2">
                                      <button
                                        onClick={() => toggleUnit(unitKey)}
                                        className="flex items-center gap-2 text-xs font-black text-text-primary dark:text-slate-200 hover:text-brand-primary transition-colors cursor-pointer w-full text-left"
                                      >
                                        <span>{isExpanded ? "▼" : "▶"}</span>
                                        <span className="truncate">{unit.unitName}</span>
                                      </button>

                                      {isExpanded && (
                                        <div className="pl-4 space-y-3.5 pt-1.5 border-l border-dashed border-border-primary dark:border-slate-800">
                                          {unit.chapters.map((ch, cIdx) => (
                                            <div key={cIdx} className="space-y-1.5">
                                              <span className="text-[11px] font-extrabold text-text-secondary dark:text-text-muted block">
                                                {ch.chapterName}
                                              </span>
                                              <div className="space-y-1.5 pl-2">
                                                {ch.topics.map((top, tIdx) => (
                                                  <div key={tIdx} className="flex items-center justify-between gap-3 text-[10.5px] p-2 bg-bg-primary/40 dark:bg-slate-900/40 border border-border-primary/40 dark:border-slate-800 rounded-lg">
                                                    <span className="text-text-muted dark:text-text-secondary truncate max-w-[70%]">{top.topicName}</span>
                                                    {top.task ? (
                                                      <button
                                                        onClick={() => togglePlanTaskComplete(top.task.date, top.task.id)}
                                                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                                                          top.task.completed 
                                                            ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20"
                                                            : "bg-brand-primary/10 text-brand-primary border border-primary-500/20"
                                                        }`}
                                                      >
                                                        {top.task.completed ? "✓ Done" : "Schedule"}
                                                      </button>
                                                    ) : (
                                                      <span className="text-[9px] font-bold text-text-secondary italic">Review sprint</span>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AIPlanner;
