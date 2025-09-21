import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Environment Data Interface
 * Meteorological and external environmental data
 */
export interface IEnvironmentData {
  _id?: string;
  farmId: string; // Reference to FarmData
  location: {
    latitude: number;
    longitude: number;
    elevation: number; // meters above sea level
    timezone: string;
  };
  
  // Weather Data
  weather: {
    timestamp: Date;
    temperature: {
      current: number; // Celsius
      min: number; // Celsius
      max: number; // Celsius
      feelsLike: number; // Celsius
      dewPoint: number; // Celsius
    };
    humidity: {
      relative: number; // percentage
      absolute: number; // g/m³
    };
    pressure: {
      atmospheric: number; // hPa
      seaLevel: number; // hPa
    };
    wind: {
      speed: number; // m/s
      direction: number; // degrees (0-360)
      gust: number; // m/s
    };
    precipitation: {
      current: number; // mm
      hourly: number; // mm
      daily: number; // mm
      probability: number; // percentage
    };
    visibility: number; // km
    uvIndex: number; // 0-11
    cloudCover: number; // percentage
    weatherCondition: string; // e.g., 'clear', 'partly_cloudy', 'rain', 'snow'
  };
  
  // Solar Data
  solar: {
    irradiance: {
      current: number; // W/m²
      peak: number; // W/m²
      daily: number; // kWh/m²
    };
    sunPosition: {
      azimuth: number; // degrees
      elevation: number; // degrees
      sunrise: Date;
      sunset: Date;
      dayLength: number; // hours
    };
    photosyntheticallyActiveRadiation: {
      current: number; // μmol/m²/s
      daily: number; // mol/m²
    };
  };
  
  // Soil Data
  soil: {
    temperature: {
      surface: number; // Celsius
      depth10cm: number; // Celsius
      depth20cm: number; // Celsius
      depth50cm: number; // Celsius
    };
    moisture: {
      surface: number; // percentage
      depth10cm: number; // percentage
      depth20cm: number; // percentage
      depth50cm: number; // percentage
    };
    ph: number;
    conductivity: number; // μS/cm
    organicMatter: number; // percentage
    nutrients: {
      nitrogen: number; // ppm
      phosphorus: number; // ppm
      potassium: number; // ppm
      calcium: number; // ppm
      magnesium: number; // ppm
    };
  };
  
  // Air Quality
  airQuality: {
    pm25: number; // μg/m³
    pm10: number; // μg/m³
    co2: number; // ppm
    co: number; // ppm
    no2: number; // ppb
    o3: number; // ppb
    so2: number; // ppb
    aqi: number; // Air Quality Index
    level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  };
  
  // Growing Degree Days
  growingDegreeDays: {
    base10: number; // GDD with base temperature 10°C
    base15: number; // GDD with base temperature 15°C
    base20: number; // GDD with base temperature 20°C
    cumulative: {
      base10: number;
      base15: number;
      base20: number;
    };
  };
  
  // Frost and Freeze Data
  frost: {
    risk: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    probability: number; // percentage
    expectedDate?: Date;
    lastFrostDate?: Date;
    firstFrostDate?: Date;
    frostFreeDays: number;
  };
  
  // Drought Index
  drought: {
    palmerIndex: number; // -4 to +4
    level: 'extreme_wet' | 'very_wet' | 'moderately_wet' | 'slightly_wet' | 'normal' | 'slightly_dry' | 'moderately_dry' | 'severely_dry' | 'extremely_dry';
    soilMoistureAnomaly: number; // percentage deviation from normal
  };
  
  // Pest and Disease Risk
  pestDiseaseRisk: {
    fungal: {
      risk: 'low' | 'moderate' | 'high' | 'severe';
      factors: string[];
    };
    bacterial: {
      risk: 'low' | 'moderate' | 'high' | 'severe';
      factors: string[];
    };
    insect: {
      risk: 'low' | 'moderate' | 'high' | 'severe';
      factors: string[];
    };
    overall: 'low' | 'moderate' | 'high' | 'severe';
  };
  
  // Forecast Data
  forecast: {
    shortTerm: {
      hours: number[];
      temperature: number[];
      humidity: number[];
      precipitation: number[];
      windSpeed: number[];
      conditions: string[];
    };
    longTerm: {
      days: number[];
      temperature: {
        min: number[];
        max: number[];
      };
      precipitation: number[];
      conditions: string[];
    };
    accuracy: number; // percentage
    lastUpdated: Date;
  };
  
  // Data Source Information
  dataSource: {
    provider: string; // e.g., 'OpenWeatherMap', 'WeatherAPI', 'NOAA'
    stationId?: string;
    apiKey?: string;
    lastUpdate: Date;
    reliability: number; // 1-10 scale
    coverage: number; // percentage
  };
  
  // Quality Control
  qualityControl: {
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    completeness: number; // percentage
    accuracy: number; // percentage
    flags: {
      missingData: boolean;
      outlier: boolean;
      inconsistent: boolean;
      stale: boolean;
    };
    lastValidation: Date;
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Environment Data Document Interface
 */
export interface IEnvironmentDataDocument extends Omit<IEnvironmentData, '_id'>, Document {}

/**
 * Environment Data Schema
 */
const environmentDataSchema = new Schema<IEnvironmentDataDocument>({
  farmId: {
    type: String,
    required: true,
    ref: 'FarmData'
  },
  
  location: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    elevation: { type: Number, required: true, min: 0 },
    timezone: { type: String, required: true, trim: true }
  },
  
  weather: {
    timestamp: { type: Date, required: true },
    temperature: {
      current: { type: Number, required: true, min: -50, max: 50 },
      min: { type: Number, required: true, min: -50, max: 50 },
      max: { type: Number, required: true, min: -50, max: 50 },
      feelsLike: { type: Number, min: -50, max: 50 },
      dewPoint: { type: Number, min: -50, max: 50 }
    },
    humidity: {
      relative: { type: Number, required: true, min: 0, max: 100 },
      absolute: { type: Number, min: 0 }
    },
    pressure: {
      atmospheric: { type: Number, required: true, min: 800, max: 1100 },
      seaLevel: { type: Number, min: 800, max: 1100 }
    },
    wind: {
      speed: { type: Number, required: true, min: 0 },
      direction: { type: Number, required: true, min: 0, max: 360 },
      gust: { type: Number, min: 0 }
    },
    precipitation: {
      current: { type: Number, default: 0, min: 0 },
      hourly: { type: Number, default: 0, min: 0 },
      daily: { type: Number, default: 0, min: 0 },
      probability: { type: Number, default: 0, min: 0, max: 100 }
    },
    visibility: { type: Number, min: 0 },
    uvIndex: { type: Number, min: 0, max: 11 },
    cloudCover: { type: Number, min: 0, max: 100 },
    weatherCondition: { type: String, required: true, trim: true }
  },
  
  solar: {
    irradiance: {
      current: { type: Number, min: 0 },
      peak: { type: Number, min: 0 },
      daily: { type: Number, min: 0 }
    },
    sunPosition: {
      azimuth: { type: Number, min: 0, max: 360 },
      elevation: { type: Number, min: -90, max: 90 },
      sunrise: { type: Date },
      sunset: { type: Date },
      dayLength: { type: Number, min: 0, max: 24 }
    },
    photosyntheticallyActiveRadiation: {
      current: { type: Number, min: 0 },
      daily: { type: Number, min: 0 }
    }
  },
  
  soil: {
    temperature: {
      surface: { type: Number, min: -50, max: 50 },
      depth10cm: { type: Number, min: -50, max: 50 },
      depth20cm: { type: Number, min: -50, max: 50 },
      depth50cm: { type: Number, min: -50, max: 50 }
    },
    moisture: {
      surface: { type: Number, min: 0, max: 100 },
      depth10cm: { type: Number, min: 0, max: 100 },
      depth20cm: { type: Number, min: 0, max: 100 },
      depth50cm: { type: Number, min: 0, max: 100 }
    },
    ph: { type: Number, min: 0, max: 14 },
    conductivity: { type: Number, min: 0 },
    organicMatter: { type: Number, min: 0, max: 100 },
    nutrients: {
      nitrogen: { type: Number, min: 0 },
      phosphorus: { type: Number, min: 0 },
      potassium: { type: Number, min: 0 },
      calcium: { type: Number, min: 0 },
      magnesium: { type: Number, min: 0 }
    }
  },
  
  airQuality: {
    pm25: { type: Number, min: 0 },
    pm10: { type: Number, min: 0 },
    co2: { type: Number, min: 0 },
    co: { type: Number, min: 0 },
    no2: { type: Number, min: 0 },
    o3: { type: Number, min: 0 },
    so2: { type: Number, min: 0 },
    aqi: { type: Number, min: 0, max: 500 },
    level: {
      type: String,
      enum: ['good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous'],
      default: 'good'
    }
  },
  
  growingDegreeDays: {
    base10: { type: Number, default: 0, min: 0 },
    base15: { type: Number, default: 0, min: 0 },
    base20: { type: Number, default: 0, min: 0 },
    cumulative: {
      base10: { type: Number, default: 0, min: 0 },
      base15: { type: Number, default: 0, min: 0 },
      base20: { type: Number, default: 0, min: 0 }
    }
  },
  
  frost: {
    risk: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high', 'severe'],
      default: 'none'
    },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    expectedDate: { type: Date },
    lastFrostDate: { type: Date },
    firstFrostDate: { type: Date },
    frostFreeDays: { type: Number, default: 0, min: 0 }
  },
  
  drought: {
    palmerIndex: { type: Number, min: -4, max: 4 },
    level: {
      type: String,
      enum: ['extreme_wet', 'very_wet', 'moderately_wet', 'slightly_wet', 'normal', 'slightly_dry', 'moderately_dry', 'severely_dry', 'extremely_dry'],
      default: 'normal'
    },
    soilMoistureAnomaly: { type: Number, default: 0 }
  },
  
  pestDiseaseRisk: {
    fungal: {
      risk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'severe'],
        default: 'low'
      },
      factors: [{ type: String, trim: true }]
    },
    bacterial: {
      risk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'severe'],
        default: 'low'
      },
      factors: [{ type: String, trim: true }]
    },
    insect: {
      risk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'severe'],
        default: 'low'
      },
      factors: [{ type: String, trim: true }]
    },
    overall: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'low'
    }
  },
  
  forecast: {
    shortTerm: {
      hours: [{ type: Number, min: 0, max: 168 }],
      temperature: [{ type: Number }],
      humidity: [{ type: Number, min: 0, max: 100 }],
      precipitation: [{ type: Number, min: 0 }],
      windSpeed: [{ type: Number, min: 0 }],
      conditions: [{ type: String, trim: true }]
    },
    longTerm: {
      days: [{ type: Number, min: 1, max: 30 }],
      temperature: {
        min: [{ type: Number }],
        max: [{ type: Number }]
      },
      precipitation: [{ type: Number, min: 0 }],
      conditions: [{ type: String, trim: true }]
    },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  dataSource: {
    provider: { type: String, required: true, trim: true },
    stationId: { type: String, trim: true },
    apiKey: { type: String, trim: true },
    lastUpdate: { type: Date, required: true },
    reliability: { type: Number, required: true, min: 1, max: 10 },
    coverage: { type: Number, required: true, min: 0, max: 100 }
  },
  
  qualityControl: {
    dataQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    completeness: { type: Number, default: 100, min: 0, max: 100 },
    accuracy: { type: Number, default: 100, min: 0, max: 100 },
    flags: {
      missingData: { type: Boolean, default: false },
      outlier: { type: Boolean, default: false },
      inconsistent: { type: Boolean, default: false },
      stale: { type: Boolean, default: false }
    },
    lastValidation: { type: Date, default: Date.now }
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
  collection: 'environmentdata'
});

// Indexes for performance
environmentDataSchema.index({ farmId: 1, 'weather.timestamp': -1 });
environmentDataSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
environmentDataSchema.index({ 'weather.timestamp': -1 });
environmentDataSchema.index({ 'dataSource.provider': 1 });
environmentDataSchema.index({ 'qualityControl.dataQuality': 1 });
environmentDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
environmentDataSchema.pre('save', function(next) {
  // Calculate growing degree days
  const temp = this.weather.temperature.current;
  this.growingDegreeDays.base10 = Math.max(0, temp - 10);
  this.growingDegreeDays.base15 = Math.max(0, temp - 15);
  this.growingDegreeDays.base20 = Math.max(0, temp - 20);
  
  // Update cumulative GDD
  this.growingDegreeDays.cumulative.base10 += this.growingDegreeDays.base10;
  this.growingDegreeDays.cumulative.base15 += this.growingDegreeDays.base15;
  this.growingDegreeDays.cumulative.base20 += this.growingDegreeDays.base20;
  
  // Calculate frost risk based on temperature
  if (temp < 0) {
    this.frost.risk = 'severe';
    this.frost.probability = 100;
  } else if (temp < 2) {
    this.frost.risk = 'high';
    this.frost.probability = 80;
  } else if (temp < 5) {
    this.frost.risk = 'moderate';
    this.frost.probability = 50;
  } else if (temp < 8) {
    this.frost.risk = 'low';
    this.frost.probability = 20;
  } else {
    this.frost.risk = 'none';
    this.frost.probability = 0;
  }
  
  // Calculate drought level based on Palmer Index
  if (this.drought.palmerIndex >= 3) {
    this.drought.level = 'extreme_wet';
  } else if (this.drought.palmerIndex >= 2) {
    this.drought.level = 'very_wet';
  } else if (this.drought.palmerIndex >= 1) {
    this.drought.level = 'moderately_wet';
  } else if (this.drought.palmerIndex >= 0.5) {
    this.drought.level = 'slightly_wet';
  } else if (this.drought.palmerIndex >= -0.5) {
    this.drought.level = 'normal';
  } else if (this.drought.palmerIndex >= -1) {
    this.drought.level = 'slightly_dry';
  } else if (this.drought.palmerIndex >= -2) {
    this.drought.level = 'moderately_dry';
  } else if (this.drought.palmerIndex >= -3) {
    this.drought.level = 'severely_dry';
  } else {
    this.drought.level = 'extremely_dry';
  }
  
  // Assess pest and disease risk
  environmentDataSchema.methods.assessPestDiseaseRisk.call(this);
  
  // Validate data quality
  environmentDataSchema.methods.validateDataQuality.call(this);
  
  next();
});

// Instance methods
environmentDataSchema.methods.assessPestDiseaseRisk = function() {
  const temp = this.weather.temperature.current;
  const humidity = this.weather.humidity.relative;
  const precipitation = this.weather.precipitation.daily;
  
  // Fungal risk assessment
  if (humidity > 80 && temp > 20 && temp < 30) {
    this.pestDiseaseRisk.fungal.risk = 'high';
    this.pestDiseaseRisk.fungal.factors = ['high_humidity', 'optimal_temperature'];
  } else if (humidity > 70 && temp > 15 && temp < 35) {
    this.pestDiseaseRisk.fungal.risk = 'moderate';
    this.pestDiseaseRisk.fungal.factors = ['moderate_humidity'];
  } else {
    this.pestDiseaseRisk.fungal.risk = 'low';
    this.pestDiseaseRisk.fungal.factors = [];
  }
  
  // Bacterial risk assessment
  if (temp > 25 && temp < 35 && humidity > 70) {
    this.pestDiseaseRisk.bacterial.risk = 'high';
    this.pestDiseaseRisk.bacterial.factors = ['high_temperature', 'high_humidity'];
  } else if (temp > 20 && temp < 40 && humidity > 60) {
    this.pestDiseaseRisk.bacterial.risk = 'moderate';
    this.pestDiseaseRisk.bacterial.factors = ['moderate_conditions'];
  } else {
    this.pestDiseaseRisk.bacterial.risk = 'low';
    this.pestDiseaseRisk.bacterial.factors = [];
  }
  
  // Insect risk assessment
  if (temp > 20 && temp < 30 && humidity > 60) {
    this.pestDiseaseRisk.insect.risk = 'high';
    this.pestDiseaseRisk.insect.factors = ['optimal_breeding_conditions'];
  } else if (temp > 15 && temp < 35 && humidity > 50) {
    this.pestDiseaseRisk.insect.risk = 'moderate';
    this.pestDiseaseRisk.insect.factors = ['favorable_conditions'];
  } else {
    this.pestDiseaseRisk.insect.risk = 'low';
    this.pestDiseaseRisk.insect.factors = [];
  }
  
  // Overall risk assessment
  const risks = [
    this.pestDiseaseRisk.fungal.risk,
    this.pestDiseaseRisk.bacterial.risk,
    this.pestDiseaseRisk.insect.risk
  ];
  
  if (risks.includes('severe')) {
    this.pestDiseaseRisk.overall = 'severe';
  } else if (risks.includes('high')) {
    this.pestDiseaseRisk.overall = 'high';
  } else if (risks.includes('moderate')) {
    this.pestDiseaseRisk.overall = 'moderate';
  } else {
    this.pestDiseaseRisk.overall = 'low';
  }
};

environmentDataSchema.methods.validateDataQuality = function() {
  let qualityScore = 100;
  const flags = this.qualityControl.flags;
  
  // Check for missing critical data
  if (!this.weather.temperature.current || !this.weather.humidity.relative) {
    flags.missingData = true;
    qualityScore -= 30;
  }
  
  // Check for outliers
  if (this.weather.temperature.current < -50 || this.weather.temperature.current > 50) {
    flags.outlier = true;
    qualityScore -= 20;
  }
  
  if (this.weather.humidity.relative < 0 || this.weather.humidity.relative > 100) {
    flags.outlier = true;
    qualityScore -= 20;
  }
  
  // Check for stale data
  const now = new Date();
  const dataAge = now.getTime() - this.weather.timestamp.getTime();
  if (dataAge > 24 * 60 * 60 * 1000) { // 24 hours
    flags.stale = true;
    qualityScore -= 25;
  }
  
  // Check for inconsistencies
  if (this.weather.temperature.min > this.weather.temperature.max) {
    flags.inconsistent = true;
    qualityScore -= 15;
  }
  
  // Set data quality level
  if (qualityScore >= 90) {
    this.qualityControl.dataQuality = 'excellent';
  } else if (qualityScore >= 75) {
    this.qualityControl.dataQuality = 'good';
  } else if (qualityScore >= 60) {
    this.qualityControl.dataQuality = 'fair';
  } else {
    this.qualityControl.dataQuality = 'poor';
  }
  
  this.qualityControl.completeness = qualityScore;
  this.qualityControl.accuracy = qualityScore;
  this.qualityControl.lastValidation = new Date();
};

environmentDataSchema.methods.getWeatherSummary = function() {
  return {
    temperature: this.weather.temperature.current,
    humidity: this.weather.humidity.relative,
    condition: this.weather.weatherCondition,
    windSpeed: this.weather.wind.speed,
    precipitation: this.weather.precipitation.daily,
    uvIndex: this.weather.uvIndex
  };
};

environmentDataSchema.methods.getGrowingConditions = function() {
  return {
    temperature: this.weather.temperature.current,
    humidity: this.weather.humidity.relative,
    light: this.solar.irradiance.current,
    soilMoisture: this.soil.moisture.surface,
    soilTemperature: this.soil.temperature.surface,
    growingDegreeDays: this.growingDegreeDays.base10,
    frostRisk: this.frost.risk,
    pestDiseaseRisk: this.pestDiseaseRisk.overall
  };
};

environmentDataSchema.methods.isOptimalForPlanting = function(plantRequirements: any): boolean {
  const temp = this.weather.temperature.current;
  const humidity = this.weather.humidity.relative;
  const soilMoisture = this.soil.moisture.surface;
  
  return (
    temp >= plantRequirements.temperature.min &&
    temp <= plantRequirements.temperature.max &&
    humidity >= plantRequirements.humidity.min &&
    humidity <= plantRequirements.humidity.max &&
    soilMoisture >= 30 && // Minimum soil moisture for planting
    this.frost.risk === 'none' &&
    this.pestDiseaseRisk.overall !== 'severe'
  );
};

environmentDataSchema.methods.getIrrigationRecommendation = function(): string {
  const soilMoisture = this.soil.moisture.surface;
  const precipitation = this.weather.precipitation.daily;
  const temperature = this.weather.temperature.current;
  
  if (soilMoisture < 30) {
    return 'irrigate_immediately';
  } else if (soilMoisture < 50 && precipitation < 5) {
    return 'irrigate_soon';
  } else if (soilMoisture < 70 && temperature > 25) {
    return 'monitor_closely';
  } else {
    return 'no_irrigation_needed';
  }
};

// Static methods
environmentDataSchema.statics.findByFarm = function(farmId: string) {
  return this.find({ farmId, isActive: true });
};

environmentDataSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    'weather.timestamp': { $gte: startDate, $lte: endDate },
    isActive: true
  });
};

environmentDataSchema.statics.findByLocation = function(latitude: number, longitude: number, radius: number = 10) {
  return this.find({
    'location.latitude': {
      $gte: latitude - radius,
      $lte: latitude + radius
    },
    'location.longitude': {
      $gte: longitude - radius,
      $lte: longitude + radius
    },
    isActive: true
  });
};

environmentDataSchema.statics.findHighRiskConditions = function() {
  return this.find({
    $or: [
      { 'frost.risk': { $in: ['high', 'severe'] } },
      { 'pestDiseaseRisk.overall': { $in: ['high', 'severe'] } },
      { 'drought.level': { $in: ['severely_dry', 'extremely_dry'] } },
      { 'airQuality.level': { $in: ['unhealthy', 'very_unhealthy', 'hazardous'] } }
    ],
    isActive: true
  });
};

environmentDataSchema.statics.getWeatherTrends = function(farmId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        farmId,
        'weather.timestamp': { $gte: startDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        avgTemperature: { $avg: '$weather.temperature.current' },
        avgHumidity: { $avg: '$weather.humidity.relative' },
        totalPrecipitation: { $sum: '$weather.precipitation.daily' },
        avgWindSpeed: { $avg: '$weather.wind.speed' },
        maxTemperature: { $max: '$weather.temperature.max' },
        minTemperature: { $min: '$weather.temperature.min' }
      }
    }
  ]);
};

// Transform to JSON
environmentDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const EnvironmentData = mongoose.model<IEnvironmentDataDocument>('EnvironmentData', environmentDataSchema);
