import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Logistics Data Interface
 * Transportation, delivery, and fleet management
 */
export interface ILogisticsData {
  _id?: string;
  farmId: string; // Reference to FarmData
  
  // Vehicle Information
  vehicles: {
    vehicleId: string;
    type: 'truck' | 'van' | 'tractor' | 'trailer' | 'other';
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    capacity: {
      weight: number; // kg
      volume: number; // m³
    };
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    status: 'active' | 'maintenance' | 'inactive' | 'retired';
    driverId?: string; // Reference to UserData
  }[];
  
  // Driver Information
  drivers: {
    driverId: string; // Reference to UserData
    licenseNumber: string;
    licenseType: string;
    expiryDate: Date;
    status: 'active' | 'suspended' | 'inactive';
    certifications: string[];
    performance: {
      rating: number; // 1-10 scale
      accidents: number;
      violations: number;
      onTimeDelivery: number; // percentage
    };
  }[];
  
  // Routes and Schedules
  routes: {
    routeId: string;
    name: string;
    startLocation: string;
    endLocation: string;
    distance: number; // km
    estimatedTime: number; // minutes
    stops: {
      customerId: string;
      address: string;
      coordinates: { latitude: number; longitude: number };
      deliveryWindow: { start: string; end: string };
      priority: 'high' | 'medium' | 'low';
    }[];
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    assignedVehicle: string;
    assignedDriver: string;
    scheduledDate: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
  }[];
  
  // Delivery Tracking
  deliveries: {
    deliveryId: string;
    orderId: string;
    customerId: string;
    routeId: string;
    vehicleId: string;
    driverId: string;
    status: 'scheduled' | 'in_transit' | 'delivered' | 'failed' | 'returned';
    scheduledDate: Date;
    actualDate?: Date;
    address: string;
    coordinates: { latitude: number; longitude: number };
    items: {
      productId: string;
      quantity: number;
      weight: number;
      temperature?: number;
    }[];
    proofOfDelivery: {
      signature?: string;
      photo?: string;
      notes?: string;
      timestamp?: Date;
    };
  }[];
  
  // Cost Tracking
  costs: {
    fuel: {
      total: number; // USD
      perKm: number; // USD per km
      efficiency: number; // km per liter
    };
    maintenance: {
      total: number; // USD
      breakdown: {
        routine: number;
        repairs: number;
        parts: number;
        labor: number;
      };
    };
    insurance: {
      total: number; // USD
      coverage: string[];
      claims: number;
    };
    tolls: {
      total: number; // USD
      routes: string[];
    };
    fines: {
      total: number; // USD
      violations: {
        type: string;
        amount: number;
        date: Date;
        status: 'paid' | 'pending' | 'disputed';
      }[];
    };
  };
  
  // Performance Metrics
  performance: {
    onTimeDelivery: number; // percentage
    averageDeliveryTime: number; // minutes
    fuelEfficiency: number; // km per liter
    vehicleUtilization: number; // percentage
    driverProductivity: number; // deliveries per day
    customerSatisfaction: number; // 1-10 scale
    accidentRate: number; // per 100,000 km
    maintenanceCost: number; // USD per km
  };
  
  // Fleet Management
  fleetManagement: {
    totalVehicles: number;
    activeVehicles: number;
    maintenanceVehicles: number;
    averageAge: number; // years
    replacementSchedule: {
      vehicleId: string;
      currentValue: number; // USD
      replacementDate: Date;
      estimatedCost: number; // USD
    }[];
  };
  
  // Compliance
  compliance: {
    licenses: {
      type: string;
      number: string;
      expiryDate: Date;
      status: 'active' | 'expired' | 'pending';
    }[];
    inspections: {
      type: string;
      date: Date;
      result: 'passed' | 'failed' | 'pending';
      nextInspection: Date;
    }[];
    regulations: {
      name: string;
      description: string;
      complianceStatus: 'compliant' | 'non_compliant' | 'pending';
      lastCheck: Date;
    }[];
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Logistics Data Document Interface
 */
export interface ILogisticsDataDocument extends Omit<ILogisticsData, '_id'>, Document {}

/**
 * Logistics Data Schema
 */
const logisticsDataSchema = new Schema<ILogisticsDataDocument>({
  farmId: {
    type: String,
    required: true,
    ref: 'FarmData'
  },
  
  vehicles: [{
    vehicleId: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ['truck', 'van', 'tractor', 'trailer', 'other']
    },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
    licensePlate: { type: String, required: true, trim: true },
    capacity: {
      weight: { type: Number, required: true, min: 0 },
      volume: { type: Number, required: true, min: 0 }
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid']
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'maintenance', 'inactive', 'retired'],
      default: 'active'
    },
    driverId: { type: String, ref: 'UserData' }
  }],
  
  drivers: [{
    driverId: { type: String, required: true, ref: 'UserData' },
    licenseNumber: { type: String, required: true, trim: true },
    licenseType: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active'
    },
    certifications: [{ type: String, trim: true }],
    performance: {
      rating: { type: Number, default: 5, min: 1, max: 10 },
      accidents: { type: Number, default: 0, min: 0 },
      violations: { type: Number, default: 0, min: 0 },
      onTimeDelivery: { type: Number, default: 100, min: 0, max: 100 }
    }
  }],
  
  routes: [{
    routeId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    startLocation: { type: String, required: true, trim: true },
    endLocation: { type: String, required: true, trim: true },
    distance: { type: Number, required: true, min: 0 },
    estimatedTime: { type: Number, required: true, min: 0 },
    stops: [{
      customerId: { type: String, required: true },
      address: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      },
      deliveryWindow: {
        start: { type: String, required: true },
        end: { type: String, required: true }
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }],
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned'
    },
    assignedVehicle: { type: String, required: true },
    assignedDriver: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date }
  }],
  
  deliveries: [{
    deliveryId: { type: String, required: true },
    orderId: { type: String, required: true },
    customerId: { type: String, required: true },
    routeId: { type: String, required: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'in_transit', 'delivered', 'failed', 'returned'],
      default: 'scheduled'
    },
    scheduledDate: { type: Date, required: true },
    actualDate: { type: Date },
    address: { type: String, required: true, trim: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    items: [{
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 },
      weight: { type: Number, required: true, min: 0 },
      temperature: { type: Number }
    }],
    proofOfDelivery: {
      signature: { type: String },
      photo: { type: String },
      notes: { type: String, trim: true },
      timestamp: { type: Date }
    }
  }],
  
  costs: {
    fuel: {
      total: { type: Number, default: 0, min: 0 },
      perKm: { type: Number, default: 0, min: 0 },
      efficiency: { type: Number, default: 0, min: 0 }
    },
    maintenance: {
      total: { type: Number, default: 0, min: 0 },
      breakdown: {
        routine: { type: Number, default: 0, min: 0 },
        repairs: { type: Number, default: 0, min: 0 },
        parts: { type: Number, default: 0, min: 0 },
        labor: { type: Number, default: 0, min: 0 }
      }
    },
    insurance: {
      total: { type: Number, default: 0, min: 0 },
      coverage: [{ type: String, trim: true }],
      claims: { type: Number, default: 0, min: 0 }
    },
    tolls: {
      total: { type: Number, default: 0, min: 0 },
      routes: [{ type: String, trim: true }]
    },
    fines: {
      total: { type: Number, default: 0, min: 0 },
      violations: [{
        type: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: ['paid', 'pending', 'disputed'],
          default: 'pending'
        }
      }]
    }
  },
  
  performance: {
    onTimeDelivery: { type: Number, default: 100, min: 0, max: 100 },
    averageDeliveryTime: { type: Number, default: 0, min: 0 },
    fuelEfficiency: { type: Number, default: 0, min: 0 },
    vehicleUtilization: { type: Number, default: 0, min: 0, max: 100 },
    driverProductivity: { type: Number, default: 0, min: 0 },
    customerSatisfaction: { type: Number, default: 5, min: 1, max: 10 },
    accidentRate: { type: Number, default: 0, min: 0 },
    maintenanceCost: { type: Number, default: 0, min: 0 }
  },
  
  fleetManagement: {
    totalVehicles: { type: Number, default: 0, min: 0 },
    activeVehicles: { type: Number, default: 0, min: 0 },
    maintenanceVehicles: { type: Number, default: 0, min: 0 },
    averageAge: { type: Number, default: 0, min: 0 },
    replacementSchedule: [{
      vehicleId: { type: String, required: true },
      currentValue: { type: Number, required: true, min: 0 },
      replacementDate: { type: Date, required: true },
      estimatedCost: { type: Number, required: true, min: 0 }
    }]
  },
  
  compliance: {
    licenses: [{
      type: { type: String, required: true, trim: true },
      number: { type: String, required: true, trim: true },
      expiryDate: { type: Date, required: true },
      status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'active'
      }
    }],
    inspections: [{
      type: { type: String, required: true, trim: true },
      date: { type: Date, required: true },
      result: {
        type: String,
        enum: ['passed', 'failed', 'pending'],
        default: 'pending'
      },
      nextInspection: { type: Date }
    }],
    regulations: [{
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      complianceStatus: {
        type: String,
        enum: ['compliant', 'non_compliant', 'pending'],
        default: 'pending'
      },
      lastCheck: { type: Date, required: true }
    }]
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  lastModifiedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'logisticsdata'
});

// Indexes for performance
logisticsDataSchema.index({ farmId: 1, isActive: 1 });
logisticsDataSchema.index({ 'vehicles.vehicleId': 1 });
logisticsDataSchema.index({ 'drivers.driverId': 1 });
logisticsDataSchema.index({ 'routes.routeId': 1 });
logisticsDataSchema.index({ 'deliveries.deliveryId': 1 });
logisticsDataSchema.index({ 'deliveries.status': 1 });
logisticsDataSchema.index({ 'deliveries.scheduledDate': 1 });
logisticsDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations
logisticsDataSchema.pre('save', function(next) {
  // Calculate fleet management metrics
  this.fleetManagement.totalVehicles = this.vehicles.length;
  this.fleetManagement.activeVehicles = this.vehicles.filter(v => v.status === 'active').length;
  this.fleetManagement.maintenanceVehicles = this.vehicles.filter(v => v.status === 'maintenance').length;
  
  // Calculate average vehicle age
  if (this.vehicles.length > 0) {
    const currentYear = new Date().getFullYear();
    const totalAge = this.vehicles.reduce((sum: number, vehicle: any) => sum + (currentYear - vehicle.year), 0);
    this.fleetManagement.averageAge = totalAge / this.vehicles.length;
  }
  
  // Calculate total maintenance cost
  this.costs.maintenance.total = 
    this.costs.maintenance.breakdown.routine +
    this.costs.maintenance.breakdown.repairs +
    this.costs.maintenance.breakdown.parts +
    this.costs.maintenance.breakdown.labor;
  
  // Calculate total fines
  this.costs.fines.total = this.costs.fines.violations.reduce((sum: number, violation: any) => sum + violation.amount, 0);
  
  next();
});

// Instance methods
logisticsDataSchema.methods.getActiveVehicles = function() {
  return this.vehicles.filter((vehicle: any) => vehicle.status === 'active');
};

logisticsDataSchema.methods.getAvailableVehicles = function() {
  return this.vehicles.filter((vehicle: any) => 
    vehicle.status === 'active' && !vehicle.driverId
  );
};

logisticsDataSchema.methods.getActiveDrivers = function() {
  return this.drivers.filter((driver: any) => driver.status === 'active');
};

logisticsDataSchema.methods.getPendingDeliveries = function() {
  return this.deliveries.filter((delivery: any) => 
    delivery.status === 'scheduled' || delivery.status === 'in_transit'
  );
};

logisticsDataSchema.methods.calculateRouteEfficiency = function(routeId: string): number {
  const route = this.routes.find((r: any) => r.routeId === routeId);
  if (!route) return 0;
  
  const deliveries = this.deliveries.filter((d: any) => d.routeId === routeId);
  const onTimeDeliveries = deliveries.filter((d: any) => 
    d.actualDate && d.actualDate <= d.scheduledDate
  ).length;
  
  return deliveries.length > 0 ? (onTimeDeliveries / deliveries.length) * 100 : 0;
};

logisticsDataSchema.methods.getTotalCosts = function(): number {
  return this.costs.fuel.total +
         this.costs.maintenance.total +
         this.costs.insurance.total +
         this.costs.tolls.total +
         this.costs.fines.total;
};

logisticsDataSchema.methods.getCostPerDelivery = function(): number {
  const totalDeliveries = this.deliveries.length;
  return totalDeliveries > 0 ? this.getTotalCosts() / totalDeliveries : 0;
};

// Static methods
logisticsDataSchema.statics.findByFarm = function(farmId: string) {
  return this.find({ farmId, isActive: true });
};

logisticsDataSchema.statics.findByVehicle = function(vehicleId: string) {
  return this.find({ 'vehicles.vehicleId': vehicleId, isActive: true });
};

logisticsDataSchema.statics.findByDriver = function(driverId: string) {
  return this.find({ 'drivers.driverId': driverId, isActive: true });
};

logisticsDataSchema.statics.findPendingDeliveries = function() {
  return this.find({
    'deliveries.status': { $in: ['scheduled', 'in_transit'] },
    isActive: true
  });
};

// Transform to JSON
logisticsDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const LogisticsData = mongoose.model<ILogisticsDataDocument>('LogisticsData', logisticsDataSchema);
