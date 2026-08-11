export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  completed: boolean;
  isGenerated?: boolean;
  revisionBlocks?: string[];
  completedAt?: string;
  
  // Upgraded syllabus fields
  sessionType?: 'Study' | 'Revision' | 'Practical' | 'Mock Test';
  topic?: string;
  weekNum?: number;
  dayNum?: number;
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO String
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  location: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedTasks?: Omit<Task, 'id' | 'completed'>[];
}

export interface SubjectSyllabus {
  subject: string;
  fileName: string;
  fileSize: number;
  extractedText: string;
  structuredSyllabus?: ExtractedSyllabus;
}

export interface ExtractedSyllabus {
  units: {
    unitName: string;
    chapters: {
      chapterName: string;
      topics: string[];
    }[];
  }[];
  practicals: string[];
  revisions: string[];
}

export interface ExamDetails {
  date: string;
  type: 'Midterm' | 'Final' | 'University' | 'Competitive';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: 'High' | 'Medium' | 'Low';
}

export interface Availability {
  dailyHours: number;
  preferredTime: 'Morning' | 'Afternoon' | 'Evening';
  sessionLength: number; // e.g. 25, 50, 90 mins
  weeklyOffDay: string; // e.g. "Sunday" or "None"
}

export interface PlannerInput {
  subjects: string[];
  syllabuses?: Record<string, SubjectSyllabus>;
  exams?: Record<string, ExamDetails>;
  availability?: Availability;
  examDates?: Record<string, string>; // Legacy support mapping
  dailyHours?: number; // Legacy support
}

export interface StudyDay {
  date: string;
  tasks: Task[];
}

export interface StudyPlanMetadata {
  generationSource: 'gemini' | 'cache' | 'fallback' | 'demo';
  promptVersion: string;
  generatedAt: string;
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
  motivationalIntro?: string;
  studyStrategy?: string;
  
  // Upgraded metadata tracking
  riskAreas?: string[];
  estimatedCompletionDate?: string;
  recommendedRevisionInterval?: string;
  pomodoroStructure?: string;
  finalWeekStrategy?: string;
  syllabusesParsed?: Record<string, ExtractedSyllabus>;
}

export interface StudyPlanResult {
  schedule: StudyDay[];
  metadata: StudyPlanMetadata;
}
