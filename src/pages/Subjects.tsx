import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { BookOpen, Plus, Trash2, Calendar, CheckSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Subjects: React.FC = () => {
  const { 
    plannerInput, 
    addSubject, 
    deleteSubject, 
    tasks, 
    exams, 
    studySessions 
  } = useStudy();

  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    addSubject(newSubject.trim());
    setNewSubject('');
  };

  // Helper to compute stats for a subject
  const getSubjectStats = (subject: string) => {
    const subjectTasks = tasks.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
    const completedTasks = subjectTasks.filter(t => t.completed).length;
    const subjectExams = exams.filter(e => e.subject.toLowerCase() === subject.toLowerCase());
    const totalMinutes = studySessions
      .filter(s => s.subject.toLowerCase() === subject.toLowerCase())
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      totalTasks: subjectTasks.length,
      completedTasks,
      examCount: subjectExams.length,
      hoursStudied: (totalMinutes / 60).toFixed(1)
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="pt-20 md:pt-8 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 dark:text-white">Subjects Management</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Organize your academic curriculum, track study hours, and monitor task completion by subject.</p>
          </div>

          {/* Add Subject form */}
          <GlassCard hover={false} className="max-w-md">
            <h3 className="font-heading font-black text-lg text-slate-850 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-500" />
              <span>Add New Subject</span>
            </h3>
            <form onSubmit={handleAddSubject} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Chemistry, Calculus, World History"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-950/50 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-white min-h-[44px]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
          </GlassCard>

          {/* Subject Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {plannerInput.subjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-black text-lg text-slate-850 dark:text-white mb-1">No subjects configured</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4">Add your first academic subject above to start organizing your study center.</p>
              </div>
            ) : (
              plannerInput.subjects.map((subject) => {
                const stats = getSubjectStats(subject);
                return (
                  <motion.div key={subject} variants={itemVariants}>
                    <GlassCard hover={true} className="flex flex-col justify-between h-56 group relative">
                      {/* Delete button (absolute) */}
                      <button
                        onClick={() => deleteSubject(subject)}
                        aria-label={`Delete ${subject}`}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-red-50 dark:bg-slate-800/60 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer focus:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-1 pr-8">
                        <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Subject Course</span>
                        <h3 className="font-heading font-black text-xl text-slate-850 dark:text-white leading-tight mt-0.5">{subject}</h3>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-200/40 dark:border-slate-850/40 pt-4 mt-auto">
                        <div className="text-center">
                          <CheckSquare className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Tasks</p>
                          <p className="font-heading font-black text-sm text-slate-800 dark:text-white mt-0.5">{stats.completedTasks}/{stats.totalTasks}</p>
                        </div>
                        <div className="text-center">
                          <Clock className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Studied</p>
                          <p className="font-heading font-black text-sm text-slate-800 dark:text-white mt-0.5">{stats.hoursStudied}h</p>
                        </div>
                        <div className="text-center">
                          <Calendar className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Exams</p>
                          <p className="font-heading font-black text-sm text-slate-800 dark:text-white mt-0.5">{stats.examCount}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
