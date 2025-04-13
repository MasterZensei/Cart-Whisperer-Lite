interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: string;
  additionalData?: Record<string, any>;
}

/**
 * Centralized logger utility
 * Can be extended to send logs to external services like Sentry, Datadog, etc.
 */
class Logger {
  private readonly enableConsole: boolean;
  private readonly environment: string;
  
  constructor() {
    this.enableConsole = process.env.NODE_ENV !== 'test';
    this.environment = process.env.NODE_ENV || 'development';
  }
  
  /**
   * Log debug message
   */
  debug(message: string, options?: Omit<LoggerOptions, 'level'>) {
    this.log(message, { ...options, level: 'debug' });
  }
  
  /**
   * Log info message
   */
  info(message: string, options?: Omit<LoggerOptions, 'level'>) {
    this.log(message, { ...options, level: 'info' });
  }
  
  /**
   * Log warning message
   */
  warn(message: string, options?: Omit<LoggerOptions, 'level'>) {
    this.log(message, { ...options, level: 'warn' });
  }
  
  /**
   * Log error message
   */
  error(message: string | Error, options?: Omit<LoggerOptions, 'level'>) {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorStack = message instanceof Error ? message.stack : undefined;
    
    this.log(errorMessage, { 
      ...options, 
      level: 'error',
      additionalData: {
        ...(options?.additionalData || {}),
        stack: errorStack,
      }
    });
    
    // Here we could send the error to an external service like Sentry or Datadog
    // Example: if (process.env.SENTRY_DSN) Sentry.captureException(message);
  }
  
  /**
   * Internal log method
   */
  private log(message: string, options?: LoggerOptions) {
    const { 
      level = 'info', 
      context = 'app',
      additionalData = {}
    } = options || {};
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context,
      message,
      environment: this.environment,
      ...additionalData
    };
    
    // Log to console in development
    if (this.enableConsole) {
      const consoleMethod = level === 'error' ? 'error' 
                         : level === 'warn' ? 'warn'
                         : level === 'debug' ? 'debug'
                         : 'log';
                         
      console[consoleMethod](
        `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`,
        Object.keys(additionalData).length ? additionalData : ''
      );
    }
    
    // In production, we could send logs to a logging service
    if (this.environment === 'production') {
      // Example implementation for sending logs to a service
      // this.sendToLoggingService(logEntry);
    }
    
    return logEntry;
  }
  
  /**
   * Method to send logs to an external service
   * This is just a stub - implement with your preferred logging service
   */
  private async sendToLoggingService(logEntry: any) {
    // Example implementation:
    // await fetch(process.env.LOGGING_ENDPOINT, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
  }
}

// Export a singleton instance
export const logger = new Logger(); 