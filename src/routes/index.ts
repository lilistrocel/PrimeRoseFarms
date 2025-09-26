import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requestLoggingMiddleware, performanceMiddleware, securityLoggingMiddleware } from '../middleware/logging';

// Import route modules
import authRoutes from './auth';
import userRoutes from './users';
import managerRoutes from './manager';
import workerRoutes from './worker';
import salesRoutes from './sales';
import sensorRoutes from './sensor';
import plantDataRoutes from './plantData';

const router = Router();

// Apply global middleware to all routes
router.use(requestLoggingMiddleware);
router.use(performanceMiddleware(1000)); // Log requests slower than 1 second
router.use(securityLoggingMiddleware);

// API versioning
const API_VERSION = '/api/v1';

// Health check endpoint (no authentication required)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PrimeRoseFarms API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      encryption: 'active'
    }
  });
});

// API information endpoint
router.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PrimeRoseFarms API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      manager: '/api/v1/manager',
      worker: '/api/v1/worker',
      sales: '/api/v1/sales',
      sensor: '/api/v1/sensor',
      plantData: '/api/v1/plant-data'
    },
    description: 'Business process-driven APIs for agricultural farm management'
  });
});

// Mount route modules with versioning
// Debug middleware for auth routes
router.use(`${API_VERSION}/auth`, (req, res, next) => {
  console.log(`🔍 Request reached auth route: ${req.method} ${req.path}`);
  next();
}, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/manager`, managerRoutes);
router.use(`${API_VERSION}/worker`, workerRoutes);
router.use(`${API_VERSION}/sales`, salesRoutes);
router.use(`${API_VERSION}/sensor`, sensorRoutes);
router.use(`${API_VERSION}/plant-data`, plantDataRoutes);

export default router;
