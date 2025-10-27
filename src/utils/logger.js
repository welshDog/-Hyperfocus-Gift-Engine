const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const LOG_EMOJIS = {
  [LOG_LEVELS.ERROR]: '❌',
  [LOG_LEVELS.WARN]: '⚠️',
  [LOG_LEVELS.INFO]: 'ℹ️',
  [LOG_LEVELS.DEBUG]: '🐛'
};

class Logger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const emoji = LOG_EMOJIS[level] || '';
    
    if (this.shouldLog(level)) {
      const logMethod = console[level] || console.log;
      logMethod(`[${timestamp}] ${emoji} [${level.toUpperCase()}] ${message}`, data);
      
      // In production, you might want to send errors to a logging service
      if (level === LOG_LEVELS.ERROR && process.env.NODE_ENV === 'production') {
        // this.sendToErrorTracking({ timestamp, level, message, ...data });
      }
    }
  }

  shouldLog(level) {
    const levels = Object.values(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  error(message, data) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }
}

export const logger = new Logger();
