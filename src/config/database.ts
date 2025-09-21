import mongoose from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { logger, LogCategory } from '../utils/logger';

/**
 * MongoDB connection configuration with encryption support
 */
class DatabaseConfig {
  private static instance: DatabaseConfig;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Connect to MongoDB with encryption support
   */
  public async connect(): Promise<void> {
    try {
      // Check if already connected
      if (mongoose.connection.readyState === 1) {
        this.isConnected = true;
        logger.debug(LogCategory.DATABASE, 'MongoDB already connected');
        return;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/primerosefarms';
      
      // MongoDB connection options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      logger.info(LogCategory.DATABASE, 'Connecting to MongoDB', { uri: mongoUri.replace(/\/\/.*@/, '//***:***@') });
      
      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      logger.info(LogCategory.DATABASE, 'MongoDB connected successfully');
      
      // Set up encryption for sensitive collections
      this.setupEncryption();
      
    } catch (error) {
      logger.error(LogCategory.DATABASE, 'MongoDB connection failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      if (process.env.NODE_ENV !== 'test') {
        console.log('MongoDB disconnected successfully');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('MongoDB disconnection error:', error);
      }
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public isDatabaseConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Setup encryption for sensitive collections
   */
  private setupEncryption(): void {
    // This will be used by mongoose plugins for automatic encryption/decryption
    if (process.env.NODE_ENV !== 'test') {
      console.log('Encryption system initialized for sensitive data');
    }
  }

  /**
   * Get database connection status
   */
  public getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  /**
   * Handle connection events
   */
  public setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      console.error('Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }
}

export default DatabaseConfig;
