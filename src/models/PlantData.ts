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
  
  // Growing Requirements
  growingRequirements: {
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
      daily: number; // Liters per plant per day
      frequency: 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly';
    };
  };
  
  // Growth Timeline
  growthTimeline: {
    germinationDays: number;
    seedlingDays: number;
    vegetativeDays: number;
    floweringDays: number;
    fruitingDays: number;
    totalDays: number;
  };
  
  // Yield Information
  yieldInfo: {
    expectedYieldPerPlant: number; // kg or units
    yieldUnit: 'kg' | 'units' | 'bunches' | 'heads';
    harvestWindow: number; // Days
    shelfLife: number; // Days
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
  
  growingRequirements: {
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
      daily: { type: Number, required: true, min: 0 },
      frequency: {
        type: String,
        required: true,
        enum: ['daily', 'every_other_day', 'twice_weekly', 'weekly']
      }
    }
  },
  
  growthTimeline: {
    germinationDays: { type: Number, required: true, min: 0 },
    seedlingDays: { type: Number, required: true, min: 0 },
    vegetativeDays: { type: Number, required: true, min: 0 },
    floweringDays: { type: Number, required: true, min: 0 },
    fruitingDays: { type: Number, required: true, min: 0 },
    totalDays: { type: Number, required: true, min: 0 }
  },
  
  yieldInfo: {
    expectedYieldPerPlant: { type: Number, required: true, min: 0 },
    yieldUnit: {
      type: String,
      required: true,
      enum: ['kg', 'units', 'bunches', 'heads']
    },
    harvestWindow: { type: Number, required: true, min: 0 },
    shelfLife: { type: Number, required: true, min: 0 }
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
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const PlantData = mongoose.model<IPlantDataDocument>('PlantData', plantDataSchema);
