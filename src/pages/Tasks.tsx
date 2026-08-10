import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { Task } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTaskComplete, 
    deleteTask 
  } = useStudy();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Completed
  const [subjectFilter, setSubjectFilter] = useState('All'); // All, Chemistry, Mathematics, etc.
  const [priorityFilter, setPriorityFilter] = useState('All'); // All, High, Medium, Low

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Chemistry');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');

  const taskTitleInputRef = useRef<HTMLInputElement>(null);
  const toggleFormButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management: focus task title on form open
  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        taskTitleInputRef.current?.focus();
      }, 50);
    }
  }, [showForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    addTask({
      title: title.trim(),
      subject,
      priority,
      dueDate,
      estimatedHours: Number(estimatedHours) || 1
    });

    // Reset fields
    setTitle('');
    setDueDate('');
    setEstimatedHours('1');
    setShowForm(false);

    // Restore focus to trigger button
    setTimeout(() => {
      toggleFormButtonRef.current?.focus();
    }, 50);
  };

  // Memoize unique subjects from tasks for dropdown filtering
  const availableSubjects = useMemo(() => {
    return ['All', ...Array.from(new Set(tasks.map(t => t.subject)))];
  }, [tasks]);

  // Helper: compute days left
  const getDaysLeft = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diff = due.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'Overdue';
    return `In ${days} days`;
  };

  // Memoize filtered tasks list to eliminate redundant render recalculations (Performance Audit)
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'Pending' ? !task.completed :
        task.completed;

      const matchesSubject = 
        subjectFilter === 'All' ? true :
        task.subject === subjectFilter;

      const matchesPriority = 
        priorityFilter === 'All' ? true :
        task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesSubject && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, subjectFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="md:pl-64 min-h-screen transition-all duration-300">
        {/* Switched from <main> to <div> since global landmark wraps routing shell */}
        <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">Study Planner</h1>
              <p className="text-text-secondary dark:text-text-muted text-sm font-semibold">Organize coursework, manage estimated study hours, and schedule revisions.</p>
            </div>
            
            <motion.button
              onClick={() => setShowForm(!showForm)}
              ref={toggleFormButtonRef}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-sm shadow-xl  hover: hover:-translate-y-0.5 transition-all self-start cursor-pointer min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {showForm ? (
                <>
                  <X className="w-4.5 h-4.5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>Add Study Task</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Add Task Form (Collapsible/Animated) */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <GlassCard hover={false} className="border border-primary-500/20 p-6">
                  <h3 className="font-heading font-black text-lg text-text-primary dark:text-text-primary mb-4">Create New Study Target</h3>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="task-title" className="text-[10px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">Task Title</label>
                      <input
                        id="task-title"
                        ref={taskTitleInputRef}
                        type="text"
                        required
                        placeholder="e.g. Review Organic Chemistry reaction mechanism sheets"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-bg-primary/50 dark:bg-surface-primary/50 border border-border-primary dark:border-border-primary focus:outline-none focus:border-primary-500 focus:bg-surface-primary dark:focus:bg-slate-950 text-text-primary dark:text-text-primary min-h-[44px]"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="task-subject" className="text-[10px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">Subject / Course</label>
                      <input
                        id="task-subject"
                        type="text"
                        required
                        placeholder="e.g. Chemistry, Math, Literature"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-bg-primary/50 dark:bg-surface-primary/50 border border-border-primary dark:border-border-primary focus:outline-none focus:border-primary-500 focus:bg-surface-primary dark:focus:bg-slate-950 text-text-primary dark:text-text-primary min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label htmlFor="task-priority" className="text-[10px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">Priority Level</label>
                      <select
                        id="task-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                        className="w-full mt-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl bg-bg-primary/50 dark:bg-surface-primary/50 border border-border-primary dark:border-border-primary focus:outline-none focus:border-primary-500 focus:bg-surface-primary dark:focus:bg-slate-950 text-text-primary dark:text-text-primary min-h-[44px]"
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="task-due" className="text-[10px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">Due Date</label>
                      <input
                        id="task-due"
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full mt-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-bg-primary/50 dark:bg-surface-primary/50 border border-border-primary dark:border-border-primary focus:outline-none focus:border-brand-primary focus:bg-surface-primary dark:focus:bg-surface-elevated text-text-primary min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label htmlFor="task-hours" className="text-[10px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">Estimated Workload (Hours)</label>
                      <input
                        id="task-hours"
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        required
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-bg-primary/50 dark:bg-surface-primary/50 border border-border-primary dark:border-border-primary focus:outline-none focus:border-primary-500 focus:bg-surface-primary dark:focus:bg-slate-950 text-text-primary dark:text-text-primary min-h-[44px]"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-5 py-2.5 rounded-xl border border-border-primary dark:border-border-primary text-xs font-bold text-slate-655 hover:bg-bg-primary dark:text-slate-350 dark:hover:bg-slate-900 transition-colors cursor-pointer min-h-[44px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-xs shadow-md  hover:-translate-y-0.5 transition-all cursor-pointer min-h-[44px]"
                      >
                        Save Task
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtering Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <label htmlFor="search-field" className="sr-only">Search tasks</label>
              <input
                id="search-field"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-surface-primary/40 dark:bg-surface-primary/40 border border-border-primary dark:border-border-primary/80 focus:outline-none focus:border-primary-500 text-text-primary dark:text-text-primary placeholder-slate-400 min-h-[40px]"
              />
            </div>
            
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              <label htmlFor="filter-subject" className="sr-only">Filter by subject</label>
              <select
                id="filter-subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-surface-primary/40 dark:bg-surface-primary/40 border border-border-primary dark:border-border-primary/80 focus:outline-none focus:border-primary-500 text-text-primary dark:text-text-primary min-h-[40px]"
              >
                <option value="All">All Subjects</option>
                {availableSubjects.filter(sub => sub !== 'All').map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="filter-priority" className="sr-only">Filter by priority</label>
              <select
                id="filter-priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-surface-primary/40 dark:bg-surface-primary/40 border border-border-primary dark:border-border-primary/80 focus:outline-none focus:border-primary-500 text-text-primary dark:text-text-primary min-h-[40px]"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 border-b border-border-primary/20 dark:border-border-primary/40 pb-0.5">
            {['All', 'Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-xs font-extrabold uppercase relative transition-colors cursor-pointer min-h-[36px] ${
                  statusFilter === tab 
                    ? 'text-brand-primary dark:text-brand-primary' 
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <span>{tab}</span>
                {statusFilter === tab && (
                  <motion.div 
                    layoutId="statusIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-pink-500" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {filteredTasks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-text-secondary dark:text-text-secondary font-semibold"
                >
                  No tasks matched your filters. Time to relax, or create another study task!
                </motion.div>
              ) : (
                filteredTasks.map((task: Task) => {
                  const daysLeft = getDaysLeft(task.dueDate);
                  const isOverdue = daysLeft === 'Overdue' && !task.completed;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border transition-all gap-4 ${
                        task.completed 
                          ? 'bg-bg-primary/40 dark:bg-surface-primary/20 border-border-primary/50 dark:border-border-primary/10 opacity-60' 
                          : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/20 dark:border-border-primary/60 shadow-sm'
                      }`}
                    >
                      {/* Checkbox and info */}
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          aria-label={`Toggle completion of ${task.title}`}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer min-h-[32px] min-w-[32px] focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                            task.completed 
                              ? 'bg-brand-primary border-primary-500 text-white' 
                              : 'border-slate-350 dark:border-slate-650 hover:border-primary-500 bg-transparent'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-5 h-5 stroke-[2.5]" />}
                        </button>
                        
                        <div className="space-y-1.5">
                          <h4 className={`font-semibold text-sm ${
                            task.completed ? 'line-through text-text-secondary dark:text-text-secondary font-semibold' : 'text-text-primary dark:text-slate-200'
                          }`}>
                            {task.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-150 text-text-secondary dark:bg-slate-800 dark:text-text-muted border border-border-primary/20">
                              {task.subject}
                            </span>
                            
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              task.priority === 'High' ? 'bg-red-500/10 text-red-650 dark:bg-red-955/40 dark:text-red-400' : 
                              task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-655 dark:bg-amber-955/40 dark:text-amber-400' : 
                              'bg-blue-500/10 text-blue-655 dark:bg-blue-955/40 dark:text-blue-400'
                            }`}>
                              {task.priority} Priority
                            </span>

                            <span className="text-[10px] font-semibold text-text-secondary dark:text-text-secondary flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{task.estimatedHours}h study load</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date and Delete */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-4.5 h-4.5 ${isOverdue ? 'text-rose-500' : 'text-text-secondary'}`} />
                          <span className={`text-xs font-bold ${
                            isOverdue ? 'text-rose-500' : 'text-text-secondary dark:text-text-muted'
                          }`}>
                            {daysLeft}
                          </span>
                          {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete task: ${task.title}`}
                          className="p-3 rounded-xl bg-bg-primary hover:bg-red-50 dark:bg-slate-800/50 dark:hover:bg-red-955/40 text-text-secondary hover:text-red-500 transition-colors cursor-pointer shadow-sm border border-border-primary/40 dark:border-border-primary/40 focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[40px] flex items-center justify-center"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tasks;
