import mongoose, { Document, Schema } from 'mongoose';

// Interface for task templates managed by managers
export interface ITaskTemplate {
  templateId: string;
  farmId: string;
  managerId: string;
  
  // Basic Task Information
  taskInfo: {
    name: string;
    description: string;
    category: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'maintenance' | 'inspection' | 'pest_control' | 'custom';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDuration: number; // minutes
    skillLevel: 'basic' | 'intermediate' | 'advanced' | 'specialist';
  };

  // Task Triggers and Scheduling
  triggers: {
    // Plant-based triggers (from PlantData)
    plantGrowthStage?: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest' | 'post_harvest';
    daysAfterPlanting?: number;
    daysBeforeHarvest?: number;
    
    // Time-based triggers
    frequency?: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
    customSchedule?: {
      interval: number; // days
      startCondition: string;
    };
    
    // Condition-based triggers
    weatherConditions?: string[];
    sensorThresholds?: {
      sensorType: string;
      condition: 'above' | 'below' | 'equals';
      value: number;
    }[];
    
    // Manual triggers
    manualTriggerOnly?: boolean;
  };

  // Task Dependencies
  dependencies: {
    prerequisiteTasks?: string[]; // Task template IDs that must be completed first
    waitingPeriod?: {
      afterTask: string; // Task template ID
      waitHours: number; // Hours to wait after the prerequisite task
      reason: string; // Explanation for the waiting period
    }[];
    
    conflictingTasks?: string[]; // Tasks that cannot run simultaneously
    seasonalRestrictions?: {
      allowedMonths: number[]; // Months (1-12) when task is allowed
      restrictedMonths: number[]; // Months when task is not allowed
      reason: string;
    };
  };

  // Resource Requirements
  resources: {
    materials?: {
      [materialType: string]: {
        quantityFormula: string; // Formula to calculate quantity (e.g., "plantCount * 0.5")
        unit: string;
        qualityRequirements?: string;
      };
    };
    
    equipment?: {
      [equipmentType: string]: {
        required: boolean;
        alternatives?: string[];
        setupTime?: number; // minutes
      };
    };
    
    labor?: {
      workersNeeded: number;
      skillRequirements: string[];
      supervisionRequired?: boolean;
    };
  };

  // Step-by-Step Instructions
  instructions: {
    preparation?: {
      steps: string[];
      checklistItems: string[];
      safetyRequirements: string[];
    };
    
    execution: {
      steps: string[];
      qualityChecks: string[];
      measurements?: {
        parameter: string;
        expectedRange: string;
        recordingRequired: boolean;
      }[];
    };
    
    completion?: {
      steps: string[];
      documentation: string[];
      nextSteps?: string[];
    };
  };

  // Quality and Performance Standards
  standards: {
    qualityMetrics: {
      [metricName: string]: {
        targetValue: number;
        acceptableRange: string;
        measurementMethod: string;
      };
    };
    
    performanceTargets: {
      timeStandard: number; // minutes - target completion time
      tolerancePercentage: number; // acceptable deviation from time standard
      qualityThreshold: number; // minimum quality score (0-100)
    };
    
    safetyRequirements: {
      ppe: string[]; // Personal protective equipment required
      procedures: string[]; // Safety procedures to follow
      emergencyContacts: string[];
    };
  };

  // Cost Calculation
  costCalculation: {
    laborCostFormula: string; // Formula to calculate labor cost
    materialCostFormula: string; // Formula to calculate material cost
    equipmentCostFormula?: string; // Formula for equipment usage cost
    overheadPercentage?: number; // Overhead allocation percentage
  };

  // Task Customization
  customization: {
    blockTypeSpecific?: {
      [blockType: string]: {
        adjustedDuration?: number;
        specialInstructions?: string[];
        additionalEquipment?: string[];
      };
    };
    
    plantSpecific?: {
      [plantCategory: string]: {
        adjustedQuantities?: { [material: string]: string }; // Adjusted quantity formulas
        specialHandling?: string[];
        additionalSteps?: string[];
      };
    };
    
    seasonalAdjustments?: {
      [season: string]: {
        durationMultiplier?: number;
        additionalRequirements?: string[];
        restrictedProcedures?: string[];
      };
    };
  };

  // Tracking and Analytics
  tracking: {
    recordRequirements: {
      timeTracking: boolean;
      materialUsage: boolean;
      qualityMetrics: boolean;
      workerFeedback: boolean;
      photoDocumentation: boolean;
    };
    
    kpiMetrics: string[]; // Key performance indicators to track
    reportingSchedule: 'real_time' | 'daily' | 'weekly' | 'monthly';
  };

  // Template Management
  management: {
    version: string;
    status: 'draft' | 'active' | 'deprecated' | 'archived';
    approvalRequired: boolean;
    approvedBy?: string;
    approvalDate?: Date;
    
    changeLog: {
      version: string;
      changes: string[];
      changedBy: string;
      changeDate: Date;
      reason: string;
    }[];
  };

  // Usage Statistics
  usage: {
    timesUsed: number;
    averageCompletionTime: number;
    successRate: number; // Percentage of successful completions
    lastUsed?: Date;
    
    feedback: {
      averageRating: number; // 1-5 scale
      commonIssues: string[];
      improvementSuggestions: string[];
    };
  };

  // Metadata
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ITaskTemplateDocument extends Omit<ITaskTemplate, '_id'>, Document {}

const taskTemplateSchema = new Schema<ITaskTemplateDocument>({
  templateId: { type: String, required: true, unique: true, index: true },
  farmId: { type: String, required: true, index: true },
  managerId: { type: String, required: true, index: true },

  taskInfo: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['planting', 'watering', 'fertilizing', 'harvesting', 'maintenance', 'inspection', 'pest_control', 'custom']
    },
    priority: { 
      type: String, 
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    estimatedDuration: { type: Number, required: true, min: 1 },
    skillLevel: { 
      type: String, 
      required: true,
      enum: ['basic', 'intermediate', 'advanced', 'specialist'],
      default: 'basic'
    }
  },

  triggers: {
    plantGrowthStage: { 
      type: String,
      enum: ['germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 'harvest', 'post_harvest']
    },
    daysAfterPlanting: { type: Number, min: 0 },
    daysBeforeHarvest: { type: Number, min: 0 },
    frequency: { 
      type: String,
      enum: ['once', 'daily', 'weekly', 'biweekly', 'monthly', 'custom']
    },
    customSchedule: {
      interval: { type: Number, min: 1 },
      startCondition: { type: String }
    },
    weatherConditions: [{ type: String }],
    sensorThresholds: [{
      sensorType: { type: String, required: true },
      condition: { type: String, enum: ['above', 'below', 'equals'], required: true },
      value: { type: Number, required: true }
    }],
    manualTriggerOnly: { type: Boolean, default: false }
  },

  dependencies: {
    prerequisiteTasks: [{ type: String }],
    waitingPeriod: [{
      afterTask: { type: String, required: true },
      waitHours: { type: Number, required: true, min: 0 },
      reason: { type: String, required: true }
    }],
    conflictingTasks: [{ type: String }],
    seasonalRestrictions: {
      allowedMonths: [{ type: Number, min: 1, max: 12 }],
      restrictedMonths: [{ type: Number, min: 1, max: 12 }],
      reason: { type: String }
    }
  },

  resources: {
    materials: {
      type: Map,
      of: {
        quantityFormula: { type: String, required: true },
        unit: { type: String, required: true },
        qualityRequirements: { type: String }
      },
      default: new Map()
    },
    equipment: {
      type: Map,
      of: {
        required: { type: Boolean, required: true },
        alternatives: [{ type: String }],
        setupTime: { type: Number, min: 0 }
      },
      default: new Map()
    },
    labor: {
      workersNeeded: { type: Number, required: true, min: 1, default: 1 },
      skillRequirements: [{ type: String }],
      supervisionRequired: { type: Boolean, default: false }
    }
  },

  instructions: {
    preparation: {
      steps: [{ type: String }],
      checklistItems: [{ type: String }],
      safetyRequirements: [{ type: String }]
    },
    execution: {
      steps: [{ type: String, required: true }],
      qualityChecks: [{ type: String }],
      measurements: [{
        parameter: { type: String, required: true },
        expectedRange: { type: String, required: true },
        recordingRequired: { type: Boolean, default: false }
      }]
    },
    completion: {
      steps: [{ type: String }],
      documentation: [{ type: String }],
      nextSteps: [{ type: String }]
    }
  },

  standards: {
    qualityMetrics: {
      type: Map,
      of: {
        targetValue: { type: Number, required: true },
        acceptableRange: { type: String, required: true },
        measurementMethod: { type: String, required: true }
      },
      default: new Map()
    },
    performanceTargets: {
      timeStandard: { type: Number, required: true, min: 1 },
      tolerancePercentage: { type: Number, default: 20, min: 0, max: 100 },
      qualityThreshold: { type: Number, default: 80, min: 0, max: 100 }
    },
    safetyRequirements: {
      ppe: [{ type: String }],
      procedures: [{ type: String }],
      emergencyContacts: [{ type: String }]
    }
  },

  costCalculation: {
    laborCostFormula: { type: String, required: true },
    materialCostFormula: { type: String, required: true },
    equipmentCostFormula: { type: String },
    overheadPercentage: { type: Number, default: 0, min: 0, max: 100 }
  },

  customization: {
    blockTypeSpecific: {
      type: Map,
      of: {
        adjustedDuration: { type: Number, min: 1 },
        specialInstructions: [{ type: String }],
        additionalEquipment: [{ type: String }]
      },
      default: new Map()
    },
    plantSpecific: {
      type: Map,
      of: {
        adjustedQuantities: {
          type: Map,
          of: String,
          default: new Map()
        },
        specialHandling: [{ type: String }],
        additionalSteps: [{ type: String }]
      },
      default: new Map()
    },
    seasonalAdjustments: {
      type: Map,
      of: {
        durationMultiplier: { type: Number, min: 0.1 },
        additionalRequirements: [{ type: String }],
        restrictedProcedures: [{ type: String }]
      },
      default: new Map()
    }
  },

  tracking: {
    recordRequirements: {
      timeTracking: { type: Boolean, default: true },
      materialUsage: { type: Boolean, default: true },
      qualityMetrics: { type: Boolean, default: false },
      workerFeedback: { type: Boolean, default: false },
      photoDocumentation: { type: Boolean, default: false }
    },
    kpiMetrics: [{ type: String }],
    reportingSchedule: { 
      type: String, 
      enum: ['real_time', 'daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },

  management: {
    version: { type: String, required: true, default: '1.0' },
    status: { 
      type: String, 
      required: true,
      enum: ['draft', 'active', 'deprecated', 'archived'],
      default: 'draft'
    },
    approvalRequired: { type: Boolean, default: true },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    changeLog: [{
      version: { type: String, required: true },
      changes: [{ type: String, required: true }],
      changedBy: { type: String, required: true },
      changeDate: { type: Date, required: true, default: Date.now },
      reason: { type: String, required: true }
    }]
  },

  usage: {
    timesUsed: { type: Number, default: 0, min: 0 },
    averageCompletionTime: { type: Number, default: 0, min: 0 },
    successRate: { type: Number, default: 100, min: 0, max: 100 },
    lastUsed: { type: Date },
    feedback: {
      averageRating: { type: Number, default: 5, min: 1, max: 5 },
      commonIssues: [{ type: String }],
      improvementSuggestions: [{ type: String }]
    }
  },

  notes: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Indexes for performance
taskTemplateSchema.index({ farmId: 1, 'taskInfo.category': 1 });
taskTemplateSchema.index({ managerId: 1, createdAt: -1 });
taskTemplateSchema.index({ 'management.status': 1, isActive: 1 });
taskTemplateSchema.index({ 'triggers.plantGrowthStage': 1 });
taskTemplateSchema.index({ 'taskInfo.skillLevel': 1 });

// Pre-save middleware
taskTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate template ID if not provided
  if (!this.templateId) {
    this.templateId = `TMPL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  
  next();
});

// Instance methods
taskTemplateSchema.methods.calculateCost = function(plantCount: number, costsData: any): number {
  let totalCost = 0;
  
  try {
    // Evaluate formulas with context
    const context = { plantCount, costsData };
    
    // Calculate labor cost
    if (this.costCalculation.laborCostFormula) {
      totalCost += this.evaluateFormula(this.costCalculation.laborCostFormula, context);
    }
    
    // Calculate material cost
    if (this.costCalculation.materialCostFormula) {
      totalCost += this.evaluateFormula(this.costCalculation.materialCostFormula, context);
    }
    
    // Calculate equipment cost
    if (this.costCalculation.equipmentCostFormula) {
      totalCost += this.evaluateFormula(this.costCalculation.equipmentCostFormula, context);
    }
    
    // Apply overhead
    if (this.costCalculation.overheadPercentage) {
      totalCost *= (1 + this.costCalculation.overheadPercentage / 100);
    }
    
  } catch (error) {
    console.error('Error calculating task cost:', error);
    return 0;
  }
  
  return totalCost;
};

taskTemplateSchema.methods.evaluateFormula = function(formula: string, context: any): number {
  // Simple formula evaluator (in production, use a proper expression evaluator)
  try {
    // Replace variables with values
    let expression = formula;
    for (const [key, value] of Object.entries(context)) {
      expression = expression.replace(new RegExp(key, 'g'), (value as any).toString());
    }
    
    // Basic safety check - only allow numbers, operators, and dots
    if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
      throw new Error('Invalid formula characters');
    }
    
    return eval(expression);
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return 0;
  }
};

taskTemplateSchema.methods.canExecute = function(conditions: any): boolean {
  // Check if task can be executed given current conditions
  const { plantGrowthStage, daysAfterPlanting, daysBeforeHarvest, currentMonth, sensorData } = conditions;
  
  // Check plant growth stage
  if (this.triggers.plantGrowthStage && this.triggers.plantGrowthStage !== plantGrowthStage) {
    return false;
  }
  
  // Check days after planting
  if (this.triggers.daysAfterPlanting !== undefined && daysAfterPlanting < this.triggers.daysAfterPlanting) {
    return false;
  }
  
  // Check days before harvest
  if (this.triggers.daysBeforeHarvest !== undefined && daysBeforeHarvest < this.triggers.daysBeforeHarvest) {
    return false;
  }
  
  // Check seasonal restrictions
  if (this.dependencies.seasonalRestrictions) {
    const restrictions = this.dependencies.seasonalRestrictions;
    if (restrictions.restrictedMonths && restrictions.restrictedMonths.includes(currentMonth)) {
      return false;
    }
    if (restrictions.allowedMonths && !restrictions.allowedMonths.includes(currentMonth)) {
      return false;
    }
  }
  
  // Check sensor thresholds
  if (this.triggers.sensorThresholds && sensorData) {
    for (const threshold of this.triggers.sensorThresholds) {
      const sensorValue = sensorData[threshold.sensorType];
      if (sensorValue === undefined) continue;
      
      switch (threshold.condition) {
        case 'above':
          if (sensorValue <= threshold.value) return false;
          break;
        case 'below':
          if (sensorValue >= threshold.value) return false;
          break;
        case 'equals':
          if (sensorValue !== threshold.value) return false;
          break;
      }
    }
  }
  
  return true;
};

taskTemplateSchema.methods.updateUsageStats = function(completionTime: number, success: boolean, rating?: number) {
  this.usage.timesUsed += 1;
  
  // Update average completion time
  const totalTime = this.usage.averageCompletionTime * (this.usage.timesUsed - 1) + completionTime;
  this.usage.averageCompletionTime = totalTime / this.usage.timesUsed;
  
  // Update success rate
  const successCount = Math.round(this.usage.successRate * (this.usage.timesUsed - 1) / 100);
  const newSuccessCount = successCount + (success ? 1 : 0);
  this.usage.successRate = (newSuccessCount / this.usage.timesUsed) * 100;
  
  // Update rating
  if (rating) {
    const totalRating = this.usage.feedback.averageRating * (this.usage.timesUsed - 1) + rating;
    this.usage.feedback.averageRating = totalRating / this.usage.timesUsed;
  }
  
  this.usage.lastUsed = new Date();
};

// Transform function for JSON output
taskTemplateSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete (ret as any).__v;
    return ret;
  }
});

export const TaskTemplate = mongoose.model<ITaskTemplateDocument>('TaskTemplate', taskTemplateSchema);
