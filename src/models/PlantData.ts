import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Plant Data Interface
 * Base unit for all plant-related calculations and operations
 */
export interface IPlantData {
  _id?: string;
  name: string;
  scientificName: string;
  variety: string;
  category: 'vegetable' | 'fruit' | 'herb' | 'flower' | 'grain' | 'legume' | 'other';
  
  // Basic Plant Information
  family: string;
  growthCharacteristics: {
    height: number; // cm
    spread: number; // cm
    rootDepth: number; // cm
    lifecycle: 'annual' | 'perennial' | 'biennial';
  };
  
  // Advanced Growing Requirements
  growingRequirements: {
    soilType: string;
    temperature: {
      min: number; // Celsius
      max: number; // Celsius
      optimal: number; // Celsius
    };
    humidity: {
      min: number; // Percentage
      max: number; // Percentage
      optimal: number; // Percentage
    };
    lightRequirements: 'full_sun' | 'partial_shade' | 'shade';
    lightHours: {
      min: number; // Hours per day
      max: number; // Hours per day
      optimal: number; // Hours per day
    };
    soilPh: {
      min: number;
      max: number;
      optimal: number;
    };
    waterRequirements: {
      level: 'low' | 'moderate' | 'high';
      daily: number; // Liters per plant per day
      frequency: 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly';
    };
  };
  
  // Detailed Fertilizer Schedule
  fertilizerSchedule: Array<{
    day: number; // Days after planting
    fertilizerType: string; // NPK ratios, micronutrients
    applicationRate: number; // ml or g per plant
    frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
    applicationMethod: 'foliar_spray' | 'soil_drench' | 'injection' | 'broadcast';
    notes?: string;
  }>;
  
  // Detailed Pesticide/Chemical Schedule
  pesticideSchedule: Array<{
    day: number; // Days after planting
    chemicalType: string; // Pesticide, fungicide, herbicide
    applicationRate: number; // ml or g per plant
    frequency: 'preventive' | 'curative' | 'as_needed';
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
    applicationMethod: 'foliar_spray' | 'dust' | 'injection' | 'soil_drench';
    safetyRequirements: string; // PPE needed
    reEntryInterval: number; // Hours
    harvestRestriction: number; // Days before harvest
    notes?: string;
  }>;
  
  // Enhanced Growth Timeline
  growthTimeline: {
    germinationTime: number; // Days
    daysToMaturity: number; // Days
    harvestWindow: number; // Days
    seasonalPlanting: string[]; // Months
    germinationDays: number;
    seedlingDays: number;
    vegetativeDays: number;
    floweringDays: number;
    fruitingDays: number;
    totalDays: number;
  };
  
  // Enhanced Yield Information
  yieldInfo: {
    expectedYieldPerPlant: number; // kg or units
    yieldPerSquareMeter: number; // kg per m²
    yieldUnit: 'kg' | 'units' | 'bunches' | 'heads';
    harvestWindow: number; // Days
    shelfLife: number; // Days
    qualityMetrics: {
      size: string; // Size description
      color: string; // Expected color
      texture: string; // Expected texture
      brix: number; // Sugar content for fruits
    };
  };
  
  // Resource Requirements
  resourceRequirements: {
    seedsPerUnit: number; // Seeds per planting unit
    fertilizerType: string[];
    fertilizerAmount: number; // kg per plant
    pesticideType: string[];
    pesticideAmount: number; // ml per plant
    spaceRequirement: {
      width: number; // cm
      length: number; // cm
      height: number; // cm (for vertical growing)
    };
  };
  
  // Market Information
  marketInfo: {
    basePrice: number; // Base price per unit
    priceUnit: 'kg' | 'units' | 'bunches' | 'heads';
    seasonality: {
      peakSeason: string[]; // Months
      offSeason: string[]; // Months
    };
    demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  };
  
  // Quality Standards
  qualityStandards: {
    size: {
      min: number;
      max: number;
      unit: 'cm' | 'mm' | 'g';
    };
    color: string[];
    texture: string[];
    defects: string[]; // Common defects to watch for
  };
  
  // Environmental Impact
  environmentalImpact: {
    waterFootprint: number; // Liters per kg
    carbonFootprint: number; // CO2 kg per kg
    sustainabilityScore: number; // 1-10 scale
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plant Data Document Interface
 */
export interface IPlantDataDocument extends Omit<IPlantData, '_id'>, Document {}

/**
 * Plant Data Schema
 */
const plantDataSchema = new Schema<IPlantDataDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  scientificName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  variety: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetable', 'fruit', 'herb', 'flower', 'grain', 'legume', 'other']
  },
  family: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  growthCharacteristics: {
    height: { type: Number, required: true, min: 0 },
    spread: { type: Number, required: true, min: 0 },
    rootDepth: { type: Number, required: true, min: 0 },
    lifecycle: {
      type: String,
      required: true,
      enum: ['annual', 'perennial', 'biennial']
    }
  },
  
  growingRequirements: {
    soilType: { type: String, required: true, trim: true },
    temperature: {
      min: { type: Number, required: true, min: -50, max: 50 },
      max: { type: Number, required: true, min: -50, max: 50 },
      optimal: { type: Number, required: true, min: -50, max: 50 }
    },
    humidity: {
      min: { type: Number, required: true, min: 0, max: 100 },
      max: { type: Number, required: true, min: 0, max: 100 },
      optimal: { type: Number, required: true, min: 0, max: 100 }
    },
    lightRequirements: {
      type: String,
      required: true,
      enum: ['full_sun', 'partial_shade', 'shade']
    },
    lightHours: {
      min: { type: Number, required: true, min: 0, max: 24 },
      max: { type: Number, required: true, min: 0, max: 24 },
      optimal: { type: Number, required: true, min: 0, max: 24 }
    },
    soilPh: {
      min: { type: Number, required: true, min: 0, max: 14 },
      max: { type: Number, required: true, min: 0, max: 14 },
      optimal: { type: Number, required: true, min: 0, max: 14 }
    },
    waterRequirements: {
      level: {
        type: String,
        required: true,
        enum: ['low', 'moderate', 'high']
      },
      daily: { type: Number, required: true, min: 0 },
      frequency: {
        type: String,
        required: true,
        enum: ['daily', 'every_other_day', 'twice_weekly', 'weekly']
      }
    }
  },
  
  // Fertilizer Schedule Schema
  fertilizerSchedule: [{
    day: { type: Number, required: true, min: 0 },
    fertilizerType: { type: String, required: true, trim: true },
    applicationRate: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'bi_weekly', 'monthly']
    },
    growthStage: {
      type: String,
      required: true,
      enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest']
    },
    applicationMethod: {
      type: String,
      required: true,
      enum: ['foliar_spray', 'soil_drench', 'injection', 'broadcast']
    },
    notes: { type: String, trim: true }
  }],
  
  // Pesticide Schedule Schema
  pesticideSchedule: [{
    day: { type: Number, required: true, min: 0 },
    chemicalType: { type: String, required: true, trim: true },
    applicationRate: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      required: true,
      enum: ['preventive', 'curative', 'as_needed']
    },
    growthStage: {
      type: String,
      required: true,
      enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest']
    },
    applicationMethod: {
      type: String,
      required: true,
      enum: ['foliar_spray', 'dust', 'injection', 'soil_drench']
    },
    safetyRequirements: { type: String, required: true, trim: true },
    reEntryInterval: { type: Number, required: true, min: 0 },
    harvestRestriction: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true }
  }],
  
  growthTimeline: {
    germinationTime: { type: Number, required: true, min: 0 },
    daysToMaturity: { type: Number, required: true, min: 0 },
    harvestWindow: { type: Number, required: true, min: 0 },
    seasonalPlanting: [{ type: String, enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }],
    germinationDays: { type: Number, required: true, min: 0 },
    seedlingDays: { type: Number, required: true, min: 0 },
    vegetativeDays: { type: Number, required: true, min: 0 },
    floweringDays: { type: Number, required: true, min: 0 },
    fruitingDays: { type: Number, required: true, min: 0 },
    totalDays: { type: Number, required: true, min: 0 }
  },
  
  yieldInfo: {
    expectedYieldPerPlant: { type: Number, required: true, min: 0 },
    yieldPerSquareMeter: { type: Number, required: true, min: 0 },
    yieldUnit: {
      type: String,
      required: true,
      enum: ['kg', 'units', 'bunches', 'heads']
    },
    harvestWindow: { type: Number, required: true, min: 0 },
    shelfLife: { type: Number, required: true, min: 0 },
    qualityMetrics: {
      size: { type: String, required: true, trim: true },
      color: { type: String, required: true, trim: true },
      texture: { type: String, required: true, trim: true },
      brix: { type: Number, required: true, min: 0, max: 30 }
    }
  },
  
  resourceRequirements: {
    seedsPerUnit: { type: Number, required: true, min: 0 },
    fertilizerType: [{ type: String, trim: true }],
    fertilizerAmount: { type: Number, required: true, min: 0 },
    pesticideType: [{ type: String, trim: true }],
    pesticideAmount: { type: Number, required: true, min: 0 },
    spaceRequirement: {
      width: { type: Number, required: true, min: 0 },
      length: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 }
    }
  },
  
  marketInfo: {
    basePrice: { type: Number, required: true, min: 0 },
    priceUnit: {
      type: String,
      required: true,
      enum: ['kg', 'units', 'bunches', 'heads']
    },
    seasonality: {
      peakSeason: [{ type: String, enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }],
      offSeason: [{ type: String, enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }]
    },
    demandLevel: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'very_high']
    }
  },
  
  qualityStandards: {
    size: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      unit: {
        type: String,
        required: true,
        enum: ['cm', 'mm', 'g']
      }
    },
    color: [{ type: String, trim: true }],
    texture: [{ type: String, trim: true }],
    defects: [{ type: String, trim: true }]
  },
  
  environmentalImpact: {
    waterFootprint: { type: Number, required: true, min: 0 },
    carbonFootprint: { type: Number, required: true, min: 0 },
    sustainabilityScore: { type: Number, required: true, min: 1, max: 10 }
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
  collection: 'plantdata'
});

// Indexes for performance
plantDataSchema.index({ name: 1, variety: 1 }, { unique: true });
plantDataSchema.index({ category: 1 });
plantDataSchema.index({ isActive: 1 });
plantDataSchema.index({ 'marketInfo.demandLevel': 1 });
plantDataSchema.index({ createdAt: -1 });

// Pre-save middleware for data validation
plantDataSchema.pre('save', function(next) {
  // Validate temperature ranges
  if (this.growingRequirements.temperature.min >= this.growingRequirements.temperature.max) {
    return next(new Error('Minimum temperature must be less than maximum temperature'));
  }
  
  if (this.growingRequirements.temperature.optimal < this.growingRequirements.temperature.min ||
      this.growingRequirements.temperature.optimal > this.growingRequirements.temperature.max) {
    return next(new Error('Optimal temperature must be within min-max range'));
  }
  
  // Validate humidity ranges
  if (this.growingRequirements.humidity.min >= this.growingRequirements.humidity.max) {
    return next(new Error('Minimum humidity must be less than maximum humidity'));
  }
  
  // Validate total days calculation
  const calculatedTotal = this.growthTimeline.germinationDays + 
                         this.growthTimeline.seedlingDays + 
                         this.growthTimeline.vegetativeDays + 
                         this.growthTimeline.floweringDays + 
                         this.growthTimeline.fruitingDays;
  
  if (Math.abs(calculatedTotal - this.growthTimeline.totalDays) > 1) {
    return next(new Error('Total days must match sum of all growth phases'));
  }
  
  next();
});

// Instance methods
plantDataSchema.methods.calculateSpacePerPlant = function(): number {
  return this.resourceRequirements.spaceRequirement.width * 
         this.resourceRequirements.spaceRequirement.length;
};

plantDataSchema.methods.getOptimalGrowingConditions = function() {
  return {
    temperature: this.growingRequirements.temperature.optimal,
    humidity: this.growingRequirements.humidity.optimal,
    lightHours: this.growingRequirements.lightHours.optimal,
    soilPh: this.growingRequirements.soilPh.optimal
  };
};

plantDataSchema.methods.isInPeakSeason = function(month: string): boolean {
  return this.marketInfo.seasonality.peakSeason.includes(month);
};

plantDataSchema.methods.calculateExpectedYield = function(plantCount: number): number {
  return plantCount * this.yieldInfo.expectedYieldPerPlant;
};

// Static methods
plantDataSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true });
};

plantDataSchema.statics.findHighDemandPlants = function() {
  return this.find({ 
    'marketInfo.demandLevel': { $in: ['high', 'very_high'] },
    isActive: true 
  });
};

plantDataSchema.statics.findByGrowingConditions = function(temperature: number, humidity: number) {
  return this.find({
    'growingRequirements.temperature.min': { $lte: temperature },
    'growingRequirements.temperature.max': { $gte: temperature },
    'growingRequirements.humidity.min': { $lte: humidity },
    'growingRequirements.humidity.max': { $gte: humidity },
    isActive: true
  });
};

// Transform to JSON
plantDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Keep _id as _id for frontend compatibility
    delete (ret as any).__v;
    return ret;
  }
});

export const PlantData = mongoose.model<IPlantDataDocument>('PlantData', plantDataSchema);
