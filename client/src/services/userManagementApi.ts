/**
 * User Management API Service
 * Handles all user management operations with test mode support
 */

import axios from 'axios';
import { testModeService } from '../config/testMode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// User interfaces
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
  dateHired?: Date;
  department?: string;
  supervisor?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPermissions {
  _id: string;
  userId: string;
  farmAccess: {
    farmId: string;
    accessLevel: 'read' | 'write' | 'admin';
    blocks?: string[];
  }[];
  customerAccess?: string[];
  scheduleRestrictions?: {
    allowedHours: { start: string; end: string };
    allowedDays: number[];
    blackoutDates: Date[];
  };
  approvalAuthority?: {
    maxAmount: number;
    categories: string[];
  };
  temporaryAccess?: {
    startDate: Date;
    endDate: Date;
    reason: string;
  };
  certifications: {
    type: string;
    issueDate: Date;
    expiryDate: Date;
    issuingAuthority: string;
  }[];
  auditTrail: {
    action: string;
    timestamp: Date;
    performedBy: string;
    details?: any;
  }[];
}

export type UserRole = 'admin' | 'manager' | 'agronomist' | 'farmer' | 'worker' | 'hr' | 'sales' | 'demo';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  department?: string;
  farmAccess?: {
    farmId: string;
    accessLevel: 'read' | 'write' | 'admin';
    blocks?: string[];
  }[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  phoneNumber?: string;
  address?: string;
  department?: string;
}

// Mock data for testing
const mockUsers: IUser[] = [
  {
    _id: 'user-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@primerose.com',
    role: 'manager',
    isActive: true,
    phoneNumber: '+1-555-0101',
    department: 'Operations',
    dateHired: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-12-19')
  },
  {
    _id: 'user-2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@primerose.com',
    role: 'worker',
    isActive: true,
    phoneNumber: '+1-555-0102',
    department: 'Field Operations',
    supervisor: 'john.smith@primerose.com',
    dateHired: new Date('2023-03-20'),
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-12-19')
  },
  {
    _id: 'user-3',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@primerose.com',
    role: 'agronomist',
    isActive: true,
    phoneNumber: '+1-555-0103',
    department: 'Research & Development',
    dateHired: new Date('2022-08-10'),
    createdAt: new Date('2022-08-10'),
    updatedAt: new Date('2024-12-19')
  },
  {
    _id: 'user-4',
    firstName: 'Lisa',
    lastName: 'Johnson',
    email: 'lisa.johnson@primerose.com',
    role: 'sales',
    isActive: true,
    phoneNumber: '+1-555-0104',
    department: 'Sales & Marketing',
    dateHired: new Date('2023-06-01'),
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-12-19')
  },
  {
    _id: 'user-5',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@primerose.com',
    role: 'hr',
    isActive: true,
    phoneNumber: '+1-555-0105',
    department: 'Human Resources',
    dateHired: new Date('2022-11-15'),
    createdAt: new Date('2022-11-15'),
    updatedAt: new Date('2024-12-19')
  }
];

const mockUserPermissions: IUserPermissions[] = [
  {
    _id: 'perm-1',
    userId: 'user-1',
    farmAccess: [
      { farmId: 'farm-1', accessLevel: 'admin' },
      { farmId: 'farm-2', accessLevel: 'write' }
    ],
    approvalAuthority: {
      maxAmount: 10000,
      categories: ['materials', 'equipment', 'labor']
    },
    certifications: [
      {
        type: 'Farm Safety Management',
        issueDate: new Date('2023-01-20'),
        expiryDate: new Date('2025-01-20'),
        issuingAuthority: 'Agricultural Safety Board'
      }
    ],
    auditTrail: []
  },
  {
    _id: 'perm-2',
    userId: 'user-2',
    farmAccess: [
      { farmId: 'farm-1', accessLevel: 'read', blocks: ['block-1', 'block-2'] }
    ],
    scheduleRestrictions: {
      allowedHours: { start: '06:00', end: '18:00' },
      allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
      blackoutDates: []
    },
    certifications: [
      {
        type: 'Field Worker Safety',
        issueDate: new Date('2023-03-25'),
        expiryDate: new Date('2025-03-25'),
        issuingAuthority: 'Agricultural Safety Board'
      }
    ],
    auditTrail: []
  }
];

class UserManagementApiService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<IUser[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      console.log('🔧 Using mock user data');
      return Promise.resolve(mockUsers);
    }
    
    console.log('🔧 Using real user data from API');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/users`, {
        headers: this.getAuthHeader()
      });
      // Backend returns { success: true, data: { users, pagination } }
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      const user = mockUsers.find(u => u._id === userId);
      if (!user) throw new Error('User not found');
      return Promise.resolve(user);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/${userId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<IUser> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      const newUser: IUser = {
        _id: `user-${Date.now()}`,
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockUsers.push(newUser);
      console.log('🔧 Created mock user:', newUser);
      return Promise.resolve(newUser);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users`, userData, {
        headers: { ...this.getAuthHeader(), 'Content-Type': 'application/json' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<IUser> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      const userIndex = mockUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...updates,
        updatedAt: new Date()
      };
      console.log('🔧 Updated mock user:', mockUsers[userIndex]);
      return Promise.resolve(mockUsers[userIndex]);
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/users/${userId}`, updates, {
        headers: { ...this.getAuthHeader(), 'Content-Type': 'application/json' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      const userIndex = mockUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockUsers[userIndex].isActive = false;
      mockUsers[userIndex].updatedAt = new Date();
      console.log('🔧 Deactivated mock user:', mockUsers[userIndex]);
      return Promise.resolve();
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/v1/users/${userId}`, {
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<IUserPermissions> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      const permissions = mockUserPermissions.find(p => p.userId === userId);
      if (!permissions) throw new Error('Permissions not found');
      return Promise.resolve(permissions);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/user-permissions/${userId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(userId: string, permissions: Partial<IUserPermissions>): Promise<IUserPermissions> {
    if (testModeService.isTestMode() && !testModeService.useRealData('user-management')) {
      const permIndex = mockUserPermissions.findIndex(p => p.userId === userId);
      if (permIndex === -1) {
        // Create new permissions
        const newPermissions: IUserPermissions = {
          _id: `perm-${Date.now()}`,
          userId,
          farmAccess: [],
          certifications: [],
          auditTrail: [],
          ...permissions
        };
        mockUserPermissions.push(newPermissions);
        return Promise.resolve(newPermissions);
      } else {
        // Update existing permissions
        mockUserPermissions[permIndex] = {
          ...mockUserPermissions[permIndex],
          ...permissions
        };
        return Promise.resolve(mockUserPermissions[permIndex]);
      }
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/user-permissions/${userId}`, permissions, {
        headers: { ...this.getAuthHeader(), 'Content-Type': 'application/json' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    const users = await this.getUsers();
    return users.filter(user => user.role === role && user.isActive);
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<IUser[]> {
    const users = await this.getUsers();
    const searchTerm = query.toLowerCase();
    return users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.department?.toLowerCase().includes(searchTerm)
    );
  }
}

export const userManagementApi = new UserManagementApiService();
export default userManagementApi;
