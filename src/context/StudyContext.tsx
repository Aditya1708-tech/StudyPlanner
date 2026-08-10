import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Exam, ChatMessage, PlannerInput, StudyDay, StudyPlanMetadata, StudySession } from '../types';
import { useToast } from './ToastContext';
import { getSimpleHash, SeededRandom } from '../utils/random';
import { AuthContext } from './AuthContext';

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
  
  // Dynamic metrics additions
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  streakCount: number;
  overallProgress: number;
  currentDateStr: string;
  addSubject: (subject: string) => void;
  deleteSubject: (subject: string) => void;

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

const defaultTasks: Task[] = [];
const defaultExams: Exam[] = [];

const defaultMessages: ChatMessage[] = [
  { id: 'msg-1', sender: 'ai', text: "Hello! I am your StudyAI assistant. I can analyze your study tasks, create structured review plans, explain complex topics, or generate new tasks directly for your calendar. What subject are we tackling today?", timestamp: new Date().toISOString() }
];

const defaultPlannerInput: PlannerInput = {
  subjects: [],
  examDates: {},
  dailyHours: 4
};

// Demo Mode static data helper generators using dynamic dates relative to today
const getRelativeDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getCuratedTasks = (): Task[] => [
  { id: 'curated-task-7', title: 'Download Chemistry past papers', subject: 'Chemistry', dueDate: getRelativeDateStr(-1), priority: 'Low', completed: true, estimatedHours: 1.0 },
  { id: 'curated-task-8', title: 'Calculus homework set 4 problems 1-10', subject: 'Calculus III', dueDate: getRelativeDateStr(0), priority: 'High', completed: false, estimatedHours: 2.0 },
  { id: 'curated-task-9', title: 'Review Physics Gauss\'s law formula card', subject: 'Physics II', dueDate: getRelativeDateStr(1), priority: 'Medium', completed: false, estimatedHours: 1.5 }
];

const getCuratedExams = (): Exam[] => [
  { id: 'curated-exam-1', name: 'Chemistry Midterm', subject: 'Chemistry', date: getRelativeDateStr(4), location: 'Science Hall 301' },
  { id: 'curated-exam-2', name: 'Calculus Final', subject: 'Calculus III', date: getRelativeDateStr(12), location: 'Math Tower Rm 102' },
  { id: 'curated-exam-3', name: 'Physics Exam', subject: 'Physics II', date: getRelativeDateStr(6), location: 'Physics Bldg Rm 204' },
  { id: 'curated-exam-4', name: 'Linear Algebra Quiz', subject: 'Linear Algebra', date: getRelativeDateStr(8), location: 'Math Tower Rm 104' },
  { id: 'curated-exam-5', name: 'Organic Chemistry Test', subject: 'Organic Chemistry', date: getRelativeDateStr(10), location: 'Chemistry Lab 12' }
];

const getCuratedMessages = (): ChatMessage[] => [
  { id: 'msg-1', sender: 'ai', text: "Hello! I am your StudyAI assistant. I can analyze your study tasks, create structured review plans, explain complex topics, or generate new tasks directly for your calendar. What subject are we tackling today?", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'msg-2', sender: 'user', text: "Can you explain the main difference between first-order and second-order reactions in Chemistry?", timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString() },
  { id: 'msg-3', sender: 'ai', text: "Certainly! In first-order reactions, the reaction rate depends linearly on the concentration of a single reactant. In contrast, in second-order reactions, the rate depends either on the square of one reactant's concentration or on the product of two different reactants. Visually, a first-order reaction has a constant half-life, whereas a second-order half-life increases as concentration decreases.", timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString() }
];

const getCuratedSessions = (): StudySession[] => [
  { id: 'sess-0', subject: 'Chemistry', durationMinutes: 90, date: getRelativeDateStr(0), timestamp: new Date().toISOString() },
  { id: 'sess-1', subject: 'Calculus III', durationMinutes: 120, date: getRelativeDateStr(-1), timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sess-2', subject: 'Physics II', durationMinutes: 60, date: getRelativeDateStr(-2), timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'sess-3', subject: 'Linear Algebra', durationMinutes: 150, date: getRelativeDateStr(-3), timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'sess-4', subject: 'Organic Chemistry', durationMinutes: 110, date: getRelativeDateStr(-4), timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'sess-5', subject: 'Chemistry', durationMinutes: 80, date: getRelativeDateStr(-5), timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'sess-6', subject: 'Calculus III', durationMinutes: 100, date: getRelativeDateStr(-6), timestamp: new Date(Date.now() - 86400000 * 6).toISOString() }
];

const getCuratedPlannerInput = (): PlannerInput => ({
  subjects: ['Chemistry', 'Calculus III', 'Physics II', 'Linear Algebra', 'Organic Chemistry'],
  examDates: {
    'Chemistry': getRelativeDateStr(4),
    'Calculus III': getRelativeDateStr(12),
    'Physics II': getRelativeDateStr(6),
    'Linear Algebra': getRelativeDateStr(8),
    'Organic Chemistry': getRelativeDateStr(10)
  },
  dailyHours: 4
});

const getCuratedStudyPlan = (): StudyDay[] => [
  {
    date: getRelativeDateStr(0),
    tasks: [
      { id: 'plan-task-1', title: 'Review Chemistry organic mechanism questions', subject: 'Chemistry', estimatedHours: 1.5, completed: true, isGenerated: true, dueDate: getRelativeDateStr(0), priority: 'High' },
      { id: 'plan-task-2', title: 'Solve Calculus triple integration review worksheet', subject: 'Calculus III', estimatedHours: 2.0, completed: false, isGenerated: true, dueDate: getRelativeDateStr(0), priority: 'High' },
      { id: 'plan-task-3', title: 'Read Physics electromagnetism lecture 6 notes', subject: 'Physics II', estimatedHours: 1.0, completed: false, isGenerated: true, dueDate: getRelativeDateStr(0), priority: 'Medium' }
    ]
  },
  {
    date: getRelativeDateStr(1),
    tasks: [
      { id: 'plan-task-4', title: 'Linear Algebra homework section 4.2', subject: 'Linear Algebra', estimatedHours: 1.5, completed: false, isGenerated: true, dueDate: getRelativeDateStr(1), priority: 'Medium' },
      { id: 'plan-task-5', title: 'Read Physics wave motion textbook chapter 8', subject: 'Physics II', estimatedHours: 2.0, completed: false, isGenerated: true, dueDate: getRelativeDateStr(1), priority: 'Low' }
    ]
  },
  {
    date: getRelativeDateStr(2),
    tasks: [
      { id: 'plan-task-6', title: 'Organic Chemistry reaction pathway project draft', subject: 'Organic Chemistry', estimatedHours: 3.0, completed: false, isGenerated: true, dueDate: getRelativeDateStr(2), priority: 'High' }
    ]
  }
];

const getCuratedStudyPlanMetadata = (): StudyPlanMetadata => ({
  generationSource: 'demo',
  promptVersion: 'v2',
  generatedAt: new Date().toISOString(),
  estimatedDifficulty: 'medium'
});

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const auth = useContext(AuthContext);
  const isDemoMode = auth ? auth.isDemoMode : false;

  // Tracks if the component has processed initial demo setup
  const [prevIsDemo, setPrevIsDemo] = useState(() => localStorage.getItem('is_demo_mode') === 'true');

  // Theme state
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved : 'light';
  });

  // Tasks state (overwrites with curated on page refresh if in demo mode)
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedTasks();
    }
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  // Exams state
  const [exams, setExams] = useState<Exam[]>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedExams();
    }
    const saved = localStorage.getItem('exams');
    return saved ? JSON.parse(saved) : defaultExams;
  });

  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedMessages();
    }
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : defaultMessages;
  });

  // Study sessions state
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedSessions();
    }
    const saved = localStorage.getItem('study_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // AI Study Planner input
  const [plannerInput, setPlannerInput] = useState<PlannerInput>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedPlannerInput();
    }
    const saved = localStorage.getItem('planner_input');
    return saved ? JSON.parse(saved) : defaultPlannerInput;
  });

  // AI Study Plan output (day-by-day study tasks)
  const [studyPlan, setStudyPlan] = useState<StudyDay[]>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedStudyPlan();
    }
    const saved = localStorage.getItem('study_plan');
    return saved ? JSON.parse(saved) : [];
  });

  // AI Study Plan metadata (generation source, prompt version, difficulty)
  const [studyPlanMetadata, setStudyPlanMetadata] = useState<StudyPlanMetadata | null>(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') {
      return getCuratedStudyPlanMetadata();
    }
    const saved = localStorage.getItem('study_plan_metadata');
    return saved ? JSON.parse(saved) : null;
  });

  // Demo state active transitions
  useEffect(() => {
    if (isDemoMode && !prevIsDemo) {
      // ENTERING DEMO MODE
      // 1. Back up existing user workspace data
      const keys = ['tasks', 'exams', 'chat_messages', 'study_sessions', 'planner_input', 'study_plan', 'study_plan_metadata'];
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val !== null) {
          localStorage.setItem(`backup_demo_${k}`, val);
        } else {
          localStorage.removeItem(`backup_demo_${k}`);
        }
      });

      // 2. Load curated datasets into state
      setTasks(getCuratedTasks());
      setExams(getCuratedExams());
      setMessages(getCuratedMessages());
      setStudySessions(getCuratedSessions());
      setPlannerInput(getCuratedPlannerInput());
      setStudyPlan(getCuratedStudyPlan());
      setStudyPlanMetadata(getCuratedStudyPlanMetadata());
      setPrevIsDemo(true);
    } else if (!isDemoMode && prevIsDemo) {
      // EXITING DEMO MODE
      // 1. Clear active demo values
      const keys = ['tasks', 'exams', 'chat_messages', 'study_sessions', 'planner_input', 'study_plan', 'study_plan_metadata'];
      keys.forEach(k => localStorage.removeItem(k));

      // 2. Restore backed up values
      const restTasks: Task[] = [];
      const restExams: Exam[] = [];
      const restMessages: ChatMessage[] = [...defaultMessages];
      const restSessions: StudySession[] = [];
      let restPlannerInput = defaultPlannerInput;
      let restStudyPlan: StudyDay[] = [];
      let restMetadata: StudyPlanMetadata | null = null;

      keys.forEach(k => {
        const val = localStorage.getItem(`backup_demo_${k}`);
        if (val !== null) {
          localStorage.setItem(k, val);
          localStorage.removeItem(`backup_demo_${k}`);
          const parsed = JSON.parse(val);
          if (k === 'tasks') restTasks.push(...parsed);
          else if (k === 'exams') restExams.push(...parsed);
          else if (k === 'chat_messages') {
            restMessages.length = 0;
            restMessages.push(...parsed);
          }
          else if (k === 'study_sessions') restSessions.push(...parsed);
          else if (k === 'planner_input') restPlannerInput = parsed;
          else if (k === 'study_plan') restStudyPlan = parsed;
          else if (k === 'study_plan_metadata') restMetadata = parsed;
        }
      });

      setTasks(restTasks);
      setExams(restExams);
      setMessages(restMessages);
      setStudySessions(restSessions);
      setPlannerInput(restPlannerInput);
      setStudyPlan(restStudyPlan);
      setStudyPlanMetadata(restMetadata);
      setPrevIsDemo(false);
    }
  }, [isDemoMode, prevIsDemo]);

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

  // Sync study plan metadata to localStorage
  useEffect(() => {
    localStorage.setItem('study_plan_metadata', JSON.stringify(studyPlanMetadata));
  }, [studyPlanMetadata]);

  // Sync study sessions to localStorage
  useEffect(() => {
    localStorage.setItem('study_sessions', JSON.stringify(studySessions));
  }, [studySessions]);

  // Event-based daily refresh system using lastActiveDate and visibility/focus checks
  const [currentDateStr, setCurrentDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  const checkDailyReset = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = localStorage.getItem('last_active_date');
    if (lastActive && lastActive !== today) {
      setCurrentDateStr(today);
      showToast("Welcome back! Today's study agenda has been updated.", "info");
    }
    localStorage.setItem('last_active_date', today);
  }, [showToast]);

  useEffect(() => {
    checkDailyReset();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDailyReset();
      }
    };
    const handleFocus = () => {
      checkDailyReset();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkDailyReset]);

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
      // Auto-log a study session for the task's estimated duration
      const durationMin = Math.round((task.estimatedHours || 1) * 60);
      const newSession: StudySession = {
        id: `session-task-${task.id}`,
        subject: task.subject,
        durationMinutes: durationMin,
        date: currentDateStr,
        timestamp: new Date().toISOString()
      };
      setStudySessions(prev => [newSession, ...prev]);

      setTasks(prev => prev.map(t => t.id === id ? { 
        ...t, 
        completed: true, 
        completedAt: currentDateStr 
      } : t));
      showToast('Task completed! Study hours logged.', 'success');
    } else {
      // Remove any auto-logged session matching this task
      setStudySessions(prev => prev.filter(s => s.id !== `session-task-${task.id}`));

      setTasks(prev => prev.map(t => t.id === id ? { 
        ...t, 
        completed: false, 
        completedAt: undefined 
      } : t));
      showToast('Task marked active.', 'info');
    }
  }, [tasks, currentDateStr, showToast]);

  const deleteTask = useCallback((id: string) => {
    const target = tasks.find(t => t.id === id);
    if (target) {
      setStudySessions(prev => prev.filter(s => s.id !== `session-task-${id}`));
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
    
    // Seeded randomness for dynamic replies in demo mode
    const sortedSubjects = [...plannerInput.subjects].sort();
    const inputSeed = sortedSubjects.join(',') + `:${plannerInput.dailyHours}`;
    const seedHash = getSimpleHash(userText + ':' + inputSeed);
    const rng = new SeededRandom(seedHash);

    let reply = "";
    let suggestedTasks: Omit<Task, 'id' | 'completed'>[] | undefined = undefined;

    const motivationalClosing = [
      " Keep up the great work and stay consistent!",
      " Remember, steady progress yields the best results.",
      " You've got this! One step at a time.",
      " Stay focused, take breaks, and let's achieve your goals!",
      " We've mapped out the key targets; you're on track to succeed."
    ];

    if (textLower.includes('schedule') || textLower.includes('plan') || textLower.includes('study')) {
      const intros = [
        "I've structured a study plan for your upcoming exams.",
        "Here is a customized study proposal based on your requirements.",
        "I've updated your learning roadmap with focused review targets."
      ];
      const details = [
        "Based on your current load, you should prioritize Calculus today. Would you like me to schedule a 2-hour review task for Calculus?",
        "To maximize efficiency, I suggest allocating a dedicated revision block to Calculus functions today. Should I add this?",
        "I recommend checking Calculus concepts and working through core problems today. Let's schedule a 2-hour review task."
      ];
      
      reply = rng.select(intros) + " " + rng.select(details) + rng.select(motivationalClosing);
      suggestedTasks = [
        { title: "Calculus Exam Review (Functions & Integrals)", subject: "Mathematics", priority: rng.select(["High", "Medium"] as const), estimatedHours: 2, dueDate: new Date().toISOString().split('T')[0] }
      ];
    } else if (textLower.includes('chemistry') || textLower.includes('organic')) {
      const intros = [
        "Organic Chemistry Chapter 4 covers electrophilic additions.",
        "We need to tackle electrophilic reaction mechanisms for your Chemistry Chapter 4 review.",
        "To master Chapter 4 Organic Chemistry, visualizing step-by-step pathways is crucial."
      ];
      const details = [
        "I recommend outlining the key reaction mechanisms and drawing transition states. Shall we create a Chemistry study session for tomorrow?",
        "I suggest practice drawings of the transition states to cement the mechanisms. Shall we add a Chemistry session tomorrow?",
        "Try drawing electrophilic additions on your scratchpad. I can create a chemistry study task for you tomorrow."
      ];
      
      reply = rng.select(intros) + " " + rng.select(details) + rng.select(motivationalClosing);
      suggestedTasks = [
        { title: "Draw Organic Chemistry Reaction Mechanisms", subject: "Chemistry", priority: rng.select(["High", "Medium"] as const), estimatedHours: 1.5, dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] }
      ];
    } else if (textLower.includes('calculus') || textLower.includes('math')) {
      const intros = [
        "Calculus III double integrals require visualizing coordinate bounds.",
        "Mastering double integrals in Calculus requires drawing the integration regions.",
        "Calculus bounds can be tricky to analyze without visual coordinate sheets."
      ];
      const details = [
        "I suggest resolving 5 integration sheets. Let's add this task to your planner.",
        "I recommend working through 5 integration problems under timed conditions. Shall we add this?",
        "Try solving 5 practice questions focusing on polar coordinates bounds. Let's schedule this task."
      ];
      
      reply = rng.select(intros) + " " + rng.select(details) + rng.select(motivationalClosing);
      suggestedTasks = [
        { title: "Solve Double Integrals Worksheet", subject: "Mathematics", priority: rng.select(["Medium", "Low"] as const), estimatedHours: 3, dueDate: new Date().toISOString().split('T')[0] }
      ];
    } else {
      const intros = [
        "I've analyzed your schedule.",
        "Looking closely at your task checklist,",
        "Based on your upcoming deadlines,"
      ];
      const details = [
        "You have a Chemistry midterm exam coming up in 3 days. I recommend a focused 2-hour session on Molecular Orbitals and synthesis pathway reviews. I can add this study slot to your list directly!",
        "Your Chemistry midterm is only 3 days away. I suggest spending 2 hours reviewing Molecular Orbitals and reactions. Let's schedule this session!",
        "With your Chemistry midterm in 3 days, a 2-hour block on molecular orbital configuration is ideal. Should we insert this task?"
      ];
      
      reply = rng.select(intros) + " " + rng.select(details) + rng.select(motivationalClosing);
      suggestedTasks = [
        { title: "Study Chemistry Molecular Orbitals", subject: "Chemistry", priority: rng.select(["High", "Medium"] as const), estimatedHours: 2, dueDate: new Date().toISOString().split('T')[0] }
      ];
    }

    if (suggestedTasks) {
      suggestedTasks = rng.shuffle(suggestedTasks);
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toISOString(),
      suggestedTasks
    };

    setMessages(prev => [...prev, aiMsg]);
  }, [plannerInput]);

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

  const addStudySession = useCallback((session: Omit<StudySession, 'id' | 'timestamp'>) => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...session
    };
    setStudySessions(prev => [newSession, ...prev]);
    showToast(`Logged ${session.durationMinutes} min of ${session.subject}!`, 'success');
  }, [showToast]);

  const addSubject = useCallback((subject: string) => {
    if (!subject) return;
    setPlannerInput(prev => {
      if (prev.subjects.includes(subject)) return prev;
      showToast(`Subject added: ${subject}`, 'success');
      return { ...prev, subjects: [...prev.subjects, subject] };
    });
  }, [showToast]);

  const deleteSubject = useCallback((subject: string) => {
    setPlannerInput(prev => {
      const nextSubjects = prev.subjects.filter(s => s !== subject);
      const nextExamDates = { ...prev.examDates };
      delete nextExamDates[subject];
      showToast(`Subject removed: ${subject}`, 'info');
      return { ...prev, subjects: nextSubjects, examDates: nextExamDates };
    });
  }, [showToast]);

  const togglePlanTaskComplete = useCallback((dateStr: string, taskId: string) => {
    const day = studyPlan.find(d => d.date === dateStr);
    const task = day?.tasks.find(t => t.id === taskId);
    if (!task) return;
    const nextCompleted = !task.completed;

    if (nextCompleted) {
      const durationMin = Math.round((task.estimatedHours || 1) * 60);
      const newSession: StudySession = {
        id: `session-plan-${taskId}`,
        subject: task.subject,
        durationMinutes: durationMin,
        date: dateStr,
        timestamp: new Date().toISOString()
      };
      setStudySessions(prev => [newSession, ...prev]);
      
      setStudyPlan(prev => prev.map(d => {
        if (d.date === dateStr) {
          return {
            ...d,
            tasks: d.tasks.map(t => t.id === taskId ? { ...t, completed: true, completedAt: dateStr } : t)
          };
        }
        return d;
      }));
      showToast('Revision task completed! Streak updated.', 'success');
    } else {
      setStudySessions(prev => prev.filter(s => s.id !== `session-plan-${taskId}`));
      setStudyPlan(prev => prev.map(d => {
        if (d.date === dateStr) {
          return {
            ...d,
            tasks: d.tasks.map(t => t.id === taskId ? { ...t, completed: false, completedAt: undefined } : t)
          };
        }
        return d;
      }));
      showToast('Revision task marked active.', 'info');
    }
  }, [studyPlan, showToast]);

  // Dynamic calculations from studySessions
  const studyHistory = useMemo(() => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Find start of current calendar week (Monday)
    const today = new Date(currentDateStr);
    const currentDay = today.getDay(); // 0 Sunday, 1 Monday, etc.
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    return daysOfWeek.map((day, index) => {
      const target = new Date(monday);
      target.setDate(monday.getDate() + index);
      const dateStr = target.toISOString().split('T')[0];

      const minutes = studySessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      return {
        day,
        hours: Number((minutes / 60).toFixed(1))
      };
    });
  }, [studySessions, currentDateStr]);

  const streakCount = useMemo(() => {
    const activeDates = new Set<string>();
    
    // Completed custom tasks
    tasks.forEach(t => {
      if (t.completed && t.completedAt) activeDates.add(t.completedAt);
    });

    // Completed AI plan tasks
    studyPlan.forEach(day => {
      day.tasks.forEach(t => {
        if (t.completed && t.completedAt) activeDates.add(t.completedAt);
      });
    });

    // Logged study sessions
    studySessions.forEach(s => {
      activeDates.add(s.date);
    });

    if (activeDates.size === 0) return 0;

    let streak = 0;
    const checkDate = new Date(currentDateStr);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };

    if (activeDates.has(formatDate(checkDate))) {
      while (activeDates.has(formatDate(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (activeDates.has(formatDate(checkDate))) {
        while (activeDates.has(formatDate(checkDate))) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    return streak;
  }, [tasks, studyPlan, studySessions, currentDateStr]);

  const overallProgress = useMemo(() => {
    const last7Days: string[] = [];
    const temp = new Date(currentDateStr);
    for (let i = 0; i < 7; i++) {
      const y = temp.getFullYear();
      const m = String(temp.getMonth() + 1).padStart(2, '0');
      const d = String(temp.getDate()).padStart(2, '0');
      last7Days.push(`${y}-${m}-${d}`);
      temp.setDate(temp.getDate() - 1);
    }

    let totalItems = 0;
    let completedItems = 0;

    tasks.forEach(t => {
      if (last7Days.includes(t.dueDate)) {
        totalItems++;
        if (t.completed) completedItems++;
        if (t.revisionBlocks) {
          totalItems += t.revisionBlocks.length;
          if (t.completed) completedItems += t.revisionBlocks.length;
        }
      }
    });

    studyPlan.forEach(day => {
      if (last7Days.includes(day.date)) {
        day.tasks.forEach(t => {
          totalItems++;
          if (t.completed) completedItems++;
          if (t.revisionBlocks) {
            totalItems += t.revisionBlocks.length;
            if (t.completed) completedItems += t.revisionBlocks.length;
          }
        });
      }
    });

    studySessions.forEach(s => {
      if (last7Days.includes(s.date)) {
        totalItems++;
        completedItems++;
      }
    });

    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  }, [tasks, studyPlan, studySessions, currentDateStr]);

  // Derived tasks completion rate stats
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = totalTasks - completedTasksCount;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  
  const totalStudyHoursThisWeek = useMemo(() => {
    return studyHistory.reduce((sum, item) => sum + item.hours, 0).toFixed(1);
  }, [studyHistory]);

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
    studySessions,
    addStudySession,
    streakCount,
    overallProgress,
    currentDateStr,
    addSubject,
    deleteSubject,
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
    studySessions,
    addStudySession,
    streakCount,
    overallProgress,
    currentDateStr,
    addSubject,
    deleteSubject,
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
