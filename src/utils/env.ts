import { logger } from './logger';

/**
 * Centralized environment configuration.
 */
export const ENV = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

/**
 * Validates environment variables on startup.
 * Logs developer-friendly warning in development if configuration is missing.
 */
export const validateEnv = (): boolean => {
  const key = ENV.GEMINI_API_KEY;
  if (!key || key === 'demo-api-key') {
    if (ENV.isDev) {
      logger.warn(
        'VITE_GEMINI_API_KEY is missing or is placeholder. ' +
        'Currently running in Demo Mode with local fallback scheduler.'
      );
    }
    return false;
  }
  if (!key.startsWith('AIzaSy')) {
    logger.warn(
      'VITE_GEMINI_API_KEY is invalid (should start with "AIzaSy"). ' +
      'Falling back to Demo Mode.'
    );
    return false;
  }
  return true;
};
