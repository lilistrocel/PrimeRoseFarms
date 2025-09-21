import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import DatabaseConfig from './config/database';
import { encryptionService } from './utils/encryption';
import { loggingConfig } from './config/logging';
import { requestLoggingMiddleware, errorLoggingMiddleware, performanceMiddleware, securityLoggingMiddleware } from './middleware/logging';
import { logger, LogCategory } from './utils/logger';

// Load environment variables
dotenv.config();

// Configure logging first
loggingConfig.configureForEnvironment();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Logging middleware (must be early in the chain)
app.use(requestLoggingMiddleware);
app.use(performanceMiddleware(1000)); // Log requests slower than 1 second
app.use(securityLoggingMiddleware);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = DatabaseConfig.getInstance().isDatabaseConnected();
  const encryptionStatus = encryptionService ? 'active' : 'inactive';
  
  res.json({
    success: true,
    message: 'PrimeRoseFarms API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus ? 'connected' : 'disconnected',
      encryption: encryptionStatus
    }
  });
});

// API routes will be added here
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PrimeRoseFarms API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      farms: '/api/farms',
      fields: '/api/fields',
      workers: '/api/workers'
    }
  });
});

// Error handling middleware
app.use(errorLoggingMiddleware);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - using a different pattern
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize database connection
const initializeApp = async (): Promise<void> => {
  try {
    logger.info(LogCategory.SYSTEM, 'Initializing PrimeRoseFarms application');
    
    const dbConfig = DatabaseConfig.getInstance();
    dbConfig.setupEventHandlers();
    await dbConfig.connect();
    
    logger.info(LogCategory.SYSTEM, 'PrimeRoseFarms application initialized successfully');
  } catch (error) {
    logger.error(LogCategory.SYSTEM, 'Failed to initialize application', { error: error instanceof Error ? error.message : 'Unknown error' });
    process.exit(1);
  }
};

export { app, initializeApp };