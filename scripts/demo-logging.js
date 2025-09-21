/**
 * Logging System Demonstration Script
 * 
 * This script demonstrates the various features of the PrimeRoseFarms logging system.
 * Run with: node scripts/demo-logging.js
 */

const { Logger, LogLevel, LogCategory } = require('../dist/utils/logger');
const { loggingConfig } = require('../dist/config/logging');

async function demonstrateLogging() {
  console.log('🚀 PrimeRoseFarms Logging System Demonstration\n');

  // Get logger instance
  const logger = Logger.getInstance();

  // Configure for demonstration
  loggingConfig.configureDevelopment();
  logger.clearLogBuffer();

  console.log('📋 Current Logging Configuration:');
  const status = loggingConfig.getStatus();
  console.log(`   Level: ${status.level}`);
  console.log(`   Categories: ${status.categories.length} enabled`);
  console.log(`   Console: ${status.console ? '✅' : '❌'}`);
  console.log(`   File: ${status.file ? '✅' : '❌'}`);
  console.log(`   Colors: ${status.colors ? '✅' : '❌'}\n`);

  // Demonstrate different log levels
  console.log('📊 Demonstrating Log Levels:');
  await logger.error(LogCategory.SYSTEM, 'This is an ERROR level message');
  await logger.warn(LogCategory.API, 'This is a WARN level message');
  await logger.info(LogCategory.USER, 'This is an INFO level message');
  await logger.debug(LogCategory.DATABASE, 'This is a DEBUG level message');
  await logger.trace(LogCategory.ENCRYPTION, 'This is a TRACE level message');
  console.log();

  // Demonstrate request context
  console.log('🔗 Demonstrating Request Context:');
  const requestId = logger.generateRequestId();
  logger.setRequestId(requestId);
  
  await logger.info(LogCategory.API, 'Request started');
  await logger.debug(LogCategory.DATABASE, 'Database query executed');
  await logger.info(LogCategory.API, 'Request completed');
  
  logger.clearRequestId();
  console.log();

  // Demonstrate user context
  console.log('👤 Demonstrating User Context:');
  await logger.info(LogCategory.USER, 'User profile updated', { 
    changes: ['email', 'phone'] 
  }, 'user123');
  console.log();

  // Demonstrate performance logging
  console.log('⚡ Demonstrating Performance Logging:');
  await logger.logPerformance('user-query', 150, { records: 100 });
  await logger.logPerformance('data-export', 2500, { records: 10000 });
  console.log();

  // Demonstrate security logging
  console.log('🔒 Demonstrating Security Logging:');
  await logger.logSecurityEvent('failed-login', { 
    ip: '192.168.1.1', 
    attempts: 3 
  });
  await logger.logSecurityEvent('suspicious-activity', { 
    path: '/admin/config',
    ip: '10.0.0.1'
  });
  console.log();

  // Demonstrate database logging
  console.log('🗄️ Demonstrating Database Logging:');
  await logger.logDatabaseOperation('find', 'users', { 
    filter: { active: true },
    limit: 50 
  });
  await logger.logDatabaseOperation('update', 'farms', { 
    filter: { _id: 'farm123' },
    update: { status: 'active' }
  });
  console.log();

  // Demonstrate API logging
  console.log('🌐 Demonstrating API Logging:');
  await logger.logApiRequest('GET', '/api/users', 200, 45, 'user123');
  await logger.logApiRequest('POST', '/api/auth', 401, 100);
  await logger.logApiRequest('PUT', '/api/farms', 500, 2000);
  console.log();

  // Demonstrate filtering
  console.log('🔍 Demonstrating Log Filtering:');
  const allLogs = logger.getLogBuffer();
  console.log(`   Total logs: ${allLogs.length}`);
  
  const errorLogs = logger.filterLogs({ level: LogLevel.ERROR });
  console.log(`   Error logs: ${errorLogs.length}`);
  
  const apiLogs = logger.filterLogs({ category: LogCategory.API });
  console.log(`   API logs: ${apiLogs.length}`);
  
  const userLogs = logger.filterLogs({ userId: 'user123' });
  console.log(`   User logs: ${userLogs.length}`);
  
  const requestLogs = logger.filterLogs({ requestId: requestId });
  console.log(`   Request logs: ${requestLogs.length}`);
  console.log();

  // Demonstrate configuration changes
  console.log('⚙️ Demonstrating Configuration Changes:');
  console.log('   Disabling DEBUG and TRACE levels...');
  loggingConfig.setLogLevel(LogLevel.INFO);
  
  await logger.debug(LogCategory.SYSTEM, 'This DEBUG message should not appear');
  await logger.trace(LogCategory.SYSTEM, 'This TRACE message should not appear');
  await logger.info(LogCategory.SYSTEM, 'This INFO message should appear');
  
  const filteredLogs = logger.getLogBuffer();
  console.log(`   Logs after filtering: ${filteredLogs.length}`);
  console.log();

  // Demonstrate category filtering
  console.log('📂 Demonstrating Category Filtering:');
  console.log('   Disabling API and DATABASE categories...');
  loggingConfig.disableCategories([LogCategory.API, LogCategory.DATABASE]);
  
  await logger.info(LogCategory.API, 'This API message should not appear');
  await logger.info(LogCategory.DATABASE, 'This DATABASE message should not appear');
  await logger.info(LogCategory.USER, 'This USER message should appear');
  
  const categoryFilteredLogs = logger.getLogBuffer();
  console.log(`   Logs after category filtering: ${categoryFilteredLogs.length}`);
  console.log();

  console.log('✅ Logging demonstration completed!');
  console.log('\n📚 For more information, see:');
  console.log('   - LOGGING_GUIDE.md - Complete usage guide');
  console.log('   - SystemArchitecture.md - System architecture details');
  console.log('   - DevLog.md - Development progress');
}

// Run demonstration
demonstrateLogging().catch(console.error);
