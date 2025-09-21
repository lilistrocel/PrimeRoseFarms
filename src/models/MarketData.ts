import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Market Data Interface
 * Market pricing and demand data for agricultural products
 */
export interface IMarketData {
  _id?: string;
  productId: string; // Reference to PlantData
  
  // Market Information
  marketInfo: {
    name: string;
    location: {
      city: string;
      state: string;
      country: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    type: 'wholesale' | 'retail' | 'farmers_market' | 'online' | 'export' | 'import';
    size: 'local' | 'regional' | 'national' | 'international';
    seasonality: string[]; // Peak months
  };
  
  // Price Data
  pricing: {
    current: {
      price: number; // USD per unit
      unit: 'kg' | 'lb' | 'bushel' | 'ton' | 'piece' | 'bunch' | 'head';
      quality: 'premium' | 'standard' | 'economy';
      grade: 'A' | 'B' | 'C' | 'D';
      organic: boolean;
      lastUpdated: Date;
    };
    historical: {
      date: Date;
      price: number; // USD per unit
      volume: number; // units traded
      quality: string;
      grade: string;
      organic: boolean;
      source: string;
    }[];
    trends: {
      shortTerm: 'increasing' | 'decreasing' | 'stable' | 'volatile';
      longTerm: 'increasing' | 'decreasing' | 'stable' | 'volatile';
      volatility: number; // percentage
      averagePrice: number; // USD per unit
      priceRange: {
        min: number; // USD per unit
        max: number; // USD per unit
      };
    };
  };
  
  // Demand Analysis
  demand: {
    current: {
      level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
      volume: number; // units per day
      growth: number; // percentage change
      lastUpdated: Date;
    };
    seasonal: {
      month: string;
      demandLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
      priceMultiplier: number; // multiplier for base price
      volumeMultiplier: number; // multiplier for base volume
    }[];
    factors: {
      weather: number; // impact factor (-1 to 1)
      holidays: number; // impact factor (-1 to 1)
      competition: number; // impact factor (-1 to 1)
      supply: number; // impact factor (-1 to 1)
      consumer_trends: number; // impact factor (-1 to 1)
    };
  };
  
  // Supply Analysis
  supply: {
    current: {
      level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
      volume: number; // units available
      quality: 'premium' | 'standard' | 'economy';
      lastUpdated: Date;
    };
    sources: {
      local: number; // percentage
      regional: number; // percentage
      national: number; // percentage
      international: number; // percentage
    };
    competitors: {
      name: string;
      marketShare: number; // percentage
      priceRange: {
        min: number; // USD per unit
        max: number; // USD per unit
      };
      quality: string;
      location: string;
    }[];
  };
  
  // Market Intelligence
  intelligence: {
    news: {
      date: Date;
      title: string;
      content: string;
      impact: 'positive' | 'negative' | 'neutral';
      source: string;
      relevance: number; // 1-10 scale
    }[];
    events: {
      date: Date;
      type: 'harvest' | 'festival' | 'trade_show' | 'weather' | 'policy' | 'other';
      description: string;
      impact: 'positive' | 'negative' | 'neutral';
      duration: number; // days
    }[];
    regulations: {
      name: string;
      type: 'import' | 'export' | 'quality' | 'safety' | 'environmental';
      description: string;
      effectiveDate: Date;
      impact: 'positive' | 'negative' | 'neutral';
      complianceCost: number; // USD
    }[];
  };
  
  // Price Forecasting
  forecasting: {
    shortTerm: {
      nextWeek: number; // USD per unit
      nextMonth: number; // USD per unit
      confidence: number; // percentage
    };
    longTerm: {
      nextQuarter: number; // USD per unit
      nextYear: number; // USD per unit
      confidence: number; // percentage
    };
    scenarios: {
      optimistic: {
        price: number; // USD per unit
        probability: number; // percentage
      };
      realistic: {
        price: number; // USD per unit
        probability: number; // percentage
      };
      pessimistic: {
        price: number; // USD per unit
        probability: number; // percentage
      };
    };
    factors: {
      weather: number; // impact factor
      demand: number; // impact factor
      supply: number; // impact factor
      competition: number; // impact factor
      seasonality: number; // impact factor
    };
    lastUpdated: Date;
  };
  
  // Quality Standards
  qualityStandards: {
    grades: {
      grade: 'A' | 'B' | 'C' | 'D';
      description: string;
      priceMultiplier: number;
      requirements: string[];
    }[];
    certifications: {
      name: string;
      description: string;
      pricePremium: number; // percentage
      requirements: string[];
      marketDemand: 'low' | 'moderate' | 'high';
    }[];
    testing: {
      parameters: string[];
      methods: string[];
      frequency: string;
      cost: number; // USD per test
    };
  };
  
  // Logistics and Distribution
  logistics: {
    transportation: {
      cost: number; // USD per unit per km
      methods: string[];
      timeToMarket: number; // days
      reliability: number; // percentage
    };
    storage: {
      cost: number; // USD per unit per day
      capacity: number; // units
      conditions: string[];
      shelfLife: number; // days
    };
    packaging: {
      cost: number; // USD per unit
      types: string[];
      requirements: string[];
      sustainability: number; // percentage
    };
  };
  
  // Market Opportunities
  opportunities: {
    emerging: {
      market: string;
      potential: 'low' | 'moderate' | 'high';
      barriers: string[];
      timeline: string;
    }[];
    expansion: {
      region: string;
      marketSize: number; // units
      competition: 'low' | 'moderate' | 'high';
      entryCost: number; // USD
    }[];
    partnerships: {
      type: 'distributor' | 'retailer' | 'processor' | 'exporter';
      name: string;
      contact: string;
      potential: 'low' | 'moderate' | 'high';
    }[];
  };
  
  // Risk Assessment
  risks: {
    price: {
      volatility: 'low' | 'moderate' | 'high';
      factors: string[];
      mitigation: string[];
    };
    supply: {
      reliability: 'low' | 'moderate' | 'high';
      factors: string[];
      mitigation: string[];
    };
    demand: {
      stability: 'low' | 'moderate' | 'high';
      factors: string[];
      mitigation: string[];
    };
    regulatory: {
      level: 'low' | 'moderate' | 'high';
      factors: string[];
      mitigation: string[];
    };
  };
  
  // Performance Metrics
  performance: {
    priceAccuracy: number; // percentage
    demandAccuracy: number; // percentage
    forecastAccuracy: number; // percentage
    marketShare: number; // percentage
    profitability: number; // percentage
    customerSatisfaction: number; // 1-10 scale
  };
  
  // Data Source Information
  dataSource: {
    provider: string;
    apiKey?: string;
    lastUpdate: Date;
    reliability: number; // 1-10 scale
    coverage: number; // percentage
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Market Data Document Interface
 */
export interface IMarketDataDocument extends Omit<IMarketData, '_id'>, Document {}

/**
 * Market Data Schema
 */
const marketDataSchema = new Schema<IMarketDataDocument>({
  productId: {
    type: String,
    required: true,
    ref: 'PlantData'
  },
  
  marketInfo: {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    location: {
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 }
      }
    },
    type: {
      type: String,
      required: true,
      enum: ['wholesale', 'retail', 'farmers_market', 'online', 'export', 'import']
    },
    size: {
      type: String,
      required: true,
      enum: ['local', 'regional', 'national', 'international']
    },
    seasonality: [{ type: String, trim: true }]
  },
  
  pricing: {
    current: {
      price: { type: Number, required: true, min: 0 },
      unit: {
        type: String,
        required: true,
        enum: ['kg', 'lb', 'bushel', 'ton', 'piece', 'bunch', 'head']
      },
      quality: {
        type: String,
        required: true,
        enum: ['premium', 'standard', 'economy']
      },
      grade: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
      },
      organic: { type: Boolean, default: false },
      lastUpdated: { type: Date, default: Date.now }
    },
    historical: [{
      date: { type: Date, required: true },
      price: { type: Number, required: true, min: 0 },
      volume: { type: Number, required: true, min: 0 },
      quality: { type: String, required: true, trim: true },
      grade: { type: String, required: true, trim: true },
      organic: { type: Boolean, default: false },
      source: { type: String, required: true, trim: true }
    }],
    trends: {
      shortTerm: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'volatile'],
        default: 'stable'
      },
      longTerm: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'volatile'],
        default: 'stable'
      },
      volatility: { type: Number, default: 0, min: 0, max: 100 },
      averagePrice: { type: Number, default: 0, min: 0 },
      priceRange: {
        min: { type: Number, default: 0, min: 0 },
        max: { type: Number, default: 0, min: 0 }
      }
    }
  },
  
  demand: {
    current: {
      level: {
        type: String,
        enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
        default: 'moderate'
      },
      volume: { type: Number, default: 0, min: 0 },
      growth: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    seasonal: [{
      month: { type: String, required: true, trim: true },
      demandLevel: {
        type: String,
        enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
        default: 'moderate'
      },
      priceMultiplier: { type: Number, default: 1, min: 0 },
      volumeMultiplier: { type: Number, default: 1, min: 0 }
    }],
    factors: {
      weather: { type: Number, default: 0, min: -1, max: 1 },
      holidays: { type: Number, default: 0, min: -1, max: 1 },
      competition: { type: Number, default: 0, min: -1, max: 1 },
      supply: { type: Number, default: 0, min: -1, max: 1 },
      consumer_trends: { type: Number, default: 0, min: -1, max: 1 }
    }
  },
  
  supply: {
    current: {
      level: {
        type: String,
        enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
        default: 'moderate'
      },
      volume: { type: Number, default: 0, min: 0 },
      quality: {
        type: String,
        enum: ['premium', 'standard', 'economy'],
        default: 'standard'
      },
      lastUpdated: { type: Date, default: Date.now }
    },
    sources: {
      local: { type: Number, default: 0, min: 0, max: 100 },
      regional: { type: Number, default: 0, min: 0, max: 100 },
      national: { type: Number, default: 0, min: 0, max: 100 },
      international: { type: Number, default: 0, min: 0, max: 100 }
    },
    competitors: [{
      name: { type: String, required: true, trim: true },
      marketShare: { type: Number, required: true, min: 0, max: 100 },
      priceRange: {
        min: { type: Number, required: true, min: 0 },
        max: { type: Number, required: true, min: 0 }
      },
      quality: { type: String, required: true, trim: true },
      location: { type: String, required: true, trim: true }
    }]
  },
  
  intelligence: {
    news: [{
      date: { type: Date, required: true },
      title: { type: String, required: true, trim: true },
      content: { type: String, required: true, trim: true },
      impact: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral'
      },
      source: { type: String, required: true, trim: true },
      relevance: { type: Number, required: true, min: 1, max: 10 }
    }],
    events: [{
      date: { type: Date, required: true },
      type: {
        type: String,
        enum: ['harvest', 'festival', 'trade_show', 'weather', 'policy', 'other'],
        default: 'other'
      },
      description: { type: String, required: true, trim: true },
      impact: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral'
      },
      duration: { type: Number, required: true, min: 0 }
    }],
    regulations: [{
      name: { type: String, required: true, trim: true },
      type: {
        type: String,
        enum: ['import', 'export', 'quality', 'safety', 'environmental'],
        default: 'quality'
      },
      description: { type: String, required: true, trim: true },
      effectiveDate: { type: Date, required: true },
      impact: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral'
      },
      complianceCost: { type: Number, default: 0, min: 0 }
    }]
  },
  
  forecasting: {
    shortTerm: {
      nextWeek: { type: Number, min: 0 },
      nextMonth: { type: Number, min: 0 },
      confidence: { type: Number, min: 0, max: 100 }
    },
    longTerm: {
      nextQuarter: { type: Number, min: 0 },
      nextYear: { type: Number, min: 0 },
      confidence: { type: Number, min: 0, max: 100 }
    },
    scenarios: {
      optimistic: {
        price: { type: Number, min: 0 },
        probability: { type: Number, min: 0, max: 100 }
      },
      realistic: {
        price: { type: Number, min: 0 },
        probability: { type: Number, min: 0, max: 100 }
      },
      pessimistic: {
        price: { type: Number, min: 0 },
        probability: { type: Number, min: 0, max: 100 }
      }
    },
    factors: {
      weather: { type: Number, min: -1, max: 1 },
      demand: { type: Number, min: -1, max: 1 },
      supply: { type: Number, min: -1, max: 1 },
      competition: { type: Number, min: -1, max: 1 },
      seasonality: { type: Number, min: -1, max: 1 }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  qualityStandards: {
    grades: [{
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true
      },
      description: { type: String, required: true, trim: true },
      priceMultiplier: { type: Number, required: true, min: 0 },
      requirements: [{ type: String, trim: true }]
    }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      pricePremium: { type: Number, default: 0, min: 0, max: 100 },
      requirements: [{ type: String, trim: true }],
      marketDemand: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      }
    }],
    testing: {
      parameters: [{ type: String, trim: true }],
      methods: [{ type: String, trim: true }],
      frequency: { type: String, trim: true },
      cost: { type: Number, default: 0, min: 0 }
    }
  },
  
  logistics: {
    transportation: {
      cost: { type: Number, default: 0, min: 0 },
      methods: [{ type: String, trim: true }],
      timeToMarket: { type: Number, default: 0, min: 0 },
      reliability: { type: Number, default: 100, min: 0, max: 100 }
    },
    storage: {
      cost: { type: Number, default: 0, min: 0 },
      capacity: { type: Number, default: 0, min: 0 },
      conditions: [{ type: String, trim: true }],
      shelfLife: { type: Number, default: 0, min: 0 }
    },
    packaging: {
      cost: { type: Number, default: 0, min: 0 },
      types: [{ type: String, trim: true }],
      requirements: [{ type: String, trim: true }],
      sustainability: { type: Number, default: 0, min: 0, max: 100 }
    }
  },
  
  opportunities: {
    emerging: [{
      market: { type: String, required: true, trim: true },
      potential: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      barriers: [{ type: String, trim: true }],
      timeline: { type: String, trim: true }
    }],
    expansion: [{
      region: { type: String, required: true, trim: true },
      marketSize: { type: Number, required: true, min: 0 },
      competition: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      entryCost: { type: Number, required: true, min: 0 }
    }],
    partnerships: [{
      type: {
        type: String,
        enum: ['distributor', 'retailer', 'processor', 'exporter'],
        required: true
      },
      name: { type: String, required: true, trim: true },
      contact: { type: String, required: true, trim: true },
      potential: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      }
    }]
  },
  
  risks: {
    price: {
      volatility: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      factors: [{ type: String, trim: true }],
      mitigation: [{ type: String, trim: true }]
    },
    supply: {
      reliability: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      factors: [{ type: String, trim: true }],
      mitigation: [{ type: String, trim: true }]
    },
    demand: {
      stability: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      factors: [{ type: String, trim: true }],
      mitigation: [{ type: String, trim: true }]
    },
    regulatory: {
      level: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      factors: [{ type: String, trim: true }],
      mitigation: [{ type: String, trim: true }]
    }
  },
  
  performance: {
    priceAccuracy: { type: Number, default: 0, min: 0, max: 100 },
    demandAccuracy: { type: Number, default: 0, min: 0, max: 100 },
    forecastAccuracy: { type: Number, default: 0, min: 0, max: 100 },
    marketShare: { type: Number, default: 0, min: 0, max: 100 },
    profitability: { type: Number, default: 0, min: 0, max: 100 },
    customerSatisfaction: { type: Number, default: 5, min: 1, max: 10 }
  },
  
  dataSource: {
    provider: { type: String, required: true, trim: true },
    apiKey: { type: String, trim: true },
    lastUpdate: { type: Date, required: true },
    reliability: { type: Number, required: true, min: 1, max: 10 },
    coverage: { type: Number, required: true, min: 0, max: 100 },
    frequency: {
      type: String,
      enum: ['real_time', 'hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily'
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
  collection: 'marketdata'
});

// Indexes for performance
marketDataSchema.index({ productId: 1, isActive: 1 });
marketDataSchema.index({ 'marketInfo.type': 1 });
marketDataSchema.index({ 'marketInfo.size': 1 });
marketDataSchema.index({ 'pricing.current.lastUpdated': -1 });
marketDataSchema.index({ 'demand.current.level': 1 });
marketDataSchema.index({ 'supply.current.level': 1 });
marketDataSchema.index({ 'forecasting.lastUpdated': -1 });
marketDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
marketDataSchema.pre('save', function(next) {
  // Calculate price trends
  if (this.pricing.historical.length > 0) {
    const recentPrices = this.pricing.historical.slice(-30).map(h => h.price);
    const olderPrices = this.pricing.historical.slice(-60, -30).map(h => h.price);
    
    if (recentPrices.length > 0 && olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((sum: number, price: number) => sum + price, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((sum: number, price: number) => sum + price, 0) / olderPrices.length;
      
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      if (change > 5) {
        this.pricing.trends.shortTerm = 'increasing';
      } else if (change < -5) {
        this.pricing.trends.shortTerm = 'decreasing';
      } else {
        this.pricing.trends.shortTerm = 'stable';
      }
    }
    
    // Calculate volatility
    const prices = this.pricing.historical.map(h => h.price);
    const mean = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum: number, price: number) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    this.pricing.trends.volatility = (stdDev / mean) * 100;
    
    // Calculate price range
    this.pricing.trends.priceRange.min = Math.min(...prices);
    this.pricing.trends.priceRange.max = Math.max(...prices);
    this.pricing.trends.averagePrice = mean;
  }
  
  // Validate supply sources percentages
  const totalSupply = this.supply.sources.local + this.supply.sources.regional + 
                     this.supply.sources.national + this.supply.sources.international;
  if (Math.abs(totalSupply - 100) > 0.1) {
    return next(new Error('Supply sources must total 100%'));
  }
  
  // Validate scenario probabilities
  const totalProbability = this.forecasting.scenarios.optimistic.probability +
                          this.forecasting.scenarios.realistic.probability +
                          this.forecasting.scenarios.pessimistic.probability;
  if (Math.abs(totalProbability - 100) > 0.1) {
    return next(new Error('Forecast scenario probabilities must total 100%'));
  }
  
  next();
});

// Instance methods
marketDataSchema.methods.getCurrentPrice = function(): number {
  return this.pricing.current.price;
};

marketDataSchema.methods.getPriceTrend = function(): string {
  return this.pricing.trends.shortTerm;
};

marketDataSchema.methods.getDemandLevel = function(): string {
  return this.demand.current.level;
};

marketDataSchema.methods.getSupplyLevel = function(): string {
  return this.supply.current.level;
};

marketDataSchema.methods.getMarketBalance = function(): string {
  const demandLevel = this.demand.current.level;
  const supplyLevel = this.supply.current.level;
  
  if (demandLevel === 'very_high' && supplyLevel === 'very_low') {
    return 'severe_shortage';
  } else if (demandLevel === 'high' && supplyLevel === 'low') {
    return 'shortage';
  } else if (demandLevel === 'low' && supplyLevel === 'high') {
    return 'surplus';
  } else if (demandLevel === 'very_low' && supplyLevel === 'very_high') {
    return 'severe_surplus';
  } else {
    return 'balanced';
  }
};

marketDataSchema.methods.getOptimalSellingPrice = function(): number {
  const basePrice = this.pricing.current.price;
  const demandMultiplier = this.getDemandMultiplier();
  const supplyMultiplier = this.getSupplyMultiplier();
  const seasonalMultiplier = this.getSeasonalMultiplier();
  
  return basePrice * demandMultiplier * supplyMultiplier * seasonalMultiplier;
};

marketDataSchema.methods.getDemandMultiplier = function(): number {
  switch (this.demand.current.level) {
    case 'very_high': return 1.2;
    case 'high': return 1.1;
    case 'moderate': return 1.0;
    case 'low': return 0.9;
    case 'very_low': return 0.8;
    default: return 1.0;
  }
};

marketDataSchema.methods.getSupplyMultiplier = function(): number {
  switch (this.supply.current.level) {
    case 'very_low': return 1.2;
    case 'low': return 1.1;
    case 'moderate': return 1.0;
    case 'high': return 0.9;
    case 'very_high': return 0.8;
    default: return 1.0;
  }
};

marketDataSchema.methods.getSeasonalMultiplier = function(): number {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const seasonalData = this.demand.seasonal.find((s: any) => s.month === currentMonth);
  return seasonalData ? seasonalData.priceMultiplier : 1.0;
};

marketDataSchema.methods.addPriceData = function(priceData: any) {
  this.pricing.historical.push({
    date: new Date(),
    price: priceData.price,
    volume: priceData.volume,
    quality: priceData.quality,
    grade: priceData.grade,
    organic: priceData.organic,
    source: priceData.source
  });
  
  // Update current price
  this.pricing.current.price = priceData.price;
  this.pricing.current.lastUpdated = new Date();
};

marketDataSchema.methods.updateForecast = function(forecastData: any) {
  this.forecasting.shortTerm = forecastData.shortTerm;
  this.forecasting.longTerm = forecastData.longTerm;
  this.forecasting.scenarios = forecastData.scenarios;
  this.forecasting.factors = forecastData.factors;
  this.forecasting.lastUpdated = new Date();
};

marketDataSchema.methods.getRiskLevel = function(): string {
  const risks = [
    this.risks.price.volatility,
    this.risks.supply.reliability,
    this.risks.demand.stability,
    this.risks.regulatory.level
  ];
  
  if (risks.includes('high')) {
    return 'high';
  } else if (risks.includes('moderate')) {
    return 'moderate';
  } else {
    return 'low';
  }
};

// Static methods
marketDataSchema.statics.findByProduct = function(productId: string) {
  return this.find({ productId, isActive: true });
};

marketDataSchema.statics.findByMarketType = function(type: string) {
  return this.find({ 'marketInfo.type': type, isActive: true });
};

marketDataSchema.statics.findByLocation = function(city: string, state: string) {
  return this.find({
    'marketInfo.location.city': city,
    'marketInfo.location.state': state,
    isActive: true
  });
};

marketDataSchema.statics.findHighDemand = function() {
  return this.find({
    'demand.current.level': { $in: ['high', 'very_high'] },
    isActive: true
  });
};

marketDataSchema.statics.findLowSupply = function() {
  return this.find({
    'supply.current.level': { $in: ['low', 'very_low'] },
    isActive: true
  });
};

marketDataSchema.statics.findPriceIncreasing = function() {
  return this.find({
    'pricing.trends.shortTerm': 'increasing',
    isActive: true
  });
};

marketDataSchema.statics.getMarketSummary = function(productId: string) {
  return this.aggregate([
    { $match: { productId, isActive: true } },
    {
      $group: {
        _id: null,
        averagePrice: { $avg: '$pricing.current.price' },
        minPrice: { $min: '$pricing.current.price' },
        maxPrice: { $max: '$pricing.current.price' },
        totalMarkets: { $sum: 1 },
        highDemandMarkets: {
          $sum: { $cond: [{ $in: ['$demand.current.level', ['high', 'very_high']] }, 1, 0] }
        }
      }
    }
  ]);
};

// Transform to JSON
marketDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const MarketData = mongoose.model<IMarketDataDocument>('MarketData', marketDataSchema);
