import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Suppress dotenv console logs
process.env.DOTENV_CONFIG_QUIET = 'true';

// Load test environment variables with quiet mode
dotenv.config({ path: '.env.test', quiet: true });

let mongoServer: MongoMemoryServer;

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
  process.env.MONGODB_URI = mongoUri; // Override the main URI for tests
  
  // Connect to test database
  await mongoose.connect(mongoUri);
  
  // Wait a bit to ensure connection is stable
  await new Promise(resolve => setTimeout(resolve, 200));
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
  // Clear all collections only if connected
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
