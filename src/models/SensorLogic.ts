import mongoose, { Document, Schema } from 'mongoose';

// Interface for sensor automation logic configuration
export interface ISensorLogic {
  logicId: string;
  farmId: string;
  blockId?: string; // Optional - can be farm-wide or block-specific
  managerId: string;
  
  // Logic Configuration
  logicInfo: {
    name: string;
    description: string;
    category: 'irrigation' | 'climate_control' | 'emergency' | 'nutrient_management' | 'lighting' | 'ventilation' | 'custom';
    priority: number; // Higher number = higher priority (1-100)
    enabled: boolean;
  };

  // Trigger Conditions (IF part)
  conditions: {
    // Sensor-based conditions
    sensorConditions?: {
      [sensorType: string]: {
        operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'between' | 'outside_range';
        value?: number;
        range?: { min: number; max: number };
        unit: string;
        duration?: number; // Minutes condition must be true before triggering
      };
    };

    // Time-based conditions
    timeConditions?: {
      timeRange?: { start: string; end: string }; // HH:MM format
      daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
      daysOfMonth?: number[]; // 1-31
      months?: number[]; // 1-12
      excludeHolidays?: boolean;
    };

    // Plant/Block conditions
    plantConditions?: {
      growthStages?: string[]; // Growth stages this applies to
      daysAfterPlanting?: { min?: number; max?: number };
      daysBeforeHarvest?: { min?: number; max?: number };
      plantTypes?: string[]; // Specific plant types
    };

    // Weather conditions
    weatherConditions?: {
      temperature?: { min?: number; max?: number };
      humidity?: { min?: number; max?: number };
      rainfall?: { min?: number; max?: number };
      windSpeed?: { min?: number; max?: number };
      forecast?: string[]; // Weather forecast conditions
    };

    // Compound conditions
    logicalOperator?: 'AND' | 'OR' | 'NOT'; // How to combine multiple conditions
    parentLogic?: string[]; // Reference to other logic IDs for complex conditions
  };

  // Actions (THEN part)
  actions: {
    // Direct control actions
    controlActions?: {
      [deviceType: string]: {
        action: 'turn_on' | 'turn_off' | 'set_value' | 'adjust_by' | 'cycle' | 'pulse';
        value?: number;
        duration?: number; // Minutes for timed actions
        gradual?: {
          enabled: boolean;
          stepSize: number;
          intervalSeconds: number;
        };
      };
    };

    // Notification actions
    notifications?: {
      alertLevel: 'info' | 'warning' | 'critical' | 'emergency';
      message: string;
      recipients: string[]; // User IDs to notify
      channels: ('app' | 'email' | 'sms' | 'dashboard' | 'webhook')[];
      escalation?: {
        delayMinutes: number;
        nextLevel: string; // Next escalation logic ID
      };
    };

    // Task generation actions
    taskActions?: {
      generateTask: boolean;
      taskTemplateId?: string;
      assignToUsers?: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
      dueWithinMinutes?: number;
      notes?: string;
    };

    // Data logging actions
    dataActions?: {
      logEvent: boolean;
      eventType: string;
      additionalData?: { [key: string]: any };
      storeInAnalytics: boolean;
    };

    // Integration actions
    integrationActions?: {
      webhookUrl?: string;
      apiCall?: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        url: string;
        headers?: { [key: string]: string };
        body?: any;
      };
      externalSystem?: {
        systemType: string;
        actionType: string;
        parameters: { [key: string]: any };
      };
    };
  };

  // Advanced Configuration
  advanced: {
    // Cooldown and rate limiting
    cooldown?: {
      minimumIntervalMinutes: number; // Minimum time between executions
      maxExecutionsPerHour?: number;
      resetDaily?: boolean;
    };

    // Hysteresis (prevent oscillation)
    hysteresis?: {
      [sensorType: string]: {
        onThreshold: number;
        offThreshold: number;
        enabled: boolean;
      };
    };

    // Safety limits
    safetyLimits?: {
      maxRuntimeMinutes?: number; // Maximum continuous runtime
      emergencyStopConditions?: {
        sensorType: string;
        operator: string;
        value: number;
      }[];
      manualOverrideRequired?: boolean;
    };

    // Machine learning integration
    aiEnhancement?: {
      enabled: boolean;
      modelType?: 'predictive' | 'optimization' | 'anomaly_detection';
      learningRate?: number;
      adaptThresholds?: boolean;
      useHistoricalData?: boolean;
    };
  };

  // Validation and Testing
  validation: {
    testMode: boolean; // Run in simulation mode
    validationResults?: {
      lastTested: Date;
      testsPassed: number;
      testsFailed: number;
      issues: string[];
    };
    
    dependencies?: {
      requiredSensors: string[];
      requiredDevices: string[];
      conflictingLogic?: string[]; // Logic IDs that conflict with this one
    };
  };

  // Performance and Analytics
  performance: {
    executionCount: number;
    lastExecuted?: Date;
    averageExecutionTime: number; // milliseconds
    successRate: number; // percentage
    
    analytics: {
      triggersPerDay: number[];
      effectivenessScore?: number; // 0-100 based on outcomes
      resourceSavings?: {
        waterSaved: number;
        energySaved: number;
        costSaved: number;
      };
      issues: {
        failureCount: number;
        lastFailure?: Date;
        commonErrors: string[];
      };
    };
  };

  // Version Control and Approval
  management: {
    version: string;
    status: 'draft' | 'testing' | 'active' | 'paused' | 'deprecated';
    approvalRequired: boolean;
    approvedBy?: string;
    approvalDate?: Date;
    
    changeHistory: {
      version: string;
      changes: string[];
      changedBy: string;
      changeDate: Date;
      reason: string;
      impactAssessment?: string;
    }[];
  };

  // Metadata
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ISensorLogicDocument extends Omit<ISensorLogic, '_id'>, Document {}

const sensorLogicSchema = new Schema<ISensorLogicDocument>({
  logicId: { type: String, required: true, unique: true, index: true },
  farmId: { type: String, required: true, index: true },
  blockId: { type: String, index: true },
  managerId: { type: String, required: true, index: true },

  logicInfo: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['irrigation', 'climate_control', 'emergency', 'nutrient_management', 'lighting', 'ventilation', 'custom']
    },
    priority: { type: Number, required: true, min: 1, max: 100, default: 50 },
    enabled: { type: Boolean, default: true }
  },

  conditions: {
    sensorConditions: {
      type: Map,
      of: {
        operator: { 
          type: String, 
          required: true,
          enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'outside_range']
        },
        value: { type: Number },
        range: {
          min: { type: Number },
          max: { type: Number }
        },
        unit: { type: String, required: true },
        duration: { type: Number, min: 0 }
      },
      default: new Map()
    },

    timeConditions: {
      timeRange: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
      daysOfMonth: [{ type: Number, min: 1, max: 31 }],
      months: [{ type: Number, min: 1, max: 12 }],
      excludeHolidays: { type: Boolean, default: false }
    },

    plantConditions: {
      growthStages: [{ type: String }],
      daysAfterPlanting: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      },
      daysBeforeHarvest: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      },
      plantTypes: [{ type: String }]
    },

    weatherConditions: {
      temperature: {
        min: { type: Number },
        max: { type: Number }
      },
      humidity: {
        min: { type: Number, min: 0, max: 100 },
        max: { type: Number, min: 0, max: 100 }
      },
      rainfall: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      },
      windSpeed: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      },
      forecast: [{ type: String }]
    },

    logicalOperator: { type: String, enum: ['AND', 'OR', 'NOT'], default: 'AND' },
    parentLogic: [{ type: String }]
  },

  actions: {
    controlActions: {
      type: Map,
      of: {
        action: { 
          type: String, 
          required: true,
          enum: ['turn_on', 'turn_off', 'set_value', 'adjust_by', 'cycle', 'pulse']
        },
        value: { type: Number },
        duration: { type: Number, min: 0 },
        gradual: {
          enabled: { type: Boolean, default: false },
          stepSize: { type: Number, min: 0 },
          intervalSeconds: { type: Number, min: 1 }
        }
      },
      default: new Map()
    },

    notifications: {
      alertLevel: { 
        type: String, 
        enum: ['info', 'warning', 'critical', 'emergency'],
        default: 'info'
      },
      message: { type: String, required: true },
      recipients: [{ type: String }],
      channels: [{ 
        type: String, 
        enum: ['app', 'email', 'sms', 'dashboard', 'webhook']
      }],
      escalation: {
        delayMinutes: { type: Number, min: 1 },
        nextLevel: { type: String }
      }
    },

    taskActions: {
      generateTask: { type: Boolean, default: false },
      taskTemplateId: { type: String },
      assignToUsers: [{ type: String }],
      priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      },
      dueWithinMinutes: { type: Number, min: 1 },
      notes: { type: String }
    },

    dataActions: {
      logEvent: { type: Boolean, default: true },
      eventType: { type: String, required: true },
      additionalData: { type: Map, of: Schema.Types.Mixed },
      storeInAnalytics: { type: Boolean, default: true }
    },

    integrationActions: {
      webhookUrl: { type: String },
      apiCall: {
        method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        url: { type: String },
        headers: { type: Map, of: String },
        body: { type: Schema.Types.Mixed }
      },
      externalSystem: {
        systemType: { type: String },
        actionType: { type: String },
        parameters: { type: Map, of: Schema.Types.Mixed }
      }
    }
  },

  advanced: {
    cooldown: {
      minimumIntervalMinutes: { type: Number, min: 0, default: 0 },
      maxExecutionsPerHour: { type: Number, min: 1 },
      resetDaily: { type: Boolean, default: true }
    },

    hysteresis: {
      type: Map,
      of: {
        onThreshold: { type: Number, required: true },
        offThreshold: { type: Number, required: true },
        enabled: { type: Boolean, default: true }
      },
      default: new Map()
    },

    safetyLimits: {
      maxRuntimeMinutes: { type: Number, min: 1 },
      emergencyStopConditions: [{
        sensorType: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: Number, required: true }
      }],
      manualOverrideRequired: { type: Boolean, default: false }
    },

    aiEnhancement: {
      enabled: { type: Boolean, default: false },
      modelType: { type: String, enum: ['predictive', 'optimization', 'anomaly_detection'] },
      learningRate: { type: Number, min: 0, max: 1, default: 0.1 },
      adaptThresholds: { type: Boolean, default: false },
      useHistoricalData: { type: Boolean, default: true }
    }
  },

  validation: {
    testMode: { type: Boolean, default: false },
    validationResults: {
      lastTested: { type: Date },
      testsPassed: { type: Number, default: 0 },
      testsFailed: { type: Number, default: 0 },
      issues: [{ type: String }]
    },
    dependencies: {
      requiredSensors: [{ type: String }],
      requiredDevices: [{ type: String }],
      conflictingLogic: [{ type: String }]
    }
  },

  performance: {
    executionCount: { type: Number, default: 0 },
    lastExecuted: { type: Date },
    averageExecutionTime: { type: Number, default: 0 },
    successRate: { type: Number, default: 100, min: 0, max: 100 },
    
    analytics: {
      triggersPerDay: [{ type: Number }],
      effectivenessScore: { type: Number, min: 0, max: 100 },
      resourceSavings: {
        waterSaved: { type: Number, default: 0 },
        energySaved: { type: Number, default: 0 },
        costSaved: { type: Number, default: 0 }
      },
      issues: {
        failureCount: { type: Number, default: 0 },
        lastFailure: { type: Date },
        commonErrors: [{ type: String }]
      }
    }
  },

  management: {
    version: { type: String, required: true, default: '1.0' },
    status: { 
      type: String, 
      required: true,
      enum: ['draft', 'testing', 'active', 'paused', 'deprecated'],
      default: 'draft'
    },
    approvalRequired: { type: Boolean, default: true },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    
    changeHistory: [{
      version: { type: String, required: true },
      changes: [{ type: String, required: true }],
      changedBy: { type: String, required: true },
      changeDate: { type: Date, required: true, default: Date.now },
      reason: { type: String, required: true },
      impactAssessment: { type: String }
    }]
  },

  notes: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Indexes for performance
sensorLogicSchema.index({ farmId: 1, 'logicInfo.category': 1 });
sensorLogicSchema.index({ blockId: 1, 'logicInfo.priority': -1 });
sensorLogicSchema.index({ managerId: 1, createdAt: -1 });
sensorLogicSchema.index({ 'management.status': 1, 'logicInfo.enabled': 1 });
sensorLogicSchema.index({ 'logicInfo.priority': -1, 'logicInfo.enabled': 1 });

// Pre-save middleware
sensorLogicSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate logic ID if not provided
  if (!this.logicId) {
    this.logicId = `LOGIC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  
  next();
});

// Instance methods
sensorLogicSchema.methods.evaluateConditions = function(sensorData: any, contextData: any): boolean {
  try {
    // Evaluate sensor conditions
    if (this.conditions.sensorConditions) {
      for (const [sensorType, condition] of this.conditions.sensorConditions.entries()) {
        const sensorValue = sensorData[sensorType];
        if (sensorValue === undefined) return false;
        
        if (!this.evaluateSensorCondition(sensorValue, condition)) {
          return this.conditions.logicalOperator === 'OR' ? false : false;
        }
      }
    }
    
    // Evaluate time conditions
    if (this.conditions.timeConditions && !this.evaluateTimeConditions(this.conditions.timeConditions)) {
      return this.conditions.logicalOperator === 'OR' ? false : false;
    }
    
    // Evaluate plant conditions
    if (this.conditions.plantConditions && !this.evaluatePlantConditions(this.conditions.plantConditions, contextData)) {
      return this.conditions.logicalOperator === 'OR' ? false : false;
    }
    
    // Evaluate weather conditions
    if (this.conditions.weatherConditions && !this.evaluateWeatherConditions(this.conditions.weatherConditions, contextData.weather)) {
      return this.conditions.logicalOperator === 'OR' ? false : false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error evaluating sensor logic conditions:', error);
    return false;
  }
};

sensorLogicSchema.methods.evaluateSensorCondition = function(value: number, condition: any): boolean {
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    case 'not_equals':
      return value !== condition.value;
    case 'greater_than':
      return value > condition.value;
    case 'less_than':
      return value < condition.value;
    case 'greater_equal':
      return value >= condition.value;
    case 'less_equal':
      return value <= condition.value;
    case 'between':
      return condition.range && value >= condition.range.min && value <= condition.range.max;
    case 'outside_range':
      return condition.range && (value < condition.range.min || value > condition.range.max);
    default:
      return false;
  }
};

sensorLogicSchema.methods.evaluateTimeConditions = function(timeConditions: any): boolean {
  const now = new Date();
  
  // Check time range
  if (timeConditions.timeRange) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTimeString(timeConditions.timeRange.start);
    const endTime = this.parseTimeString(timeConditions.timeRange.end);
    
    if (startTime <= endTime) {
      if (currentTime < startTime || currentTime > endTime) return false;
    } else {
      // Overnight range
      if (currentTime < startTime && currentTime > endTime) return false;
    }
  }
  
  // Check days of week
  if (timeConditions.daysOfWeek && !timeConditions.daysOfWeek.includes(now.getDay())) {
    return false;
  }
  
  // Check days of month
  if (timeConditions.daysOfMonth && !timeConditions.daysOfMonth.includes(now.getDate())) {
    return false;
  }
  
  // Check months
  if (timeConditions.months && !timeConditions.months.includes(now.getMonth() + 1)) {
    return false;
  }
  
  return true;
};

sensorLogicSchema.methods.parseTimeString = function(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

sensorLogicSchema.methods.evaluatePlantConditions = function(plantConditions: any, contextData: any): boolean {
  // Check growth stages
  if (plantConditions.growthStages && !plantConditions.growthStages.includes(contextData.growthStage)) {
    return false;
  }
  
  // Check days after planting
  if (plantConditions.daysAfterPlanting) {
    const daysAfter = contextData.daysAfterPlanting;
    if (plantConditions.daysAfterPlanting.min && daysAfter < plantConditions.daysAfterPlanting.min) return false;
    if (plantConditions.daysAfterPlanting.max && daysAfter > plantConditions.daysAfterPlanting.max) return false;
  }
  
  // Check days before harvest
  if (plantConditions.daysBeforeHarvest) {
    const daysBefore = contextData.daysBeforeHarvest;
    if (plantConditions.daysBeforeHarvest.min && daysBefore < plantConditions.daysBeforeHarvest.min) return false;
    if (plantConditions.daysBeforeHarvest.max && daysBefore > plantConditions.daysBeforeHarvest.max) return false;
  }
  
  // Check plant types
  if (plantConditions.plantTypes && !plantConditions.plantTypes.includes(contextData.plantType)) {
    return false;
  }
  
  return true;
};

sensorLogicSchema.methods.evaluateWeatherConditions = function(weatherConditions: any, weatherData: any): boolean {
  if (!weatherData) return true;
  
  // Check temperature
  if (weatherConditions.temperature) {
    const temp = weatherData.temperature;
    if (weatherConditions.temperature.min && temp < weatherConditions.temperature.min) return false;
    if (weatherConditions.temperature.max && temp > weatherConditions.temperature.max) return false;
  }
  
  // Check humidity
  if (weatherConditions.humidity) {
    const humidity = weatherData.humidity;
    if (weatherConditions.humidity.min && humidity < weatherConditions.humidity.min) return false;
    if (weatherConditions.humidity.max && humidity > weatherConditions.humidity.max) return false;
  }
  
  // Add other weather condition checks as needed
  
  return true;
};

sensorLogicSchema.methods.canExecute = function(): boolean {
  // Check if logic can execute based on cooldown, safety limits, etc.
  
  // Check if enabled
  if (!this.logicInfo.enabled || !this.isActive) return false;
  
  // Check status
  if (this.management.status !== 'active') return false;
  
  // Check cooldown
  if (this.advanced.cooldown && this.performance.lastExecuted) {
    const minutesSinceExecution = (Date.now() - this.performance.lastExecuted.getTime()) / (1000 * 60);
    if (minutesSinceExecution < this.advanced.cooldown.minimumIntervalMinutes) {
      return false;
    }
  }
  
  // Check execution limits
  if (this.advanced.cooldown?.maxExecutionsPerHour) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // In a real implementation, you'd check actual execution history
    // For now, we'll assume it's within limits
  }
  
  return true;
};

sensorLogicSchema.methods.updatePerformance = function(executionTime: number, success: boolean) {
  this.performance.executionCount += 1;
  this.performance.lastExecuted = new Date();
  
  // Update average execution time
  const totalTime = this.performance.averageExecutionTime * (this.performance.executionCount - 1) + executionTime;
  this.performance.averageExecutionTime = totalTime / this.performance.executionCount;
  
  // Update success rate
  if (!success) {
    this.performance.analytics.issues.failureCount += 1;
    this.performance.analytics.issues.lastFailure = new Date();
  }
  
  const successCount = Math.round(this.performance.successRate * (this.performance.executionCount - 1) / 100);
  const newSuccessCount = successCount + (success ? 1 : 0);
  this.performance.successRate = (newSuccessCount / this.performance.executionCount) * 100;
};

// Transform function for JSON output
sensorLogicSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete (ret as any).__v;
    return ret;
  }
});

export const SensorLogic = mongoose.model<ISensorLogicDocument>('SensorLogic', sensorLogicSchema);
