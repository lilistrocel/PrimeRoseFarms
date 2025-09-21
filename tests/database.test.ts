import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import DatabaseConfig from '../src/config/database';
import { User } from '../src/models/User';
import { UserRole, DataProtectionLevel } from '../src/types';

let mongoServer: MongoMemoryServer;

// Setup database connection for this test file
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
  
  // Wait a bit to ensure connection is stable
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

describe('Database Configuration', () => {
  let dbConfig: DatabaseConfig;

  beforeAll(() => {
    dbConfig = DatabaseConfig.getInstance();
  });

  test('should create singleton instance', () => {
    const instance1 = DatabaseConfig.getInstance();
    const instance2 = DatabaseConfig.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  test('should connect to database successfully', async () => {
    await dbConfig.connect();
    
    expect(dbConfig.isDatabaseConnected()).toBe(true);
    expect(dbConfig.getConnectionStatus()).toBe('connected');
  });

  test('should disconnect from database successfully', async () => {
    await dbConfig.disconnect();
    
    expect(dbConfig.isDatabaseConnected()).toBe(false);
    expect(dbConfig.getConnectionStatus()).toBe('disconnected');
  });
});

describe('User Model', () => {
  // Database connection is handled by global setup

  afterEach(async () => {
    // Clean up after each test - only if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await User.deleteMany({});
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  test('should create user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.isActive).toBe(true);
    expect(savedUser.password).not.toBe(userData.password); // Should be hashed
  });

  test('should hash password before saving', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.password.length).toBeGreaterThan(50); // bcrypt hash length
  });

  test('should compare password correctly', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER
    };

    const user = new User(userData);
    await user.save();

    const isValidPassword = await user.comparePassword('testPassword123!');
    const isInvalidPassword = await user.comparePassword('wrongPassword');

    expect(isValidPassword).toBe(true);
    expect(isInvalidPassword).toBe(false);
  });

  test('should encrypt sensitive fields', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER,
      phoneNumber: '+1234567890',
      address: '123 Farm Street, Rural City, RC 12345',
      emergencyContact: 'Jane Doe, +0987654321'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    // Check that sensitive fields are encrypted in database
    const rawUser = await User.collection.findOne({ _id: savedUser._id as any });
    
    expect(rawUser?.phoneNumber).not.toBe(userData.phoneNumber);
    expect(rawUser?.address).not.toBe(userData.address);
    expect(rawUser?.emergencyContact).not.toBe(userData.emergencyContact);
  });

  test('should decrypt sensitive fields when retrieved', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER,
      phoneNumber: '+1234567890',
      address: '123 Farm Street, Rural City, RC 12345',
      emergencyContact: 'Jane Doe, +0987654321'
    };

    const user = new User(userData);
    await user.save();

    // Retrieve user and check decryption
    const retrievedUser = await User.findById(user._id);
    
    expect(retrievedUser?.phoneNumber).toBe(userData.phoneNumber);
    expect(retrievedUser?.address).toBe(userData.address);
    expect(retrievedUser?.emergencyContact).toBe(userData.emergencyContact);
  });

  test('should validate user permissions', async () => {
    const farmerData = {
      email: 'farmer@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Farmer',
      role: UserRole.FARMER
    };

    const adminData = {
      email: 'admin@example.com',
      password: 'testPassword123!',
      firstName: 'Jane',
      lastName: 'Admin',
      role: UserRole.ADMIN
    };

    const farmer = new User(farmerData);
    const admin = new User(adminData);
    
    await farmer.save();
    await admin.save();

    // Test farmer permissions
    expect(farmer.hasPermission('farm.read')).toBe(true);
    expect(farmer.hasPermission('user.write')).toBe(false);
    expect(farmer.hasPermission('*')).toBe(false);

    // Test admin permissions
    expect(admin.hasPermission('*')).toBe(true);
    expect(admin.hasPermission('farm.read')).toBe(true);
    expect(admin.hasPermission('user.write')).toBe(true);
  });

  test('should validate role checking', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.MANAGER
    };

    const user = new User(userData);
    await user.save();

    expect(user.isRole(UserRole.MANAGER)).toBe(true);
    expect(user.isRole(UserRole.ADMIN)).toBe(false);
    expect(user.isRole(UserRole.FARMER)).toBe(false);
  });

  test('should get full name correctly', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER
    };

    const user = new User(userData);
    await user.save();

    expect(user.getFullName()).toBe('John Doe');
  });

  test('should exclude password from JSON output', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.FARMER
    };

    const user = new User(userData);
    await user.save();

    const userJson = user.toJSON();
    
    expect(userJson.password).toBeUndefined();
    expect(userJson.__v).toBeUndefined();
    expect(userJson.email).toBe(userData.email);
  });
});
