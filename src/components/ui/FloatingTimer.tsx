import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Clock, Play, Pause, RotateCcw, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingTimer: React.FC = () => {
  const { plannerInput, addStudySession, currentDateStr } = useStudy();

  const [isOpen, setIsOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [durationPreset, setDurationPreset] = useState(25); // minutes
  const [selectedSubject, setSelectedSubject] = useState('General');
  
  const timerRef = useRef<any>(null);

  // Set default subject
  useEffect(() => {
    if (plannerInput.subjects.length > 0) {
      setSelectedSubject(plannerInput.subjects[0]);
    }
  }, [plannerInput.subjects]);

  // Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            // Completed! Log study session
            addStudySession({
              subject: selectedSubject,
              durationMinutes: durationPreset,
              date: currentDateStr
            });
            // Reset to preset
            return durationPreset * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, durationPreset, selectedSubject, currentDateStr, addStudySession]);

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(durationPreset * 60);
  };

  const handleSelectPreset = (mins: number) => {
    setIsTimerRunning(false);
    setDurationPreset(mins);
    setTimeLeft(mins * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleManualLog = () => {
    addStudySession({
      subject: selectedSubject,
      durationMinutes: durationPreset,
      date: currentDateStr
    });
    handleResetTimer();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-72 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-5 backdrop-blur-xl text-slate-800 dark:text-slate-100 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-3">
              <h3 className="font-heading font-black text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Focus Session</span>
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close Focus Timer panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Timer Clock */}
            <div className="text-center py-2 space-y-1">
              <span className="font-heading font-black text-4xl tracking-tight text-slate-900 dark:text-white leading-none">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                {isTimerRunning ? 'Time to Focus' : 'Timer Paused'}
              </p>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1">
              <label htmlFor="float-timer-sub" className="text-[9px] font-bold text-slate-450 uppercase">Subject Focus</label>
              <select
                id="float-timer-sub"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isTimerRunning}
                className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-950/50 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-850 dark:text-white"
              >
                <option value="General">General</option>
                {plannerInput.subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Presets */}
            {!isTimerRunning && (
              <div className="flex justify-between gap-1.5">
                {[15, 25, 50].map(mins => (
                  <button
                    key={mins}
                    onClick={() => handleSelectPreset(mins)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                      durationPreset === mins 
                        ? 'bg-primary-500/10 border border-primary-500/20 text-primary-500' 
                        : 'bg-slate-100/60 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleTimer}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isTimerRunning 
                    ? 'bg-amber-550 hover:bg-amber-500 text-white' 
                    : 'bg-primary-500 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start</span>
                  </>
                )}
              </button>
              <button
                onClick={handleResetTimer}
                aria-label="Reset Timer"
                className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Log / Quick Action */}
            {!isTimerRunning && (
              <button
                onClick={handleManualLog}
                className="w-full py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Log {durationPreset}m session</span>
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer transition-all ${
          isTimerRunning 
            ? 'bg-amber-500 shadow-amber-500/20' 
            : 'bg-primary-500 shadow-primary-500/20'
        }`}
        aria-label="Toggle Focus Timer"
      >
        {isTimerRunning ? (
          <span className="font-heading font-black text-[10px] tracking-tighter leading-none animate-pulse">
            {formatTime(timeLeft)}
          </span>
        ) : (
          isOpen ? <ChevronUp className="w-6 h-6" /> : <Clock className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingTimer;
