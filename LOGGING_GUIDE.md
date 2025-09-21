# Logging System Usage Guide

## Overview

The PrimeRoseFarms application includes a comprehensive logging system designed for debugging, monitoring, and troubleshooting. This guide explains how to use the logging system effectively.

## Quick Start

### Basic Logging

```typescript
import { logger, LogCategory } from './src/utils/logger';

// Log different levels
await logger.error(LogCategory.SYSTEM, 'Critical error occurred');
await logger.warn(LogCategory.API, 'Slow request detected');
await logger.info(LogCategory.USER, 'User logged in successfully');
await logger.debug(LogCategory.DATABASE, 'Database query executed');
await logger.trace(LogCategory.ENCRYPTION, 'Data encrypted successfully');
```

### Logging with Context

```typescript
// Log with user context
await logger.info(LogCategory.USER, 'Profile updated', { field: 'email' }, 'user123');

// Log with data
await logger.debug(LogCategory.DATABASE, 'Query executed', { 
  collection: 'users', 
  filter: { active: true },
  duration: 45 
});
```

## Environment Configuration

### Development Environment
```bash
LOG_LEVEL=DEBUG
LOG_CATEGORIES=SYSTEM,DATABASE,AUTH,ENCRYPTION,API,USER,FARM,FIELD,WORKER,PERFORMANCE,SECURITY
LOG_CONSOLE=true
LOG_FILE=true
LOG_COLORS=true
```

### Production Environment
```bash
LOG_LEVEL=WARN
LOG_CATEGORIES=SYSTEM,DATABASE,AUTH,API,SECURITY,PERFORMANCE
LOG_CONSOLE=false
LOG_FILE=true
LOG_COLORS=false
```

### Testing Environment
```bash
LOG_LEVEL=ERROR
LOG_CATEGORIES=SYSTEM,DATABASE,AUTH
LOG_CONSOLE=false
LOG_FILE=false
```

## Log Categories

### System Categories
- **SYSTEM:** Application startup, shutdown, configuration
- **DATABASE:** Database connections, queries, operations
- **AUTH:** Authentication, authorization, user sessions
- **ENCRYPTION:** Encryption/decryption operations

### Application Categories
- **API:** HTTP requests, responses, API operations
- **USER:** User management, profile changes
- **FARM:** Farm operations and management
- **FIELD:** Field operations, crop management
- **WORKER:** Worker management, scheduling

### Monitoring Categories
- **PERFORMANCE:** Performance metrics, slow operations
- **SECURITY:** Security events, threats, suspicious activities
- **TEST:** Test execution and validation
- **DEVELOPMENT:** Development-specific logging

## Request Tracking

### Automatic Request ID Generation
Every HTTP request automatically gets a unique request ID that's included in all logs:

```
[2025-09-21T09:00:00.000Z] [INFO] [API] [req_1758445672476_1] GET /api/users - 200 (45ms)
[2025-09-21T09:00:00.001Z] [DEBUG] [DATABASE] [req_1758445672476_1] Query executed on users collection
[2025-09-21T09:00:00.002Z] [INFO] [USER] [req_1758445672476_1] User profile retrieved
```

### Manual Request Context
```typescript
// Set request context for non-HTTP operations
const requestId = logger.generateRequestId();
logger.setRequestId(requestId);

// All subsequent logs will include this request ID
await logger.info(LogCategory.SYSTEM, 'Background task started');
await logger.info(LogCategory.SYSTEM, 'Background task completed');

// Clear request context when done
logger.clearRequestId();
```

## Filtering and Debugging

### Filter Logs by Criteria
```typescript
// Filter by request ID
const requestLogs = logger.filterLogs({ requestId: 'req_1758445672476_1' });

// Filter by user
const userLogs = logger.filterLogs({ userId: 'user123' });

// Filter by category
const apiLogs = logger.filterLogs({ category: LogCategory.API });

// Filter by level
const errorLogs = logger.filterLogs({ level: LogLevel.ERROR });

// Filter by time range
const recentLogs = logger.filterLogs({ 
  startTime: new Date(Date.now() - 3600000), // Last hour
  endTime: new Date() 
});
```

### Performance Monitoring
```typescript
// Log performance metrics
await logger.logPerformance('user-query', 150, { records: 100 });

// Automatic slow request detection (configured in middleware)
// Requests slower than 1 second are automatically logged as warnings
```

### Security Monitoring
```typescript
// Log security events
await logger.logSecurityEvent('failed-login', { 
  ip: '192.168.1.1', 
  attempts: 3 
});

// Automatic security event detection
// Failed authentication attempts are automatically logged
```

## Configuration Management

### Runtime Configuration Changes
```typescript
import { loggingConfig } from './src/config/logging';

// Enable specific categories for debugging
loggingConfig.enableCategories([LogCategory.PERFORMANCE, LogCategory.SECURITY]);

// Disable noisy categories
loggingConfig.disableCategories([LogCategory.TRACE]);

// Change log level
loggingConfig.setLogLevel(LogLevel.DEBUG);

// Get current configuration
const status = loggingConfig.getStatus();
console.log('Current logging configuration:', status);
```

### Environment-Specific Setup
```typescript
// Configure for different environments
loggingConfig.configureDevelopment();  // DEBUG level, all categories
loggingConfig.configureProduction();   // WARN level, essential categories
loggingConfig.configureTesting();      // ERROR level, minimal categories
```

## Log File Management

### Automatic Log Rotation
- Log files are automatically rotated when they exceed the configured size
- Default: 10MB per file, keep 5 files
- Configuration via environment variables:
  ```bash
  LOG_MAX_FILE_SIZE=10  # MB
  LOG_MAX_FILES=5       # Number of files to keep
  ```

### Log File Location
- Default: `./logs/application.log`
- Configurable via `LOG_DIRECTORY` environment variable

## Best Practices

### 1. Use Appropriate Log Levels
- **ERROR:** Critical errors that require immediate attention
- **WARN:** Warning conditions that may indicate problems
- **INFO:** General information about application flow
- **DEBUG:** Detailed information for debugging
- **TRACE:** Very detailed information for tracing execution

### 2. Include Relevant Context
```typescript
// Good: Include relevant context
await logger.info(LogCategory.USER, 'User profile updated', {
  userId: 'user123',
  changes: ['email', 'phone'],
  timestamp: new Date()
}, 'user123');

// Bad: Missing context
await logger.info(LogCategory.USER, 'Profile updated');
```

### 3. Use Appropriate Categories
- Choose the most specific category for your log
- Use SYSTEM for general application events
- Use specific categories (USER, FARM, etc.) for domain-specific events

### 4. Avoid Logging Sensitive Data
```typescript
// Good: Log structure without sensitive data
await logger.debug(LogCategory.AUTH, 'Authentication attempt', {
  userId: 'user123',
  method: 'password',
  success: true
  // Don't log the actual password
});

// Bad: Logging sensitive data
await logger.debug(LogCategory.AUTH, 'Authentication attempt', {
  userId: 'user123',
  password: 'secret123'  // Never log passwords!
});
```

### 5. Use Request Context
- Always use request IDs for HTTP operations
- Set request context for background tasks
- Clear request context when done

## Troubleshooting

### Common Issues

1. **Logs not appearing:**
   - Check log level configuration
   - Verify category is enabled
   - Ensure console/file output is enabled

2. **Too many logs:**
   - Increase log level (ERROR, WARN)
   - Disable unnecessary categories
   - Use more specific filtering

3. **Missing request context:**
   - Ensure request logging middleware is enabled
   - Set request ID manually for background tasks
   - Check middleware order in Express app

### Debug Commands

```bash
# Test logging system
npm run test:logging

# Run with specific log level
LOG_LEVEL=DEBUG npm run dev

# Enable specific categories
LOG_CATEGORIES=API,PERFORMANCE npm run dev

# Disable console output
LOG_CONSOLE=false npm run dev
```

## Integration Examples

### Express Middleware
```typescript
import { requestLoggingMiddleware, performanceMiddleware } from './middleware/logging';

app.use(requestLoggingMiddleware);
app.use(performanceMiddleware(1000)); // Log requests slower than 1 second
```

### Database Operations
```typescript
import { logger, LogCategory } from './utils/logger';

// Log database operations
await logger.logDatabaseOperation('find', 'users', { filter: { active: true } });
```

### API Requests
```typescript
// Log API requests (automatic via middleware)
// Manual logging for specific cases
await logger.logApiRequest('POST', '/api/auth', 401, 100, 'user123');
```

This logging system provides comprehensive debugging and monitoring capabilities while maintaining performance and security. Use it effectively to understand application behavior and troubleshoot issues quickly.
