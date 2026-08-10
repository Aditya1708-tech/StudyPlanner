import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateStudyPlan, generateLocalFallbackPlan, fetchStudyPlanFromGemini } from './gemini';
import { PlannerInput } from '../types';
import { ENV } from '../utils/env';

describe('Gemini Study Plan Service Tests', () => {
  
  describe('validateStudyPlan', () => {
    it('should successfully validate and sanitize well-formed schedule response', () => {
      const mockRawJSON = {
        schedule: [
          {
            date: '2026-08-05',
            tasks: [
              {
                title: 'Study organic mechanisms',
                subject: 'Chemistry',
                priority: 'High',
                estimatedHours: 2
              },
              {
                title: 'Review double integrals',
                subject: 'Mathematics',
                priority: 'Medium',
                estimatedHours: 1.5
              }
            ]
          }
        ]
      };

      const validated = validateStudyPlan(mockRawJSON);
      
      expect(validated.schedule).toHaveLength(1);
      expect(validated.schedule[0].date).toBe('2026-08-05');
      expect(validated.schedule[0].tasks).toHaveLength(2);
      
      expect(validated.schedule[0].tasks[0].title).toBe('Study organic mechanisms');
      expect(validated.schedule[0].tasks[0].subject).toBe('Chemistry');
      expect(validated.schedule[0].tasks[0].priority).toBe('High');
      expect(validated.schedule[0].tasks[0].estimatedHours).toBe(2);
      expect(validated.schedule[0].tasks[0].completed).toBe(false);
      expect(validated.schedule[0].tasks[0].isGenerated).toBe(true);
    });

    it('should handle alternative root array representation', () => {
      const mockArrayJSON = [
        {
          date: '2026-08-06',
          tasks: [
            {
              title: 'Physics equations sheet',
              subject: 'Physics',
              priority: 'Low',
              estimatedHours: 1
            }
          ]
        }
      ];

      const validated = validateStudyPlan(mockArrayJSON);
      expect(validated.schedule).toHaveLength(1);
      expect(validated.schedule[0].date).toBe('2026-08-06');
    });

    it('should throw error for invalid formats or empty results', () => {
      expect(() => validateStudyPlan(null)).toThrow("Invalid response format");
      expect(() => validateStudyPlan({ schedule: 'not-an-array' })).toThrow();
      expect(() => validateStudyPlan({ schedule: [] })).toThrow("No valid study days or tasks found");
    });
  });

  describe('generateLocalFallbackPlan', () => {
    const getFutureDateString = (daysAhead: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    it('should dynamically generate schedule days when called', () => {
      const mockInput: PlannerInput = {
        subjects: ['Biology', 'Physics'],
        examDates: {
          'Biology': getFutureDateString(3),
          'Physics': getFutureDateString(7)
        },
        dailyHours: 3
      };

      const fallbackPlan = generateLocalFallbackPlan(mockInput);
      
      expect(fallbackPlan.schedule.length).toBeGreaterThan(0);
      fallbackPlan.schedule.forEach(day => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day.tasks.length).toBeGreaterThan(0);
        
        let totalHours = 0;
        day.tasks.forEach(task => {
          expect(mockInput.subjects).toContain(task.subject);
          expect(task.completed).toBe(false);
          expect(task.isGenerated).toBe(true);
          totalHours += task.estimatedHours;
        });
        
        expect(totalHours).toBeLessThanOrEqual(mockInput.dailyHours);
      });
    });
  });

  describe('fetchStudyPlanFromGemini integration test with fallback', () => {
    const getFutureDateString = (daysAhead: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    let originalApiKey = ENV.GEMINI_API_KEY;

    beforeEach(() => {
      originalApiKey = ENV.GEMINI_API_KEY;
      localStorage.clear(); // Clear cache before each test
    });

    afterEach(() => {
      ENV.GEMINI_API_KEY = originalApiKey;
      vi.restoreAllMocks();
    });

    it('should successfully generate and validate study plan from Gemini API', async () => {
      ENV.GEMINI_API_KEY = 'mock-key-123';
      
      const mockSuccessResponse = {
        courses: [
          { courseName: 'Chemistry', examDate: getFutureDateString(4) }
        ],
        estimatedDifficulty: 'medium',
        schedule: [
          {
            date: getFutureDateString(1),
            tasks: [
              {
                title: 'Review Organic Reaction Paths',
                subject: 'Chemistry',
                priority: 'High',
                estimatedHours: 2.0,
                revisionBlocks: ['electrophilic additions', 'cramming']
              }
            ]
          }
        ]
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockSuccessResponse) }]
              }
            }
          ]
        })
      } as Response);

      const mockInput: PlannerInput = {
        subjects: ['Chemistry'],
        examDates: { 'Chemistry': getFutureDateString(4) },
        dailyHours: 4
      };

      const result = await fetchStudyPlanFromGemini(mockInput, 0);
      expect(result.schedule).toHaveLength(1);
      expect(result.metadata.generationSource).toBe('gemini');
      expect(result.metadata.estimatedDifficulty).toBe('medium');
      expect(result.schedule[0].tasks[0].revisionBlocks).toContain('electrophilic additions');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should retrieve plan from cache and skip API call on cache hit', async () => {
      ENV.GEMINI_API_KEY = 'mock-key-123';
      
      const mockInput: PlannerInput = {
        subjects: ['Chemistry'],
        examDates: { 'Chemistry': getFutureDateString(4) },
        dailyHours: 4
      };

      const mockSuccessResponse = {
        courses: [{ courseName: 'Chemistry', examDate: getFutureDateString(4) }],
        estimatedDifficulty: 'medium',
        schedule: [
          {
            date: getFutureDateString(1),
            tasks: [{ title: 'Study Chemistry', subject: 'Chemistry', priority: 'High', estimatedHours: 2, revisionBlocks: ['intro'] }]
          }
        ]
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(mockSuccessResponse) }] } }]
        })
      } as Response);

      // First call (cache miss)
      const res1 = await fetchStudyPlanFromGemini(mockInput, 0);
      expect(res1.metadata.generationSource).toBe('gemini');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Second call (cache hit)
      const res2 = await fetchStudyPlanFromGemini(mockInput, 0);
      expect(res2.metadata.generationSource).toBe('cache');
      expect(fetchSpy).toHaveBeenCalledTimes(1); // fetch count remains 1!
    });

    it('should fallback to local planner if the API fetch fails due to timeout/abort error', async () => {
      ENV.GEMINI_API_KEY = 'mock-key-123';
      
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new DOMException('The user aborted a request.', 'AbortError')
      );

      const mockInput: PlannerInput = {
        subjects: ['Chemistry'],
        examDates: { 'Chemistry': getFutureDateString(4) },
        dailyHours: 4
      };

      const result = await fetchStudyPlanFromGemini(mockInput, 0); // 0 retries
      expect(result.schedule.length).toBeGreaterThan(0);
      expect(result.metadata.generationSource).toBe('fallback');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should retry requests using exponential backoff before failing and using fallback', async () => {
      ENV.GEMINI_API_KEY = 'mock-key-123';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new Error('Temporary API Server Error')
      );

      const mockInput: PlannerInput = {
        subjects: ['Chemistry'],
        examDates: { 'Chemistry': getFutureDateString(4) },
        dailyHours: 4
      };

      // Set retries = 1 to test retry behavior
      const result = await fetchStudyPlanFromGemini(mockInput, 1);
      expect(result.metadata.generationSource).toBe('fallback');
      expect(fetchSpy).toHaveBeenCalledTimes(2); // Initial try + 1 retry = 2 calls
    });

    it('should fall back to local planner if API returns malformed JSON data', async () => {
      ENV.GEMINI_API_KEY = 'mock-key-123';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '{ malformed json string }' }] } }]
        })
      } as Response);

      const mockInput: PlannerInput = {
        subjects: ['Chemistry'],
        examDates: { 'Chemistry': getFutureDateString(4) },
        dailyHours: 4
      };

      const result = await fetchStudyPlanFromGemini(mockInput, 0); // 0 retries
      expect(result.metadata.generationSource).toBe('fallback');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should use demo mode, return demo generationSource, and behave deterministically when API key is missing', async () => {
      ENV.GEMINI_API_KEY = '';

      const mockInput1: PlannerInput = {
        subjects: ['Chemistry', 'Mathematics'],
        examDates: { 'Chemistry': getFutureDateString(4), 'Mathematics': getFutureDateString(6) },
        dailyHours: 4
      };

      const mockInput2: PlannerInput = {
        subjects: ['Chemistry', 'Mathematics'],
        examDates: { 'Chemistry': getFutureDateString(4), 'Mathematics': getFutureDateString(6) },
        dailyHours: 4
      };

      const mockInput3: PlannerInput = {
        subjects: ['Physics'],
        examDates: { 'Physics': getFutureDateString(5) },
        dailyHours: 4
      };

      const res1 = await fetchStudyPlanFromGemini(mockInput1, 0);
      const res2 = await fetchStudyPlanFromGemini(mockInput2, 0);
      const res3 = await fetchStudyPlanFromGemini(mockInput3, 0);

      // Verify source is 'demo'
      expect(res1.metadata.generationSource).toBe('demo');
      expect(res1.metadata.motivationalIntro).toBeTypeOf('string');
      expect(res1.metadata.studyStrategy).toBeTypeOf('string');

      // Verify deterministic identical output for identical inputs
      expect(res1.metadata.estimatedDifficulty).toBe(res2.metadata.estimatedDifficulty);
      expect(res1.metadata.motivationalIntro).toBe(res2.metadata.motivationalIntro);
      expect(res1.metadata.studyStrategy).toBe(res2.metadata.studyStrategy);
      
      // Tasks and blocks should be identical
      expect(res1.schedule[0].tasks[0].title).toBe(res2.schedule[0].tasks[0].title);
      expect(res1.schedule[0].tasks[0].priority).toBe(res2.schedule[0].tasks[0].priority);
      expect(res1.schedule[0].tasks[0].revisionBlocks).toEqual(res2.schedule[0].tasks[0].revisionBlocks);

      // Verify that changing input changes the deterministic output (different seed)
      const diffOutput = res1.metadata.motivationalIntro !== res3.metadata.motivationalIntro ||
                         res1.metadata.studyStrategy !== res3.metadata.studyStrategy ||
                         res1.schedule[0].tasks[0].title !== res3.schedule[0].tasks[0].title;
      expect(diffOutput).toBe(true);
    });
  });

});

