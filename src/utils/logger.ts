import fs from 'fs';
import path from 'path';

/**
 * Log Levels for filtering and categorization
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

/**
 * Log Categories for filtering specific functionality
 */
export enum LogCategory {
  // System categories
  SYSTEM = 'SYSTEM',
  DATABASE = 'DATABASE',
  AUTH = 'AUTH',
  ENCRYPTION = 'ENCRYPTION',
  
  // Application categories
  API = 'API',
  USER = 'USER',
  FARM = 'FARM',
  FIELD = 'FIELD',
  WORKER = 'WORKER',
  
  // Performance categories
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  
  // Development categories
  TEST = 'TEST',
  DEVELOPMENT = 'DEVELOPMENT'
}

/**
 * Log Entry Interface
 */
export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  userId?: string;
  requestId?: string;
  stack?: string;
}

/**
 * Logger Configuration
 */
export interface ILoggerConfig {
  level: LogLevel;
  categories: LogCategory[];
  enableConsole: boolean;
  enableFile: boolean;
  logDirectory: string;
  maxFileSize: number; // in MB
  maxFiles: number;
  enableColors: boolean;
  enableTimestamp: boolean;
  enableRequestId: boolean;
}

/**
 * Comprehensive Logging System for PrimeRoseFarms
 * Features:
 * - Multiple log levels (ERROR, WARN, INFO, DEBUG, TRACE)
 * - Category-based filtering
 * - Console and file output
 * - Log rotation
 * - Request ID tracking
 * - User context tracking
 * - Performance monitoring
 * - Security event logging
 */
export class Logger {
  private static instance: Logger;
  private config: ILoggerConfig;
  private logBuffer: ILogEntry[] = [];
  private requestIdCounter: number = 0;
  private currentRequestId: string | null = null;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.ensureLogDirectory();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ILoggerConfig {
    return {
      level: this.getLogLevelFromEnv(),
      categories: this.getCategoriesFromEnv(),
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE !== 'false',
      logDirectory: process.env.LOG_DIRECTORY || './logs',
      maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10'), // 10MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
      enableColors: process.env.LOG_COLORS !== 'false',
      enableTimestamp: process.env.LOG_TIMESTAMP !== 'false',
      enableRequestId: process.env.LOG_REQUEST_ID !== 'false'
    };
  }

  /**
   * Get log level from environment
   */
  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      case 'TRACE': return LogLevel.TRACE;
      default: return LogLevel.INFO;
    }
  }

  /**
   * Get categories from environment
   */
  private getCategoriesFromEnv(): LogCategory[] {
    const categories = process.env.LOG_CATEGORIES;
    if (!categories) {
      return Object.values(LogCategory); // All categories by default
    }
    
    return categories.split(',').map(cat => cat.trim().toUpperCase() as LogCategory);
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (this.config.enableFile && !fs.existsSync(this.config.logDirectory)) {
      fs.mkdirSync(this.config.logDirectory, { recursive: true });
    }
  }

  /**
   * Generate unique request ID
   */
  public generateRequestId(): string {
    this.requestIdCounter++;
    return `req_${Date.now()}_${this.requestIdCounter}`;
  }

  /**
   * Set current request ID for context
   */
  public setRequestId(requestId: string): void {
    this.currentRequestId = requestId;
  }

  /**
   * Clear current request ID
   */
  public clearRequestId(): void {
    this.currentRequestId = null;
  }

  /**
   * Check if log should be processed
   */
  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    return level <= this.config.level && this.config.categories.includes(category);
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: ILogEntry): string {
    const parts: string[] = [];
    
    if (this.config.enableTimestamp) {
      parts.push(`[${entry.timestamp}]`);
    }
    
    parts.push(`[${LogLevel[entry.level]}]`);
    parts.push(`[${entry.category}]`);
    
    if (this.config.enableRequestId && entry.requestId) {
      parts.push(`[${entry.requestId}]`);
    }
    
    if (entry.userId) {
      parts.push(`[USER:${entry.userId}]`);
    }
    
    parts.push(entry.message);
    
    if (entry.data) {
      parts.push(`\nData: ${JSON.stringify(entry.data, null, 2)}`);
    }
    
    if (entry.stack) {
      parts.push(`\nStack: ${entry.stack}`);
    }
    
    return parts.join(' ');
  }

  /**
   * Get color for log level
   */
  private getColorForLevel(level: LogLevel): string {
    if (!this.config.enableColors) return '';
    
    switch (level) {
      case LogLevel.ERROR: return '\x1b[31m'; // Red
      case LogLevel.WARN: return '\x1b[33m';  // Yellow
      case LogLevel.INFO: return '\x1b[36m';  // Cyan
      case LogLevel.DEBUG: return '\x1b[35m'; // Magenta
      case LogLevel.TRACE: return '\x1b[37m'; // White
      default: return '';
    }
  }

  /**
   * Reset color
   */
  private resetColor(): string {
    return this.config.enableColors ? '\x1b[0m' : '';
  }

  /**
   * Write to console
   */
  private writeToConsole(entry: ILogEntry): void {
    if (!this.config.enableConsole) return;
    
    const formatted = this.formatLogEntry(entry);
    const color = this.getColorForLevel(entry.level);
    const reset = this.resetColor();
    
    console.log(`${color}${formatted}${reset}`);
  }

  /**
   * Write to file
   */
  private async writeToFile(entry: ILogEntry): Promise<void> {
    if (!this.config.enableFile) return;
    
    try {
      const logFile = path.join(this.config.logDirectory, 'application.log');
      const formatted = this.formatLogEntry(entry);
      
      fs.appendFileSync(logFile, formatted + '\n');
      
      // Check file size and rotate if necessary
      await this.rotateLogFileIfNeeded(logFile);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Rotate log file if it exceeds max size
   */
  private async rotateLogFileIfNeeded(logFile: string): Promise<void> {
    try {
      const stats = fs.statSync(logFile);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB >= this.config.maxFileSize) {
        // Rotate existing files
        for (let i = this.config.maxFiles - 1; i > 0; i--) {
          const oldFile = `${logFile}.${i}`;
          const newFile = `${logFile}.${i + 1}`;
          
          if (fs.existsSync(oldFile)) {
            if (i === this.config.maxFiles - 1) {
              fs.unlinkSync(oldFile); // Delete oldest file
            } else {
              fs.renameSync(oldFile, newFile);
            }
          }
        }
        
        // Move current log to .1
        fs.renameSync(logFile, `${logFile}.1`);
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Core logging method
   */
  private async log(level: LogLevel, category: LogCategory, message: string, data?: any, userId?: string): Promise<void> {
    if (!this.shouldLog(level, category)) return;
    
    const entry: ILogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      userId,
      requestId: this.currentRequestId || undefined
    };
    
    // Add stack trace for errors
    if (level === LogLevel.ERROR) {
      entry.stack = new Error().stack;
    }
    
    // Add to buffer for potential batch processing
    this.logBuffer.push(entry);
    
    // Write to outputs
    this.writeToConsole(entry);
    await this.writeToFile(entry);
    
    // Clear buffer if it gets too large
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500); // Keep last 500 entries
    }
  }

  /**
   * Public logging methods
   */
  public async error(category: LogCategory, message: string, data?: any, userId?: string): Promise<void> {
    await this.log(LogLevel.ERROR, category, message, data, userId);
  }

  public async warn(category: LogCategory, message: string, data?: any, userId?: string): Promise<void> {
    await this.log(LogLevel.WARN, category, message, data, userId);
  }

  public async info(category: LogCategory, message: string, data?: any, userId?: string): Promise<void> {
    await this.log(LogLevel.INFO, category, message, data, userId);
  }

  public async debug(category: LogCategory, message: string, data?: any, userId?: string): Promise<void> {
    await this.log(LogLevel.DEBUG, category, message, data, userId);
  }

  public async trace(category: LogCategory, message: string, data?: any, userId?: string): Promise<void> {
    await this.log(LogLevel.TRACE, category, message, data, userId);
  }

  /**
   * Performance logging
   */
  public async logPerformance(operation: string, duration: number, data?: any): Promise<void> {
    await this.info(LogCategory.PERFORMANCE, `Operation '${operation}' completed in ${duration}ms`, data);
  }

  /**
   * Security event logging
   */
  public async logSecurityEvent(event: string, data?: any, userId?: string): Promise<void> {
    await this.warn(LogCategory.SECURITY, `Security event: ${event}`, data, userId);
  }

  /**
   * Database operation logging
   */
  public async logDatabaseOperation(operation: string, collection: string, data?: any): Promise<void> {
    await this.debug(LogCategory.DATABASE, `DB ${operation} on ${collection}`, data);
  }

  /**
   * API request logging
   */
  public async logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string): Promise<void> {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    await this.log(level, LogCategory.API, `${method} ${path} - ${statusCode} (${duration}ms)`, { method, path, statusCode, duration }, userId);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ILoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.ensureLogDirectory();
  }

  /**
   * Get current configuration
   */
  public getConfig(): ILoggerConfig {
    return { ...this.config };
  }

  /**
   * Get log buffer (for debugging)
   */
  public getLogBuffer(): ILogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  public clearLogBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Filter logs by criteria
   */
  public filterLogs(criteria: {
    level?: LogLevel;
    category?: LogCategory;
    userId?: string;
    requestId?: string;
    startTime?: Date;
    endTime?: Date;
  }): ILogEntry[] {
    return this.logBuffer.filter(entry => {
      if (criteria.level !== undefined && entry.level !== criteria.level) return false;
      if (criteria.category && entry.category !== criteria.category) return false;
      if (criteria.userId && entry.userId !== criteria.userId) return false;
      if (criteria.requestId && entry.requestId !== criteria.requestId) return false;
      if (criteria.startTime && new Date(entry.timestamp) < criteria.startTime) return false;
      if (criteria.endTime && new Date(entry.timestamp) > criteria.endTime) return false;
      return true;
    });
  }
}

// Singleton instance
export const logger = Logger.getInstance();

// Convenience functions for quick logging
export const logError = (category: LogCategory, message: string, data?: any, userId?: string) => 
  logger.error(category, message, data, userId);

export const logWarn = (category: LogCategory, message: string, data?: any, userId?: string) => 
  logger.warn(category, message, data, userId);

export const logInfo = (category: LogCategory, message: string, data?: any, userId?: string) => 
  logger.info(category, message, data, userId);

export const logDebug = (category: LogCategory, message: string, data?: any, userId?: string) => 
  logger.debug(category, message, data, userId);

export const logTrace = (category: LogCategory, message: string, data?: any, userId?: string) => 
  logger.trace(category, message, data, userId);
