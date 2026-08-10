import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Exam, ChatMessage, PlannerInput, StudyDay, StudyPlanMetadata } from '../types';
import { useToast } from './ToastContext';

interface StudyContextType {
  theme: string;
  toggleTheme: () => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  deleteExam: (id: string) => void;
  messages: ChatMessage[];
  sendChatMessage: (text: string, sender?: 'user' | 'ai') => void;
  clearChatHistory: () => void;
  studyHistory: { day: string; hours: number }[];
  totalTasks: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  completionPercentage: number;
  totalStudyHoursThisWeek: string;
  
  // AI Planner additions
  plannerInput: PlannerInput;
  savePlannerInput: (input: PlannerInput) => void;
  studyPlan: StudyDay[];
  setStudyPlan: React.Dispatch<React.SetStateAction<StudyDay[]>>;
  studyPlanMetadata: StudyPlanMetadata | null;
  setStudyPlanMetadata: React.Dispatch<React.SetStateAction<StudyPlanMetadata | null>>;
  togglePlanTaskComplete: (dateStr: string, taskId: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

const defaultTasks: Task[] = [
  { id: '1', title: 'Review Chemistry Chapter 4 (Organic Synthesis)', subject: 'Chemistry', dueDate: new Date().toISOString().split('T')[0], priority: 'High', estimatedHours: 2, completed: false },
  { id: '2', title: 'Solve Calculus III Practice Set 5', subject: 'Mathematics', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], priority: 'Medium', estimatedHours: 3, completed: false },
  { id: '3', title: 'Draft Biology Lab Report on Photosynthesis', subject: 'Biology', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], priority: 'Low', estimatedHours: 1.5, completed: false },
  { id: '4', title: 'Outline Physics Term Project Architecture', subject: 'Physics', dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], priority: 'High', estimatedHours: 4, completed: true }
];

const defaultExams: Exam[] = [
  { id: '1', subject: 'Chemistry', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], name: 'Chemistry Midterm Exam', location: 'Hall A' },
  { id: '2', subject: 'Mathematics', date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], name: 'Calculus Final Assessment', location: 'Seminar Room B' },
  { id: '3', subject: 'Physics', date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], name: 'Advanced Physics Term Quiz', location: 'Lab Room 102' }
];

const defaultMessages: ChatMessage[] = [
  { id: 'msg-1', sender: 'ai', text: "Hello! I am your StudyAI assistant. I can analyze your study tasks, create structured review plans, explain complex topics, or generate new tasks directly for your calendar. What subject are we tackling today?", timestamp: new Date(Date.now() - 600000).toISOString() }
];

const defaultPlannerInput: PlannerInput = {
  subjects: ['Chemistry', 'Mathematics', 'Physics'],
  examDates: {
    'Chemistry': new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    'Mathematics': new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    'Physics': new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]
  },
  dailyHours: 4
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  // Theme state
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  // Exams state
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('exams');
    return saved ? JSON.parse(saved) : defaultExams;
  });

  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : defaultMessages;
  });

  // Active study hours historical log (for analytics charts)
  const [studyHistory, setStudyHistory] = useState<{ day: string; hours: number }[]>([
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 5.5 },
    { day: 'Thu', hours: 6.0 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 2.5 },
    { day: 'Sun', hours: 0 }
  ]);

  // AI Study Planner input
  const [plannerInput, setPlannerInput] = useState<PlannerInput>(() => {
    const saved = localStorage.getItem('planner_input');
    return saved ? JSON.parse(saved) : defaultPlannerInput;
  });

  // AI Study Plan output (day-by-day study tasks)
  const [studyPlan, setStudyPlan] = useState<StudyDay[]>(() => {
    const saved = localStorage.getItem('study_plan');
    return saved ? JSON.parse(saved) : [];
  });

  // AI Study Plan metadata (generation source, prompt version, difficulty)
  const [studyPlanMetadata, setStudyPlanMetadata] = useState<StudyPlanMetadata | null>(() => {
    const saved = localStorage.getItem('study_plan_metadata');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync exams to localStorage
  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  // Sync chat messages to localStorage
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Sync planner input to localStorage
  useEffect(() => {
    localStorage.setItem('planner_input', JSON.stringify(plannerInput));
  }, [plannerInput]);

  // Sync study plan to localStorage
  useEffect(() => {
    localStorage.setItem('study_plan', JSON.stringify(studyPlan));
  }, [studyPlan]);

  // Sync study plan metadata to localStorage
  useEffect(() => {
    localStorage.setItem('study_plan_metadata', JSON.stringify(studyPlanMetadata));
  }, [studyPlanMetadata]);

  // Actions
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Theme changed to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'success');
  }, [theme, showToast]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      completed: false,
      ...task
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`Task created: "${task.title}"`, 'success');
  }, [showToast]);

  const toggleTaskComplete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;

    if (nextCompleted) {
      setStudyHistory(history => history.map((item, idx) => {
        if (idx === history.length - 1) { // Add to current day
          return { ...item, hours: Math.min(12, item.hours + Number(task.estimatedHours || 1)) };
        }
        return item;
      }));
      showToast('Task completed! Study hours logged.', 'success');
    } else {
      showToast('Task marked active.', 'info');
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: nextCompleted } : t));
  }, [tasks, showToast]);

  const deleteTask = useCallback((id: string) => {
    const target = tasks.find(t => t.id === id);
    if (target) {
      showToast(`Task deleted: "${target.title}"`, 'info');
    }
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [tasks, showToast]);

  const addExam = useCallback((exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      id: Date.now().toString(),
      ...exam
    };
    setExams(prev => [...prev, newExam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    showToast(`Exam countdown added for ${exam.subject}!`, 'success');
  }, [showToast]);

  const deleteExam = useCallback((id: string) => {
    const target = exams.find(e => e.id === id);
    if (target) {
      showToast(`Exam countdown removed: "${target.name}"`, 'info');
    }
    setExams(prev => prev.filter(exam => exam.id !== id));
  }, [exams, showToast]);

  const generateAIResponse = useCallback((userText: string) => {
    const textLower = userText.toLowerCase();
    let reply = "";
    let suggestedTasks: Omit<Task, 'id' | 'completed'>[] | undefined = undefined;

    if (textLower.includes('schedule') || textLower.includes('plan') || textLower.includes('study')) {
      reply = "I've structured a study plan for your upcoming exams. Based on your current load, you should prioritize Calculus today. Would you like me to schedule a 2-hour review task for Calculus?";
      suggestedTasks = [
        { title: "Calculus Exam Review (Functions & Integrals)", subject: "Mathematics", priority: "High", estimatedHours: 2, dueDate: new Date().toISOString().split('T')[0] }
      ];
    } else if (textLower.includes('chemistry') || textLower.includes('organic')) {
      reply = "Organic Chemistry Chapter 4 covers electrophilic additions. I recommend outlining the key reaction mechanisms and drawing transition states. Shall we create a Chemistry study session for tomorrow?";
      suggestedTasks = [
        { title: "Draw Organic Chemistry Reaction Mechanisms", subject: "Chemistry", priority: "High", estimatedHours: 1.5, dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] }
      ];
    } else if (textLower.includes('calculus') || textLower.includes('math')) {
      reply = "Calculus III double integrals require visualizing coordinate bounds. I suggest resolving 5 integration sheets. Let's add this task to your planner.";
      suggestedTasks = [
        { title: "Solve Double Integrals Worksheet", subject: "Mathematics", priority: "Medium", estimatedHours: 3, dueDate: new Date().toISOString().split('T')[0] }
      ];
    } else {
      reply = "I've analyzed your schedule. You have a Chemistry midterm exam coming up in 3 days. I recommend a focused 2-hour session on Molecular Orbitals and synthesis pathway reviews. I can add this study slot to your list directly!";
      suggestedTasks = [
        { title: "Study Chemistry Molecular Orbitals", subject: "Chemistry", priority: "High", estimatedHours: 2, dueDate: new Date().toISOString().split('T')[0] }
      ];
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toISOString(),
      suggestedTasks
    };

    setMessages(prev => [...prev, aiMsg]);
  }, []);

  const sendChatMessage = useCallback((text: string, sender: 'user' | 'ai' = 'user') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);

    if (sender === 'user') {
      setTimeout(() => {
        generateAIResponse(text);
      }, 1000);
    }
  }, [generateAIResponse]);

  const clearChatHistory = useCallback(() => {
    setMessages(defaultMessages);
  }, []);

  const savePlannerInput = useCallback((input: PlannerInput) => {
    setPlannerInput(input);
  }, []);

  const togglePlanTaskComplete = useCallback((dateStr: string, taskId: string) => {
    const day = studyPlan.find(d => d.date === dateStr);
    const task = day?.tasks.find(t => (t as Task).id === taskId) as Task | undefined;
    if (!task) return;
    const nextCompleted = !task.completed;

    if (nextCompleted) {
      setStudyHistory(history => history.map((item, idx) => {
        if (idx === history.length - 1) { // Add to current day
          return { ...item, hours: Math.min(12, item.hours + Number(task.estimatedHours || 1)) };
        }
        return item;
      }));
      showToast('Revision task completed! Streak updated.', 'success');
    } else {
      showToast('Revision task marked active.', 'info');
    }

    setStudyPlan(prev => prev.map(d => {
      if (d.date === dateStr) {
        return {
          ...d,
          tasks: d.tasks.map(t => (t as Task).id === taskId ? { ...t, completed: nextCompleted } : t)
        };
      }
      return d;
    }));
  }, [studyPlan, showToast]);

  // Dynamic calculated stats
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = totalTasks - completedTasksCount;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Study hours this week sum
  const totalStudyHoursThisWeek = studyHistory.reduce((sum, item) => sum + item.hours, 0).toFixed(1);

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    tasks,
    addTask,
    toggleTaskComplete,
    deleteTask,
    exams,
    addExam,
    deleteExam,
    messages,
    sendChatMessage,
    clearChatHistory,
    studyHistory,
    totalTasks,
    completedTasksCount,
    pendingTasksCount,
    completionPercentage,
    totalStudyHoursThisWeek,
    plannerInput,
    savePlannerInput,
    studyPlan,
    setStudyPlan,
    studyPlanMetadata,
    setStudyPlanMetadata,
    togglePlanTaskComplete
  }), [
    theme,
    toggleTheme,
    tasks,
    addTask,
    toggleTaskComplete,
    deleteTask,
    exams,
    addExam,
    deleteExam,
    messages,
    sendChatMessage,
    clearChatHistory,
    studyHistory,
    totalTasks,
    completedTasksCount,
    pendingTasksCount,
    completionPercentage,
    totalStudyHoursThisWeek,
    plannerInput,
    savePlannerInput,
    studyPlan,
    setStudyPlan,
    studyPlanMetadata,
    setStudyPlanMetadata,
    togglePlanTaskComplete
  ]);

  return (
    <StudyContext.Provider value={contextValue}>
      {children}
    </StudyContext.Provider>
  );
};
