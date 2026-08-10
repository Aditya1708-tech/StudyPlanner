import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateCacheKey, getCachedPlan, cachePlan } from './gemini';
import { PlannerInput, StudyPlanResult } from '../types';

describe('Cache Utilities Unit Tests', () => {
  const mockInput: PlannerInput = {
    subjects: ['Chemistry', 'Mathematics'],
    examDates: {
      'Chemistry': '2026-08-15',
      'Mathematics': '2026-08-18'
    },
    dailyHours: 4
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should generate a deterministic cache key', () => {
    const key1 = generateCacheKey(mockInput);
    const key2 = generateCacheKey(mockInput);
    expect(key1).toBeTypeOf('string');
    expect(key1).toBe(key2); // must be deterministic
    expect(key1).toContain('studyplan_cache');
    expect(key1).toContain('Chemistry');
    expect(key1).toContain('Mathematics');
  });

  it('should retrieve null when cache is empty', () => {
    const cached = getCachedPlan(mockInput);
    expect(cached).toBeNull();
  });

  it('should correctly write and retrieve plans from the cache', () => {
    const mockResult: StudyPlanResult = {
      schedule: [
        {
          date: '2026-08-15',
          tasks: [
            {
              id: 'task-1',
              title: 'Cram for chemistry',
              subject: 'Chemistry',
              dueDate: '2026-08-15',
              priority: 'High',
              estimatedHours: 2,
              completed: false,
              revisionBlocks: ['mock prep']
            }
          ]
        }
      ],
      metadata: {
        generationSource: 'gemini',
        promptVersion: 'v2',
        generatedAt: '10/08/2026, 17:35:00',
        estimatedDifficulty: 'medium'
      }
    };

    cachePlan(mockInput, mockResult);
    
    // Check that plan exists in cache
    const cached = getCachedPlan(mockInput);
    expect(cached).not.toBeNull();
    expect(cached?.metadata.promptVersion).toBe('v2');
    expect(cached?.schedule.length).toBe(1);
    expect(cached?.schedule[0].tasks[0].title).toBe('Cram for chemistry');
  });

  it('should invalidate cache if subjects sorting differs but values match (deterministic)', () => {
    const inputShuffled: PlannerInput = {
      subjects: ['Mathematics', 'Chemistry'], // shuffled
      examDates: {
        'Chemistry': '2026-08-15',
        'Mathematics': '2026-08-18'
      },
      dailyHours: 4
    };

    const mockResult: StudyPlanResult = {
      schedule: [],
      metadata: {
        generationSource: 'gemini',
        promptVersion: 'v2',
        generatedAt: '10/08/2026, 17:35:00',
        estimatedDifficulty: 'medium'
      }
    };

    cachePlan(mockInput, mockResult);
    
    // Shuffled subjects should generate the exact same cache key and thus hit the cache
    const cached = getCachedPlan(inputShuffled);
    expect(cached).not.toBeNull();
  });
});
