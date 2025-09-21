import { logger, LogCategory, LogLevel } from '../utils/logger';

/**
 * Logging Configuration Manager
 * Provides easy ways to configure logging for different environments
 */
export class LoggingConfig {
  private static instance: LoggingConfig;

  private constructor() {}

  public static getInstance(): LoggingConfig {
    if (!LoggingConfig.instance) {
      LoggingConfig.instance = new LoggingConfig();
    }
    return LoggingConfig.instance;
  }

  /**
   * Configure logging for development environment
   */
  public configureDevelopment(): void {
    logger.updateConfig({
      level: LogLevel.DEBUG,
      categories: Object.values(LogCategory),
      enableConsole: true,
      enableFile: true,
      enableColors: true,
      enableTimestamp: true,
      enableRequestId: true
    });

    logger.info(LogCategory.SYSTEM, 'Logging configured for development environment');
  }

  /**
   * Configure logging for production environment
   */
  public configureProduction(): void {
    logger.updateConfig({
      level: LogLevel.WARN,
      categories: [
        LogCategory.SYSTEM,
        LogCategory.DATABASE,
        LogCategory.AUTH,
        LogCategory.API,
        LogCategory.SECURITY,
        LogCategory.PERFORMANCE
      ],
      enableConsole: false,
      enableFile: true,
      enableColors: false,
      enableTimestamp: true,
      enableRequestId: true
    });

    logger.info(LogCategory.SYSTEM, 'Logging configured for production environment');
  }

  /**
   * Configure logging for testing environment
   */
  public configureTesting(): void {
    logger.updateConfig({
      level: LogLevel.ERROR,
      categories: [LogCategory.SYSTEM, LogCategory.DATABASE, LogCategory.AUTH],
      enableConsole: false,
      enableFile: false,
      enableColors: false,
      enableTimestamp: false,
      enableRequestId: false
    });

    // Don't log the configuration message in tests to avoid noise
  }

  /**
   * Configure logging based on environment
   */
  public configureForEnvironment(): void {
    const env = process.env.NODE_ENV || 'development';

    switch (env) {
      case 'production':
        this.configureProduction();
        break;
      case 'test':
        this.configureTesting();
        break;
      case 'development':
      default:
        this.configureDevelopment();
        break;
    }
  }

  /**
   * Enable specific categories for debugging
   */
  public enableCategories(categories: LogCategory[]): void {
    const currentConfig = logger.getConfig();
    const newCategories = [...new Set([...currentConfig.categories, ...categories])];
    
    logger.updateConfig({
      categories: newCategories
    });

    logger.info(LogCategory.SYSTEM, `Enabled logging categories: ${categories.join(', ')}`);
  }

  /**
   * Disable specific categories
   */
  public disableCategories(categories: LogCategory[]): void {
    const currentConfig = logger.getConfig();
    const newCategories = currentConfig.categories.filter(cat => !categories.includes(cat));
    
    logger.updateConfig({
      categories: newCategories
    });

    logger.info(LogCategory.SYSTEM, `Disabled logging categories: ${categories.join(', ')}`);
  }

  /**
   * Set log level
   */
  public setLogLevel(level: LogLevel): void {
    logger.updateConfig({ level });
    logger.info(LogCategory.SYSTEM, `Log level set to: ${LogLevel[level]}`);
  }

  /**
   * Enable performance monitoring
   */
  public enablePerformanceMonitoring(): void {
    this.enableCategories([LogCategory.PERFORMANCE]);
    logger.info(LogCategory.SYSTEM, 'Performance monitoring enabled');
  }

  /**
   * Enable security monitoring
   */
  public enableSecurityMonitoring(): void {
    this.enableCategories([LogCategory.SECURITY]);
    logger.info(LogCategory.SYSTEM, 'Security monitoring enabled');
  }

  /**
   * Enable database monitoring
   */
  public enableDatabaseMonitoring(): void {
    this.enableCategories([LogCategory.DATABASE]);
    logger.info(LogCategory.SYSTEM, 'Database monitoring enabled');
  }

  /**
   * Get current logging status
   */
  public getStatus(): {
    level: string;
    categories: string[];
    console: boolean;
    file: boolean;
    colors: boolean;
    timestamp: boolean;
    requestId: boolean;
  } {
    const config = logger.getConfig();
    return {
      level: LogLevel[config.level],
      categories: config.categories,
      console: config.enableConsole,
      file: config.enableFile,
      colors: config.enableColors,
      timestamp: config.enableTimestamp,
      requestId: config.enableRequestId
    };
  }
}

// Singleton instance
export const loggingConfig = LoggingConfig.getInstance();
