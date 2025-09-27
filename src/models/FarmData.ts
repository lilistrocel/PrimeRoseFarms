import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Farm Data Interface
 * Central management unit for all farm operations
 */
export interface IFarmData {
  _id?: string;
  name: string;
  farmId: string; // Unique farm identifier
  ownerId: string; // Reference to UserData
  farmOwner: string; // Farm owner name
  
  // Location Information
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: string;
  };
  
  // Farm Specifications
  specifications: {
    totalArea: number; // hectares
    usableArea: number; // hectares
    maxBlocks: number; // Maximum number of blocks that can be assigned to this farm
    establishedDate: Date;
    farmType: 'organic' | 'conventional' | 'hydroponic' | 'mixed' | 'research' | 'commercial';
    certification: string[]; // e.g., ['USDA Organic', 'GAP', 'HACCP']
    climate: 'tropical' | 'subtropical' | 'temperate' | 'continental' | 'arctic';
    soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'mixed';
  };
  
  // Map and Location Details
  mapLocation: {
    mapUrl?: string; // URL to farm map image or interactive map
    mapDescription?: string; // Description of the farm layout
    boundaries?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  
  // Current Status
  status: 'active' | 'inactive' | 'maintenance' | 'expansion' | 'sale';
  
  // Block Management
  blocks: {
    total: number;
    active: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  
  // Current Operations
  currentOperations: {
    activeBlocks: string[]; // BlockData IDs
    plannedBlocks: string[]; // BlockData IDs
    harvestedBlocks: string[]; // BlockData IDs
    maintenanceBlocks: string[]; // BlockData IDs
  };
  
  // Production Summary
  production: {
    currentCrops: {
      plantDataId: string;
      blockCount: number;
      totalPlants: number;
      expectedYield: number; // kg
      expectedHarvestDate: Date;
    }[];
    monthlyProduction: {
      month: string; // YYYY-MM
      totalYield: number; // kg
      revenue: number; // USD
      cost: number; // USD
      profit: number; // USD
    }[];
    annualTarget: {
      year: number;
      targetYield: number; // kg
      targetRevenue: number; // USD
      actualYield: number; // kg
      actualRevenue: number; // USD
    };
  };
  
  // Financial Overview
  financials: {
    totalInvestment: number; // USD
    monthlyOperatingCost: number; // USD
    monthlyRevenue: number; // USD
    monthlyProfit: number; // USD
    roi: number; // percentage
    breakEvenPoint: Date;
  };
  
  // Resource Management
  resources: {
    water: {
      source: 'municipal' | 'well' | 'rainwater' | 'river' | 'mixed';
      dailyUsage: number; // liters
      monthlyCost: number; // USD
      quality: 'excellent' | 'good' | 'fair' | 'poor';
    };
    electricity: {
      source: 'grid' | 'solar' | 'wind' | 'mixed';
      dailyUsage: number; // kWh
      monthlyCost: number; // USD
      efficiency: number; // percentage
    };
    labor: {
      totalWorkers: number;
      fullTime: number;
      partTime: number;
      seasonal: number;
      monthlyCost: number; // USD
    };
  };
  
  // Compliance & Regulations
  compliance: {
    licenses: {
      name: string;
      number: string;
      issuedDate: Date;
      expiryDate: Date;
      status: 'active' | 'expired' | 'pending';
    }[];
    inspections: {
      type: string;
      date: Date;
      result: 'passed' | 'failed' | 'pending';
      notes: string;
      nextInspection: Date;
    }[];
    certifications: {
      name: string;
      issuer: string;
      issuedDate: Date;
      expiryDate: Date;
      status: 'active' | 'expired' | 'pending';
    }[];
  };
  
  // Risk Management
  risks: {
    weather: {
      riskLevel: 'low' | 'medium' | 'high';
      mitigation: string[];
      insurance: boolean;
      coverage: number; // USD
    };
    market: {
      riskLevel: 'low' | 'medium' | 'high';
      diversification: string[];
      contracts: number; // percentage of production under contract
    };
    operational: {
      riskLevel: 'low' | 'medium' | 'high';
      backupSystems: string[];
      contingencyPlans: string[];
    };
  };
  
  // Performance Metrics
  performance: {
    efficiency: {
      waterEfficiency: number; // liters per kg
      energyEfficiency: number; // kWh per kg
      laborEfficiency: number; // kg per worker per day
      spaceEfficiency: number; // kg per square meter
    };
    quality: {
      averageGrade: 'A' | 'B' | 'C' | 'D';
      defectRate: number; // percentage
      customerSatisfaction: number; // 1-10 scale
    };
    sustainability: {
      carbonFootprint: number; // CO2 kg per kg
      waterFootprint: number; // liters per kg
      wasteReduction: number; // percentage
      renewableEnergy: number; // percentage
    };
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Farm Data Document Interface
 */
export interface IFarmDataDocument extends Omit<IFarmData, '_id'>, Document {}

/**
 * Farm Data Schema
 */
const farmDataSchema = new Schema<IFarmDataDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  farmId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  ownerId: {
    type: String,
    required: true,
    ref: 'UserData'
  },
  farmOwner: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  location: {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    coordinates: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 }
    },
    timezone: { type: String, required: true, trim: true }
  },
  
  specifications: {
    totalArea: { type: Number, required: true, min: 0 },
    usableArea: { type: Number, required: true, min: 0 },
    maxBlocks: { type: Number, required: true, min: 1 },
    establishedDate: { type: Date, required: true },
    farmType: {
      type: String,
      required: true,
      enum: ['organic', 'conventional', 'hydroponic', 'mixed', 'research', 'commercial']
    },
    certification: [{ type: String, trim: true }],
    climate: {
      type: String,
      required: true,
      enum: ['tropical', 'subtropical', 'temperate', 'continental', 'arctic']
    },
    soilType: {
      type: String,
      required: true,
      enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'mixed']
    }
  },
  
  mapLocation: {
    mapUrl: { type: String, trim: true },
    mapDescription: { type: String, trim: true },
    boundaries: {
      north: { type: Number },
      south: { type: Number },
      east: { type: Number },
      west: { type: Number }
    }
  },
  
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'maintenance', 'expansion', 'sale'],
    default: 'active'
  },
  
  blocks: {
    total: { type: Number, default: 0, min: 0 },
    active: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
    inUse: { type: Number, default: 0, min: 0 },
    maintenance: { type: Number, default: 0, min: 0 }
  },
  
  currentOperations: {
    activeBlocks: [{ type: String, ref: 'BlockData' }],
    plannedBlocks: [{ type: String, ref: 'BlockData' }],
    harvestedBlocks: [{ type: String, ref: 'BlockData' }],
    maintenanceBlocks: [{ type: String, ref: 'BlockData' }]
  },
  
  production: {
    currentCrops: [{
      plantDataId: { type: String, ref: 'PlantData' },
      blockCount: { type: Number, min: 0 },
      totalPlants: { type: Number, min: 0 },
      expectedYield: { type: Number, min: 0 },
      expectedHarvestDate: { type: Date }
    }],
    monthlyProduction: [{
      month: { type: String, required: true },
      totalYield: { type: Number, required: true, min: 0 },
      revenue: { type: Number, required: true, min: 0 },
      cost: { type: Number, required: true, min: 0 },
      profit: { type: Number, required: true }
    }],
    annualTarget: {
      year: { type: Number, required: true },
      targetYield: { type: Number, required: true, min: 0 },
      targetRevenue: { type: Number, required: true, min: 0 },
      actualYield: { type: Number, default: 0, min: 0 },
      actualRevenue: { type: Number, default: 0, min: 0 }
    }
  },
  
  financials: {
    totalInvestment: { type: Number, default: 0, min: 0 },
    monthlyOperatingCost: { type: Number, default: 0, min: 0 },
    monthlyRevenue: { type: Number, default: 0, min: 0 },
    monthlyProfit: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
    breakEvenPoint: { type: Date }
  },
  
  resources: {
    water: {
      source: {
        type: String,
        required: true,
        enum: ['municipal', 'well', 'rainwater', 'river', 'mixed']
      },
      dailyUsage: { type: Number, required: true, min: 0 },
      monthlyCost: { type: Number, required: true, min: 0 },
      quality: {
        type: String,
        required: true,
        enum: ['excellent', 'good', 'fair', 'poor']
      }
    },
    electricity: {
      source: {
        type: String,
        required: true,
        enum: ['grid', 'solar', 'wind', 'mixed']
      },
      dailyUsage: { type: Number, required: true, min: 0 },
      monthlyCost: { type: Number, required: true, min: 0 },
      efficiency: { type: Number, required: true, min: 0, max: 100 }
    },
    labor: {
      totalWorkers: { type: Number, required: true, min: 0 },
      fullTime: { type: Number, required: true, min: 0 },
      partTime: { type: Number, required: true, min: 0 },
      seasonal: { type: Number, required: true, min: 0 },
      monthlyCost: { type: Number, required: true, min: 0 }
    }
  },
  
  compliance: {
    licenses: [{
      name: { type: String, required: true, trim: true },
      number: { type: String, required: true, trim: true },
      issuedDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      status: {
        type: String,
        required: true,
        enum: ['active', 'expired', 'pending']
      }
    }],
    inspections: [{
      type: { type: String, required: true, trim: true },
      date: { type: Date, required: true },
      result: {
        type: String,
        required: true,
        enum: ['passed', 'failed', 'pending']
      },
      notes: { type: String, trim: true },
      nextInspection: { type: Date }
    }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, required: true, trim: true },
      issuedDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      status: {
        type: String,
        required: true,
        enum: ['active', 'expired', 'pending']
      }
    }]
  },
  
  risks: {
    weather: {
      riskLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
      },
      mitigation: [{ type: String, trim: true }],
      insurance: { type: Boolean, default: false },
      coverage: { type: Number, default: 0, min: 0 }
    },
    market: {
      riskLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
      },
      diversification: [{ type: String, trim: true }],
      contracts: { type: Number, required: true, min: 0, max: 100 }
    },
    operational: {
      riskLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
      },
      backupSystems: [{ type: String, trim: true }],
      contingencyPlans: [{ type: String, trim: true }]
    }
  },
  
  performance: {
    efficiency: {
      waterEfficiency: { type: Number, default: 0, min: 0 },
      energyEfficiency: { type: Number, default: 0, min: 0 },
      laborEfficiency: { type: Number, default: 0, min: 0 },
      spaceEfficiency: { type: Number, default: 0, min: 0 }
    },
    quality: {
      averageGrade: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        default: 'B'
      },
      defectRate: { type: Number, default: 0, min: 0, max: 100 },
      customerSatisfaction: { type: Number, default: 5, min: 1, max: 10 }
    },
    sustainability: {
      carbonFootprint: { type: Number, default: 0, min: 0 },
      waterFootprint: { type: Number, default: 0, min: 0 },
      wasteReduction: { type: Number, default: 0, min: 0, max: 100 },
      renewableEnergy: { type: Number, default: 0, min: 0, max: 100 }
    }
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
  collection: 'farmdata'
});

// Indexes for performance
farmDataSchema.index({ ownerId: 1, isActive: 1 });
farmDataSchema.index({ status: 1 });
farmDataSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
farmDataSchema.index({ 'specifications.farmType': 1 });
farmDataSchema.index({ 'specifications.climate': 1 });
farmDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
farmDataSchema.pre('save', function(next) {
  // Validate usable area
  if (this.specifications.usableArea > this.specifications.totalArea) {
    return next(new Error('Usable area cannot exceed total area'));
  }
  
  // Calculate monthly profit
  this.financials.monthlyProfit = this.financials.monthlyRevenue - this.financials.monthlyOperatingCost;
  
  // Calculate ROI
  if (this.financials.totalInvestment > 0) {
    this.financials.roi = (this.financials.monthlyProfit * 12 / this.financials.totalInvestment) * 100;
  }
  
  // Validate labor numbers
  const totalLabor = this.resources.labor.fullTime + this.resources.labor.partTime + this.resources.labor.seasonal;
  if (totalLabor !== this.resources.labor.totalWorkers) {
    return next(new Error('Total workers must equal sum of full-time, part-time, and seasonal workers'));
  }
  
  next();
});

// Instance methods
farmDataSchema.methods.calculateUtilization = function(): number {
  if (this.blocks.total === 0) return 0;
  return (this.blocks.inUse / this.blocks.total) * 100;
};

farmDataSchema.methods.getTotalExpectedYield = function(): number {
  return this.production.currentCrops.reduce((total: number, crop: any) => total + crop.expectedYield, 0);
};

farmDataSchema.methods.getTotalExpectedRevenue = function(): number {
  return this.production.currentCrops.reduce((total: number, crop: any) => {
    // This would need to be calculated based on current market prices
    return total + (crop.expectedYield * 10); // Assuming $10/kg average
  }, 0);
};

farmDataSchema.methods.isCompliant = function(): boolean {
  const expiredLicenses = this.compliance.licenses.filter((license: any) => 
    new Date(license.expiryDate) < new Date() && license.status === 'active'
  );
  const expiredCertifications = this.compliance.certifications.filter((cert: any) => 
    new Date(cert.expiryDate) < new Date() && cert.status === 'active'
  );
  
  return expiredLicenses.length === 0 && expiredCertifications.length === 0;
};

farmDataSchema.methods.getUpcomingExpirations = function(days: number = 30): any[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  const expiringLicenses = this.compliance.licenses.filter((license: any) => 
    new Date(license.expiryDate) <= cutoffDate && license.status === 'active'
  );
  const expiringCertifications = this.compliance.certifications.filter((cert: any) => 
    new Date(cert.expiryDate) <= cutoffDate && cert.status === 'active'
  );
  
  return [...expiringLicenses, ...expiringCertifications];
};

farmDataSchema.methods.calculateSustainabilityScore = function(): number {
  const sustainability = this.performance.sustainability;
  const score = (
    (100 - sustainability.carbonFootprint) * 0.3 +
    (100 - sustainability.waterFootprint) * 0.3 +
    sustainability.wasteReduction * 0.2 +
    sustainability.renewableEnergy * 0.2
  );
  return Math.max(0, Math.min(100, score));
};

// Static methods
farmDataSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ ownerId, isActive: true });
};

farmDataSchema.statics.findByStatus = function(status: string) {
  return this.find({ status, isActive: true });
};

farmDataSchema.statics.findByLocation = function(latitude: number, longitude: number, radius: number = 10) {
  // This would need a proper geospatial query
  return this.find({
    'location.coordinates.latitude': {
      $gte: latitude - radius,
      $lte: latitude + radius
    },
    'location.coordinates.longitude': {
      $gte: longitude - radius,
      $lte: longitude + radius
    },
    isActive: true
  });
};

farmDataSchema.statics.findByFarmType = function(farmType: string) {
  return this.find({ 'specifications.farmType': farmType, isActive: true });
};

farmDataSchema.statics.findNonCompliant = function() {
  return this.find({ isActive: true }).then((farms: any) => {
    return farms.filter((farm: any) => !farm.isCompliant());
  });
};

// Transform to JSON
farmDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const FarmData = mongoose.model<IFarmDataDocument>('FarmData', farmDataSchema);
