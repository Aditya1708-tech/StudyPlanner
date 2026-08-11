import { PlannerInput, StudyDay, Task, StudyPlanResult, ExtractedSyllabus, ChatMessage } from '../types';
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
  const sortedDates = sortedSubjects.map(sub => `${sub}:${input.exams?.[sub]?.date || input.examDates?.[sub] || ''}`).join(',');
  const dailyH = input.availability?.dailyHours ?? input.dailyHours ?? 4;
  return `studyplan_cache:${PROMPT_VERSION}:${sortedSubjects.join(',')}:${sortedDates}:${dailyH}`;
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
 * Robust Client-Side Syllabus Parser.
 * Scans text lines to construct Unit -> Chapter -> Topics hierarchical folders.
 */
export const parseSyllabusLocally = (text: string, subject: string): ExtractedSyllabus => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const units: ExtractedSyllabus['units'] = [];
  const practicals: string[] = [];
  const revisions: string[] = [];

  let currentUnit: typeof units[0] | null = null;
  let currentChapter: typeof units[0]['chapters'][0] | null = null;

  lines.forEach(line => {
    const isUnit = /^(unit|module|block|part|sec|section)\s+\d+/i.test(line);
    const isChapter = /^(chapter|topic|lec|lecture|ch)\s+\d+/i.test(line);
    const isPractical = /practical|lab|experiment|project/i.test(line);
    const isRevision = /revision|review|synthesis/i.test(line);

    if (isPractical) {
      practicals.push(line);
      return;
    }
    if (isRevision) {
      revisions.push(line);
      return;
    }

    if (isUnit) {
      currentUnit = {
        unitName: line,
        chapters: []
      };
      units.push(currentUnit);
      currentChapter = null;
    } else if (isChapter) {
      if (!currentUnit) {
        currentUnit = {
          unitName: "Unit 1: Introduction & Fundamentals",
          chapters: []
        };
        units.push(currentUnit);
      }
      currentChapter = {
        chapterName: line,
        topics: []
      };
      currentUnit.chapters.push(currentChapter);
    } else {
      // Treat as topic detail
      if (line.length > 3 && line.length < 120) {
        if (!currentChapter) {
          if (!currentUnit) {
            currentUnit = {
              unitName: "Unit 1: Core Subjects",
              chapters: []
            };
            units.push(currentUnit);
          }
          currentChapter = {
            chapterName: "Chapter 1: Basic Topics",
            topics: []
          };
          currentUnit.chapters.push(currentChapter);
        }
        currentChapter.topics.push(line);
      }
    }
  });

  // High-fidelity fallback database for standard courses if the file is blank or has no structure
  if (units.length === 0) {
    const subLower = subject.toLowerCase();
    if (subLower.includes('chemistry') || subLower.includes('organic')) {
      units.push({
        unitName: "Unit 1: Atomic Bonding & Orbitals",
        chapters: [
          { chapterName: "Chapter 1: Molecular Orbital Splitting", topics: ["Atomic orbital overlaps", "LCAO method rules", "Bonding vs antibonding states", "Homonuclear molecular diagrams"] },
          { chapterName: "Chapter 2: Coordination Chemistry Theory", topics: ["Ligand field interactions", "Crystal Field Splitting", "Magnetic susceptibility calculation"] }
        ]
      }, {
        unitName: "Unit 2: Electrophilic & Nucleophilic Processes",
        chapters: [
          { chapterName: "Chapter 3: Alkenes Reaction Mechanisms", topics: ["Electrophilic addition rules", "Carbocation stability factors", "Markovnikov orientation", "Halogenation transition states"] },
          { chapterName: "Chapter 4: SN1 and SN2 Substitution Competition", topics: ["Kinetic comparison metrics", "Leaving group rate dependencies", "Polar protic solvent effects", "Steric hindrance variables"] }
        ]
      });
      revisions.push("Mechanism outline mapping");
      practicals.push("Synthesis of Aspirin laboratory");
    } else if (subLower.includes('calculus') || subLower.includes('math')) {
      units.push({
        unitName: "Unit 1: Derivatives & Integrals in Space",
        chapters: [
          { chapterName: "Chapter 1: Partial Derivative Chain Rules", topics: ["Limits and continuity boundaries", "Directional derivative calculations", "Lagrange multiplier limits"] },
          { chapterName: "Chapter 2: Coordinate Integration Systems", topics: ["Double integrals in polar regions", "Triple integrals in spherical space", "Jacobian coordinate transformations"] }
        ]
      }, {
        unitName: "Unit 2: Vector Field Theorems",
        chapters: [
          { chapterName: "Chapter 3: Boundary Theorems", topics: ["Vector flow lines", "Green's Theorem in the plane", "Stokes' Theorem boundaries", "Divergence flux calculation"] }
        ]
      });
      revisions.push("Formula cards study block");
    } else if (subLower.includes('physics')) {
      units.push({
        unitName: "Unit 1: Classical Electromagnetism",
        chapters: [
          { chapterName: "Chapter 1: Electric Potential Fields", topics: ["Gauss's flux theorem proofs", "Coulomb field integration", "Dielectric polarization factors"] },
          { chapterName: "Chapter 2: Magnetic Induction Rates", topics: ["Biot-Savart field loops", "Ampere's law integration", "Faraday's induction flux"] }
        ]
      });
      revisions.push("Gauss & Faraday equations sprint");
      practicals.push("Oscilloscope magnetic field mapping");
    } else if (subLower.includes('computer') || subLower.includes('cs') || subLower.includes('programming')) {
      units.push({
        unitName: "Unit 1: Data Structures & Algorithms",
        chapters: [
          { chapterName: "Chapter 1: Complexity and Sorting", topics: ["Big-O notation analysis", "Quicksort & Mergesort implementations", "Binary search tree lookups"] },
          { chapterName: "Chapter 2: Graph Traversals", topics: ["BFS and DFS traversals", "Dijkstra's shortest path", "Minimum spanning trees (Kruskal)"] }
        ]
      });
      revisions.push("Runtime complexity cards review");
    } else {
      // General Syllabus Template
      units.push({
        unitName: "Unit 1: Fundamental Concepts",
        chapters: [
          { chapterName: "Chapter 1: Introduction & Terms", topics: ["Historical background overview", "Key terminology glossary", "Core models configuration"] },
          { chapterName: "Chapter 2: Primary Principles", topics: ["Essential assumptions testing", "Basic analysis procedures", "Simple case study mappings"] }
        ]
      }, {
        unitName: "Unit 2: Advanced Applications",
        chapters: [
          { chapterName: "Chapter 3: Critical Methodologies", topics: ["Advanced theoretical frameworks", "Data evaluation techniques", "Synthesis and integration sprint"] }
        ]
      });
    }
  }

  return {
    units,
    practicals,
    revisions
  };
};

/**
 * High-Quality Deterministic Syllabus Fallback Planner.
 * Respects topic order, availability, off-days, mock tests, and exam dates.
 */
export const generateLocalFallbackPlan = (
  input: PlannerInput,
  rng?: SeededRandom
): StudyPlanResult => {
  const { subjects, syllabuses, exams, availability } = input;
  const plan: StudyDay[] = [];
  
  // 1. Gather and parse all syllabuses locally
  const parsedSyllabuses: Record<string, ExtractedSyllabus> = {};
  subjects.forEach(sub => {
    const text = syllabuses?.[sub]?.extractedText || '';
    parsedSyllabuses[sub] = parseSyllabusLocally(text, sub);
  });

  // 2. Flatten all topics into a list of tasks to schedule
  interface FallbackTaskItem {
    subject: string;
    unitName: string;
    chapterName: string;
    topicName: string;
    sessionType: 'Study' | 'Revision' | 'Practical' | 'Mock Test';
  }

  const studyQueue: FallbackTaskItem[] = [];
  subjects.forEach(sub => {
    const syllabus = parsedSyllabuses[sub];
    syllabus.units.forEach(unit => {
      unit.chapters.forEach(ch => {
        ch.topics.forEach(top => {
          studyQueue.push({
            subject: sub,
            unitName: unit.unitName,
            chapterName: ch.chapterName,
            topicName: top,
            sessionType: 'Study'
          });
        });
      });
    });
    // Add practicals if any
    syllabus.practicals.forEach(prac => {
      studyQueue.push({
        subject: sub,
        unitName: "Practicals & Labs",
        chapterName: "Lab Review",
        topicName: prac,
        sessionType: 'Practical'
      });
    });
  });

  // Determine date bounds
  const startDate = new Date();
  startDate.setHours(0,0,0,0);
  
  // Find the latest exam date to plan until
  let latestExamDate = new Date();
  latestExamDate.setDate(latestExamDate.getDate() + 14); // Default 2 weeks
  subjects.forEach(sub => {
    const dateStr = exams?.[sub]?.date || input.examDates?.[sub];
    if (dateStr) {
      const exDate = new Date(dateStr);
      if (exDate > latestExamDate) {
        latestExamDate = exDate;
      }
    }
  });

  const totalDays = Math.ceil((latestExamDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysToGenerate = Math.max(3, Math.min(180, totalDays));

  let queueIndex = 0;
  const completedTopicsCount: Record<string, number> = {};

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isOffDay = dayName.toLowerCase() === (availability?.weeklyOffDay || 'Sunday').toLowerCase();

    const dayTasks: Task[] = [];
    let hoursAllocated = 0;

    // Check if the current date is close to exam dates
    const examDeadlinesForDay: string[] = [];
    const mockTestsForDay: string[] = [];
    const bufferSprintForDay: string[] = [];

    subjects.forEach(sub => {
      const exDateStr = exams?.[sub]?.date || input.examDates?.[sub];
      if (exDateStr) {
        const exDate = new Date(exDateStr);
        exDate.setHours(0,0,0,0);
        const timeDiff = exDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          examDeadlinesForDay.push(sub);
        } else if (daysDiff === 1) {
          mockTestsForDay.push(sub);
        } else if (daysDiff === 2 || daysDiff === 3) {
          bufferSprintForDay.push(sub);
        }
      }
    });

    if (examDeadlinesForDay.length > 0) {
      // Exam day! Schedule a resting/warmup task
      examDeadlinesForDay.forEach(sub => {
        dayTasks.push({
          id: `fallback-${dateStr}-${sub}-exam`,
          title: `Exam Day: Write ${exams?.[sub]?.type || 'Midterm'} for ${sub}`,
          subject: sub,
          dueDate: dateStr,
          priority: 'High',
          estimatedHours: 1.0,
          completed: false,
          isGenerated: true,
          sessionType: 'Mock Test',
          topic: 'Final Examination'
        });
      });
    } else if (mockTestsForDay.length > 0) {
      // Mock test day
      mockTestsForDay.forEach(sub => {
        dayTasks.push({
          id: `fallback-${dateStr}-${sub}-mock`,
          title: `Practice Mock Test: Timed exam trial for ${sub}`,
          subject: sub,
          dueDate: dateStr,
          priority: 'High',
          estimatedHours: 2.0,
          completed: false,
          isGenerated: true,
          sessionType: 'Mock Test',
          topic: 'Timed Mock Practice'
        });
      });
    } else if (bufferSprintForDay.length > 0) {
      // Buffer / Synthesis Review day
      bufferSprintForDay.forEach(sub => {
        dayTasks.push({
          id: `fallback-${dateStr}-${sub}-buffer`,
          title: `Final synthesis mapping and formulas card check for ${sub}`,
          subject: sub,
          dueDate: dateStr,
          priority: 'High',
          estimatedHours: 1.5,
          completed: false,
          isGenerated: true,
          sessionType: 'Revision',
          topic: 'Synthesis Review'
        });
      });
    } else if (isOffDay) {
      // Off day: Schedule a light weekly review
      dayTasks.push({
        id: `fallback-${dateStr}-offday-review`,
        title: "Weekly rest day: Light synthesis check of the week's notes",
        subject: subjects[0] || 'General',
        dueDate: dateStr,
        priority: 'Low',
        estimatedHours: 0.5,
        completed: false,
        isGenerated: true,
        sessionType: 'Revision',
        topic: 'Weekly Consolidation'
      });
    } else {
      // Standard Study Day: Allocate topics from the queue
      const maxDailyHours = availability?.dailyHours ?? input.dailyHours ?? 4;
      while (hoursAllocated < maxDailyHours && queueIndex < studyQueue.length) {
        const item = studyQueue[queueIndex];
        
        // Skip if subject exam has already passed
        const exDateStr = exams?.[item.subject]?.date || input.examDates?.[item.subject];
        if (exDateStr) {
          const exDate = new Date(exDateStr);
          exDate.setHours(0,0,0,0);
          if (currentDate >= exDate) {
            queueIndex++;
            continue;
          }
        }

        const taskHours = Math.min(2.0, maxDailyHours - hoursAllocated);
        dayTasks.push({
          id: `fallback-${dateStr}-${item.subject.toLowerCase()}-${queueIndex}`,
          title: `Study topic: ${item.topicName} in ${item.chapterName}`,
          subject: item.subject,
          dueDate: dateStr,
          priority: exams?.[item.subject]?.priority || 'Medium',
          estimatedHours: taskHours,
          completed: false,
          isGenerated: true,
          sessionType: item.sessionType,
          topic: item.topicName
        });

        hoursAllocated += taskHours;
        queueIndex++;
        completedTopicsCount[item.subject] = (completedTopicsCount[item.subject] || 0) + 1;
      }

      // If we finished topics but have remaining daily hours, inject a revision task
      if (hoursAllocated < (availability?.dailyHours ?? input.dailyHours ?? 4) && dayTasks.length > 0) {
        const sub = dayTasks[0].subject;
        dayTasks.push({
          id: `fallback-${dateStr}-${sub}-periodic-revision`,
          title: `Periodic review: active recall checks on ${sub} concepts`,
          subject: sub,
          dueDate: dateStr,
          priority: 'Medium',
          estimatedHours: (availability?.dailyHours ?? input.dailyHours ?? 4) - hoursAllocated,
          completed: false,
          isGenerated: true,
          sessionType: 'Revision',
          topic: 'Periodic Revision'
        });
      }
    }

    if (dayTasks.length > 0) {
      plan.push({
        date: dateStr,
        tasks: dayTasks
      });
    }
  }

  // Calculate estimated completion date based on queue mapping
  const allScheduledTasks = plan.reduce((acc, d) => [...acc, ...d.tasks], [] as Task[]);
  const lastTask = allScheduledTasks[allScheduledTasks.length - 1];
  const estCompletionDate = lastTask ? lastTask.dueDate : startDate.toISOString().split('T')[0];

  return {
    schedule: plan,
    metadata: {
      generationSource: 'fallback',
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date().toLocaleString(),
      estimatedDifficulty: 'medium',
      motivationalIntro: "Trust the process! This local study timeline distributes your syllabus chapters evenly to prevent cramming.",
      studyStrategy: "Work through your chapters sequentially. Spend 50 minutes studying and take a 10-minute rest break to retain complex formulas.",
      riskAreas: ["Ensuring even distribution of remaining topics if study days are missed."],
      estimatedCompletionDate: estCompletionDate,
      recommendedRevisionInterval: "Every 4 days",
      pomodoroStructure: "50m study, 10m break",
      finalWeekStrategy: "Synthesize outline units, complete sample questions, and practice mock tests.",
      syllabusesParsed: parsedSyllabuses
    }
  };
};

/**
 * Interface with the Gemini API to request a personalized, syllabus-aware study roadmap.
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
  if (!apiKey || apiKey === 'demo-api-key') {
    // Wait a brief simulated moment to make the interface loading state smooth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fallback = generateLocalFallbackPlan(input);
    fallback.metadata.generationSource = 'demo';
    
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
    }, 12000); // 12 second timeout

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

      // Parse JSON from API candidate text response
      interface ApiResponseFormat {
        syllabusesParsed: Record<string, ExtractedSyllabus>;
        workload: {
          estimatedDifficulty: 'easy' | 'medium' | 'hard';
          timeRequiredHours: number;
          sessionsCount: number;
          revisionFrequencyDays: number;
        };
        strategy: {
          estimatedCompletionDate: string;
          riskAreas: string[];
          recommendedRevisionInterval: string;
          pomodoroStructure: string;
          finalWeekStrategy: string;
        };
        schedule: StudyDay[];
      }

      const parsedJSON = JSON.parse(textResponse) as ApiResponseFormat;
      
      // Build full study plan result
      const result: StudyPlanResult = {
        schedule: parsedJSON.schedule,
        metadata: {
          generationSource: 'gemini',
          promptVersion: PROMPT_VERSION,
          generatedAt: new Date().toLocaleString(),
          estimatedDifficulty: parsedJSON.workload?.estimatedDifficulty || 'medium',
          motivationalIntro: `Let's conquer this syllabus! Focus on the scheduled daily sessions to finish comfortably.`,
          studyStrategy: parsedJSON.strategy?.finalWeekStrategy || 'Follow active recall intervals.',
          riskAreas: parsedJSON.strategy?.riskAreas || [],
          estimatedCompletionDate: parsedJSON.strategy?.estimatedCompletionDate || '',
          recommendedRevisionInterval: parsedJSON.strategy?.recommendedRevisionInterval || '',
          pomodoroStructure: parsedJSON.strategy?.pomodoroStructure || '',
          finalWeekStrategy: parsedJSON.strategy?.finalWeekStrategy || '',
          syllabusesParsed: parsedJSON.syllabusesParsed
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

/**
 * Interface with the Gemini API to handle conversational questions and study plan queries.
 */
export const fetchChatResponseFromGemini = async (
  history: ChatMessage[],
  newMessageText: string
): Promise<{ reply: string; suggestedTasks?: Omit<Task, 'id' | 'completed'>[] }> => {
  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'demo-api-key') {
    throw new Error("Gemini API key is not configured or in demo mode.");
  }

  const model = "gemini-2.5-flash";
  
  // Convert chat messages history to Gemini API format.
  // Limit history length to last 15 messages to stay within prompt limits and avoid latency.
  const chatHistorySlice = history.slice(-15);
  const contents = chatHistorySlice.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Append the current message
  contents.push({
    role: 'user',
    parts: [{ text: newMessageText }]
  });

  const systemInstruction = {
    parts: [{
      text: `You are StudyAI, an intelligent, helpful academic tutor and study planning assistant.
Your goal is to help the user master their academic subjects, explain complex topics, and organize their study tasks.

CONVERSATION RULES:
1. Explain concepts clearly, step-by-step, using rich markdown formatting where helpful (bold text, lists, equations, tables).
2. Maintain a friendly, supportive, and encouraging tone.
3. Keep explanations structured and concise but complete.
4. If asked about study tips, plans, or academic concepts, formulate helpful explanations and optionally suggest study tasks.

STUDY TASK SUGGESTIONS:
- Based on the user's questions or request, you can suggest 1 or 2 concrete, study-oriented tasks that they should schedule to help them study or review.
- Only suggest tasks that are directly relevant to the topic of conversation.
- If no study tasks are relevant (e.g. they are just greeting you), set "suggestedTasks" to an empty array or omit it.

JSON RESPONSE FORMAT:
You MUST reply strictly in JSON format matching this schema:
{
  "reply": "Your response text explaining the topic or answering the user's query. Use standard markdown for formatting.",
  "suggestedTasks": [
    {
      "title": "Action-oriented task title (e.g., 'Practice solving 5 triple integration problems')",
      "subject": "Name of the course/subject (e.g., 'Chemistry', 'Mathematics', 'Physics')",
      "priority": "High" | "Medium" | "Low",
      "estimatedHours": 1.5
    }
  ]
}

Ensure the output is valid raw JSON. Do NOT wrap it in markdown code blocks (such as \`\`\`json) and do not provide any explanation outside the JSON object.`
    }]
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`API HTTP error! Status: ${response.status}`);
  }

  const responseData = await response.json() as {
    candidates?: {
      content?: {
        parts?: {
          text?: string
        }[]
      }
    }[]
  };
  
  const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error("Empty response from Gemini API");
  }

  try {
    const parsed = JSON.parse(textResponse) as {
      reply: string;
      suggestedTasks?: Omit<Task, 'id' | 'completed'>[];
    };
    return {
      reply: parsed.reply || "I'm sorry, I couldn't generate a proper response.",
      suggestedTasks: parsed.suggestedTasks
    };
  } catch (e) {
    logger.error("Failed to parse JSON response from chat Gemini API:", textResponse);
    throw new Error("Invalid response format received from Gemini API");
  }
};

/**
 * Validates the study plan schema generated from the Gemini API or loaded from cache.
 * Restores compatibility with pre-existing unit test suites.
 */
export const validateStudyPlan = (payload: any): any => {
  if (!payload) {
    throw new Error("Invalid response format");
  }
  
  let parsed = payload;
  if (typeof payload === 'string') {
    try {
      parsed = JSON.parse(payload);
    } catch {
      throw new Error("Invalid response format");
    }
  }

  let schedule = [];
  if (Array.isArray(parsed)) {
    schedule = parsed;
  } else if (parsed && Array.isArray(parsed.schedule)) {
    schedule = parsed.schedule;
  } else {
    throw new Error("Invalid response format: 'schedule' array is missing or invalid");
  }

  const totalT = schedule.reduce((acc: number, day: any) => {
    if (day && Array.isArray(day.tasks)) {
      return acc + day.tasks.length;
    }
    return acc;
  }, 0);

  if (totalT === 0) {
    throw new Error("No valid study days or tasks found in the generated response");
  }

  const metadata = parsed.metadata || parsed || {};
  let estimatedDifficulty = metadata.estimatedDifficulty || 'medium';
  if (estimatedDifficulty !== 'easy' && estimatedDifficulty !== 'medium' && estimatedDifficulty !== 'hard') {
    estimatedDifficulty = 'medium';
  }
  const motivationalIntro = metadata.motivationalIntro || '';
  const studyStrategy = metadata.studyStrategy || '';

  const sanitizedSchedule = schedule.map((day: any) => ({
    date: day.date || new Date().toISOString().split('T')[0],
    tasks: (day.tasks || []).map((t: any) => ({
      id: t.id || `task-${Math.random()}`,
      title: t.title || 'Review Study Topic',
      subject: t.subject || 'General',
      dueDate: t.dueDate || day.date || new Date().toISOString().split('T')[0],
      priority: t.priority || 'Medium',
      estimatedHours: t.estimatedHours !== undefined ? t.estimatedHours : 1.5,
      completed: t.completed !== undefined ? t.completed : false,
      isGenerated: t.isGenerated !== undefined ? t.isGenerated : true,
      revisionBlocks: t.revisionBlocks || ['Concept review'],
      sessionType: t.sessionType || 'Study',
      topic: t.topic || t.title || 'Review Topic'
    }))
  }));

  return {
    schedule: sanitizedSchedule,
    estimatedDifficulty,
    motivationalIntro,
    studyStrategy,
    metadata: {
      generationSource: metadata.generationSource || 'fallback',
      promptVersion: metadata.promptVersion || PROMPT_VERSION,
      generatedAt: metadata.generatedAt || new Date().toLocaleString(),
      estimatedDifficulty,
      motivationalIntro,
      studyStrategy,
      riskAreas: metadata.riskAreas || [],
      estimatedCompletionDate: metadata.estimatedCompletionDate || '',
      recommendedRevisionInterval: metadata.recommendedRevisionInterval || '',
      pomodoroStructure: metadata.pomodoroStructure || '',
      finalWeekStrategy: metadata.finalWeekStrategy || '',
      syllabusesParsed: metadata.syllabusesParsed || {}
    }
  };
};
