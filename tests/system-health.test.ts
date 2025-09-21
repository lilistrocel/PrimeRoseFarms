import request from 'supertest';
import { app } from '../src/app';
import DatabaseConfig from '../src/config/database';
import { encryptionService } from '../src/utils/encryption';

describe('System Health Check', () => {
  beforeAll(async () => {
    // Ensure database is connected
    const dbConfig = DatabaseConfig.getInstance();
    if (!dbConfig.isDatabaseConnected()) {
      await dbConfig.connect();
    }
  });

  describe('Health Endpoint', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('PrimeRoseFarms API is running');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.services).toBeDefined();
    });

    test('should include database status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services.database).toBeDefined();
      expect(['connected', 'disconnected']).toContain(response.body.services.database);
    });

    test('should include encryption status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services.encryption).toBeDefined();
      expect(['active', 'inactive']).toContain(response.body.services.encryption);
    });
  });

  describe('API Endpoint', () => {
    test('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('PrimeRoseFarms API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.endpoints).toBeDefined();
    });

    test('should list available endpoints', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      const expectedEndpoints = [
        'health',
        'auth',
        'users',
        'farms',
        'fields',
        'workers'
      ];

      expectedEndpoints.forEach(endpoint => {
        expect(response.body.endpoints[endpoint]).toBeDefined();
      });
    });
  });

  describe('404 Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for Helmet security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-xss-protection']).toBe('0');
    });
  });

  describe('CORS Configuration', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .expect(200);

      // CORS should be configured (request should succeed)
      expect(response.status).toBe(200);
    });
  });
});

describe('System Components Health', () => {
  describe('Database Connection', () => {
    test('should maintain database connection', () => {
      const dbConfig = DatabaseConfig.getInstance();
      expect(dbConfig.isDatabaseConnected()).toBe(true);
    });

    test('should report correct connection status', () => {
      const dbConfig = DatabaseConfig.getInstance();
      const status = dbConfig.getConnectionStatus();
      expect(['connected', 'connecting', 'disconnected', 'disconnecting']).toContain(status);
    });
  });

  describe('Encryption Service', () => {
    test('should be available and functional', () => {
      expect(encryptionService).toBeDefined();
      
      // Test basic encryption functionality
      const testData = 'test data';
      const encrypted = encryptionService.encrypt(testData);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(testData);
    });

    test('should generate secure tokens', () => {
      const token1 = encryptionService.generateSecureToken();
      const token2 = encryptionService.generateSecureToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });
  });

  describe('Environment Configuration', () => {
    test('should have required environment variables', () => {
      const requiredVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'ENCRYPTION_KEY'
      ];

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
        expect(process.env[varName]).not.toBe('');
      });
    });

    test('should have proper JWT configuration', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.env.JWT_EXPIRE).toBeDefined();
      expect(process.env.JWT_REFRESH_EXPIRE).toBeDefined();
    });

    test('should have encryption configuration', () => {
      expect(process.env.ENCRYPTION_KEY).toBeDefined();
      expect(process.env.ENCRYPTION_ALGORITHM).toBeDefined();
      expect(process.env.PBKDF2_ITERATIONS).toBeDefined();
      expect(process.env.PBKDF2_KEYLEN).toBeDefined();
    });
  });
});
