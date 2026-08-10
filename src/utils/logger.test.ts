import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('Logger Utility Unit Tests', () => {
  let logSpy: any;
  let warnSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should call console.warn when logger.warn is invoked', () => {
    logger.warn('Test warning message', { detail: 'testing' });
    expect(warnSpy).toHaveBeenCalledWith('[WARN] Test warning message', { detail: 'testing' });
  });

  it('should call console.error when logger.error is invoked', () => {
    logger.error('Test error message', new Error('Fail'));
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain('[ERROR] Test error message');
  });

  it('should invoke console.log in non-production environments when logger.info is run', () => {
    logger.info('Test info message');
    // In vitest environment (usually test/development, so PROD is false), info should be output
    expect(logSpy).toHaveBeenCalledWith('[INFO] Test info message');
  });
});
