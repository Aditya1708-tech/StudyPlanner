import { describe, it, expect } from 'vitest';
import { validateStudyPlan } from './gemini';

describe('Validation Helpers Unit Tests', () => {
  it('should successfully validate a correct study plan payload', () => {
    const validPayload = {
      estimatedDifficulty: 'medium',
      schedule: [
        {
          date: '2026-08-15',
          tasks: [
            {
              title: 'Review Chapter 5 Organic synthetics mechanisms',
              subject: 'Chemistry',
              priority: 'High',
              estimatedHours: 2.0,
              revisionBlocks: ['mechanisms', 'electrophilic addition']
            }
          ]
        }
      ]
    };

    const validated = validateStudyPlan(validPayload);
    expect(validated.estimatedDifficulty).toBe('medium');
    expect(validated.schedule.length).toBe(1);
    expect(validated.schedule[0].date).toBe('2026-08-15');
    expect(validated.schedule[0].tasks.length).toBe(1);
    expect(validated.schedule[0].tasks[0].title).toBe('Review Chapter 5 Organic synthetics mechanisms');
    expect(validated.schedule[0].tasks[0].subject).toBe('Chemistry');
    expect(validated.schedule[0].tasks[0].priority).toBe('High');
    expect(validated.schedule[0].tasks[0].estimatedHours).toBe(2.0);
    expect(validated.schedule[0].tasks[0].completed).toBe(false); // check that default state is populated
  });

  it('should fallback to default parameters for missing properties inside tasks', () => {
    const payloadWithMissingProperties = {
      estimatedDifficulty: 'easy',
      schedule: [
        {
          date: '2026-08-16',
          tasks: [
            {
              title: 'Basic math practice sheet'
              // subject, priority, estimatedHours, revisionBlocks are missing
            }
          ]
        }
      ]
    };

    const validated = validateStudyPlan(payloadWithMissingProperties);
    const task = validated.schedule[0].tasks[0];
    expect(task.subject).toBe('General'); // Default subject fallback
    expect(task.priority).toBe('Medium'); // Default priority fallback
    expect(task.estimatedHours).toBe(1.5); // Default hours fallback
    expect(task.revisionBlocks).toEqual(['Concept review']); // Default revision block fallback
  });

  it('should throw an error if the payload contains no schedule', () => {
    const invalidPayload = {
      estimatedDifficulty: 'hard'
      // schedule is missing
    };

    expect(() => validateStudyPlan(invalidPayload)).toThrow("Invalid response format: 'schedule' array is missing or invalid");
  });

  it('should throw an error if no valid tasks are present', () => {
    const payloadWithNoValidTasks = {
      estimatedDifficulty: 'hard',
      schedule: [
        {
          date: '2026-08-17',
          tasks: [] // no valid tasks
        }
      ]
    };

    expect(() => validateStudyPlan(payloadWithNoValidTasks)).toThrow("No valid study days or tasks found in the generated response");
  });

  it('should fallback to default difficulty if not set or invalid', () => {
    const payloadWithInvalidDifficulty = {
      estimatedDifficulty: 'super_hard', // invalid
      schedule: [
        {
          date: '2026-08-18',
          tasks: [
            {
              title: 'Review physics outlines',
              subject: 'Physics'
            }
          ]
        }
      ]
    };

    const validated = validateStudyPlan(payloadWithInvalidDifficulty);
    expect(validated.estimatedDifficulty).toBe('medium'); // defaults to medium
  });
});
