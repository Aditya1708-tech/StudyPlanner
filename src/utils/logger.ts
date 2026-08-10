/**
 * Centralized production-ready logging utility.
 * Suppresses verbose info logs in production build environments.
 */
const isProduction = import.meta.env.PROD;

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
