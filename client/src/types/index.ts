// Client-side types for the PrimeRoseFarms application

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGRONOMIST = 'AGRONOMIST',
  FARMER = 'FARMER',
  WORKER = 'WORKER',
  HR = 'HR',
  SALES = 'SALES',
  DEMO = 'DEMO'
}

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface IAuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: IUser;
  token: string;
  refreshToken?: string;
}

// Interface determination types
export enum InterfaceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE'
}

export interface IInterfaceConfig {
  type: InterfaceType;
  role: UserRole;
  features: string[];
}

// Desktop roles (complex interface)
export const DESKTOP_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.AGRONOMIST,
  UserRole.HR,
  UserRole.SALES
];

// Mobile roles (simplified interface)
export const MOBILE_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.FARMER // Farmer can use both but defaults to mobile for field use
];

// Task types for mobile interface
export interface ITask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: 'planting' | 'harvest' | 'maintenance' | 'fertilizing' | 'watering' | 'delivery';
  estimatedTime: number; // in minutes
  block?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  instructions: string[];
  requirements: {
    tools?: string[];
    materials?: string[];
    safety?: string[];
  };
}

// Simple form types for mobile interface
export interface IHarvestRecord {
  blockId: string;
  plantType: string;
  quantity: number; // kg
  quality: 'premium' | 'standard' | 'economy';
  harvesterId: string;
  date: string;
  notes?: string;
}

export interface IDeliveryRecord {
  orderId: string;
  customerId: string;
  customerName: string;
  address: string;
  items: Array<{
    plantType: string;
    quantity: number;
    quality: string;
  }>;
  status: 'assigned' | 'in_transit' | 'delivered' | 'failed';
  driverId: string;
  estimatedDelivery: string;
}
