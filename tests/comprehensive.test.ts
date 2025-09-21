import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { EncryptionService } from '../src/utils/encryption';
import DatabaseConfig from '../src/config/database';
import { User } from '../src/models/User';
import { UserRole, DataProtectionLevel, IJWTPayload } from '../src/types';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../src/middleware/auth';
import { app } from '../src/app';

let mongoServer: MongoMemoryServer;
let encryptionService: EncryptionService;

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
  
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
  
  // Initialize encryption service
  encryptionService = new EncryptionService();
});

// Global test teardown
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

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.deleteMany({});
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
});

describe('PrimeRoseFarms Comprehensive Test Suite', () => {
  
  describe('Encryption System', () => {
    test('should encrypt and decrypt data correctly', async () => {
      const testData = 'Sensitive farm data';
      const protectionLevel = DataProtectionLevel.CONFIDENTIAL;
      
      const encrypted = encryptionService.encrypt(testData, protectionLevel);
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      
      const decrypted = encryptionService.decrypt(encrypted, protectionLevel);
      expect(decrypted).toBe(testData);
    });

    test('should hash passwords correctly', async () => {
      const password = 'testPassword123!';
      const hashed = await encryptionService.hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
      
      const isValid = await encryptionService.verifyPassword(password, hashed);
      expect(isValid).toBe(true);
      
      const isInvalid = await encryptionService.verifyPassword('wrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });

    test('should generate and verify HMAC signatures', async () => {
      const data = 'Important farm data';
      const secret = 'test-secret-key';
      const signature = encryptionService.createHMAC(data, secret);
      
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA-256 hex string
      
      const isValid = encryptionService.verifyHMAC(data, signature, secret);
      expect(isValid).toBe(true);
      
      const isInvalid = encryptionService.verifyHMAC('different data', signature, secret);
      expect(isInvalid).toBe(false);
    });

    test('should handle different data protection levels', async () => {
      const testData = 'Test data';
      
      const publicData = encryptionService.encrypt(testData, DataProtectionLevel.PUBLIC);
      const internalData = encryptionService.encrypt(testData, DataProtectionLevel.INTERNAL);
      const confidentialData = encryptionService.encrypt(testData, DataProtectionLevel.CONFIDENTIAL);
      const restrictedData = encryptionService.encrypt(testData, DataProtectionLevel.RESTRICTED);
      
      // All should decrypt to the same data
      expect(encryptionService.decrypt(publicData, DataProtectionLevel.PUBLIC)).toBe(testData);
      expect(encryptionService.decrypt(internalData, DataProtectionLevel.INTERNAL)).toBe(testData);
      expect(encryptionService.decrypt(confidentialData, DataProtectionLevel.CONFIDENTIAL)).toBe(testData);
      expect(encryptionService.decrypt(restrictedData, DataProtectionLevel.RESTRICTED)).toBe(testData);
    });
  });

  describe('Database Configuration', () => {
    test('should create singleton instance', () => {
      const dbConfig1 = DatabaseConfig.getInstance();
      const dbConfig2 = DatabaseConfig.getInstance();
      
      expect(dbConfig1).toBe(dbConfig2);
      expect(dbConfig1).toBeInstanceOf(DatabaseConfig);
    });

    test('should connect to database successfully', async () => {
      const dbConfig = DatabaseConfig.getInstance();
      // Ensure database is connected
      await dbConfig.connect();
      expect(dbConfig.isDatabaseConnected()).toBe(true);
      expect(dbConfig.getConnectionStatus()).toBe('connected');
    });

    test('should disconnect from database successfully', async () => {
      const dbConfig = DatabaseConfig.getInstance();
      await dbConfig.disconnect();
      
      expect(dbConfig.isDatabaseConnected()).toBe(false);
      expect(dbConfig.getConnectionStatus()).toBe('disconnected');
      
      // Reconnect for other tests
      await dbConfig.connect();
    });
  });

  describe('User Model', () => {
    test('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.FARMER,
        phoneNumber: '+1234567890',
        address: '123 Farm St, Farmville, CA 12345, USA'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    test('should hash password before saving', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'testPassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.MANAGER
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(50);
    });

    test('should compare password correctly', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'testPassword123!',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: UserRole.WORKER
      };

      const user = new User(userData);
      await user.save();

      const isValid = await user.comparePassword('testPassword123!');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('wrongPassword');
      expect(isInvalid).toBe(false);
    });

    test('should encrypt sensitive fields', async () => {
      const userData = {
        email: 'test4@example.com',
        password: 'testPassword123!',
        firstName: 'Alice',
        lastName: 'Brown',
        role: UserRole.AGRONOMIST,
        phoneNumber: '+1234567890',
        address: '456 Farm Rd, Farmtown, TX 67890, USA'
      };

      const user = new User(userData);
      await user.save();

      // Check that sensitive fields are encrypted in the database
      const rawUser = await User.collection.findOne({ _id: user._id as any });
      expect(rawUser).toBeDefined();
      
      // Phone and address should be encrypted
      if (rawUser && rawUser.phoneNumber) {
        expect(rawUser.phoneNumber).not.toBe(userData.phoneNumber);
      }
    });

    test('should decrypt sensitive fields when retrieved', async () => {
      const userData = {
        email: 'test5@example.com',
        password: 'testPassword123!',
        firstName: 'Charlie',
        lastName: 'Wilson',
        role: UserRole.HR,
        phoneNumber: '+1234567890',
        address: '789 Farm Ave, Farmburg, FL 54321, USA'
      };

      const user = new User(userData);
      await user.save();

      // Retrieve user from database
      const retrievedUser = await User.findById(user._id);
      expect(retrievedUser).toBeDefined();
      
      if (retrievedUser) {
        expect(retrievedUser.phoneNumber).toBe(userData.phoneNumber);
        expect(retrievedUser.address).toBe(userData.address);
      }
    });

    test('should validate user permissions', async () => {
      const adminUser = new User({
        email: 'admin@example.com',
        password: 'adminPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN
      });

      const farmerUser = new User({
        email: 'farmer@example.com',
        password: 'farmerPassword123!',
        firstName: 'Farmer',
        lastName: 'User',
        role: UserRole.FARMER
      });

      await adminUser.save();
      await farmerUser.save();

      // Admin should have all permissions
      expect(adminUser.hasPermission('*')).toBe(true);
      expect(adminUser.hasPermission('farm.read')).toBe(true);
      expect(adminUser.hasPermission('user.read')).toBe(true);

      // Farmer should have limited permissions
      expect(farmerUser.hasPermission('*')).toBe(false);
      expect(farmerUser.hasPermission('farm.read')).toBe(true);
      expect(farmerUser.hasPermission('user.read')).toBe(false);
      expect(farmerUser.hasPermission('field.read')).toBe(true);
    });

    test('should validate role checking', async () => {
      const user = new User({
        email: 'test6@example.com',
        password: 'testPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.SALES
      });

      await user.save();

      expect(user.isRole(UserRole.ADMIN)).toBe(false);
      expect(user.isRole(UserRole.MANAGER)).toBe(false);
      expect(user.isRole(UserRole.FARMER)).toBe(false);
      expect(user.isRole(UserRole.WORKER)).toBe(false);
      expect(user.isRole(UserRole.SALES)).toBe(true);
    });

    test('should get full name correctly', async () => {
      const user = new User({
        email: 'test7@example.com',
        password: 'testPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.DEMO
      });

      await user.save();

      expect(user.getFullName()).toBe('John Doe');
    });

    test('should exclude password from JSON output', async () => {
      const user = new User({
        email: 'test8@example.com',
        password: 'testPassword123!',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.WORKER
      });

      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.__v).toBeUndefined();
      expect(userJSON.email).toBe('test8@example.com');
      expect(userJSON.firstName).toBe('Jane');
    });
  });

  describe('Authentication System', () => {
    test('should generate JWT token', () => {
      const payload: IJWTPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.ADMIN
      };

      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate refresh token', () => {
      const payload: IJWTPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.MANAGER
      };

      const refreshToken = generateRefreshToken(payload);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);
    });

    test('should verify refresh token', () => {
      const payload: IJWTPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.AGRONOMIST
      };

      const refreshToken = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should create tokens for all user roles', () => {
      const roles = [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.AGRONOMIST,
        UserRole.FARMER,
        UserRole.WORKER,
        UserRole.HR,
        UserRole.SALES,
        UserRole.DEMO
      ];

      roles.forEach(role => {
        const payload: IJWTPayload = {
          userId: '507f1f77bcf86cd799439011',
          email: `${role.toLowerCase()}@example.com`,
          role: role
        };

        const token = generateToken(payload);
        const refreshToken = generateRefreshToken(payload);

        expect(token).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(token.split('.')).toHaveLength(3);
        expect(refreshToken.split('.')).toHaveLength(3);
      });
    });
  });

  describe('System Health and API', () => {
    test('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'PrimeRoseFarms API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('encryption');
    });

    test('should provide API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'PrimeRoseFarms API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
    });

    test('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });

    test('should have security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-xss-protection']).toBe('0');
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .expect(200);

      expect(response.status).toBe(200);
    });

    test('should validate database connection in health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services.database).toBe('connected');
    });

    test('should validate encryption service in health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services.encryption).toBe('active');
    });

    test('should validate environment configuration', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.env.ENCRYPTION_KEY).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should create user and authenticate', async () => {
      // Create user
      const userData = {
        email: 'integration@example.com',
        password: 'integrationPassword123!',
        firstName: 'Integration',
        lastName: 'Test',
        role: UserRole.FARMER
      };

      const user = new User(userData);
      await user.save();

      // Generate token for user
      const payload: IJWTPayload = {
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role
      };

      const token = generateToken(payload);
      expect(token).toBeDefined();

      // Verify user can authenticate
      const isValidPassword = await user.comparePassword(userData.password);
      expect(isValidPassword).toBe(true);

      // Verify user permissions
      expect(user.hasPermission('farm.read')).toBe(true);
      expect(user.hasPermission('field.read')).toBe(true);
      expect(user.hasPermission('user.read')).toBe(false);
    });

    test('should handle encrypted user data flow', async () => {
      const userData = {
        email: 'encrypted@example.com',
        password: 'encryptedPassword123!',
        firstName: 'Encrypted',
        lastName: 'User',
        role: UserRole.MANAGER,
        phoneNumber: '+1234567890',
        address: '123 Encrypted St, Encrypted City, EC 12345, USA'
      };

      // Create and save user
      const user = new User(userData);
      await user.save();

      // Retrieve user
      const retrievedUser = await User.findById(user._id);
      expect(retrievedUser).toBeDefined();

      if (retrievedUser) {
        // Verify sensitive data is decrypted
        expect(retrievedUser.phoneNumber).toBe(userData.phoneNumber);
        expect(retrievedUser.address).toBe(userData.address);

        // Verify password is hashed
        expect(retrievedUser.password).not.toBe(userData.password);

        // Verify password comparison works
        const isValidPassword = await retrievedUser.comparePassword(userData.password);
        expect(isValidPassword).toBe(true);
      }
    });
  });
});
