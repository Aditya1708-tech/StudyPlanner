import { PlannerInput } from '../types';

/**
 * Version identifier for the prompt template.
 * Incrementing this value automatically invalidates stale cached plans.
 */
export const PROMPT_VERSION = 'v2';

/**
 * Builds a structured prompt template for the Gemini API.
 */
export const buildPlannerPrompt = (input: PlannerInput): string => {
  const { subjects, examDates, dailyHours } = input;
  const todayStr = new Date().toISOString().split('T')[0];

  return `You are a professional, structured study scheduler.
Generate a personalized, day-by-day revision timeline starting today (${todayStr}) for these constraints:
- Active Subjects: ${subjects.join(', ')}
- Upcoming Exam Deadlines: ${JSON.stringify(examDates)}
- Daily Available Cap: ${dailyHours} hours

ADAPTIVE SCHEDULING RULES:
1. Workload Distribution (Weekend vs Weekday):
   - Weekdays (Monday through Friday): Distribute standard workloads, keeping total daily study hours strictly <= the daily cap of ${dailyHours} hours.
   - Weekends (Saturday and Sunday): Students have more availability. You can schedule up to 1.5x the standard daily cap (up to ${Math.min(12, dailyHours * 1.5)} hours) to accelerate review of core topics.
2. Automatic Revision & Synthesis Days:
   - For every subject, dedicate the final day before its exam date strictly to "Revision & Mock Practice" tasks.
   - Designate every 4th day of the plan as a "Synthesis Day" focusing on active recall, flashcards, and summary mapping across all active courses, rather than introducing new subtopics.
3. Logical Clamping:
   - Do not schedule any task for a subject on or after its specific exam deadline.
   - Ensure the total estimatedHours scheduled on any single date does not exceed that date's hour cap (weekday: ${dailyHours}h, weekend: ${Math.min(12, dailyHours * 1.5)}h).

ESTIMATED DIFFICULTY:
- Evaluate the schedule density: if daily hours are constantly at the cap and exams are close, difficulty is "hard". If hours are light, difficulty is "easy". Otherwise "medium". Return this estimate in the root metadata.

OUTPUT SCHEMA & FORMAT:
Provide the schedule in a strict JSON format matching this schema:
{
  "courses": [
    {
      "courseName": "Name of the course",
      "examDate": "YYYY-MM-DD"
    }
  ],
  "estimatedDifficulty": "easy" | "medium" | "hard",
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "Action-oriented task description (e.g. Draw nucleophilic reaction steps in Organic Chemistry)",
          "subject": "Name of the course",
          "priority": "High" | "Medium" | "Low",
          "estimatedHours": 1.5,
          "revisionBlocks": ["electrophilic additions", "Chapter 4 reaction pathways"]
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Ensure the output is valid raw JSON. Do NOT wrap it in markdown code blocks (such as \`\`\`json) and do not provide any explanation, comments, or intro/outro text.
2. Each task must specify 'revisionBlocks' as a non-empty array of strings representing specific subtopics/chapters covered.
3. Every task description ('title') must start with an active verb and be concrete and study-relevant.`;
};
