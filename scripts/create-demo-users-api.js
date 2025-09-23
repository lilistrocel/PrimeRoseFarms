const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function createDemoUsers() {
  const demoUsers = [
    {
      email: 'manager@primerose.com',
      password: 'demo123',
      firstName: 'John',
      lastName: 'Manager',
      role: 'MANAGER',
      phoneNumber: '+1234567890',
      address: '123 Farm Street, Agriculture City'
    },
    {
      email: 'worker@primerose.com',
      password: 'demo123',
      firstName: 'Maria',
      lastName: 'Worker',
      role: 'WORKER',
      phoneNumber: '+1234567891',
      address: '456 Field Avenue, Agriculture City'
    },
    {
      email: 'admin@primerose.com',
      password: 'demo123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phoneNumber: '+1234567892',
      address: '789 Admin Road, Agriculture City'
    },
    {
      email: 'sales@primerose.com',
      password: 'demo123',
      firstName: 'Sarah',
      lastName: 'Sales',
      role: 'SALES',
      phoneNumber: '+1234567893',
      address: '321 Sales Street, Agriculture City'
    }
  ];

  console.log('Creating demo users via API...');

  for (const userData of demoUsers) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, userData);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`User ${userData.email} already exists, skipping...`);
      } else {
        console.error(`Error creating user ${userData.email}:`, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('Demo user creation completed!');
}

createDemoUsers().catch(console.error);

