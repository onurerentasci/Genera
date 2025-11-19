/**
 * Logger Service for Frontend
 * Provides centralized logging with environment-aware behavior
 */

type LogContext = Record<string, unknown>;

class Logger {
  /**
   * Log error messages
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error, context);
    }
    
    // In production, you can integrate with:
    // - Sentry: Sentry.captureException(error)
    // - LogRocket: LogRocket.error(message)
    // - Custom analytics service
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
