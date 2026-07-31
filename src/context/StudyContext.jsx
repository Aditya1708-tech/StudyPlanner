import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();

export const useStudy = () => useContext(StudyContext);

const defaultTasks = [
  { id: '1', title: 'Review Chemistry Chapter 4 (Organic Synthesis)', subject: 'Chemistry', dueDate: new Date().toISOString().split('T')[0], priority: 'High', estimatedHours: 2, completed: false },
  { id: '2', title: 'Solve Calculus III Practice Set 5', subject: 'Mathematics', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], priority: 'Medium', estimatedHours: 3, completed: false },
  { id: '3', title: 'Draft Biology Lab Report on Photosynthesis', subject: 'Biology', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], priority: 'Low', estimatedHours: 1.5, completed: false },
  { id: '4', title: 'Outline Physics Term Project Architecture', subject: 'Physics', dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], priority: 'High', estimatedHours: 4, completed: true }
];

const defaultExams = [
  { id: '1', subject: 'Chemistry', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], name: 'Chemistry Midterm Exam', location: 'Hall A' },
  { id: '2', subject: 'Mathematics', date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], name: 'Calculus Final Assessment', location: 'Seminar Room B' },
  { id: '3', subject: 'Physics', date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], name: 'Advanced Physics Term Quiz', location: 'Lab Room 102' }
];

const defaultMessages = [
  { id: 'msg-1', sender: 'ai', text: "Hello! I am your StudyAI assistant. I can analyze your study tasks, create structured review plans, explain complex topics, or generate new tasks directly for your calendar. What subject are we tackling today?", timestamp: new Date(Date.now() - 600000).toISOString() }
];

export const StudyProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Tasks state
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  // Exams state
  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('exams');
    return saved ? JSON.parse(saved) : defaultExams;
  });

  // Chat messages state
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : defaultMessages;
  });

  // Active study hours historical log (for analytics charts)
  const [studyHistory, setStudyHistory] = useState([
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 5.5 },
    { day: 'Thu', hours: 6.0 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 2.5 },
    { day: 'Sun', hours: 0 }
  ]);

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

  // Actions
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      completed: false,
      ...task
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskComplete = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        // Mock analytics: if completing a task, add estimated hours to today's study history (Sunday / last day in log)
        const updatedCompleted = !task.completed;
        if (updatedCompleted) {
          setStudyHistory(history => history.map((item, idx) => {
            if (idx === history.length - 1) { // Add to current day
              return { ...item, hours: Math.min(12, item.hours + Number(task.estimatedHours || 1)) };
            }
            return item;
          }));
        }
        return { ...task, completed: updatedCompleted };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addExam = (exam) => {
    const newExam = {
      id: Date.now().toString(),
      ...exam
    };
    setExams(prev => [...prev, newExam].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const deleteExam = (id) => {
    setExams(prev => prev.filter(exam => exam.id !== id));
  };

  const sendChatMessage = (text, sender = 'user') => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);

    if (sender === 'user') {
      // Simulate AI response trigger after a short delay
      setTimeout(() => {
        generateAIResponse(text);
      }, 1000);
    }
  };

  const generateAIResponse = (userText) => {
    const textLower = userText.toLowerCase();
    let reply = "";
    let suggestedTasks = null;

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

    const aiMsg = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toISOString(),
      suggestedTasks // Attach suggested tasks so Assistant page can display a button
    };

    setMessages(prev => [...prev, aiMsg]);
  };

  const clearChatHistory = () => {
    setMessages(defaultMessages);
  };

  // Dynamic calculated stats
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = totalTasks - completedTasksCount;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Study hours this week sum
  const totalStudyHoursThisWeek = studyHistory.reduce((sum, item) => sum + item.hours, 0).toFixed(1);

  return (
    <StudyContext.Provider value={{
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
      totalStudyHoursThisWeek
    }}>
      {children}
    </StudyContext.Provider>
  );
};
