import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Plus, 
  BookOpen, 
  Terminal, 
  ArrowRight,
  User,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Assistant = () => {
  const { 
    messages, 
    sendChatMessage, 
    clearChatHistory, 
    addTask 
  } = useStudy();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedTasks, setAddedTasks] = useState({}); // track added task IDs to show "Added Checkmark"
  
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendChatMessage(input.trim());
    setInput('');
    setIsTyping(true);

    // Turn off typing animation after delay (corresponds to Context's AI response trigger)
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = (promptText) => {
    sendChatMessage(promptText);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleAddSuggestedTask = (task, msgId) => {
    addTask({
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      dueDate: task.dueDate
    });

    // Mark as added
    setAddedTasks(prev => ({
      ...prev,
      [msgId]: true
    }));
  };

  const samplePrompts = [
    { text: "Create study plan for Chemistry", label: "Chemistry Schedule" },
    { text: "Help me study for Calculus exam", label: "Calculus Prep" },
    { text: "Summarize photosynthentic lab reports", label: "Biology Summary" },
    { text: "Suggest tasks for Physics outlining", label: "Physics Tasks" }
  ];

  return (
    <div className="min-h-screen bg-mesh text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="md:pl-64 min-h-screen transition-all duration-300 flex flex-col">
        <div className="pt-20 md:pt-8 p-6 md:p-10 max-w-6xl w-full mx-auto flex-1 flex flex-col gap-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-black text-3xl tracking-tight">AI Study Assistant</h1>
              <p className="text-slate-500 dark:text-slate-450 text-sm font-semibold">Ask queries, explain concepts, or auto-schedule study plans.</p>
            </div>
            
            <button
              onClick={clearChatHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all active:scale-95"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>

          {/* Main Workspace split */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[450px]">
            
            {/* Left Prompt Guide column (1 col on desktop) */}
            <div className="lg:col-span-1 space-y-4">
              <GlassCard hover={false} className="p-5 space-y-4 h-full flex flex-col">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-white border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <span className="font-heading font-extrabold text-sm uppercase tracking-wide">Quick Prompts</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold leading-relaxed">
                  Click any standard template prompt below to load a conversational plan instantly:
                </p>
                <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.text)}
                      className="whitespace-nowrap lg:whitespace-normal text-left px-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/20 hover:bg-primary-500/5 hover:border-primary-500/30 text-xs font-bold text-slate-650 dark:text-slate-350 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-between gap-2"
                    >
                      <span>{prompt.label}</span>
                      <ArrowRight className="w-3 h-3 hidden lg:block" />
                    </button>
                  ))}
                </div>
                
                {/* Visual AI Help Card */}
                <div className="mt-auto hidden lg:block p-4 rounded-xl bg-gradient-to-tr from-primary-600/10 to-pink-500/10 border border-primary-500/15">
                  <h4 className="font-extrabold text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" /> Tasks Integration
                  </h4>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold mt-1">
                    Ask me: "Suggest a Chemistry schedule" and you can add tasks instantly via the chat window!
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Right Chat Column (3 cols on desktop) */}
            <div className="lg:col-span-3 flex flex-col h-[550px] lg:h-auto">
              <GlassCard hover={false} className="flex-1 flex flex-col p-4 overflow-hidden h-full relative">
                
                {/* Chat Log container */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 max-h-[420px] lg:max-h-none">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-3.5 max-w-[85%] ${
                          msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center border font-bold text-xs ${
                          msg.sender === 'user'
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/15'
                        }`}>
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </div>

                        {/* Content bubble */}
                        <div className="space-y-3.5">
                          <div className={`px-4.5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-tr from-primary-600 to-indigo-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850/60 rounded-tl-none text-slate-750 dark:text-slate-250 shadow-sm'
                          }`}>
                            <p>{msg.text}</p>
                          </div>

                          {/* Dynamic Task Attachment (If AI suggests a task) */}
                          {msg.sender === 'ai' && msg.suggestedTasks && (
                            <div className="pl-2.5">
                              {msg.suggestedTasks.map((task, sIdx) => {
                                const isAdded = addedTasks[msg.id];
                                return (
                                  <div 
                                    key={sIdx}
                                    className="p-3.5 rounded-xl border border-primary-500/20 bg-primary-500/5 max-w-sm flex items-center justify-between gap-4 transition-all"
                                  >
                                    <div>
                                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-white leading-snug">{task.title}</h5>
                                      <p className="text-[10px] text-slate-450 mt-0.5">{task.subject} • {task.estimatedHours}h</p>
                                    </div>
                                    <button
                                      onClick={() => handleAddSuggestedTask(task, msg.id)}
                                      disabled={isAdded}
                                      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg font-black text-[10px] transition-all active:scale-95 ${
                                        isAdded 
                                          ? 'bg-emerald-500 text-white cursor-default'
                                          : 'bg-primary-650 hover:bg-primary-600 text-white hover:shadow shadow-primary-500/10'
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Scheduled</span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>Add to Planner</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Loader */}
                  {isTyping && (
                    <div className="flex items-center gap-3.5 mr-auto max-w-[80%]">
                      <div className="w-8.5 h-8.5 rounded-full bg-primary-500 text-white flex items-center justify-center animate-pulse shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850/60 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Bottom Input Area */}
                <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask study tips, explain 'molecular orbitals', or type standard queries..."
                    className="flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl bg-slate-100/55 dark:bg-slate-900/60 border border-slate-250 dark:border-slate-850 focus:outline-none focus:border-primary-500/70 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="p-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>

              </GlassCard>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Assistant;
