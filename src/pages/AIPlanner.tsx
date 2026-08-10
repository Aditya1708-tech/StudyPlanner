import React, { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import AnimatedPage from '../components/layout/AnimatedPage';
import { fetchStudyPlanFromGemini } from '../services/gemini';
import { PlannerInput, Task } from '../types';
import { ENV } from '../utils/env';
import { logger } from '../utils/logger';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Check,
  Loader2,
  AlertTriangle
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
    togglePlanTaskComplete 
  } = useStudy();
  
  const { showToast } = useToast();

  // Local form states
  const [subjects, setSubjects] = useState<string[]>(plannerInput.subjects);
  const [examDates, setExamDates] = useState<Record<string, string>>(plannerInput.examDates);
  const [dailyHours, setDailyHours] = useState<number>(plannerInput.dailyHours);
  
  // Adding subject local states
  const [newSubject, setNewSubject] = useState<string>('');
  const [newExamDate, setNewExamDate] = useState<string>('');

  // Call states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [ariaAnnounce, setAriaAnnounce] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Screen reader announcements for staged loading
  useEffect(() => {
    if (loading) {
      setAriaAnnounce(`AI Planner progress: ${loadingStages[loadingStage].title}. ${loadingStages[loadingStage].desc}`);
    } else {
      setAriaAnnounce('');
    }
  }, [loading, loadingStage]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newExamDate) return;
    
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

  // Helper method used by both normal generate and sample generate
  const handleGeneratePlanWithData = async (inputData: PlannerInput) => {
    setLoading(true);
    setLoadingStage(0);
    setError(null);

    let apiSuccess = false;
    let apiResult: any = null;
    let apiError: any = null;

    // Start API request in parallel
    const apiPromise = fetchStudyPlanFromGemini(inputData)
      .then(res => {
        apiSuccess = true;
        apiResult = res;
      })
      .catch(err => {
        apiError = err;
      });

    // Animate stages (1s per stage) to show a premium, predictable stepper experience
    for (let stage = 0; stage < 4; stage++) {
      setLoadingStage(stage);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Wait for the API promise to finish if it hasn't already
    await apiPromise;

    if (apiSuccess && apiResult) {
      setStudyPlan(apiResult.schedule);
      setStudyPlanMetadata(apiResult.metadata);
      savePlannerInput(inputData);
      
      const source = apiResult.metadata.generationSource;
      if (source === 'gemini') {
        showToast('AI study plan generated successfully!', 'success');
      } else if (source === 'demo') {
        showToast('Demo AI study plan generated!', 'success');
      } else if (source === 'cache') {
        showToast('Study plan loaded from cache', 'success');
      } else {
        if (navigator.onLine) {
          showToast('API unavailable, local fallback plan generated', 'warning');
        } else {
          showToast('Offline fallback plan generated', 'warning');
        }
      }
    } else {
      logger.error('Error generating study plan', apiError);
      setError("An unexpected error occurred while generating the plan. Please try again.");
      showToast("Error generating study plan", "error");
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

    // Verify all subjects have dates
    for (const sub of subjects) {
      if (!examDates[sub]) {
        setError(`Please provide an exam date for ${sub}.`);
        showToast(`Missing date for ${sub}`, "warning");
        return;
      }
    }

    const inputData: PlannerInput = {
      subjects,
      examDates,
      dailyHours
    };

    handleGeneratePlanWithData(inputData);
  };

  const handleGenerateSamplePlan = () => {
    const sampleSubjects = ['Chemistry', 'Mathematics', 'Physics'];
    const today = new Date();
    
    const dateChem = new Date(today);
    dateChem.setDate(today.getDate() + 3);
    const dateMath = new Date(today);
    dateMath.setDate(today.getDate() + 6);
    const datePhys = new Date(today);
    datePhys.setDate(today.getDate() + 10);

    const sampleDates = {
      'Chemistry': dateChem.toISOString().split('T')[0],
      'Mathematics': dateMath.toISOString().split('T')[0],
      'Physics': datePhys.toISOString().split('T')[0]
    };

    setSubjects(sampleSubjects);
    setExamDates(sampleDates);
    showToast("Loaded sample parameters. Starting AI scheduler...", "info");

    const inputData: PlannerInput = {
      subjects: sampleSubjects,
      examDates: sampleDates,
      dailyHours
    };

    // Briefly delay start to let state render visually
    setTimeout(() => {
      handleGeneratePlanWithData(inputData);
    }, 300);
  };

  // Helper: Format date string
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Memoized stats calculation for performance
  const totalGeneratedTasks = useMemo(() => {
    return studyPlan.reduce((acc, day) => acc + day.tasks.length, 0);
  }, [studyPlan]);

  const completedGeneratedTasks = useMemo(() => {
    return studyPlan.reduce(
      (acc, day) => acc + day.tasks.filter((t) => (t as Task).completed).length, 
      0
    );
  }, [studyPlan]);
  
  const completionPercent = useMemo(() => {
    return totalGeneratedTasks > 0 
      ? Math.round((completedGeneratedTasks / totalGeneratedTasks) * 100) 
      : 0;
  }, [totalGeneratedTasks, completedGeneratedTasks]);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300">
      {/* Hidden live region for screen-reader progress announcements */}
      <div className="sr-only" aria-live="polite">
        {ariaAnnounce}
      </div>

      <Sidebar />

      <div className="md:pl-64 min-h-screen transition-all duration-300">
        {/* Switched from <main> to <div> since global landmark is in App.tsx */}
        <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">
                AI Personalized Planner
              </h1>
              <p className="text-slate-650 dark:text-text-muted text-sm font-semibold">
                Define your courses and deadlines. Let Gemini structure a customized, day-by-day revision timeline.
              </p>
            </div>
            
            {!ENV.GEMINI_API_KEY ? (
              <div className="relative group flex items-center shrink-0">
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold cursor-help shadow-sm">
                  Demo AI Mode
                </span>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded-lg shadow-lg z-50 text-center font-normal leading-normal">
                  Using built-in demo responses. Add a Gemini API key to enable live AI generation.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel border border-primary-500/10 text-xs font-bold text-brand-primary dark:text-brand-primary self-start shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span>Gemini v2.5 Flash Engine</span>
              </div>
            )}
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Constraints Input Form (1 column on desktop) */}
            <div className="space-y-6 lg:col-span-1">
              <GlassCard hover={false} className="p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-border-primary/40 dark:border-border-primary/40 pb-4">
                  <BookOpen className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-heading font-extrabold text-lg text-text-primary dark:text-text-primary">Study Parameters</h2>
                </div>

                {/* Form to Add Subject & Date */}
                <form onSubmit={handleAddSubject} className="space-y-4">
                  <div>
                    <label htmlFor="subject-input" className="block text-xs font-bold text-slate-650 dark:text-text-muted uppercase mb-1">
                      Add Course Subject
                    </label>
                    <input 
                      id="subject-input"
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="e.g. Mathematics, Organic Chemistry"
                      className="w-full px-4 py-3 rounded-xl border border-border-primary dark:border-border-primary bg-surface-primary/20 dark:bg-surface-primary/20 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none focus:bg-surface-primary dark:focus:bg-slate-950 transition-all text-text-primary dark:text-text-primary placeholder-slate-500 dark:placeholder-slate-400 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label htmlFor="exam-date-input" className="block text-xs font-bold text-slate-655 dark:text-text-muted uppercase mb-1">
                      Exam Deadline Date
                    </label>
                    <input 
                      id="exam-date-input"
                      type="date"
                      value={newExamDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border-primary dark:border-border-primary bg-surface-primary/20 dark:bg-surface-primary/20 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none focus:bg-surface-primary dark:focus:bg-slate-950 transition-all text-text-primary dark:text-text-primary min-h-[44px]"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-bg-primary hover:bg-primary-50 dark:bg-slate-800/80 dark:hover:bg-primary-950/40 text-text-secondary hover:text-brand-primary dark:text-slate-350 dark:hover:text-primary-400 text-xs font-extrabold border border-border-primary/60 dark:border-border-primary transition-all cursor-pointer min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Subject</span>
                  </motion.button>
                </form>

                {/* Course Subjects Chip List */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-650 dark:text-text-muted uppercase">
                    Configured Subjects ({subjects.length})
                  </span>
                  
                  {subjects.length === 0 ? (
                    // Premium Empty State for Configured Subjects
                    <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-border-primary dark:border-border-primary/80 bg-bg-primary/10 dark:bg-surface-primary/5">
                      <BookOpen className="w-7 h-7 text-text-muted dark:text-text-secondary mx-auto mb-2" />
                      <p className="text-xs font-bold text-text-secondary dark:text-slate-350">No courses added</p>
                      <p className="text-[10px] text-text-secondary dark:text-text-muted mt-0.5 leading-normal">
                        Type a subject and set its exam date above to build your revision targets list.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      <AnimatePresence initial={false}>
                        {subjects.map((sub) => (
                          <motion.div 
                            key={sub}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-surface-primary/40 dark:bg-surface-primary/40 border border-border-primary/50 dark:border-border-primary/50"
                          >
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-text-primary dark:text-slate-200 truncate">{sub}</p>
                              <p className="text-[10px] text-text-secondary dark:text-text-muted flex items-center gap-1 mt-0.5 font-semibold">
                                <Calendar className="w-3 h-3 text-pink-500" /> Exam: {examDates[sub] || 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveSubject(sub)}
                              aria-label={`Remove subject ${sub}`}
                              className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-650 dark:text-red-400 transition-all cursor-pointer focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[40px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Daily hours slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="daily-hours-slider" className="text-xs font-bold text-slate-655 dark:text-text-muted uppercase">
                      Daily Study Availability
                    </label>
                    <span className="text-xs font-extrabold text-brand-primary dark:text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                      {dailyHours} Hours
                    </span>
                  </div>
                  <input
                    id="daily-hours-slider"
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-primary-500 h-1.5 bg-bg-primary dark:bg-slate-800 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary dark:text-text-muted font-bold">
                    <span>1h</span>
                    <span>4h</span>
                    <span>8h</span>
                    <span>12h</span>
                  </div>
                </div>

                {/* API Action button */}
                <div className="pt-4 border-t border-border-primary/40 dark:border-border-primary/40">
                  <motion.button
                    onClick={handleGeneratePlan}
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-sm shadow-xl  hover: hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer min-h-[48px] focus:ring-2 focus:ring-primary-500 focus:outline-none focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{studyPlan.length > 0 ? "Regenerate Study Plan" : "Generate Study Plan"}</span>
                  </motion.button>
                </div>
              </GlassCard>

              {/* Error Box */}
              {error && (
                <div className="flex gap-2.5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 text-xs font-bold shadow-sm" role="alert">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Right Column: Display day-by-day scheduler (2 columns wide) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* If loading study plan: Premium Staged Stepper Experience */}
              {loading ? (
                <GlassCard hover={false} className="p-8 flex flex-col justify-center space-y-8 min-h-[450px]">
                  <div className="text-center space-y-2">
                    <h3 className="font-heading font-black text-xl text-text-primary dark:text-text-primary">Formulating Revision Schedule...</h3>
                    <p className="text-xs text-text-secondary dark:text-text-muted font-semibold max-w-md mx-auto">
                      Our system is running deep analytics to partition your curriculum based on upcoming exams.
                    </p>
                  </div>

                  {/* Progressive Circular Stage Loader */}
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-primary-500/25 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-primary-650 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <Sparkles className="w-5 h-5 text-brand-primary animate-bounce" />
                    </div>
                  </div>

                  {/* Horizontal Loading Status Bar */}
                  <div className="w-full max-w-md mx-auto space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-primary-650 dark:text-brand-primary uppercase tracking-wide">
                      <span>Scheduler Pipeline Status</span>
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

                  {/* Visual Stepper Checkbox Stages */}
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
                          <div>
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
                // Premium Empty State: No generated plan
                <GlassCard hover={false} className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[450px] bg-gradient-to-tr from-slate-50/10 via-primary-500/5 to-transparent">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-500 to-indigo-650 text-white flex items-center justify-center shadow-xl ">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div className="space-y-2.5 max-w-md">
                    <h3 className="font-heading font-black text-xl md:text-2xl text-text-primary dark:text-text-primary leading-tight">AI Study Schedule Generator</h3>
                    <p className="text-xs text-slate-655 dark:text-text-muted font-semibold leading-relaxed">
                      Transform course content and exam dates into a high-yield structured curriculum map. Click the button to automatically load standard parameters and review the schedule.
                    </p>
                  </div>
                  
                  {/* Actions inside empty state */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <motion.button
                      onClick={handleGenerateSamplePlan}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary text-white font-extrabold text-xs shadow-lg  hover:-translate-y-0.5 transition-all cursor-pointer min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Load Sample & Generate Plan</span>
                    </motion.button>
                  </div>
                </GlassCard>
              ) : (
                // Render Day-by-Day schedule
                <div className="space-y-6">

                  {/* Plan Metadata Widget */}
                  {studyPlanMetadata && (
                    <GlassCard hover={false} className="p-4 flex flex-wrap items-center justify-between gap-4 border border-primary-500/10 bg-surface-primary/30 dark:bg-surface-primary/30">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Generation Source Badge */}
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide uppercase ${
                          studyPlanMetadata.generationSource === 'gemini' 
                            ? 'bg-brand-primary/10 text-brand-primary dark:text-brand-primary border border-primary-500/15'
                            : studyPlanMetadata.generationSource === 'cache'
                            ? 'bg-emerald-500/10 text-emerald-655 dark:text-emerald-400 border border-emerald-500/15'
                            : studyPlanMetadata.generationSource === 'demo'
                            ? 'bg-purple-500/10 text-purple-655 dark:text-purple-400 border border-purple-500/15'
                            : 'bg-amber-500/10 text-amber-655 dark:text-amber-400 border border-amber-500/15'
                        }`}>
                          {studyPlanMetadata.generationSource === 'fallback' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                          )}
                          {studyPlanMetadata.generationSource === 'gemini' && 'AI Generated'}
                          {studyPlanMetadata.generationSource === 'cache' && 'From Cache'}
                          {studyPlanMetadata.generationSource === 'demo' && 'Demo AI Mode'}
                          {studyPlanMetadata.generationSource === 'fallback' && 'Local Fallback'}
                        </span>

                        {/* Difficulty Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          studyPlanMetadata.estimatedDifficulty === 'hard'
                            ? 'bg-red-500/10 border-red-500/15 text-red-655 dark:text-red-400'
                            : studyPlanMetadata.estimatedDifficulty === 'medium'
                            ? 'bg-amber-500/10 border-amber-500/15 text-amber-655 dark:text-amber-400'
                            : 'bg-emerald-500/10 border-emerald-500/15 text-emerald-655 dark:text-emerald-400'
                        }`}>
                          Difficulty: {studyPlanMetadata.estimatedDifficulty.toUpperCase()}
                        </span>

                        {/* Prompt Version Badge */}
                        <span className="px-2.5 py-1.5 rounded-xl bg-bg-primary/50 dark:bg-slate-800/80 border border-border-primary/60 dark:border-border-primary text-[10px] font-mono font-bold text-text-secondary dark:text-text-muted">
                          Prompt: {studyPlanMetadata.promptVersion}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] font-semibold text-text-secondary dark:text-text-muted">
                        Generated: {studyPlanMetadata.generatedAt}
                      </span>
                    </GlassCard>
                  )}

                  {/* AI Study Strategy Guide Card */}
                  {studyPlanMetadata && studyPlanMetadata.motivationalIntro && (
                    <GlassCard hover={false} className="p-5 bg-gradient-to-tr from-pink-500/5 to-primary-500/5 border border-pink-500/10 text-xs font-semibold leading-relaxed text-text-secondary dark:text-slate-350">
                      <p className="font-extrabold text-text-primary mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
                        <span>AI Study Strategy Guide</span>
                      </p>
                      <p className="italic text-text-secondary dark:text-text-muted mb-3">"{studyPlanMetadata.motivationalIntro}"</p>
                      {studyPlanMetadata.studyStrategy && (
                        <div className="mt-3 pt-3 border-t border-border-primary/40 dark:border-border-primary/45 text-[11px] text-text-secondary dark:text-text-muted leading-normal">
                          <strong className="text-brand-primary dark:text-brand-primary uppercase tracking-wider text-[9px] block mb-1">Recommended Approach</strong>
                          {studyPlanMetadata.studyStrategy}
                        </div>
                      )}
                    </GlassCard>
                  )}
                  
                  {/* Progress Header Widget */}
                  <GlassCard hover={false} className="p-5 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-pink-500/10 border border-primary-500/10">
                    <div>
                      <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary">Plan Progress Tracker</h3>
                      <p className="text-[10px] uppercase font-bold text-brand-primary dark:text-brand-primary mt-0.5">
                        {completedGeneratedTasks} of {totalGeneratedTasks} tasks completed ({completionPercent}%)
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-primary-500/20 flex items-center justify-center font-black text-xs text-brand-primary dark:text-brand-primary relative">
                      <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          className="stroke-current text-brand-primary/10"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          className="stroke-current text-brand-primary"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={150.7}
                          strokeDashoffset={150.7 - (150.7 * completionPercent) / 100}
                        />
                      </svg>
                      {completionPercent}%
                    </div>
                  </GlassCard>

                  {/* Day cards */}
                  <div className="space-y-5">
                    {studyPlan.map((day) => {
                      const dayComplete = day.tasks.every((t: any) => t.completed);
                      return (
                        <GlassCard 
                          key={day.date} 
                          hover={false} 
                          className={`p-6 border transition-all ${
                            dayComplete 
                              ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75' 
                              : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/50 dark:border-border-primary/50'
                          }`}
                        >
                          {/* Date header */}
                          <div className="flex items-center justify-between border-b border-border-primary/30 dark:border-border-primary/30 pb-3 mb-4">
                            <h3 className="font-heading font-extrabold text-sm text-text-primary dark:text-text-primary flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-pink-500" />
                              <span>{formatDate(day.date)}</span>
                            </h3>
                            {dayComplete && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" /> All Done
                              </span>
                            )}
                          </div>

                          {/* Task items inside day */}
                          <div className="space-y-3">
                            {day.tasks.map((task: any) => (
                              <div 
                                key={task.id}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                  task.completed 
                                    ? 'bg-bg-primary/50 dark:bg-bg-primary/20 border-border-primary/40 dark:border-border-primary/20 opacity-60' 
                                    : 'bg-surface-primary/50 dark:bg-bg-primary/30 border-border-primary/80 dark:border-border-primary/80 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-3.5 overflow-hidden">
                                  <button
                                    onClick={() => togglePlanTaskComplete(day.date, task.id)}
                                    aria-label={`Toggle completion of ${task.title}`}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 min-h-[32px] min-w-[32px] focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                                      task.completed 
                                        ? 'bg-brand-primary border-primary-500 text-white' 
                                        : 'border-slate-350 dark:border-slate-650 hover:border-primary-500 bg-transparent'
                                    }`}
                                  >
                                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>
                                  <div className="overflow-hidden">
                                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-text-secondary dark:text-text-secondary' : 'text-text-primary dark:text-slate-200'}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-bg-primary/80 text-slate-650 dark:bg-slate-850 dark:text-text-muted">
                                        {task.subject}
                                      </span>
                                      <span className={`text-[9px] font-bold ${
                                        task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                                      }`}>
                                        {task.priority} Priority
                                      </span>
                                      <span className="text-[9px] font-semibold text-text-muted dark:text-text-secondary flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" /> {task.estimatedHours}h
                                      </span>
                                    </div>
                                    {task.revisionBlocks && task.revisionBlocks.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {task.revisionBlocks.map((block: string, bIdx: number) => (
                                          <span 
                                            key={bIdx}
                                            className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary dark:text-brand-primary border border-primary-500/10"
                                          >
                                            {block}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
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
