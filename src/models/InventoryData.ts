import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Inventory Data Interface
 * Tracks predicted and actual stock levels for farm materials
 */
export interface IInventoryData {
  _id?: string;
  itemId: string; // Unique item identifier
  
  // Basic Information
  basicInfo: {
    name: string;
    category: 'seeds' | 'fertilizer' | 'pesticide' | 'equipment' | 'tools' | 'packaging' | 'other';
    subcategory: string;
    brand: string;
    model?: string;
    sku: string;
    description: string;
    unit: 'kg' | 'g' | 'l' | 'ml' | 'pieces' | 'bags' | 'boxes' | 'pallets';
    status: 'active' | 'inactive' | 'discontinued' | 'recalled';
  };
  
  // Plant Requirements (for seeds, fertilizers, pesticides)
  plantRequirements?: {
    applicablePlants: string[]; // PlantData IDs
    applicationRate: number; // per plant or per area
    applicationUnit: 'per_plant' | 'per_sqm' | 'per_hectare';
    applicationMethod: 'soil' | 'foliar' | 'seed_treatment' | 'irrigation' | 'spray';
    applicationTiming: 'pre_planting' | 'at_planting' | 'post_planting' | 'harvest' | 'continuous';
    frequency: 'once' | 'weekly' | 'monthly' | 'seasonal' | 'as_needed';
    safetyInterval: number; // days before harvest
  };
  
  // Stock Information
  stock: {
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    reservedStock: number; // Stock allocated to orders
    availableStock: number; // Current - Reserved
    lastStockUpdate: Date;
    stockMovements: {
      id: string;
      date: Date;
      type: 'in' | 'out' | 'adjustment' | 'transfer';
      quantity: number;
      reason: string;
      reference: string; // Order ID, Transfer ID, etc.
      cost: number; // USD
      location: string; // Warehouse, Farm, etc.
    }[];
  };
  
  // Pricing Information
  pricing: {
    costPrice: number; // USD per unit
    sellingPrice: number; // USD per unit
    margin: number; // percentage
    currency: string;
    priceHistory: {
      date: Date;
      costPrice: number;
      sellingPrice: number;
      supplier: string;
    }[];
    bulkPricing?: {
      minQuantity: number;
      maxQuantity: number;
      price: number; // USD per unit
    }[];
  };
  
  // Supplier Information
  supplier: {
    primarySupplier: {
      name: string;
      contact: string;
      phone: string;
      email: string;
      address: string;
      leadTime: number; // days
      minimumOrder: number;
      paymentTerms: string;
      reliability: number; // 1-10 scale
    };
    alternateSuppliers: {
      name: string;
      contact: string;
      phone: string;
      email: string;
      leadTime: number;
      minimumOrder: number;
      reliability: number;
    }[];
    lastOrderDate?: Date;
    lastDeliveryDate?: Date;
  };
  
  // Quality and Specifications
  specifications: {
    expiryDate?: Date;
    batchNumber?: string;
    lotNumber?: string;
    qualityGrade: 'premium' | 'standard' | 'economy';
    certifications: string[]; // e.g., ['Organic', 'Non-GMO', 'ISO 9001']
    technicalSpecs: {
      [key: string]: any;
    };
    storageRequirements: {
      temperature: {
        min: number; // Celsius
        max: number; // Celsius
      };
      humidity: {
        min: number; // Percentage
        max: number; // Percentage
      };
      light: 'dark' | 'low_light' | 'bright_light';
      ventilation: boolean;
      specialHandling: string[];
    };
  };
  
  // Usage Analytics
  analytics: {
    totalUsed: number;
    totalPurchased: number;
    averageMonthlyUsage: number;
    usageTrend: 'increasing' | 'stable' | 'decreasing';
    seasonalPattern: {
      peakMonths: string[];
      lowMonths: string[];
      averageMonthlyUsage: number;
    };
    costAnalysis: {
      totalCost: number; // USD
      averageCost: number; // USD per unit
      costTrend: 'increasing' | 'stable' | 'decreasing';
    };
    efficiency: {
      wastePercentage: number; // percentage
      utilizationRate: number; // percentage
      shelfLifeUtilization: number; // percentage
    };
  };
  
  // Demand Forecasting
  forecasting: {
    predictedDemand: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
    };
    demandFactors: {
      seasonal: number; // multiplier
      growth: number; // multiplier
      market: number; // multiplier
    };
    accuracy: number; // percentage
    lastForecastUpdate: Date;
  };
  
  // Location and Storage
  location: {
    warehouse: string;
    section: string;
    shelf: string;
    position: string;
    storageType: 'ambient' | 'refrigerated' | 'frozen' | 'controlled_atmosphere';
    capacity: number;
    utilization: number; // percentage
  };
  
  // Alerts and Notifications
  alerts: {
    lowStock: boolean;
    expiryWarning: boolean;
    qualityIssue: boolean;
    priceChange: boolean;
    supplierIssue: boolean;
    lastAlertDate?: Date;
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Inventory Data Document Interface
 */
export interface IInventoryDataDocument extends Omit<IInventoryData, '_id'>, Document {}

/**
 * Inventory Data Schema
 */
const inventoryDataSchema = new Schema<IInventoryDataDocument>({
  itemId: {
    type: String,
    required: true,
    trim: true
  },
  
  basicInfo: {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      required: true,
      enum: ['seeds', 'fertilizer', 'pesticide', 'equipment', 'tools', 'packaging', 'other']
    },
    subcategory: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, trim: true },
    sku: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'l', 'ml', 'pieces', 'bags', 'boxes', 'pallets']
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'discontinued', 'recalled'],
      default: 'active'
    }
  },
  
  plantRequirements: {
    applicablePlants: [{ type: String, ref: 'PlantData' }],
    applicationRate: { type: Number, min: 0 },
    applicationUnit: {
      type: String,
      enum: ['per_plant', 'per_sqm', 'per_hectare']
    },
    applicationMethod: {
      type: String,
      enum: ['soil', 'foliar', 'seed_treatment', 'irrigation', 'spray']
    },
    applicationTiming: {
      type: String,
      enum: ['pre_planting', 'at_planting', 'post_planting', 'harvest', 'continuous']
    },
    frequency: {
      type: String,
      enum: ['once', 'weekly', 'monthly', 'seasonal', 'as_needed']
    },
    safetyInterval: { type: Number, min: 0 }
  },
  
  stock: {
    currentStock: { type: Number, required: true, min: 0 },
    minimumStock: { type: Number, required: true, min: 0 },
    maximumStock: { type: Number, required: true, min: 0 },
    reorderPoint: { type: Number, required: true, min: 0 },
    reorderQuantity: { type: Number, required: true, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    availableStock: { type: Number, default: 0, min: 0 },
    lastStockUpdate: { type: Date, default: Date.now },
    stockMovements: [{
      id: { type: String, required: true },
      date: { type: Date, required: true },
      type: {
        type: String,
        required: true,
        enum: ['in', 'out', 'adjustment', 'transfer']
      },
      quantity: { type: Number, required: true },
      reason: { type: String, required: true, trim: true },
      reference: { type: String, trim: true },
      cost: { type: Number, required: true, min: 0 },
      location: { type: String, required: true, trim: true }
    }]
  },
  
  pricing: {
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    margin: { type: Number, required: true, min: 0, max: 100 },
    currency: { type: String, required: true, default: 'USD' },
    priceHistory: [{
      date: { type: Date, required: true },
      costPrice: { type: Number, required: true, min: 0 },
      sellingPrice: { type: Number, required: true, min: 0 },
      supplier: { type: String, required: true, trim: true }
    }],
    bulkPricing: [{
      minQuantity: { type: Number, required: true, min: 0 },
      maxQuantity: { type: Number, required: true, min: 0 },
      price: { type: Number, required: true, min: 0 }
    }]
  },
  
  supplier: {
    primarySupplier: {
      name: { type: String, required: true, trim: true },
      contact: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      address: { type: String, required: true, trim: true },
      leadTime: { type: Number, required: true, min: 0 },
      minimumOrder: { type: Number, required: true, min: 0 },
      paymentTerms: { type: String, required: true, trim: true },
      reliability: { type: Number, required: true, min: 1, max: 10 }
    },
    alternateSuppliers: [{
      name: { type: String, required: true, trim: true },
      contact: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      leadTime: { type: Number, required: true, min: 0 },
      minimumOrder: { type: Number, required: true, min: 0 },
      reliability: { type: Number, required: true, min: 1, max: 10 }
    }],
    lastOrderDate: { type: Date },
    lastDeliveryDate: { type: Date }
  },
  
  specifications: {
    expiryDate: { type: Date },
    batchNumber: { type: String, trim: true },
    lotNumber: { type: String, trim: true },
    qualityGrade: {
      type: String,
      enum: ['premium', 'standard', 'economy'],
      default: 'standard'
    },
    certifications: [{ type: String, trim: true }],
    technicalSpecs: { type: Schema.Types.Mixed, default: {} },
    storageRequirements: {
      temperature: {
        min: { type: Number, min: -50, max: 50 },
        max: { type: Number, min: -50, max: 50 }
      },
      humidity: {
        min: { type: Number, min: 0, max: 100 },
        max: { type: Number, min: 0, max: 100 }
      },
      light: {
        type: String,
        enum: ['dark', 'low_light', 'bright_light'],
        default: 'dark'
      },
      ventilation: { type: Boolean, default: false },
      specialHandling: [{ type: String, trim: true }]
    }
  },
  
  analytics: {
    totalUsed: { type: Number, default: 0, min: 0 },
    totalPurchased: { type: Number, default: 0, min: 0 },
    averageMonthlyUsage: { type: Number, default: 0, min: 0 },
    usageTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    seasonalPattern: {
      peakMonths: [{ type: String }],
      lowMonths: [{ type: String }],
      averageMonthlyUsage: { type: Number, default: 0, min: 0 }
    },
    costAnalysis: {
      totalCost: { type: Number, default: 0, min: 0 },
      averageCost: { type: Number, default: 0, min: 0 },
      costTrend: {
        type: String,
        enum: ['increasing', 'stable', 'decreasing'],
        default: 'stable'
      }
    },
    efficiency: {
      wastePercentage: { type: Number, default: 0, min: 0, max: 100 },
      utilizationRate: { type: Number, default: 0, min: 0, max: 100 },
      shelfLifeUtilization: { type: Number, default: 0, min: 0, max: 100 }
    }
  },
  
  forecasting: {
    predictedDemand: {
      nextMonth: { type: Number, default: 0, min: 0 },
      nextQuarter: { type: Number, default: 0, min: 0 },
      nextYear: { type: Number, default: 0, min: 0 }
    },
    demandFactors: {
      seasonal: { type: Number, default: 1, min: 0 },
      growth: { type: Number, default: 1, min: 0 },
      market: { type: Number, default: 1, min: 0 }
    },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    lastForecastUpdate: { type: Date, default: Date.now }
  },
  
  location: {
    warehouse: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    shelf: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    storageType: {
      type: String,
      required: true,
      enum: ['ambient', 'refrigerated', 'frozen', 'controlled_atmosphere']
    },
    capacity: { type: Number, required: true, min: 0 },
    utilization: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  alerts: {
    lowStock: { type: Boolean, default: false },
    expiryWarning: { type: Boolean, default: false },
    qualityIssue: { type: Boolean, default: false },
    priceChange: { type: Boolean, default: false },
    supplierIssue: { type: Boolean, default: false },
    lastAlertDate: { type: Date }
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
  collection: 'inventorydata'
});

// Indexes for performance
inventoryDataSchema.index({ itemId: 1 }, { unique: true });
inventoryDataSchema.index({ 'basicInfo.sku': 1 }, { unique: true });
inventoryDataSchema.index({ 'basicInfo.category': 1 });
inventoryDataSchema.index({ 'basicInfo.status': 1 });
inventoryDataSchema.index({ 'stock.currentStock': 1 });
inventoryDataSchema.index({ 'stock.reorderPoint': 1 });
inventoryDataSchema.index({ 'specifications.expiryDate': 1 });
inventoryDataSchema.index({ 'location.warehouse': 1 });
inventoryDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
inventoryDataSchema.pre('save', function(next) {
  // Calculate available stock
  this.stock.availableStock = this.stock.currentStock - this.stock.reservedStock;
  
  // Calculate margin
  if (this.pricing.costPrice > 0) {
    this.pricing.margin = ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice) * 100;
  }
  
  // Update alerts
  this.alerts.lowStock = this.stock.currentStock <= this.stock.reorderPoint;
  
  if (this.specifications.expiryDate) {
    const daysToExpiry = Math.ceil((this.specifications.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    this.alerts.expiryWarning = daysToExpiry <= 30 && daysToExpiry > 0;
  }
  
  // Validate stock levels
  if (this.stock.currentStock < 0) {
    return next(new Error('Current stock cannot be negative'));
  }
  
  if (this.stock.minimumStock > this.stock.maximumStock) {
    return next(new Error('Minimum stock cannot be greater than maximum stock'));
  }
  
  if (this.stock.reorderPoint > this.stock.maximumStock) {
    return next(new Error('Reorder point cannot be greater than maximum stock'));
  }
  
  next();
});

// Instance methods
inventoryDataSchema.methods.isLowStock = function(): boolean {
  return this.stock.currentStock <= this.stock.reorderPoint;
};

inventoryDataSchema.methods.isOutOfStock = function(): boolean {
  return this.stock.currentStock <= 0;
};

inventoryDataSchema.methods.getStockValue = function(): number {
  return this.stock.currentStock * this.pricing.costPrice;
};

inventoryDataSchema.methods.getDaysToExpiry = function(): number {
  if (!this.specifications.expiryDate) return 0;
  const now = new Date();
  const expiryDate = new Date(this.specifications.expiryDate);
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

inventoryDataSchema.methods.isExpired = function(): boolean {
  if (!this.specifications.expiryDate) return false;
  return new Date() > this.specifications.expiryDate;
};

inventoryDataSchema.methods.addStockMovement = function(movement: any) {
  this.stock.stockMovements.push(movement);
  this.stock.lastStockUpdate = new Date();
  
  // Update stock based on movement type
  switch (movement.type) {
    case 'in':
      this.stock.currentStock += movement.quantity;
      this.analytics.totalPurchased += movement.quantity;
      break;
    case 'out':
      this.stock.currentStock -= movement.quantity;
      this.analytics.totalUsed += movement.quantity;
      break;
    case 'adjustment':
      this.stock.currentStock = movement.quantity;
      break;
  }
  
  // Update cost analysis
  if (movement.cost > 0) {
    this.analytics.costAnalysis.totalCost += movement.cost;
    this.analytics.costAnalysis.averageCost = this.analytics.costAnalysis.totalCost / this.analytics.totalPurchased;
  }
};

inventoryDataSchema.methods.reserveStock = function(quantity: number): boolean {
  if (this.stock.availableStock >= quantity) {
    this.stock.reservedStock += quantity;
    return true;
  }
  return false;
};

inventoryDataSchema.methods.releaseStock = function(quantity: number) {
  this.stock.reservedStock = Math.max(0, this.stock.reservedStock - quantity);
};

inventoryDataSchema.methods.getOptimalOrderQuantity = function(): number {
  // Simple EOQ (Economic Order Quantity) calculation
  const annualDemand = this.analytics.averageMonthlyUsage * 12;
  const orderingCost = 50; // Fixed ordering cost
  const holdingCost = this.pricing.costPrice * 0.2; // 20% of cost price
  
  if (holdingCost === 0) return this.stock.reorderQuantity;
  
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  return Math.ceil(eoq);
};

inventoryDataSchema.methods.updateForecast = function(demandData: any) {
  this.forecasting.predictedDemand = demandData;
  this.forecasting.lastForecastUpdate = new Date();
};

// Static methods
inventoryDataSchema.statics.findByCategory = function(category: string) {
  return this.find({ 'basicInfo.category': category, isActive: true });
};

inventoryDataSchema.statics.findLowStock = function() {
  return this.find({ 
    $expr: { $lte: ['$stock.currentStock', '$stock.reorderPoint'] },
    isActive: true 
  });
};

inventoryDataSchema.statics.findExpiring = function(days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  return this.find({
    'specifications.expiryDate': { $lte: cutoffDate, $gte: new Date() },
    isActive: true
  });
};

inventoryDataSchema.statics.findByPlant = function(plantDataId: string) {
  return this.find({ 
    'plantRequirements.applicablePlants': plantDataId,
    isActive: true 
  });
};

inventoryDataSchema.statics.findBySupplier = function(supplierName: string) {
  return this.find({
    $or: [
      { 'supplier.primarySupplier.name': supplierName },
      { 'supplier.alternateSuppliers.name': supplierName }
    ],
    isActive: true
  });
};

inventoryDataSchema.statics.findByLocation = function(warehouse: string) {
  return this.find({ 'location.warehouse': warehouse, isActive: true });
};

inventoryDataSchema.statics.getTotalInventoryValue = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalValue: {
          $sum: {
            $multiply: ['$stock.currentStock', '$pricing.costPrice']
          }
        }
      }
    }
  ]);
};

// Transform to JSON
inventoryDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const InventoryData = mongoose.model<IInventoryDataDocument>('InventoryData', inventoryDataSchema);
