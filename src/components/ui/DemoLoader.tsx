import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

interface DemoLoaderProps {
  onComplete: () => void;
}

const DemoLoader: React.FC<DemoLoaderProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Preparing demo workspace…", duration: 400 },
    { text: "Loading AI study plan…", duration: 400 },
    { text: "Restoring analytics history…", duration: 400 },
    { text: "Ready.", duration: 300 }
  ];

  useEffect(() => {
    let activeTimer: any;
    
    const runSteps = (index: number) => {
      if (index >= steps.length) {
        onComplete();
        return;
      }
      setStep(index);
      activeTimer = setTimeout(() => {
        runSteps(index + 1);
      }, steps[index].duration);
    };

    runSteps(0);

    return () => clearTimeout(activeTimer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center text-white px-6 select-none"
    >
      <div className="max-w-sm w-full space-y-8 flex flex-col items-center">
        {/* Animated logo/icon */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary-600 to-pink-500 blur opacity-60"
          />
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center z-10 border border-slate-800">
            <Sparkles className="w-6 h-6 text-brand-primary animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Synthesizing Workspace
          </h2>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            Demo Mode Initializer
          </p>
        </div>

        {/* Stepper progress checklist */}
        <div className="w-full space-y-3.5 bg-slate-900/50 border border-slate-900 p-5 rounded-2xl">
          {steps.map((s, idx) => {
            const isCompleted = step > idx;
            const isActive = step === idx;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-25'
                }`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center border shrink-0 text-[10px]">
                  {isCompleted ? (
                    <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isActive && idx < 3 ? (
                    <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  ) : isActive && idx === 3 ? (
                    <div className="w-full h-full bg-brand-primary rounded-full flex items-center justify-center text-white font-extrabold text-[8px]">
                      ✓
                    </div>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-bold">{idx + 1}</span>
                  )}
                </div>

                <span className={`text-xs ${isActive ? 'font-bold text-white' : 'text-slate-350'}`}>
                  {s.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress micro-bar */}
        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.2 }}
            className="h-full bg-gradient-to-r from-primary-600 to-pink-500 rounded-full" 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DemoLoader;
