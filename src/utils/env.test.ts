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

  it('should return false for validateEnv if key is "demo-api-key"', () => {
    const originalKey = ENV.GEMINI_API_KEY;
    ENV.GEMINI_API_KEY = 'demo-api-key';
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const result = validateEnv();
    expect(result).toBe(false);

    ENV.GEMINI_API_KEY = originalKey;
    warnSpy.mockRestore();
  });

  it('should return false for validateEnv if key does not start with "AIzaSy"', () => {
    const originalKey = ENV.GEMINI_API_KEY;
    ENV.GEMINI_API_KEY = 'invalid-key-no-prefix';
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const result = validateEnv();
    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalled();

    ENV.GEMINI_API_KEY = originalKey;
    warnSpy.mockRestore();
  });

  it('should return true for validateEnv if key starts with "AIzaSy"', () => {
    const originalKey = ENV.GEMINI_API_KEY;
    ENV.GEMINI_API_KEY = 'AIzaSy_valid_mock_key';
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const result = validateEnv();
    expect(result).toBe(true);

    ENV.GEMINI_API_KEY = originalKey;
    warnSpy.mockRestore();
  });
});
