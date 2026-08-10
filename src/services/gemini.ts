import { PlannerInput, StudyDay, Task, StudyPlanResult } from '../types';
import { logger } from '../utils/logger';
import { ENV } from '../utils/env';
import { PROMPT_VERSION, buildPlannerPrompt } from './prompts';
import { getSimpleHash, SeededRandom } from '../utils/random';

/**
 * Structured Analytics Payload schema.
 */
interface AnalyticsPayload {
  event: 'generation_started' | 'generation_succeeded' | 'generation_failed' | 'fallback_used' | 'cache_hit';
  promptVersion: string;
  cacheKey?: string;
  generationTimeMs?: number;
  source: 'gemini' | 'cache' | 'fallback' | 'demo';
  error?: string;
}

/**
 * Logs structured analytics JSON payloads.
 */
const logAnalytics = (payload: AnalyticsPayload) => {
  logger.info(`[ANALYTICS] ${JSON.stringify(payload)}`);
};

/**
 * Generates a deterministic cache key derived from inputs and prompt version.
 */
export const generateCacheKey = (input: PlannerInput): string => {
  const sortedSubjects = [...input.subjects].sort();
  const sortedDates = sortedSubjects.map(sub => `${sub}:${input.examDates[sub] || ''}`).join(',');
  return `studyplan_cache:${PROMPT_VERSION}:${sortedSubjects.join(',')}:${sortedDates}:${input.dailyHours}`;
};

/**
 * Retrieves a plan from localStorage cache.
 */
export const getCachedPlan = (input: PlannerInput): StudyPlanResult | null => {
  const key = generateCacheKey(input);
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as StudyPlanResult;
  } catch {
    return null;
  }
};

/**
 * Writes a plan to localStorage cache.
 */
export const cachePlan = (input: PlannerInput, result: StudyPlanResult) => {
  const key = generateCacheKey(input);
  try {
    localStorage.setItem(key, JSON.stringify(result));
  } catch (err) {
    logger.warn('Failed to save study plan to cache', err);
  }
};

/**
 * Validates and sanitizes the JSON response from Gemini against our schema
 */
export const validateStudyPlan = (data: unknown): { schedule: StudyDay[]; estimatedDifficulty: 'easy' | 'medium' | 'hard' } => {
  if (!data || typeof data !== 'object') {
    throw new Error("Invalid response format: expected an object");
  }
  
  const dataObj = data as Record<string, unknown>;
  const rawSchedule = Array.isArray(data) ? data : dataObj.schedule;
  
  if (!Array.isArray(rawSchedule)) {
    throw new Error("Invalid response format: 'schedule' array is missing or invalid");
  }
  
  const validatedSchedule: StudyDay[] = [];
  
  rawSchedule.forEach((day: unknown) => {
    if (!day || typeof day !== 'object') {
      return; // Skip invalid days
    }
    const dayObj = day as Record<string, unknown>;
    if (!dayObj.date || typeof dayObj.date !== 'string') {
      return; // Skip invalid days
    }
    const dateStr = dayObj.date as string;
    
    const rawTasks = dayObj.tasks;
    if (!Array.isArray(rawTasks)) {
      return; // Skip if tasks is not an array
    }
    
    const validatedTasks: Task[] = [];
    rawTasks.forEach((task: unknown, idx: number) => {
      if (!task || typeof task !== 'object') {
        return; // Skip invalid tasks
      }
      const taskObj = task as Record<string, unknown>;
      if (!taskObj.title || typeof taskObj.title !== 'string') {
        return; // Skip invalid tasks
      }
      
      const subject = typeof taskObj.subject === 'string' && taskObj.subject ? taskObj.subject : 'General';
      const priority = typeof taskObj.priority === 'string' && ['High', 'Medium', 'Low'].includes(taskObj.priority) 
        ? (taskObj.priority as 'High' | 'Medium' | 'Low') 
        : 'Medium';
      
      const estimatedHours = typeof taskObj.estimatedHours === 'number' && taskObj.estimatedHours > 0 
        ? Number(taskObj.estimatedHours.toFixed(1)) 
        : 1.5;

      const rawRevisionBlocks = taskObj.revisionBlocks;
      const revisionBlocks = Array.isArray(rawRevisionBlocks)
        ? rawRevisionBlocks.filter(block => typeof block === 'string')
        : ['Concept review'];
        
      validatedTasks.push({
        id: `gen-${dateStr}-${subject.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
        title: taskObj.title,
        subject,
        dueDate: dateStr,
        priority,
        estimatedHours,
        completed: false,
        isGenerated: true,
        revisionBlocks: revisionBlocks.length > 0 ? revisionBlocks : ['Concept review']
      });
    });
    
    if (validatedTasks.length > 0) {
      validatedSchedule.push({
        date: dateStr,
        tasks: validatedTasks
      });
    }
  });
  
  if (validatedSchedule.length === 0) {
    throw new Error("No valid study days or tasks found in the generated response");
  }
  
  let estimatedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  const rawDifficulty = String(dataObj.estimatedDifficulty).toLowerCase();
  if (['easy', 'medium', 'hard'].includes(rawDifficulty)) {
    estimatedDifficulty = rawDifficulty as 'easy' | 'medium' | 'hard';
  }
  
  // Sort schedule by date ascending
  return {
    schedule: validatedSchedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    estimatedDifficulty
  };
};

const revisionPools: Record<string, string[]> = {
  Chemistry: [
    "Organic chemistry mechanisms review",
    "Chemical kinetics problem solving",
    "Acid-base titration practice",
    "Periodic table trends mapping",
    "Molecular orbitals visualization",
    "Lab procedures safety check",
    "Thermodynamics in chemistry drills"
  ],
  Mathematics: [
    "Calculus limits and continuity",
    "Double integration sheet review",
    "Differential equations drills",
    "Linear algebra matrix proofs",
    "Formula sheet consolidation",
    "Taylor series expansion checks",
    "Vector calculus visualizations"
  ],
  Physics: [
    "Kinematics equations review",
    "Newtonian mechanics diagramming",
    "Electromagnetic field equations",
    "Quantum wave functions study",
    "Optics refraction worksheets",
    "Formula quick consolidation",
    "Thermodynamics phase diagrams"
  ],
  General: [
    "Core syllabus checklist overview",
    "Active recall conceptual drills",
    "Flashcard matching reviews",
    "Concept map mapping sessions",
    "Practice test papers simulation",
    "Study guide summary reading"
  ]
};

/**
 * Fallback study plan generator in case Gemini API is unavailable or returns an error.
 * This generates a high-quality personalized schedule locally using an algorithm.
 */
export const generateLocalFallbackPlan = (
  input: PlannerInput,
  rng?: SeededRandom
): StudyPlanResult => {
  const { subjects, examDates, dailyHours } = input;
  const plan: StudyDay[] = [];
  const today = new Date();
  
  // Generate schedule for the next 7 days
  const daysToGenerate = 7;
  
  for (let i = 0; i < daysToGenerate; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Weekend capacity check (Sat/Sun get 1.5x cap)
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const capacity = isWeekend ? Math.min(12, dailyHours * 1.5) : dailyHours;
    
    // Synthesis day check (every 4th day)
    const isSynthesisDay = (i + 1) % 4 === 0;

    let dayTasks: Task[] = [];
    let hoursAllocated = 0;
    
    // Sort subjects by closest exam date first to prioritize
    const sortedSubjects = [...subjects].sort((a, b) => {
      const dateA = examDates[a] ? new Date(examDates[a]).getTime() : Infinity;
      const dateB = examDates[b] ? new Date(examDates[b]).getTime() : Infinity;
      return dateA - dateB;
    });
    
    sortedSubjects.forEach((subject, idx) => {
      const examDateStr = examDates[subject];
      if (!examDateStr) return;
      
      const examDate = new Date(examDateStr);
      examDate.setHours(0,0,0,0);
      
      const tempCurrent = new Date(dateStr);
      tempCurrent.setHours(0,0,0,0);
      
      const diffTime = examDate.getTime() - tempCurrent.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Schedule prep if the exam is in the future
      if (daysLeft >= 0 && hoursAllocated < capacity) {
        let taskHours = 1.5;
        if (daysLeft === 0) {
          taskHours = 2.0; // intense mock prep
        } else if (daysLeft <= 2) {
          taskHours = isWeekend ? 2.5 : 2.0; // intense weekend prep
        } else if (daysLeft > 6) {
          taskHours = 1.0; // light summary review
        }
        
        // Clamp to remaining capacity
        taskHours = Math.min(taskHours, capacity - hoursAllocated);
        if (taskHours < 0.5) return; // Skip if less than 30 mins
        
        let priority: 'High' | 'Medium' | 'Low' = 'Low';
        let action = "Read syllabus and key concepts of";
        let revisionBlocks = ["General overview", "Syllabus reading"];
        
        if (isSynthesisDay) {
          priority = 'Medium';
          action = "Active recall review and formula mapping for";
          revisionBlocks = ["Synthesis mapping", "Active recall drills"];
        } else if (daysLeft === 0) {
          priority = 'High';
          action = "Final review and mock exam cramming for";
          revisionBlocks = ["Mock exams", "Final review checklist"];
        } else if (daysLeft <= 2) {
          priority = 'High';
          action = "Solve past mock exams and practice questions for";
          revisionBlocks = ["Practice sheets", "Mechanism reviews"];
        } else if (daysLeft <= 5) {
          priority = 'Medium';
          action = "Draft mindmaps and outline core topics for";
          revisionBlocks = ["Core concept outline", "Mindmapping"];
        }
        
        if (rng) {
          priority = rng.select(['High', 'Medium', 'Low'] as const);
          
          const pool = revisionPools[subject] || revisionPools.General;
          const numBlocks = rng.nextInt(2, 4); // 2 or 3 revision blocks
          const selectedBlocks: string[] = [];
          const tempPool = [...pool];
          for (let b = 0; b < numBlocks && tempPool.length > 0; b++) {
            const idxBlock = rng.nextInt(0, tempPool.length);
            selectedBlocks.push(tempPool.splice(idxBlock, 1)[0]);
          }
          revisionBlocks = selectedBlocks;

          const actions = [
            "Deep review of",
            "Solve past worksheets for",
            "Synthesize formula sheets for",
            "Active recall drills on",
            "Draft summary mindmaps for",
            "Review tricky homework problems on"
          ];
          action = rng.select(actions);
        }
        
        dayTasks.push({
          id: `gen-${dateStr}-${subject.toLowerCase().replace(/\s+/g, '-')}-${idx}-fallback`,
          title: `${action} ${subject}`,
          subject,
          dueDate: dateStr,
          priority,
          estimatedHours: taskHours,
          completed: false,
          isGenerated: true,
          revisionBlocks
        });
        
        hoursAllocated += taskHours;
      }
    });
    
    if (dayTasks.length > 0) {
      plan.push({
        date: dateStr,
        tasks: rng ? rng.shuffle(dayTasks) : dayTasks
      });
    }
  }

  // Estimate difficulty based on hour load density
  const totalAllocated = plan.reduce((sum, d) => sum + d.tasks.reduce((s, t) => s + t.estimatedHours, 0), 0);
  const averageHours = totalAllocated / daysToGenerate;
  let estimatedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (averageHours > dailyHours * 0.8) {
    estimatedDifficulty = 'hard';
  } else if (averageHours < dailyHours * 0.4) {
    estimatedDifficulty = 'easy';
  }

  return {
    schedule: plan,
    metadata: {
      generationSource: 'fallback',
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date().toLocaleString(),
      estimatedDifficulty
    }
  };
};

/**
 * Interface with the Gemini API to request a personalized, schema-compliant study schedule.
 */
export const fetchStudyPlanFromGemini = async (
  input: PlannerInput,
  retries = 2
): Promise<StudyPlanResult> => {
  const startTime = Date.now();
  const cacheKey = generateCacheKey(input);

  // 1. Caching Check
  const cached = getCachedPlan(input);
  if (cached) {
    cached.metadata.generationSource = 'cache';
    logAnalytics({
      event: 'cache_hit',
      promptVersion: PROMPT_VERSION,
      cacheKey,
      generationTimeMs: Date.now() - startTime,
      source: 'cache'
    });
    return cached;
  }

  logAnalytics({
    event: 'generation_started',
    promptVersion: PROMPT_VERSION,
    cacheKey,
    source: 'gemini'
  });

  // 2. Offline Check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    logger.warn("Browser is offline. Using local fallback planner.");
    const fallback = generateLocalFallbackPlan(input);
    fallback.metadata.generationSource = 'fallback';
    logAnalytics({
      event: 'fallback_used',
      promptVersion: PROMPT_VERSION,
      generationTimeMs: Date.now() - startTime,
      source: 'fallback',
      error: 'Browser offline'
    });
    return fallback;
  }

  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey) {
    // Wait a brief simulated moment to make the interface loading state smooth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Seeded randomness for Demo Mode
    const sortedSubjects = [...input.subjects].sort();
    const sortedDates = sortedSubjects.map(sub => `${sub}:${input.examDates[sub] || ''}`).join(',');
    const seedString = `${sortedSubjects.join(',')}:${sortedDates}:${input.dailyHours}`;
    const seedHash = getSimpleHash(seedString);
    const rng = new SeededRandom(seedHash);
    
    const fallback = generateLocalFallbackPlan(input, rng);
    fallback.metadata.generationSource = 'demo';
    
    // Deterministic random metadata fields
    const motivationalIntros = [
      "Unlock your potential! This study plan is customized to help you master your subjects systematically.",
      "Success is the sum of small efforts, repeated day in and day out. Let's make every day count!",
      "Stay focused and excel! We've structured your schedule to maximize retention and keep stress levels low.",
      "Your academic journey is a marathon, not a sprint. Follow this balanced guide to reach the finish line strong.",
      "Believe in yourself! Consistency is the key to deep comprehension. Here is your roadmap to success."
    ];
    
    const studyStrategies = [
      "Focus on active recall and self-testing. When reviewing your notes, close the book and write down everything you remember.",
      "Utilize space repetition. Revisit difficult chemistry reactions and mathematical proofs 24 hours after your first review.",
      "Try the Pomodoro Technique: study intensely for 25 minutes, then take a 5-minute break to stay fresh.",
      "Prioritize solving past exam papers under timed conditions to get comfortable with the exam format.",
      "Formulate mind maps for complex concept groups to visualize connection nodes and clear up memory bottlenecks."
    ];
    
    fallback.metadata.estimatedDifficulty = rng.select(['easy', 'medium', 'hard'] as const);
    fallback.metadata.motivationalIntro = rng.select(motivationalIntros);
    fallback.metadata.studyStrategy = rng.select(studyStrategies);
    
    logAnalytics({
      event: 'generation_succeeded',
      promptVersion: PROMPT_VERSION,
      generationTimeMs: Date.now() - startTime,
      source: 'demo'
    });
    return fallback;
  }

  const prompt = buildPlannerPrompt(input);
  let lastError: unknown = null;
  let delay = 1000; // Exponential backoff starts at 1000ms

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout

    try {
      const model = "gemini-2.5-flash"; 
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error("Empty content parts in API response candidates");
      }

      const parsedJSON = JSON.parse(textResponse) as unknown;
      const { schedule, estimatedDifficulty } = validateStudyPlan(parsedJSON);

      const result: StudyPlanResult = {
        schedule,
        metadata: {
          generationSource: 'gemini',
          promptVersion: PROMPT_VERSION,
          generatedAt: new Date().toLocaleString(),
          estimatedDifficulty
        }
      };

      // Cache successful response
      cachePlan(input, result);

      logAnalytics({
        event: 'generation_succeeded',
        promptVersion: PROMPT_VERSION,
        cacheKey,
        generationTimeMs: Date.now() - startTime,
        source: 'gemini'
      });

      return result;
      
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      logger.error(`Gemini plan generation attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      if (attempt < retries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  logger.warn("All Gemini API attempts failed. Falling back to local planner algorithm. Error detail:", lastError);
  const fallback = generateLocalFallbackPlan(input);
  fallback.metadata.generationSource = 'fallback';

  logAnalytics({
    event: 'fallback_used',
    promptVersion: PROMPT_VERSION,
    cacheKey,
    generationTimeMs: Date.now() - startTime,
    source: 'fallback',
    error: lastError instanceof Error ? lastError.message : String(lastError)
  });

  return fallback;
};
