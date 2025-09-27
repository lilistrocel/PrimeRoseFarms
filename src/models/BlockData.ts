import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Block Data Interface
 * Represents different types of growing areas within a farm
 */
export interface IBlockData {
  _id?: string;
  name: string;
  farmId: string; // Reference to FarmData
  blockType: 'open_field' | 'greenhouse' | 'nethouse' | 'hydroponic' | 'container' | 'vertical' | 'aquaponic' | 'other';
  
  // Physical Dimensions
  dimensions: {
    length: number; // meters
    width: number; // meters
    height?: number; // meters (for vertical growing)
    area: number; // square meters (calculated)
    volume?: number; // cubic meters (for 3D growing)
  };
  
  // Location within farm
  location: {
    coordinates: {
      x: number; // meters from farm origin
      y: number; // meters from farm origin
      z?: number; // elevation in meters
    };
    orientation: number; // degrees (0-360, 0 = North)
    slope?: number; // degrees (0-90)
  };
  
  // Infrastructure
  infrastructure: {
    irrigation: {
      type: 'drip' | 'sprinkler' | 'flood' | 'mist' | 'none';
      capacity: number; // liters per hour
      coverage: number; // percentage
      automation: boolean;
    };
    lighting: {
      type: 'natural' | 'led' | 'fluorescent' | 'hps' | 'mixed';
      intensity: number; // lux
      duration: number; // hours per day
      automation: boolean;
    };
    climateControl: {
      heating: boolean;
      cooling: boolean;
      ventilation: boolean;
      humidityControl: boolean;
      automation: boolean;
    };
    power: {
      connected: boolean;
      capacity: number; // watts
      backup: boolean;
    };
    water: {
      source: 'municipal' | 'well' | 'rainwater' | 'recycled' | 'mixed';
      quality: 'excellent' | 'good' | 'fair' | 'poor';
      ph: number;
      tds: number; // total dissolved solids
    };
  };
  
  // Current Status
  status: 'empty' | 'assigned' | 'planted' | 'harvesting' | 'alert';
  
  // Plant Assignment and Management
  plantAssignment: {
    maxPlantCapacity: number; // Maximum number of plants this block can hold
    assignedPlants: Array<{
      plantDataId: string; // Reference to PlantData
      plantName: string;
      assignedCount: number; // Number of plants assigned
      plantingDate?: Date; // When plants were actually planted
      expectedHarvestStart?: Date; // Predicted harvest start date
      expectedHarvestEnd?: Date; // Predicted harvest end date
      actualHarvestStart?: Date; // Actual harvest start date
      actualHarvestEnd?: Date; // Actual harvest end date
      harvestNotes?: string; // Notes about early/late harvest timing
    }>;
    totalAssigned: number; // Total plants assigned (sum of assignedCount)
    remainingCapacity: number; // Available capacity for more plants
  };
  
  // State History and Tracking
  stateHistory: Array<{
    fromState: string;
    toState: string;
    timestamp: Date;
    notes?: string;
    triggeredBy?: string; // User ID or system
  }>;
  
  // Alert Management
  alertInfo?: {
    alertType: 'disease' | 'pest' | 'weather' | 'equipment' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    startDate: Date;
    endDate?: Date;
    resolvedBy?: string; // User ID
    resolutionNotes?: string;
  };
  
  // Environmental Conditions (current)
  currentConditions: {
    temperature: number; // Celsius
    humidity: number; // Percentage
    lightLevel: number; // lux
    soilMoisture: number; // Percentage
    soilPh: number;
    lastUpdated: Date;
  };
  
  // Performance Metrics
  performance: {
    totalCycles: number;
    averageYield: number; // kg per cycle
    averageCycleLength: number; // days
    successRate: number; // percentage
    lastHarvestDate?: Date;
    lastHarvestYield?: number; // kg
  };
  
  // Maintenance Schedule
  maintenance: {
    lastMaintenance: Date;
    nextMaintenance: Date;
    maintenanceType: 'routine' | 'repair' | 'upgrade' | 'cleaning';
    notes: string;
    cost: number; // USD
  };
  
  // Cost Tracking
  costs: {
    setupCost: number; // USD
    monthlyOperatingCost: number; // USD
    maintenanceCost: number; // USD
    utilityCost: number; // USD (electricity, water)
    totalCost: number; // USD (calculated)
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Block Data Document Interface
 */
export interface IBlockDataDocument extends Omit<IBlockData, '_id'>, Document {}

/**
 * Block Data Schema
 */
const blockDataSchema = new Schema<IBlockDataDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  farmId: {
    type: String,
    required: true,
    ref: 'FarmData'
  },
  blockType: {
    type: String,
    required: true,
    enum: ['open_field', 'greenhouse', 'nethouse', 'hydroponic', 'container', 'vertical', 'aquaponic', 'other']
  },
  
  dimensions: {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, min: 0 },
    area: { type: Number, required: true, min: 0 },
    volume: { type: Number, min: 0 }
  },
  
  location: {
    coordinates: {
      x: { type: Number, required: true, min: 0 },
      y: { type: Number, required: true, min: 0 },
      z: { type: Number, min: 0 }
    },
    orientation: { type: Number, required: true, min: 0, max: 360 },
    slope: { type: Number, min: 0, max: 90 }
  },
  
  infrastructure: {
    irrigation: {
      type: {
        type: String,
        required: true,
        enum: ['drip', 'sprinkler', 'flood', 'mist', 'none']
      },
      capacity: { type: Number, required: true, min: 0 },
      coverage: { type: Number, required: true, min: 0, max: 100 },
      automation: { type: Boolean, default: false }
    },
    lighting: {
      type: {
        type: String,
        required: true,
        enum: ['natural', 'led', 'fluorescent', 'hps', 'mixed']
      },
      intensity: { type: Number, required: true, min: 0 },
      duration: { type: Number, required: true, min: 0, max: 24 },
      automation: { type: Boolean, default: false }
    },
    climateControl: {
      heating: { type: Boolean, default: false },
      cooling: { type: Boolean, default: false },
      ventilation: { type: Boolean, default: false },
      humidityControl: { type: Boolean, default: false },
      automation: { type: Boolean, default: false }
    },
    power: {
      connected: { type: Boolean, default: false },
      capacity: { type: Number, default: 0, min: 0 },
      backup: { type: Boolean, default: false }
    },
    water: {
      source: {
        type: String,
        required: true,
        enum: ['municipal', 'well', 'rainwater', 'recycled', 'mixed']
      },
      quality: {
        type: String,
        required: true,
        enum: ['excellent', 'good', 'fair', 'poor']
      },
      ph: { type: Number, required: true, min: 0, max: 14 },
      tds: { type: Number, required: true, min: 0 }
    }
  },
  
  status: {
    type: String,
    required: true,
    enum: ['empty', 'assigned', 'planted', 'harvesting', 'alert'],
    default: 'empty'
  },
  
  plantAssignment: {
    maxPlantCapacity: { type: Number, required: true, min: 1 },
    assignedPlants: [{
      plantDataId: { type: String, required: true, ref: 'PlantData' },
      plantName: { type: String, required: true, trim: true },
      assignedCount: { type: Number, required: true, min: 1 },
      plantingDate: { type: Date },
      expectedHarvestStart: { type: Date },
      expectedHarvestEnd: { type: Date },
      actualHarvestStart: { type: Date },
      actualHarvestEnd: { type: Date },
      harvestNotes: { type: String, trim: true }
    }],
    totalAssigned: { type: Number, default: 0, min: 0 },
    remainingCapacity: { type: Number, default: 0, min: 0 }
  },
  
  stateHistory: [{
    fromState: { type: String, required: true },
    toState: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
    triggeredBy: { type: String, trim: true }
  }],
  
  alertInfo: {
    alertType: {
      type: String,
      enum: ['disease', 'pest', 'weather', 'equipment', 'other']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    resolvedBy: { type: String, trim: true },
    resolutionNotes: { type: String, trim: true }
  },
  
  currentConditions: {
    temperature: { type: Number, min: -50, max: 50 },
    humidity: { type: Number, min: 0, max: 100 },
    lightLevel: { type: Number, min: 0 },
    soilMoisture: { type: Number, min: 0, max: 100 },
    soilPh: { type: Number, min: 0, max: 14 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  performance: {
    totalCycles: { type: Number, default: 0, min: 0 },
    averageYield: { type: Number, default: 0, min: 0 },
    averageCycleLength: { type: Number, default: 0, min: 0 },
    successRate: { type: Number, default: 0, min: 0, max: 100 },
    lastHarvestDate: { type: Date },
    lastHarvestYield: { type: Number, min: 0 }
  },
  
  maintenance: {
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    maintenanceType: {
      type: String,
      enum: ['routine', 'repair', 'upgrade', 'cleaning']
    },
    notes: { type: String, maxlength: 500 },
    cost: { type: Number, default: 0, min: 0 }
  },
  
  costs: {
    setupCost: { type: Number, default: 0, min: 0 },
    monthlyOperatingCost: { type: Number, default: 0, min: 0 },
    maintenanceCost: { type: Number, default: 0, min: 0 },
    utilityCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 }
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
  collection: 'blockdata'
});

// Indexes for performance
blockDataSchema.index({ farmId: 1, isActive: 1 });
blockDataSchema.index({ blockType: 1 });
blockDataSchema.index({ status: 1 });
blockDataSchema.index({ 'currentPlanting.plantDataId': 1 });
blockDataSchema.index({ 'currentPlanting.plantingDate': 1 });
blockDataSchema.index({ 'currentPlanting.expectedHarvestDate': 1 });
blockDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
blockDataSchema.pre('save', function(next) {
  // Calculate area
  this.dimensions.area = this.dimensions.length * this.dimensions.width;
  
  // Calculate volume if height is provided
  if (this.dimensions.height) {
    this.dimensions.volume = this.dimensions.area * this.dimensions.height;
  }
  
  // Calculate total cost
  this.costs.totalCost = this.costs.setupCost + 
                        this.costs.monthlyOperatingCost + 
                        this.costs.maintenanceCost + 
                        this.costs.utilityCost;
  
  // Validate plant assignment capacity
  if (this.plantAssignment.totalAssigned > this.plantAssignment.maxPlantCapacity) {
    return next(new Error('Total assigned plants cannot exceed maximum capacity'));
  }
  
  // Validate harvest dates for assigned plants
  this.plantAssignment.assignedPlants.forEach((plant: any) => {
    if (plant.plantingDate && plant.expectedHarvestStart) {
      if (new Date(plant.expectedHarvestStart) <= new Date(plant.plantingDate)) {
        return next(new Error('Expected harvest date must be after planting date'));
      }
    }
  });
  
  next();
});

// Instance methods
blockDataSchema.methods.calculateUtilization = function(): number {
  if (this.dimensions.area === 0) return 0;
  return this.currentPlanting ? (this.currentPlanting.plantCount / this.dimensions.area) * 100 : 0;
};

blockDataSchema.methods.getDaysToHarvest = function(): number {
  if (!this.currentPlanting || !this.currentPlanting.expectedHarvestDate) return 0;
  const now = new Date();
  const harvestDate = new Date(this.currentPlanting.expectedHarvestDate);
  const diffTime = harvestDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// State transition methods
blockDataSchema.methods.transitionToState = function(newState: string, triggeredBy?: string, notes?: string): void {
  const oldState = this.status;
  this.status = newState;
  
  // Add to state history
  this.stateHistory.push({
    fromState: oldState,
    toState: newState,
    timestamp: new Date(),
    notes: notes || '',
    triggeredBy: triggeredBy || 'system'
  });
  
  // Update plant assignment dates based on state
  if (newState === 'planted' && oldState === 'assigned') {
    this.plantAssignment.assignedPlants.forEach((plant: any) => {
      if (!plant.plantingDate) {
        plant.plantingDate = new Date();
        // Calculate expected harvest dates based on plant data
        // This would need to be implemented with actual plant data lookup
        const daysToHarvest = 90; // Placeholder - should come from plant data
        plant.expectedHarvestStart = new Date(Date.now() + daysToHarvest * 24 * 60 * 60 * 1000);
        plant.expectedHarvestEnd = new Date(Date.now() + (daysToHarvest + 14) * 24 * 60 * 60 * 1000);
      }
    });
  }
  
  if (newState === 'harvesting' && oldState === 'planted') {
    this.plantAssignment.assignedPlants.forEach((plant: any) => {
      if (!plant.actualHarvestStart) {
        plant.actualHarvestStart = new Date();
        // Calculate timing notes
        if (plant.expectedHarvestStart) {
          const daysDiff = Math.floor((new Date().getTime() - plant.expectedHarvestStart.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff > 0) {
            plant.harvestNotes = `Harvest started ${daysDiff} days late`;
          } else if (daysDiff < 0) {
            plant.harvestNotes = `Harvest started ${Math.abs(daysDiff)} days early`;
          } else {
            plant.harvestNotes = 'Harvest started on time';
          }
        }
      }
    });
  }
};

blockDataSchema.methods.assignPlant = function(plantDataId: string, plantName: string, count: number): boolean {
  if (this.plantAssignment.remainingCapacity < count) {
    return false; // Not enough capacity
  }
  
  // Check if plant is already assigned
  const existingPlant = this.plantAssignment.assignedPlants.find((p: any) => p.plantDataId === plantDataId);
  if (existingPlant) {
    existingPlant.assignedCount += count;
  } else {
    this.plantAssignment.assignedPlants.push({
      plantDataId,
      plantName,
      assignedCount: count
    });
  }
  
  // Update totals
  this.plantAssignment.totalAssigned += count;
  this.plantAssignment.remainingCapacity -= count;
  
  // Transition to assigned state if not already
  if (this.status === 'empty') {
    this.transitionToState('assigned', 'system', `Assigned ${count} ${plantName} plants`);
  }
  
  return true;
};

blockDataSchema.methods.removePlantAssignment = function(plantDataId: string, count: number): boolean {
  const plantIndex = this.plantAssignment.assignedPlants.findIndex((p: any) => p.plantDataId === plantDataId);
  if (plantIndex === -1) return false;
  
  const plant = this.plantAssignment.assignedPlants[plantIndex];
  if (plant.assignedCount < count) return false;
  
  plant.assignedCount -= count;
  this.plantAssignment.totalAssigned -= count;
  this.plantAssignment.remainingCapacity += count;
  
  // Remove plant if count reaches 0
  if (plant.assignedCount === 0) {
    this.plantAssignment.assignedPlants.splice(plantIndex, 1);
  }
  
  // Transition to empty if no plants assigned
  if (this.plantAssignment.totalAssigned === 0) {
    this.transitionToState('empty', 'system', 'All plant assignments removed');
  }
  
  return true;
};

blockDataSchema.methods.isReadyForHarvest = function(): boolean {
  return this.status === 'planted' && this.plantAssignment.assignedPlants.some((plant: any) => {
    return plant.expectedHarvestStart && new Date() >= plant.expectedHarvestStart;
  });
};

blockDataSchema.methods.calculateROI = function(): number {
  if (this.costs.totalCost === 0) return 0;
  const totalRevenue = this.performance.totalCycles * this.performance.averageYield * 10; // Assuming $10/kg
  return ((totalRevenue - this.costs.totalCost) / this.costs.totalCost) * 100;
};

blockDataSchema.methods.updateGrowthStage = function() {
  if (!this.currentPlanting) return;
  
  const now = new Date();
  const plantingDate = new Date(this.currentPlanting.plantingDate);
  const daysSincePlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // This would need to be calculated based on the plant's growth timeline
  // For now, we'll use a simple progression
  if (daysSincePlanting < 7) {
    this.currentPlanting.growthStage = 'germination';
  } else if (daysSincePlanting < 21) {
    this.currentPlanting.growthStage = 'seedling';
  } else if (daysSincePlanting < 60) {
    this.currentPlanting.growthStage = 'vegetative';
  } else if (daysSincePlanting < 90) {
    this.currentPlanting.growthStage = 'flowering';
  } else {
    this.currentPlanting.growthStage = 'fruiting';
  }
};

// Static methods
blockDataSchema.statics.findByFarm = function(farmId: string) {
  return this.find({ farmId, isActive: true });
};

blockDataSchema.statics.findByStatus = function(status: string) {
  return this.find({ status, isActive: true });
};

blockDataSchema.statics.findByBlockType = function(blockType: string) {
  return this.find({ blockType, isActive: true });
};

blockDataSchema.statics.findReadyForHarvest = function() {
  return this.find({ 
    status: 'growing',
    'currentPlanting.expectedHarvestDate': { $lte: new Date() },
    isActive: true 
  });
};

blockDataSchema.statics.findByPlantType = function(plantDataId: string) {
  return this.find({ 
    'currentPlanting.plantDataId': plantDataId,
    isActive: true 
  });
};

// Transform to JSON
blockDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const BlockData = mongoose.model<IBlockDataDocument>('BlockData', blockDataSchema);
