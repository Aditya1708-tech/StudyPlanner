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

export interface PlannerInput {
  subjects: string[];
  examDates: Record<string, string>;
  dailyHours: number;
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
}

export interface StudyPlanResult {
  schedule: StudyDay[];
  metadata: StudyPlanMetadata;
}
