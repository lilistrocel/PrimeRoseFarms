import { Request, Response, NextFunction } from 'express';
import { logger, LogCategory } from '../utils/logger';

/**
 * Request logging middleware
 * Automatically logs all API requests with timing and context
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = logger.generateRequestId();
  
  // Set request ID for this request context
  logger.setRequestId(requestId);
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  logger.debug(LogCategory.API, `Request started: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined
    },
    ip: req.ip,
    requestId
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - startTime;
    const userId = (req as any).user?.userId;
    
    // Log API request completion
    logger.logApiRequest(req.method, req.path, res.statusCode, duration, userId);
    
    // Log errors if status code indicates error
    if (res.statusCode >= 400) {
      logger.warn(LogCategory.API, `Request failed: ${req.method} ${req.path}`, {
        statusCode: res.statusCode,
        duration,
        userId,
        requestId,
        error: chunk ? chunk.toString() : undefined
      });
    }
    
    // Clear request ID after response
    logger.clearRequestId();
    
    // Call original end method with proper return
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};

/**
 * Error logging middleware
 * Logs errors with full context
 */
export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const userId = (req as any).user?.userId;
  const requestId = res.getHeader('X-Request-ID') as string;
  
  logger.error(LogCategory.API, `Unhandled error: ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers
    },
    userId,
    requestId
  });
  
  next(err);
};

/**
 * Performance monitoring middleware
 * Logs slow requests
 */
export const performanceMiddleware = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > threshold) {
        const userId = (req as any).user?.userId;
        const requestId = res.getHeader('X-Request-ID') as string;
        
        logger.warn(LogCategory.PERFORMANCE, `Slow request detected: ${req.method} ${req.path}`, {
          duration,
          threshold,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          userId,
          requestId
        });
      }
    });
    
    next();
  };
};

/**
 * Security event logging middleware
 * Logs potential security events
 */
export const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Log failed authentication attempts
  if (req.path.includes('/auth') && res.statusCode === 401) {
    logger.logSecurityEvent('Failed authentication attempt', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  // Log suspicious requests
  if (req.path.includes('..') || req.path.includes('admin') || req.path.includes('config')) {
    logger.logSecurityEvent('Suspicious request path', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  next();
};
