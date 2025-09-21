import jwt from 'jsonwebtoken';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../src/middleware/auth';
import { UserRole } from '../src/types';
import { User } from '../src/models/User';

describe('Authentication System', () => {
  beforeAll(() => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
    process.env.JWT_EXPIRE = '1h';
    process.env.JWT_REFRESH_EXPIRE = '7d';
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate valid refresh token', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      const refreshToken = generateRefreshToken(payload);
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);
    });

    test('should verify refresh token correctly', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      const refreshToken = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(refreshToken);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should fail verification with invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyRefreshToken(invalidToken);
      }).toThrow();
    });
  });

  describe('Token Validation', () => {
    test('should validate token with correct secret', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should fail validation with wrong secret', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      const token = generateToken(payload);
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });

    test('should include expiration time', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      const token = generateToken(payload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('Role-Based Token Generation', () => {
    const testCases = [
      { role: UserRole.ADMIN, expectedPermissions: ['*'] },
      { role: UserRole.MANAGER, expectedPermissions: ['farm.read', 'farm.write', 'user.read', 'report.read', 'report.write'] },
      { role: UserRole.AGRONOMIST, expectedPermissions: ['farm.read', 'crop.read', 'crop.write', 'report.read'] },
      { role: UserRole.FARMER, expectedPermissions: ['farm.read', 'field.read', 'field.write', 'worker.read', 'worker.write'] },
      { role: UserRole.WORKER, expectedPermissions: ['field.read', 'task.read', 'task.write'] },
      { role: UserRole.HR, expectedPermissions: ['user.read', 'user.write', 'worker.read', 'worker.write', 'report.read'] },
      { role: UserRole.SALES, expectedPermissions: ['customer.read', 'customer.write', 'order.read', 'order.write', 'report.read'] },
      { role: UserRole.DEMO, expectedPermissions: ['farm.read', 'field.read', 'report.read'] }
    ];

    testCases.forEach(({ role, expectedPermissions }) => {
      test(`should generate token for ${role} role`, () => {
        const payload = {
          userId: '507f1f77bcf86cd799439011',
          email: `${role}@example.com`,
          role: role
        };

        const token = generateToken(payload);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        expect(decoded.role).toBe(role);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.userId).toBe(payload.userId);
      });
    });
  });

  describe('Token Expiration', () => {
    test('should create token with short expiration for testing', () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.FARMER
      };

      // Override expiration for this test
      const originalExpire = process.env.JWT_EXPIRE;
      process.env.JWT_EXPIRE = '1s';

      const token = generateToken(payload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.exp).toBeDefined();
      
      // Restore original expiration
      process.env.JWT_EXPIRE = originalExpire;
    });
  });

  describe('User Authentication Integration', () => {
    test('should create user and generate token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.FARMER
      };

      const user = new User(userData);
      await user.save();

      const payload = {
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.userId).toBe((user._id as any).toString());
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });
});
