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
  if (!ENV.GEMINI_API_KEY) {
    if (ENV.isDev) {
      logger.warn(
        'VITE_GEMINI_API_KEY is missing. ' +
        'Please add VITE_GEMINI_API_KEY to your .env file. ' +
        'Currently using the local fallback scheduler.'
      );
    }
    return false;
  }
  return true;
};
