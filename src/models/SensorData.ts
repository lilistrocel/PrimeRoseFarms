import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Sensor Data Interface
 * IoT sensor data from ESP32 and Python systems
 */
export interface ISensorData {
  _id?: string;
  sensorId: string; // Unique sensor identifier
  farmId: string; // Reference to FarmData
  blockId?: string; // Reference to BlockData (optional)
  
  // Sensor Information
  sensorInfo: {
    name: string;
    type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'ph' | 'nutrient' | 'air_quality' | 'weather' | 'camera' | 'other';
    model: string;
    manufacturer: string;
    firmware: string;
    location: {
      coordinates: {
        x: number; // meters from farm origin
        y: number; // meters from farm origin
        z: number; // elevation in meters
      };
      description: string;
    };
    installationDate: Date;
    lastMaintenance: Date;
    nextMaintenance: Date;
    status: 'active' | 'inactive' | 'maintenance' | 'error' | 'offline';
  };
  
  // Data Readings
  readings: {
    timestamp: Date;
    value: number;
    unit: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
    calibration: {
      offset: number;
      multiplier: number;
      lastCalibrated: Date;
    };
    metadata: {
      batteryLevel?: number; // percentage
      signalStrength?: number; // dBm
      dataRate?: number; // readings per minute
      errorCode?: string;
      rawValue?: number;
    };
  }[];
  
  // Configuration
  configuration: {
    samplingRate: number; // seconds between readings
    transmissionRate: number; // seconds between transmissions
    thresholds: {
      min: number;
      max: number;
      warning: {
        min: number;
        max: number;
      };
      critical: {
        min: number;
        max: number;
      };
    };
    alerts: {
      enabled: boolean;
      email: string[];
      sms: string[];
      webhook?: string;
    };
    dataRetention: {
      days: number;
      compression: boolean;
      archive: boolean;
    };
  };
  
  // Performance Metrics
  performance: {
    uptime: number; // percentage
    dataQuality: number; // percentage
    transmissionSuccess: number; // percentage
    batteryLife: number; // days
    lastDataReceived: Date;
    totalReadings: number;
    failedReadings: number;
    averageResponseTime: number; // milliseconds
  };
  
  // Calibration History
  calibrationHistory: {
    date: Date;
    type: 'zero' | 'span' | 'field' | 'laboratory';
    beforeValue: number;
    afterValue: number;
    standardValue: number;
    accuracy: number; // percentage
    performedBy: string; // User ID
    notes: string;
  }[];
  
  // Maintenance History
  maintenanceHistory: {
    date: Date;
    type: 'routine' | 'repair' | 'replacement' | 'upgrade' | 'cleaning';
    description: string;
    cost: number; // USD
    performedBy: string; // User ID
    nextMaintenance: Date;
    parts: {
      name: string;
      partNumber: string;
      cost: number; // USD
    }[];
  }[];
  
  // Data Analysis
  analysis: {
    trends: {
      period: 'hourly' | 'daily' | 'weekly' | 'monthly';
      direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
      rate: number; // change per period
      confidence: number; // percentage
    };
    anomalies: {
      timestamp: Date;
      value: number;
      expectedValue: number;
      deviation: number; // percentage
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }[];
    correlations: {
      sensorId: string;
      correlation: number; // -1 to 1
      significance: number; // percentage
    }[];
    predictions: {
      nextHour: number;
      nextDay: number;
      nextWeek: number;
      confidence: number; // percentage
      lastUpdated: Date;
    };
  };
  
  // Environmental Context
  environmentalContext: {
    weatherStation?: string; // Reference to weather station
    irrigationZone?: string;
    cropType?: string; // PlantData ID
    growthStage?: string;
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sensor Data Document Interface
 */
export interface ISensorDataDocument extends Omit<ISensorData, '_id'>, Document {}

/**
 * Sensor Data Schema
 */
const sensorDataSchema = new Schema<ISensorDataDocument>({
  sensorId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  farmId: {
    type: String,
    required: true,
    ref: 'FarmData'
  },
  blockId: {
    type: String,
    ref: 'BlockData'
  },
  
  sensorInfo: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
      type: String,
      required: true,
      enum: ['temperature', 'humidity', 'soil_moisture', 'light', 'ph', 'nutrient', 'air_quality', 'weather', 'camera', 'other']
    },
    model: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    firmware: { type: String, required: true, trim: true },
    location: {
      coordinates: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true }
      },
      description: { type: String, required: true, trim: true }
    },
    installationDate: { type: Date, required: true },
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'maintenance', 'error', 'offline'],
      default: 'active'
    }
  },
  
  readings: [{
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    quality: {
      type: String,
      required: true,
      enum: ['excellent', 'good', 'fair', 'poor', 'invalid'],
      default: 'good'
    },
    calibration: {
      offset: { type: Number, default: 0 },
      multiplier: { type: Number, default: 1 },
      lastCalibrated: { type: Date }
    },
    metadata: {
      batteryLevel: { type: Number, min: 0, max: 100 },
      signalStrength: { type: Number },
      dataRate: { type: Number, min: 0 },
      errorCode: { type: String, trim: true },
      rawValue: { type: Number }
    }
  }],
  
  configuration: {
    samplingRate: { type: Number, required: true, min: 1 },
    transmissionRate: { type: Number, required: true, min: 1 },
    thresholds: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      warning: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
      },
      critical: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
      }
    },
    alerts: {
      enabled: { type: Boolean, default: true },
      email: [{ type: String, trim: true, lowercase: true }],
      sms: [{ type: String, trim: true }],
      webhook: { type: String, trim: true }
    },
    dataRetention: {
      days: { type: Number, default: 365, min: 1 },
      compression: { type: Boolean, default: true },
      archive: { type: Boolean, default: false }
    }
  },
  
  performance: {
    uptime: { type: Number, default: 100, min: 0, max: 100 },
    dataQuality: { type: Number, default: 100, min: 0, max: 100 },
    transmissionSuccess: { type: Number, default: 100, min: 0, max: 100 },
    batteryLife: { type: Number, default: 365, min: 0 },
    lastDataReceived: { type: Date, default: Date.now },
    totalReadings: { type: Number, default: 0, min: 0 },
    failedReadings: { type: Number, default: 0, min: 0 },
    averageResponseTime: { type: Number, default: 0, min: 0 }
  },
  
  calibrationHistory: [{
    date: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: ['zero', 'span', 'field', 'laboratory']
    },
    beforeValue: { type: Number, required: true },
    afterValue: { type: Number, required: true },
    standardValue: { type: Number, required: true },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    performedBy: { type: String, required: true },
    notes: { type: String, trim: true, maxlength: 500 }
  }],
  
  maintenanceHistory: [{
    date: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: ['routine', 'repair', 'replacement', 'upgrade', 'cleaning']
    },
    description: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
    performedBy: { type: String, required: true },
    nextMaintenance: { type: Date },
    parts: [{
      name: { type: String, required: true, trim: true },
      partNumber: { type: String, required: true, trim: true },
      cost: { type: Number, required: true, min: 0 }
    }]
  }],
  
  analysis: {
    trends: {
      period: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      direction: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'volatile'],
        default: 'stable'
      },
      rate: { type: Number, default: 0 },
      confidence: { type: Number, default: 0, min: 0, max: 100 }
    },
    anomalies: [{
      timestamp: { type: Date, required: true },
      value: { type: Number, required: true },
      expectedValue: { type: Number, required: true },
      deviation: { type: Number, required: true },
      severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: { type: String, required: true, trim: true }
    }],
    correlations: [{
      sensorId: { type: String, required: true },
      correlation: { type: Number, required: true, min: -1, max: 1 },
      significance: { type: Number, required: true, min: 0, max: 100 }
    }],
    predictions: {
      nextHour: { type: Number },
      nextDay: { type: Number },
      nextWeek: { type: Number },
      confidence: { type: Number, min: 0, max: 100 },
      lastUpdated: { type: Date, default: Date.now }
    }
  },
  
  environmentalContext: {
    weatherStation: { type: String, trim: true },
    irrigationZone: { type: String, trim: true },
    cropType: { type: String, ref: 'PlantData' },
    growthStage: { type: String, trim: true },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter'],
      default: 'spring'
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning'
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
  collection: 'sensordata'
});

// Indexes for performance
sensorDataSchema.index({ sensorId: 1 }, { unique: true });
sensorDataSchema.index({ farmId: 1, isActive: 1 });
sensorDataSchema.index({ blockId: 1 });
sensorDataSchema.index({ 'sensorInfo.type': 1 });
sensorDataSchema.index({ 'sensorInfo.status': 1 });
sensorDataSchema.index({ 'readings.timestamp': -1 });
sensorDataSchema.index({ 'performance.lastDataReceived': -1 });
sensorDataSchema.index({ 'environmentalContext.cropType': 1 });
sensorDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
sensorDataSchema.pre('save', function(next) {
  // Calculate performance metrics
  if (this.readings.length > 0) {
    const totalReadings = this.readings.length;
    const validReadings = this.readings.filter(reading => reading.quality !== 'invalid').length;
    this.performance.dataQuality = (validReadings / totalReadings) * 100;
    this.performance.totalReadings = totalReadings;
    this.performance.failedReadings = totalReadings - validReadings;
    
    // Update last data received
    const latestReading = this.readings.reduce((latest: any, current: any) => 
      current.timestamp > latest.timestamp ? current : latest
    );
    this.performance.lastDataReceived = latestReading.timestamp;
  }
  
  // Validate thresholds
  if (this.configuration.thresholds.min >= this.configuration.thresholds.max) {
    return next(new Error('Minimum threshold must be less than maximum threshold'));
  }
  
  if (this.configuration.thresholds.warning.min >= this.configuration.thresholds.warning.max) {
    return next(new Error('Warning minimum must be less than warning maximum'));
  }
  
  if (this.configuration.thresholds.critical.min >= this.configuration.thresholds.critical.max) {
    return next(new Error('Critical minimum must be less than critical maximum'));
  }
  
  // Validate sampling and transmission rates
  if (this.configuration.samplingRate > this.configuration.transmissionRate) {
    return next(new Error('Sampling rate cannot be greater than transmission rate'));
  }
  
  next();
});

// Instance methods
sensorDataSchema.methods.addReading = function(reading: any) {
  // Apply calibration
  const calibratedValue = (reading.rawValue + this.readings[0]?.calibration.offset || 0) * 
                         (this.readings[0]?.calibration.multiplier || 1);
  
  const newReading = {
    timestamp: new Date(),
    value: calibratedValue,
    unit: reading.unit,
    quality: this.assessDataQuality(calibratedValue),
    calibration: this.readings[0]?.calibration || { offset: 0, multiplier: 1, lastCalibrated: new Date() },
    metadata: {
      batteryLevel: reading.batteryLevel,
      signalStrength: reading.signalStrength,
      dataRate: reading.dataRate,
      errorCode: reading.errorCode,
      rawValue: reading.rawValue
    }
  };
  
  this.readings.push(newReading);
  
  // Check for anomalies
  this.checkForAnomalies(calibratedValue);
  
  // Update performance metrics
  this.updatePerformanceMetrics();
};

sensorDataSchema.methods.assessDataQuality = function(value: number): string {
  const thresholds = this.configuration.thresholds;
  
  if (value < thresholds.min || value > thresholds.max) {
    return 'invalid';
  }
  
  if (value < thresholds.warning.min || value > thresholds.warning.max) {
    return 'poor';
  }
  
  if (value < thresholds.critical.min || value > thresholds.critical.max) {
    return 'fair';
  }
  
  return 'good';
};

sensorDataSchema.methods.checkForAnomalies = function(value: number) {
  if (this.readings.length < 10) return; // Need enough data for comparison
  
  // Simple anomaly detection based on standard deviation
  const recentReadings = this.readings.slice(-10).map((r: any) => r.value);
  const mean = recentReadings.reduce((sum: number, val: number) => sum + val, 0) / recentReadings.length;
  const variance = recentReadings.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / recentReadings.length;
  const stdDev = Math.sqrt(variance);
  
  const deviation = Math.abs(value - mean) / stdDev;
  
  if (deviation > 3) {
    this.analysis.anomalies.push({
      timestamp: new Date(),
      value: value,
      expectedValue: mean,
      deviation: deviation * 100,
      severity: deviation > 5 ? 'critical' : deviation > 4 ? 'high' : 'medium',
      description: `Value ${value} deviates ${deviation.toFixed(2)} standard deviations from mean`
    });
  }
};

sensorDataSchema.methods.updatePerformanceMetrics = function() {
  // Calculate uptime based on recent data
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentReadings = this.readings.filter((r: any) => r.timestamp > oneDayAgo);
  
  if (recentReadings.length > 0) {
    const expectedReadings = 24 * 60 * 60 / this.configuration.samplingRate;
    this.performance.uptime = (recentReadings.length / expectedReadings) * 100;
  }
  
  // Update transmission success rate
  const successfulTransmissions = this.readings.filter((r: any) => r.quality !== 'invalid').length;
  this.performance.transmissionSuccess = (successfulTransmissions / this.readings.length) * 100;
};

sensorDataSchema.methods.getLatestReading = function() {
  if (this.readings.length === 0) return null;
  return this.readings[this.readings.length - 1];
};

sensorDataSchema.methods.getAverageReading = function(hours: number = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentReadings = this.readings.filter((r: any) => r.timestamp > cutoffTime && r.quality !== 'invalid');
  
  if (recentReadings.length === 0) return null;
  
  const sum = recentReadings.reduce((total: number, reading: any) => total + reading.value, 0);
  return sum / recentReadings.length;
};

sensorDataSchema.methods.getMinMaxReadings = function(hours: number = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentReadings = this.readings.filter((r: any) => r.timestamp > cutoffTime && r.quality !== 'invalid');
  
  if (recentReadings.length === 0) return null;
  
  const values = recentReadings.map((r: any) => r.value);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length
  };
};

sensorDataSchema.methods.isOnline = function(): boolean {
  const now = new Date();
  const lastReading = this.performance.lastDataReceived;
  const timeDiff = now.getTime() - lastReading.getTime();
  const maxOfflineTime = this.configuration.transmissionRate * 3 * 1000; // 3x transmission rate
  
  return timeDiff < maxOfflineTime;
};

sensorDataSchema.methods.needsMaintenance = function(): boolean {
  if (!this.sensorInfo.nextMaintenance) return false;
  return new Date() >= this.sensorInfo.nextMaintenance;
};

sensorDataSchema.methods.calibrate = function(calibrationData: any) {
  this.calibrationHistory.push({
    date: new Date(),
    type: calibrationData.type,
    beforeValue: calibrationData.beforeValue,
    afterValue: calibrationData.afterValue,
    standardValue: calibrationData.standardValue,
    accuracy: calibrationData.accuracy,
    performedBy: calibrationData.performedBy,
    notes: calibrationData.notes
  });
  
  // Update calibration values
  if (this.readings.length > 0) {
    this.readings[0].calibration.offset = calibrationData.offset;
    this.readings[0].calibration.multiplier = calibrationData.multiplier;
    this.readings[0].calibration.lastCalibrated = new Date();
  }
};

// Static methods
sensorDataSchema.statics.findByFarm = function(farmId: string) {
  return this.find({ farmId, isActive: true });
};

sensorDataSchema.statics.findByBlock = function(blockId: string) {
  return this.find({ blockId, isActive: true });
};

sensorDataSchema.statics.findByType = function(type: string) {
  return this.find({ 'sensorInfo.type': type, isActive: true });
};

sensorDataSchema.statics.findOnline = function() {
  return this.find({ 'sensorInfo.status': 'active', isActive: true });
};

sensorDataSchema.statics.findOffline = function() {
  return this.find({ 'sensorInfo.status': 'offline', isActive: true });
};

sensorDataSchema.statics.findNeedingMaintenance = function() {
  return this.find({
    'sensorInfo.nextMaintenance': { $lte: new Date() },
    isActive: true
  });
};

sensorDataSchema.statics.findWithAnomalies = function() {
  return this.find({
    'analysis.anomalies': { $exists: true, $ne: [] },
    isActive: true
  });
};

sensorDataSchema.statics.getSensorNetworkHealth = function(farmId: string) {
  return this.aggregate([
    { $match: { farmId, isActive: true } },
    {
      $group: {
        _id: null,
        totalSensors: { $sum: 1 },
        activeSensors: {
          $sum: { $cond: [{ $eq: ['$sensorInfo.status', 'active'] }, 1, 0] }
        },
        averageUptime: { $avg: '$performance.uptime' },
        averageDataQuality: { $avg: '$performance.dataQuality' }
      }
    }
  ]);
};

// Transform to JSON
sensorDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const SensorData = mongoose.model<ISensorDataDocument>('SensorData', sensorDataSchema);
