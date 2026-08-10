import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import AnimatedPage from '../components/layout/AnimatedPage';
import Spotlight from '../components/ui/Spotlight';
import { 
  Library, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  Lightbulb, 
  Save
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  updatedAt: string;
}

const Resources: React.FC = () => {
  const { plannerInput } = useStudy();
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('study_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState('General');

  useEffect(() => {
    localStorage.setItem('study_notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    const defaultSub = plannerInput.subjects[0] || 'General';
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      subject: defaultSub,
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setNoteTitle(newNote.title);
    setNoteContent(newNote.content);
    setNoteSubject(newNote.subject);
  };

  const handleSaveNote = () => {
    if (!selectedNoteId) return;
    setNotes(prev => prev.map(n => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: noteTitle || 'Untitled Note',
          content: noteContent,
          subject: noteSubject,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteSubject('General');
    }
  };

  const selectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubject(note.subject);
  };


  // Hardcoded premium tips/study guidelines for a SaaS educational application
  const studyGuides = [
    {
      subject: 'Chemistry',
      tip: 'Organic chemistry reactions require spatial memorization. Draw transition state geometry on a physical scratchpad to retain electrophilic addition rules.'
    },
    {
      subject: 'Mathematics',
      tip: 'Calculus III triple integrals require bounding sheets projection. Project the 3D volume onto a coordinate plane (XY, YZ, or XZ) to correctly define limits.'
    },
    {
      subject: 'Physics',
      tip: 'Electromagnetic field equations rely heavily on vector calculus. Relate Gauss\'s Law to physical flux geometry rather than memorizing algebraic components.'
    }
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-mesh text-text-primary dark:text-slate-100 transition-colors duration-300 relative">
        <Spotlight />
        <Sidebar />
        
        <div className="md:pl-64 min-h-screen transition-all duration-300">
          <div className="pt-20 md:pt-8 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-text-primary dark:text-text-primary">Resources & Study Notes</h1>
              <p className="text-text-secondary dark:text-text-muted text-sm font-semibold">Store notes, review subject study guidelines, and customize your strategic cheat sheets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notes Sidebar & Guidelines (1 Col) */}
            <div className="space-y-6">
              
              {/* Note creator widget */}
              <GlassCard hover={false} className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-border-primary/40 dark:border-border-primary/40 pb-3 mb-4">
                  <h3 className="font-heading font-black text-md text-text-primary dark:text-text-primary flex items-center gap-2">
                    <Library className="w-5 h-5 text-brand-primary" />
                    <span>My Notes</span>
                  </h3>
                  <button
                    onClick={handleCreateNote}
                    className="p-1.5 rounded-lg bg-bg-primary hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-950 text-text-secondary hover:text-brand-primary transition-colors active:scale-95 cursor-pointer"
                    aria-label="Create note"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-text-muted dark:text-text-secondary">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold">No notes stored yet.</p>
                    </div>
                  ) : (
                    notes.map(note => (
                      <button
                        key={note.id}
                        onClick={() => selectNote(note)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          selectedNoteId === note.id
                            ? 'bg-brand-primary/10 border-primary-500 text-brand-primary dark:text-primary-350'
                            : 'bg-surface-primary/40 dark:bg-surface-primary/40 border-border-primary/50 dark:border-border-primary/40 hover:bg-surface-primary dark:hover:bg-slate-850/60'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate text-text-primary dark:text-slate-200">{note.title}</p>
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-bg-primary/55 dark:bg-slate-800 text-text-secondary rounded mt-1.5 inline-block">
                            {note.subject}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 rounded-md text-text-muted hover:text-red-500 transition-colors"
                          aria-label={`Delete note ${note.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </button>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Guidelines Card */}
              <GlassCard hover={false} className="p-5 bg-gradient-to-tr from-primary-600/5 to-transparent border border-primary-500/10">
                <h3 className="font-heading font-black text-md text-text-primary dark:text-text-primary flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>Strategic Study Tips</span>
                </h3>
                <div className="space-y-4">
                  {studyGuides.map((guide, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary dark:text-brand-primary">
                        {guide.subject}
                      </span>
                      <p className="text-xs text-slate-655 dark:text-slate-350 font-semibold leading-relaxed">
                        "{guide.tip}"
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>

            {/* Note Editor Area (2 Cols) */}
            <div className="lg:col-span-2">
              <GlassCard hover={false} className="h-full p-6 flex flex-col justify-between min-h-[400px]">
                {selectedNoteId ? (
                  <div className="space-y-4 flex flex-col h-full">
                    {/* Note title & subject */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-border-primary/40 dark:border-border-primary/40 pb-4">
                      <input
                        type="text"
                        placeholder="Note Title"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="font-heading font-black text-xl text-text-primary dark:text-text-primary bg-transparent border-none focus:outline-none placeholder-slate-400 w-full"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={noteSubject}
                          onChange={(e) => setNoteSubject(e.target.value)}
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-surface-primary/60 dark:bg-surface-primary border border-border-primary dark:border-border-primary focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary dark:text-text-primary"
                        >
                          <option value="General">General</option>
                          {plannerInput.subjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleSaveNote}
                          className="px-3.5 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-extrabold hover:bg-brand-primary transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>

                    {/* Note content input */}
                    <textarea
                      placeholder="Start typing your study notes here..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full flex-1 min-h-[300px] text-xs font-semibold leading-relaxed text-slate-750 dark:text-slate-200 bg-transparent border-none focus:outline-none resize-none placeholder-slate-400 py-2"
                    />
                  </div>
                ) : (
                  <div className="my-auto text-center py-20 text-text-muted dark:text-text-secondary">
                    <Sparkles className="w-12 h-12 text-brand-primary/20 mx-auto mb-3" />
                    <h4 className="font-heading font-black text-lg text-text-primary dark:text-text-primary mb-1">Select or Create a Note</h4>
                    <p className="text-xs font-semibold text-text-secondary mb-4">Draft review guides and keep summaries in a single place.</p>
                    <button
                      onClick={handleCreateNote}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Note</span>
                    </button>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AnimatedPage>
);
};

export default Resources;
