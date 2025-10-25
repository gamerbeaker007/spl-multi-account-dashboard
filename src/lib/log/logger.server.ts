// Simple server-side logger
interface LogLevel {
  INFO: string;
  WARN: string;
  ERROR: string;
  DEBUG: string;
}

const LOG_LEVELS: LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
} as const;

class Logger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message));
  }

  error(message: string): void {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message));
  }

  debug(message: string): void {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_LOGS === 'true') {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message));
    }
  }
}

const logger = new Logger();
export default logger;
