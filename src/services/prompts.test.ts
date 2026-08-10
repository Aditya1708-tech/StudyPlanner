import { describe, it, expect } from 'vitest';
import { PROMPT_VERSION, buildPlannerPrompt } from './prompts';
import { PlannerInput } from '../types';

describe('Prompt Builder Unit Tests', () => {
  it('should export the correct prompt version', () => {
    expect(PROMPT_VERSION).toBe('v2');
  });

  it('should correctly format the input parameters into the prompt output', () => {
    const mockInput: PlannerInput = {
      subjects: ['Chemistry', 'Calculus'],
      examDates: {
        'Chemistry': '2026-08-15',
        'Calculus': '2026-08-18'
      },
      dailyHours: 4
    };

    const prompt = buildPlannerPrompt(mockInput);
    
    // Check that prompt is a string and is not empty
    expect(prompt).toBeTypeOf('string');
    expect(prompt.length).toBeGreaterThan(0);

    // Verify key inputs are printed in the prompt body
    expect(prompt).toContain('Chemistry');
    expect(prompt).toContain('Calculus');
    expect(prompt).toContain('2026-08-15');
    expect(prompt).toContain('2026-08-18');
    expect(prompt).toContain('Active Subjects: Chemistry, Calculus');
    
    // Check that hours constraints are printed
    expect(prompt).toContain('4 hours');
  });
});
