import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Logger, LogLevel, LogCategory } from '../src/utils/logger';
import { loggingConfig } from '../src/config/logging';

let mongoServer: MongoMemoryServer;

// Setup database connection for this test file
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'DEBUG';
  process.env.LOG_CONSOLE = 'false';
  process.env.LOG_FILE = 'false';

  // Start in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Connect to test database only if not already connected
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
  }

  // Wait for connection to be stable
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Cleanup after tests
afterAll(async () => {
  // Close database connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  // Stop the in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Logging System', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance();
    logger.clearLogBuffer();
    // Reset to development configuration for tests
    logger.updateConfig({
      level: LogLevel.TRACE,
      categories: Object.values(LogCategory),
      enableConsole: false,
      enableFile: false,
      enableColors: false,
      enableTimestamp: true,
      enableRequestId: true
    });
  });

  test('should create singleton instance', () => {
    const logger1 = Logger.getInstance();
    const logger2 = Logger.getInstance();
    expect(logger1).toBe(logger2);
  });

  test('should log different levels correctly', async () => {
    await logger.error(LogCategory.SYSTEM, 'Test error message');
    await logger.warn(LogCategory.SYSTEM, 'Test warning message');
    await logger.info(LogCategory.SYSTEM, 'Test info message');
    await logger.debug(LogCategory.SYSTEM, 'Test debug message');
    await logger.trace(LogCategory.SYSTEM, 'Test trace message');

    const logs = logger.getLogBuffer();
    expect(logs).toHaveLength(5);
    expect(logs[0].level).toBe(LogLevel.ERROR);
    expect(logs[1].level).toBe(LogLevel.WARN);
    expect(logs[2].level).toBe(LogLevel.INFO);
    expect(logs[3].level).toBe(LogLevel.DEBUG);
    expect(logs[4].level).toBe(LogLevel.TRACE);
  });

  test('should respect log level filtering', async () => {
    // Set log level to WARN
    logger.updateConfig({ level: LogLevel.WARN });

    await logger.error(LogCategory.SYSTEM, 'Error message');
    await logger.warn(LogCategory.SYSTEM, 'Warning message');
    await logger.info(LogCategory.SYSTEM, 'Info message');
    await logger.debug(LogCategory.SYSTEM, 'Debug message');

    const logs = logger.getLogBuffer();
    expect(logs).toHaveLength(2); // Only ERROR and WARN should be logged
    expect(logs[0].level).toBe(LogLevel.ERROR);
    expect(logs[1].level).toBe(LogLevel.WARN);
  });

  test('should respect category filtering', async () => {
    // Set categories to only SYSTEM and DATABASE
    logger.updateConfig({ categories: [LogCategory.SYSTEM, LogCategory.DATABASE] });

    await logger.info(LogCategory.SYSTEM, 'System message');
    await logger.info(LogCategory.DATABASE, 'Database message');
    await logger.info(LogCategory.API, 'API message');
    await logger.info(LogCategory.AUTH, 'Auth message');

    const logs = logger.getLogBuffer();
    expect(logs).toHaveLength(2); // Only SYSTEM and DATABASE should be logged
    expect(logs[0].category).toBe(LogCategory.SYSTEM);
    expect(logs[1].category).toBe(LogCategory.DATABASE);
  });

  test('should handle request ID context', async () => {
    const requestId = logger.generateRequestId();
    logger.setRequestId(requestId);

    await logger.info(LogCategory.SYSTEM, 'Message with request ID');

    const logs = logger.getLogBuffer();
    expect(logs[0].requestId).toBe(requestId);

    logger.clearRequestId();
    await logger.info(LogCategory.SYSTEM, 'Message without request ID');

    const allLogs = logger.getLogBuffer();
    expect(allLogs[1].requestId).toBeUndefined();
  });

  test('should handle user context', async () => {
    const userId = 'user123';
    await logger.info(LogCategory.USER, 'User action', undefined, userId);

    const logs = logger.getLogBuffer();
    expect(logs[0].userId).toBe(userId);
  });

  test('should handle data objects', async () => {
    const testData = { key: 'value', number: 42 };
    await logger.info(LogCategory.SYSTEM, 'Message with data', testData);

    const logs = logger.getLogBuffer();
    expect(logs[0].data).toEqual(testData);
  });

  test('should include stack trace for errors', async () => {
    await logger.error(LogCategory.SYSTEM, 'Error with stack trace');

    const logs = logger.getLogBuffer();
    expect(logs[0].stack).toBeDefined();
    expect(logs[0].stack).toContain('Error:');
  });

  test('should filter logs by criteria', async () => {
    const requestId1 = logger.generateRequestId();
    const requestId2 = logger.generateRequestId();

    logger.setRequestId(requestId1);
    await logger.info(LogCategory.SYSTEM, 'Message 1');
    await logger.error(LogCategory.DATABASE, 'Error 1');

    logger.setRequestId(requestId2);
    await logger.info(LogCategory.API, 'Message 2');
    await logger.warn(LogCategory.SYSTEM, 'Warning 1');

    // Filter by request ID
    const request1Logs = logger.filterLogs({ requestId: requestId1 });
    expect(request1Logs).toHaveLength(2);

    // Filter by level
    const errorLogs = logger.filterLogs({ level: LogLevel.ERROR });
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].message).toBe('Error 1');

    // Filter by category
    const systemLogs = logger.filterLogs({ category: LogCategory.SYSTEM });
    expect(systemLogs).toHaveLength(2);
  });

  test('should log performance metrics', async () => {
    await logger.logPerformance('test-operation', 150, { records: 100 });

    const logs = logger.getLogBuffer();
    expect(logs[0].category).toBe(LogCategory.PERFORMANCE);
    expect(logs[0].message).toContain('test-operation');
    expect(logs[0].message).toContain('150ms');
  });

  test('should log security events', async () => {
    await logger.logSecurityEvent('suspicious-activity', { ip: '192.168.1.1' });

    const logs = logger.getLogBuffer();
    expect(logs[0].category).toBe(LogCategory.SECURITY);
    expect(logs[0].message).toContain('suspicious-activity');
  });

  test('should log database operations', async () => {
    await logger.logDatabaseOperation('find', 'users', { filter: { active: true } });

    const logs = logger.getLogBuffer();
    expect(logs[0].category).toBe(LogCategory.DATABASE);
    expect(logs[0].message).toContain('find');
    expect(logs[0].message).toContain('users');
  });

  test('should log API requests', async () => {
    await logger.logApiRequest('GET', '/api/users', 200, 50, 'user123');

    const logs = logger.getLogBuffer();
    expect(logs[0].category).toBe(LogCategory.API);
    expect(logs[0].message).toContain('GET /api/users');
    expect(logs[0].message).toContain('200');
    expect(logs[0].message).toContain('50ms');
    expect(logs[0].userId).toBe('user123');
  });

  test('should log API errors', async () => {
    await logger.logApiRequest('POST', '/api/auth', 401, 100);

    const logs = logger.getLogBuffer();
    expect(logs[0].level).toBe(LogLevel.WARN); // 401 should be logged as WARN
  });
});

describe('Logging Configuration', () => {
  test('should configure for development environment', () => {
    loggingConfig.configureDevelopment();
    const status = loggingConfig.getStatus();
    
    expect(status.level).toBe('DEBUG');
    expect(status.console).toBe(true);
    expect(status.file).toBe(true);
    expect(status.colors).toBe(true);
  });

  test('should configure for production environment', () => {
    loggingConfig.configureProduction();
    const status = loggingConfig.getStatus();
    
    expect(status.level).toBe('WARN');
    expect(status.console).toBe(false);
    expect(status.file).toBe(true);
    expect(status.colors).toBe(false);
  });

  test('should configure for testing environment', () => {
    loggingConfig.configureTesting();
    const status = loggingConfig.getStatus();
    
    expect(status.level).toBe('ERROR');
    expect(status.console).toBe(false);
    expect(status.file).toBe(false);
  });

  test('should enable specific categories', () => {
    loggingConfig.enableCategories([LogCategory.PERFORMANCE, LogCategory.SECURITY]);
    const status = loggingConfig.getStatus();
    
    expect(status.categories).toContain(LogCategory.PERFORMANCE);
    expect(status.categories).toContain(LogCategory.SECURITY);
  });

  test('should disable specific categories', () => {
    loggingConfig.disableCategories([LogCategory.PERFORMANCE]);
    const status = loggingConfig.getStatus();
    
    expect(status.categories).not.toContain(LogCategory.PERFORMANCE);
  });

  test('should set log level', () => {
    loggingConfig.setLogLevel(LogLevel.DEBUG);
    const status = loggingConfig.getStatus();
    
    expect(status.level).toBe('DEBUG');
  });
});
