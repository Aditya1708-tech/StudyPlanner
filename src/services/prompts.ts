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
  const { subjects, syllabuses, exams, availability } = input;
  const todayStr = new Date().toISOString().split('T')[0];

  const dailyHours = availability?.dailyHours ?? input.dailyHours ?? 4;
  const preferredTime = availability?.preferredTime || 'Morning';
  const sessionLength = availability?.sessionLength || 50;
  const weeklyOffDay = availability?.weeklyOffDay || 'Sunday';

  // Build string representation of syllabus texts
  const syllabusStrings = subjects.map(sub => {
    const syl = syllabuses ? syllabuses[sub] : undefined;
    const ex = exams ? exams[sub] : undefined;
    const exDate = ex?.date || input.examDates?.[sub] || '';
    return `
Subject: ${sub}
- Exam Date: ${exDate}
- Exam Type: ${ex?.type || 'University'}
- Student Difficulty Level: ${ex?.difficulty || 'Medium'}
- Priority Weight: ${ex?.priority || 'Medium'}
- Extracted Syllabus Text:
"""
${syl?.extractedText || 'No syllabus provided. Please map standard university curriculum topics.'}
"""
`;
  }).join('\n');

  return `You are StudyAI, an expert, syllabus-aware academic study scheduler.
Your goal is to parse the student's syllabus texts, perform workload estimation, and generate a strict topic-by-topic daily schedule from today (${todayStr}) up until the exam deadlines.

LEGACY METADATA COMPATIBILITY:
- Active Subjects: ${subjects.join(', ')}
- Target limit: ${dailyHours} hours

CONSTRAINTS & PARAMETERS:
- Subjects & Syllabuses:
${syllabusStrings}

- Daily Available Study Time: ${dailyHours} hours/day
- Preferred Time of Study: ${preferredTime}
- Preferred Session Length: ${sessionLength} minutes
- Weekly Off Day: ${weeklyOffDay} (Do not schedule active new topics on this day, use it for rest/light review)

ADAPTIVE SCHEDULING RULES:
1. Complete Coverage: Every chapter/topic listed in the uploaded syllabus texts MUST be covered in the schedule before its respective exam date.
2. Clamping and Restrictions: Do not schedule study tasks for a subject on or after its exam date.
3. Rest & Off-days: On the weekly off day ("${weeklyOffDay}"), do not schedule heavy new chapters. You may schedule a short 30-min "Weekly Review" or leave it blank (0 hours).
4. Buffer & Review Strategy:
   - For each subject, the 2 days prior to the exam must be reserved strictly for "Mock Tests" and "Buffer/Final Review".
   - The final week before the exam must be a "Final Revision Sprint" consisting of high-priority synthesis and mock practice.
   - Dedicate a "Revision Session" block every 4-5 days to revisit previously covered chapters.
5. Task Structure:
   - Each task must have a duration (estimatedHours). The sum of task durations on any single date must be <= the daily available hours of ${dailyHours} hours.
   - Tasks must specify sessionType: 'Study', 'Revision', 'Practical', or 'Mock Test'.
   - Tasks must specify the specific topic/chapter they correspond to.

OUTPUT SCHEMA & FORMAT:
Provide the response strictly in JSON format matching this schema:
{
  "syllabusesParsed": {
    "Subject Name": {
      "units": [
        {
          "unitName": "Unit X: Title",
          "chapters": [
            {
              "chapterName": "Chapter Y: Title",
              "topics": ["Topic A", "Topic B"]
            }
          ]
        }
      ],
      "practicals": ["Lab Activity X"],
      "revisions": ["Revision Concept Y"]
    }
  },
  "workload": {
    "estimatedDifficulty": "easy" | "medium" | "hard",
    "timeRequiredHours": 45,
    "sessionsCount": 30,
    "revisionFrequencyDays": 4
  },
  "strategy": {
    "estimatedCompletionDate": "YYYY-MM-DD",
    "riskAreas": ["List potential risk areas or bottlenecks"],
    "recommendedRevisionInterval": "e.g. Every 4 days",
    "pomodoroStructure": "e.g. 50 minutes study, 10 minutes break",
    "finalWeekStrategy": "e.g. Focus on active recall and mock testing."
  },
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "Action-oriented task description (starts with an active verb, e.g. 'Solve triple integration problems in coordinate space')",
          "subject": "Name of the subject",
          "priority": "High" | "Medium" | "Low",
          "estimatedHours": 1.5,
          "sessionType": "Study" | "Revision" | "Practical" | "Mock Test",
          "topic": "The topic name this belongs to",
          "revisionBlocks": ["electrophilic additions", "concept review"]
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Ensure the output is valid raw JSON. Do NOT wrap it in markdown code blocks (such as \`\`\`json) and do not provide any explanation, comments, or intro/outro text.
2. Every task title MUST start with a strong active verb (e.g. "Read", "Solve", "Review", "Practice", "Draw").
3. Make sure the date format is strictly YYYY-MM-DD.`;
};
