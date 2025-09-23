const mongoose = require('mongoose');
const { User } = require('../dist/models/User');
const { DatabaseConfig } = require('../dist/config/database');
require('dotenv').config();

async function createDemoUsers() {
  try {
    console.log('Connecting to database...');
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.connect();

    console.log('Creating demo users...');

    const demoUsers = [
      {
        email: 'manager@primerose.com',
        password: 'demo123',
        firstName: 'John',
        lastName: 'Manager',
        role: 'MANAGER',
        phoneNumber: '+1234567890',
        address: '123 Farm Street, Agriculture City',
        isActive: true
      },
      {
        email: 'worker@primerose.com',
        password: 'demo123',
        firstName: 'Maria',
        lastName: 'Worker',
        role: 'WORKER',
        phoneNumber: '+1234567891',
        address: '456 Field Avenue, Agriculture City',
        isActive: true
      },
      {
        email: 'admin@primerose.com',
        password: 'demo123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        phoneNumber: '+1234567892',
        address: '789 Admin Road, Agriculture City',
        isActive: true
      },
      {
        email: 'sales@primerose.com',
        password: 'demo123',
        firstName: 'Sarah',
        lastName: 'Sales',
        role: 'SALES',
        phoneNumber: '+1234567893',
        address: '321 Sales Street, Agriculture City',
        isActive: true
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('Demo users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();

