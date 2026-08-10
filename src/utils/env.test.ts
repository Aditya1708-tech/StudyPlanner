import { describe, it, expect, vi } from 'vitest';
import { ENV, validateEnv } from './env';
import { logger } from './logger';

describe('Environment Config Unit Tests', () => {
  it('should export an ENV object with expected properties', () => {
    expect(ENV).toBeTypeOf('object');
    expect(ENV).toHaveProperty('GEMINI_API_KEY');
    expect(ENV).toHaveProperty('isDev');
    expect(ENV).toHaveProperty('isProd');
  });

  it('should return false for validateEnv if VITE_GEMINI_API_KEY is not defined', () => {
    const originalKey = ENV.GEMINI_API_KEY;
    
    // Simulate key is missing
    ENV.GEMINI_API_KEY = '';
    
    // Spy on logger
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const result = validateEnv();
    
    expect(result).toBe(false);
    if (ENV.isDev) {
      expect(warnSpy).toHaveBeenCalled();
    }

    // Restore
    ENV.GEMINI_API_KEY = originalKey;
    warnSpy.mockRestore();
  });
});
