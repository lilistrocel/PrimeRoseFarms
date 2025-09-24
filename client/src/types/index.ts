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

// Cost Management Interface
export interface ICostsData {
  _id: string;
  farmId: string;
  managerId: string;
  laborRates: {
    base: {
      plantingPerPlant: number;
      harvestPerKg: number;
      maintenancePerHour: number;
      irrigationPerHour: number;
      fertilizingPerHour: number;
    };
    overtime: {
      multiplier: number;
      threshold: number;
    };
    seasonal: {
      peakSeasonMultiplier: number;
      peakMonths: number[];
    };
    skillPremiums: {
      [skillLevel: string]: number;
    };
  };
  infrastructure: {
    land: {
      rentPerHectare: number;
      propertyTaxes: number;
      insurance: number;
    };
    utilities: {
      waterPerCubicMeter: number;
      electricityPerKwh: number;
      fuelPerLiter: number;
      internetMonthly: number;
    };
    equipment: {
      depreciationRate: number;
      maintenanceRate: number;
      insuranceRate: number;
    };
  };
  materials: {
    fertilizer: {
      basePricePerKg: number;
      bulkDiscounts: Array<{ minQuantity: number; discountPercent: number }>;
    };
    pesticides: {
      basePricePerLiter: number;
      applicationCostPerLiter: number;
    };
    seeds: {
      basePricePerKg: number;
      qualityPremium: number;
    };
    packaging: {
      containerCost: number;
      labelingCost: number;
    };
  };
  logistics: {
    fleet: {
      vehicleCostPerKm: number;
      fuelCostPerLiter: number;
      maintenanceCostPerKm: number;
      insuranceMonthly: number;
    };
    delivery: {
      baseRate: number;
      perKmRate: number;
      perKgRate: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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

// Plant Data Management Interface
export interface IPlantData {
  _id: string;
  name: string;
  scientificName: string;
  family: string;
  variety: string;
  growthCharacteristics: {
    height: number;
    spread: number;
    rootDepth: number;
    lifecycle: 'annual' | 'perennial' | 'biennial';
  };
  growingRequirements: {
    soilType: string;
    phRange: { min: number; max: number };
    temperatureRange: { min: number; max: number; optimal: number };
    humidityRange: { min: number; max: number };
    lightRequirements: 'full_sun' | 'partial_shade' | 'shade';
    waterRequirements: 'low' | 'moderate' | 'high';
  };
  fertilizerSchedule: Array<{
    day: number;
    fertilizerType: string;
    applicationRate: number;
    frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
    applicationMethod: 'soil_drench' | 'foliar_spray' | 'injection' | 'broadcast';
  }>;
  pesticideSchedule: Array<{
    day: number;
    chemicalType: string;
    applicationRate: number;
    frequency: 'preventive' | 'curative' | 'as_needed';
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
    applicationMethod: 'foliar_spray' | 'dust' | 'injection' | 'soil_drench';
    safetyRequirements: string;
    reEntryInterval: number; // hours
    harvestRestriction: number; // days
  }>;
  growthTimeline: {
    germinationTime: number; // days
    daysToMaturity: number;
    harvestWindow: number; // days
    seasonalPlanting: string[];
  };
  yieldInformation: {
    expectedYieldPerPlant: number; // kg
    yieldPerSquareMeter: number; // kg
    qualityMetrics: {
      size: string;
      color: string;
      texture: string;
      brix: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
