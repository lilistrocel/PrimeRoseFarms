// User Roles
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGRONOMIST = 'agronomist',
  FARMER = 'farmer',
  WORKER = 'worker',
  HR = 'hr',
  SALES = 'sales',
  DEMO = 'demo'
}

// Data Protection Levels
export enum DataProtectionLevel {
  PUBLIC = 1,      // General farm data, non-sensitive information
  INTERNAL = 2,    // Operational data, schedules, basic user info
  CONFIDENTIAL = 3, // Personal data, financial records, health information
  RESTRICTED = 4   // Admin credentials, system configurations
}

// User Interface
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Encrypted fields
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Encryption Result
export interface IEncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
}

// API Response
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Farm Data Interfaces
export interface IFarm {
  _id?: string;
  name: string;
  location: string;
  size: number; // in acres
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IField {
  _id?: string;
  farmId: string;
  name: string;
  size: number; // in acres
  cropType?: string;
  plantingDate?: Date;
  expectedHarvestDate?: Date;
  status: 'prepared' | 'planted' | 'growing' | 'ready_for_harvest' | 'harvested';
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorker {
  _id?: string;
  userId: string;
  farmId: string;
  position: string;
  hourlyRate?: number;
  startDate: Date;
  isActive: boolean;
  // Encrypted fields
  ssn?: string;
  bankAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}
