import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import AnimatedPage from '../components/layout/AnimatedPage';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Plus, 
  X, 
  CheckCircle2, 
  Brain,
  ChevronRight
} from 'lucide-react';
import { fetchStudyPlanFromGemini } from '../services/gemini';
import GlassCard from '../components/ui/GlassCard';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const { setOnboardingCompleted } = useAuth();
  const { 
    addSubject: addSubjectToContext, 
    addExam: addExamToContext, 
    savePlannerInput,
    setStudyPlan,
    setStudyPlanMetadata
  } = useStudy();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // Steps: 1 (Subjects), 2 (Exams), 3 (Availability)

  // Step 1: Subjects state
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const suggestions = ["Chemistry", "Mathematics", "Physics", "Computer Science", "Biology", "Literature"];

  // Step 2: Exams state
  const [examName, setExamName] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [exams, setExams] = useState<{ name: string; subject: string; date: string }[]>([]);

  // Step 3: Availability state
  const [dailyHours, setDailyHours] = useState(4);

  // Phase 4: Generator Animation overlay state
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0); // 0 to 4
  const generationStepsList = [
    "Analyze syllabus",
    "Estimate workload",
    "Allocate study blocks",
    "Create revision strategy",
    "Generate daily schedule"
  ];

  const addSubjectTag = (sub: string) => {
    const trimmed = sub.trim();
    if (!trimmed) return;
    if (subjects.includes(trimmed)) {
      showToast("Subject already added.", "info");
      return;
    }
    setSubjects(prev => [...prev, trimmed]);
    setSubjectInput('');
  };

  const removeSubjectTag = (sub: string) => {
    setSubjects(prev => prev.filter(s => s !== sub));
    if (examSubject === sub) setExamSubject('');
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examSubject || !examDate) {
      showToast("Please fill all exam parameters.", "warning");
      return;
    }
    setExams(prev => [...prev, { name: examName, subject: examSubject, date: examDate }]);
    setExamName('');
    setExamDate('');
  };

  const removeExam = (index: number) => {
    setExams(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleBuildPlan = async () => {
    if (subjects.length === 0) {
      showToast("Please configure at least one subject in Step 1.", "warning");
      setStep(1);
      return;
    }

    setGenerating(true);
    setGenerationStage(0);

    const examDatesObj: Record<string, string> = {};
    exams.forEach(e => {
      examDatesObj[e.subject] = e.date;
    });

    const finalSubjects = [...subjects];
    exams.forEach(e => {
      if (!finalSubjects.includes(e.subject)) {
        finalSubjects.push(e.subject);
      }
    });

    const inputData = {
      subjects: finalSubjects,
      examDates: examDatesObj,
      dailyHours
    };

    let planResult: any = null;
    const apiCall = fetchStudyPlanFromGemini(inputData)
      .then(res => {
        planResult = res;
      })
      .catch(err => {
        console.error("API error during onboarding generation, fallback will trigger", err);
      });

    // 1s per loader step
    for (let stage = 0; stage < 4; stage++) {
      setGenerationStage(stage);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await apiCall;

    if (planResult) {
      setStudyPlan(planResult.schedule);
      setStudyPlanMetadata(planResult.metadata);
      savePlannerInput(inputData);
    }

    finalSubjects.forEach(s => addSubjectToContext(s));
    exams.forEach(e => {
      addExamToContext({
        name: e.name,
        subject: e.subject,
        date: e.date,
        location: ''
      });
    });

    setGenerationStage(4); // Success

    setTimeout(async () => {
      await setOnboardingCompleted(true);
      showToast("Your personalized study plan is ready.", "success");
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-bg-primary flex flex-col justify-between font-sans text-text-primary overflow-x-hidden relative">
      
      {/* Background radial overlays */}
      <div className="absolute top-0 inset-x-0 h-96 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[50px] right-[10%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Header Bar */}
      <header className="py-6 px-8 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-border-primary relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <span className="font-heading font-black text-base tracking-tight">
            StudyAI<span className="text-brand-primary">Planner</span>
          </span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted bg-surface-primary px-3 py-1 rounded-full border border-border-primary">
          Account Setup
        </div>
      </header>

      {/* Steps content */}
      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl">
          
          {/* Stepper indicator line */}
          <div className="flex items-center justify-between mb-8 px-6">
            {[1, 2, 3].map(sNum => (
              <div key={sNum} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === sNum 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' 
                    : step > sNum 
                      ? 'bg-brand-success text-white' 
                      : 'bg-surface-primary border border-border-primary text-text-muted'
                }`}>
                  {step > sNum ? '✓' : `0${sNum}`}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${step === sNum ? 'text-text-primary' : 'text-text-muted'}`}>
                  {sNum === 1 ? 'Subjects' : sNum === 2 ? 'Exams' : 'Availability'}
                </span>
              </div>
            ))}
          </div>

          {/* Stepper Card (Primary card: 24px/3xl radius, 32px/p-8 padding) */}
          <GlassCard hover={false} className="p-8 sm:p-10 rounded-3xl border border-border-primary shadow-2xl relative min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Add Subjects */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-brand-primary tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Step 01 of 03</span>
                    </span>
                    <h2 className="font-heading font-black text-2xl sm:text-3xl">What subjects are we studying?</h2>
                    <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                      Add the courses, classes, or modules you are taking this semester. Our AI builds specific study guides around them.
                    </p>
                  </div>

                  {/* Input subject form */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Mathematics"
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubjectTag(subjectInput)}
                        className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-bg-primary border border-border-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-text-primary"
                      />
                      <button
                        onClick={() => addSubjectTag(subjectInput)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary-hover transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Suggestions list */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-text-muted tracking-wider">Suggested subjects:</span>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map(sug => (
                          <button
                            key={sug}
                            onClick={() => addSubjectTag(sug)}
                            disabled={subjects.includes(sug)}
                            className="px-3 py-1.5 rounded-lg border border-border-primary hover:border-text-secondary bg-surface-primary/40 text-[10px] font-bold text-text-secondary disabled:opacity-40 transition-all cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Custom subjects chips list */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">Your configured courses ({subjects.length})</span>
                    {subjects.length === 0 ? (
                      <p className="text-xs text-text-secondary font-semibold italic">No subjects added yet. Configure one above.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
                        {subjects.map(sub => (
                          <span 
                            key={sub}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold text-brand-primary"
                          >
                            <span>{sub}</span>
                            <button onClick={() => removeSubjectTag(sub)} className="hover:text-rose-500 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Add Upcoming Exams */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-brand-primary tracking-wider flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Step 02 of 03</span>
                    </span>
                    <h2 className="font-heading font-black text-2xl sm:text-3xl">Any upcoming exams?</h2>
                    <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                      Enter key exam deadlines. The AI schedule planner distributes workloads to review course subjects prior to these dates.
                    </p>
                  </div>

                  {/* Add Exam Form */}
                  <form onSubmit={handleAddExam} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Exam Name */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[8px] font-black uppercase text-text-muted tracking-wider">Exam Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Midterm 1"
                        required
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-xs font-semibold focus:outline-none text-text-primary"
                      />
                    </div>

                    {/* Subject Select */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[8px] font-black uppercase text-text-muted tracking-wider">Course Subject</label>
                      <select
                        required
                        value={examSubject}
                        onChange={(e) => setExamSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-xs font-semibold focus:outline-none text-text-primary"
                      >
                        <option value="">Select subject...</option>
                        {subjects.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div className="sm:col-span-8 space-y-1">
                      <label className="text-[8px] font-black uppercase text-text-muted tracking-wider">Exam Date</label>
                      <input
                        type="date"
                        required
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-xs font-semibold focus:outline-none text-text-primary"
                      />
                    </div>

                    {/* Add button */}
                    <div className="sm:col-span-4 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exam</span>
                      </button>
                    </div>

                  </form>

                  {/* Scheduled Exams List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">Exams configured ({exams.length})</span>
                    {exams.length === 0 ? (
                      <p className="text-xs text-text-secondary font-semibold italic">No exams added yet. (You can skip this if you don't have exams scheduled).</p>
                    ) : (
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                        {exams.map((ex, idx) => (
                          <div 
                            key={idx}
                            className="flex justify-between items-center p-3 bg-bg-primary border border-border-primary rounded-xl"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-text-primary">{ex.name}</h4>
                              <p className="text-[9.5px] font-bold text-text-muted">Subject: {ex.subject} | Date: {ex.date}</p>
                            </div>
                            <button 
                              onClick={() => removeExam(idx)}
                              className="w-6 h-6 rounded-md hover:bg-surface-primary text-text-muted hover:text-rose-500 flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Availability Slider */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-brand-primary tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Step 03 of 03</span>
                    </span>
                    <h2 className="font-heading font-black text-2xl sm:text-3xl">Set daily availability</h2>
                    <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                      How many hours can you commit to studying every day? We'll distribute revision tasks evenly to meet your workload targets.
                    </p>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-5 py-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-text-muted">Daily Availability</span>
                      <span className="text-2xl font-heading font-black text-brand-primary">{dailyHours} Hours / day</span>
                    </div>

                    <input 
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer h-2 bg-bg-primary rounded-lg appearance-none"
                    />

                    <div className="flex justify-between text-[9px] font-black uppercase text-text-muted">
                      <span>1h (Light review)</span>
                      <span>4h (Balanced workload)</span>
                      <span>8h (Heavy prep)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-primary/5 border border-brand-primary/15 rounded-2xl flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                      <Brain className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-[10px] text-text-secondary font-semibold leading-relaxed">
                      Our system distributes reviews across subjects. It maintains daily limits to avoid cognitive fatigue and schedules rest breaks.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-border-primary flex justify-between items-center gap-4">
              <button
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="px-5 py-2.5 rounded-xl border border-border-primary bg-surface-primary/40 text-xs font-bold text-text-secondary disabled:opacity-40 transition-colors cursor-pointer"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1 && subjects.length === 0) {
                      showToast("Please add at least one subject to proceed.", "warning");
                      return;
                    }
                    setStep(prev => prev + 1);
                  }}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer animate-pulse-glow"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleBuildPlan}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-pink-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-lg shadow-brand-primary/10 cursor-pointer"
                >
                  <span>Build Study Plan</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </button>
              )}
            </div>
          </GlassCard>

        </div>
      </main>

      {/* Dynamic Animated Generator Overlay with upgraded typing loop */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <div className="w-full max-w-sm space-y-7">
              
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 bg-gradient-to-tr from-brand-primary to-pink-500 rounded-2xl blur-xl opacity-20"
                />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-pink-500 text-white flex items-center justify-center shadow-xl">
                  {generationStage === 4 ? <CheckCircle2 className="w-8 h-8 text-white" /> : <Brain className="w-8 h-8 animate-pulse" />}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-black text-xl text-text-primary">
                  {generationStage === 4 ? "Plan Configured!" : "StudyAI Plan Engine"}
                </h3>
                
                <div className="h-6 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={generationStage}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="text-xs text-text-secondary font-bold"
                    >
                      {generationStepsList[generationStage]}...
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Loader Loading Bar */}
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-bg-primary rounded-full overflow-hidden border border-border-primary">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${(generationStage + 1) * 20}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-text-muted">
                  <span>Compilation</span>
                  <span>{Math.min(100, (generationStage + 1) * 20)}%</span>
                </div>
              </div>

              {/* Steps checklist ticks log */}
              <div className="pt-2 border-t border-border-primary space-y-1.5 text-[10px] text-left max-w-xs mx-auto">
                {generationStepsList.map((stepStr, idx) => {
                  const isChecked = generationStage > idx || generationStage === 4;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${isChecked ? 'text-brand-success' : 'text-text-muted'}`}
                    >
                      <span>{isChecked ? '✓' : '○'}</span>
                      <span>{stepStr}</span>
                    </div>
                  );
                })}
              </div>

              {generationStage === 4 && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="pt-2 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-black uppercase text-brand-success tracking-widest block">Complete</span>
                  <p className="text-xs font-black text-text-primary">Your personalized study plan is ready.</p>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-6 text-center text-[10px] font-black uppercase text-text-muted tracking-wider border-t border-border-primary relative z-10">
        &copy; {new Date().getFullYear()} StudyAI Planner Pro. All rights reserved.
      </footer>
    </div>
  </AnimatedPage>
);
};

export default Onboarding;
