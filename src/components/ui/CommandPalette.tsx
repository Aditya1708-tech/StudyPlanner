import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import { 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Sun, 
  Moon, 
  Search,
  CornerDownLeft,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { 
    theme, 
    toggleTheme, 
    addTask, 
    addExam, 
    addStudySession, 
    plannerInput 
  } = useStudy();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Palette view: 'menu' | 'add-task' | 'add-exam' | 'log-session'
  const [view, setView] = useState<'menu' | 'add-task' | 'add-exam' | 'log-session'>('menu');

  // Input states for creators
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskHours, setTaskHours] = useState('1.5');
  const [taskDueDate, setTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [examName, setExamName] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  const [sessionSubject, setSessionSubject] = useState('');
  const [sessionMinutes, setSessionMinutes] = useState('45');

  const inputRef = useRef<HTMLInputElement>(null);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => {
          if (!prev) {
            setView('menu');
            setSearch('');
            setActiveIndex(0);
          }
          return !prev;
        });
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when palette opens or view changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, view]);

  // Set default subjects when plannerInput subjects load
  useEffect(() => {
    const defaultSub = plannerInput.subjects[0] || 'General';
    setTaskSubject(defaultSub);
    setExamSubject(defaultSub);
    setSessionSubject(defaultSub);
  }, [plannerInput.subjects]);

  const menuItems = [
    { 
      id: 'task',
      name: 'Create Custom Study Task', 
      desc: 'Schedule a new learning task on your planner',
      icon: CheckSquare, 
      action: () => setView('add-task') 
    },
    { 
      id: 'exam',
      name: 'Add Exam Countdown', 
      desc: 'Set an exam milestone to calculate prep timings',
      icon: Calendar, 
      action: () => setView('add-exam') 
    },
    { 
      id: 'session',
      name: 'Log Study Session', 
      desc: 'Track hours studied and increment your active streak',
      icon: Clock, 
      action: () => setView('log-session') 
    },
    { 
      id: 'ai-plan',
      name: 'Launch AI Planner', 
      desc: 'Run model to construct optimized review roads',
      icon: Sparkles, 
      action: () => {
        navigate('/planner');
        setIsOpen(false);
      }
    },
    { 
      id: 'theme',
      name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
      desc: 'Toggle visual dashboard theme',
      icon: theme === 'dark' ? Sun : Moon, 
      action: () => {
        toggleTheme();
        setIsOpen(false);
      }
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDownMenu = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredMenuItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMenuItems[activeIndex]) {
        filteredMenuItems[activeIndex].action();
      }
    }
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    addTask({
      title: taskTitle,
      subject: taskSubject || 'General',
      dueDate: taskDueDate,
      priority: taskPriority,
      estimatedHours: Number(taskHours) || 1
    });
    setTaskTitle('');
    setIsOpen(false);
  };

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !examDate) return;
    addExam({
      name: examName,
      subject: examSubject || 'General',
      date: examDate,
      location: 'Main Hall'
    });
    setExamName('');
    setExamDate('');
    setIsOpen(false);
  };

  const handleLogSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudySession({
      subject: sessionSubject || 'General',
      durationMinutes: Number(sessionMinutes) || 45,
      date: new Date().toISOString().split('T')[0]
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          role="presentation"
        />

        {/* Palette Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden text-slate-800 dark:text-slate-100"
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          {/* Main Menu View */}
          {view === 'menu' && (
            <div onKeyDown={handleKeyDownMenu}>
              <div className="flex items-center gap-3 px-4 border-b border-slate-200/40 dark:border-slate-800/40 h-14">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command to search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setActiveIndex(0);
                  }}
                  className="w-full text-xs font-semibold bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 text-[10px] font-bold rounded-lg text-slate-400">
                  ESC
                </kbd>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-8 text-xs font-semibold text-slate-450 dark:text-slate-500">
                    No results found matching "{search}"
                  </div>
                ) : (
                  filteredMenuItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-655 dark:text-primary-350' 
                            : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary-500' : 'text-slate-400'}`} />
                          <div>
                            <p className="text-xs font-bold">{item.name}</p>
                            <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase text-primary-500 tracking-wider">
                            <span>Select</span>
                            <CornerDownLeft className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Add Task View */}
          {view === 'add-task' && (
            <form onSubmit={handleCreateTaskSubmit} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-3">
                <h3 className="font-heading font-black text-sm text-slate-850 dark:text-white">Create Custom Task</h3>
                <button 
                  type="button" 
                  onClick={() => setView('menu')}
                  className="p-1 rounded-md text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="pal-task-title" className="text-[9px] font-bold text-slate-450 uppercase">Task Title</label>
                  <input
                    id="pal-task-title"
                    ref={inputRef}
                    type="text"
                    required
                    placeholder="e.g. Solve Algebra Sheet"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pal-task-subject" className="text-[9px] font-bold text-slate-450 uppercase">Subject</label>
                    <select
                      id="pal-task-subject"
                      value={taskSubject}
                      onChange={(e) => setTaskSubject(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    >
                      <option value="General">General</option>
                      {plannerInput.subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pal-task-priority" className="text-[9px] font-bold text-slate-450 uppercase">Priority</label>
                    <select
                      id="pal-task-priority"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full text-xs font-semibold px-2 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pal-task-hours" className="text-[9px] font-bold text-slate-450 uppercase">Est. Hours</label>
                    <input
                      id="pal-task-hours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={taskHours}
                      onChange={(e) => setTaskHours(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="pal-task-date" className="text-[9px] font-bold text-slate-450 uppercase">Due Date</label>
                    <input
                      id="pal-task-date"
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </form>
          )}

          {/* Add Exam View */}
          {view === 'add-exam' && (
            <form onSubmit={handleCreateExamSubmit} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-3">
                <h3 className="font-heading font-black text-sm text-slate-850 dark:text-white">Add Exam Countdown</h3>
                <button 
                  type="button" 
                  onClick={() => setView('menu')}
                  className="p-1 rounded-md text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="pal-exam-name" className="text-[9px] font-bold text-slate-450 uppercase">Exam Name</label>
                  <input
                    id="pal-exam-name"
                    ref={inputRef}
                    type="text"
                    required
                    placeholder="e.g. Physics Final assessment"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pal-exam-subject" className="text-[9px] font-bold text-slate-450 uppercase">Subject</label>
                    <select
                      id="pal-exam-subject"
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    >
                      <option value="General">General</option>
                      {plannerInput.subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pal-exam-date" className="text-[9px] font-bold text-slate-450 uppercase">Date</label>
                    <input
                      id="pal-exam-date"
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exam</span>
              </button>
            </form>
          )}

          {/* Log Session View */}
          {view === 'log-session' && (
            <form onSubmit={handleLogSessionSubmit} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-850/40 pb-3">
                <h3 className="font-heading font-black text-sm text-slate-850 dark:text-white">Log Study Session</h3>
                <button 
                  type="button" 
                  onClick={() => setView('menu')}
                  className="p-1 rounded-md text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pal-sess-subject" className="text-[9px] font-bold text-slate-450 uppercase">Subject</label>
                    <select
                      id="pal-sess-subject"
                      value={sessionSubject}
                      onChange={(e) => setSessionSubject(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    >
                      <option value="General">General</option>
                      {plannerInput.subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pal-sess-min" className="text-[9px] font-bold text-slate-450 uppercase">Duration (min)</label>
                    <input
                      id="pal-sess-min"
                      type="number"
                      required
                      min="1"
                      step="5"
                      value={sessionMinutes}
                      onChange={(e) => setSessionMinutes(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Clock className="w-4 h-4" />
                <span>Log Session</span>
              </button>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
