import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Financial Data Interface
 * Comprehensive financial tracking and analysis
 */
export interface IFinancialData {
  _id?: string;
  farmId: string; // Reference to FarmData
  
  // Period Information
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    startDate: Date;
    endDate: Date;
    year: number;
    month?: number;
    quarter?: number;
    week?: number;
  };
  
  // Revenue
  revenue: {
    total: number; // USD
    breakdown: {
      cropSales: number; // USD
      seedSales: number; // USD
      consulting: number; // USD
      equipmentRental: number; // USD
      other: number; // USD
    };
    sources: {
      customerId: string;
      amount: number; // USD
      description: string;
      date: Date;
    }[];
  };
  
  // Operating Expenses
  operatingExpenses: {
    total: number; // USD
    breakdown: {
      labor: {
        salaries: number; // USD
        benefits: number; // USD
        overtime: number; // USD
        bonuses: number; // USD
        total: number; // USD
      };
      materials: {
        seeds: number; // USD
        fertilizer: number; // USD
        pesticides: number; // USD
        equipment: number; // USD
        packaging: number; // USD
        other: number; // USD
        total: number; // USD
      };
      utilities: {
        electricity: number; // USD
        water: number; // USD
        gas: number; // USD
        internet: number; // USD
        phone: number; // USD
        total: number; // USD
      };
      maintenance: {
        equipment: number; // USD
        facilities: number; // USD
        vehicles: number; // USD
        other: number; // USD
        total: number; // USD
      };
      logistics: {
        fuel: number; // USD
        vehicleMaintenance: number; // USD
        insurance: number; // USD
        tolls: number; // USD
        fines: number; // USD
        total: number; // USD
      };
      marketing: {
        advertising: number; // USD
        promotions: number; // USD
        events: number; // USD
        website: number; // USD
        total: number; // USD
      };
      professional: {
        legal: number; // USD
        accounting: number; // USD
        consulting: number; // USD
        licenses: number; // USD
        total: number; // USD
      };
      other: number; // USD
    };
  };
  
  // Capital Expenses (CAPEX)
  capitalExpenses: {
    total: number; // USD
    breakdown: {
      equipment: {
        machinery: number; // USD
        tools: number; // USD
        technology: number; // USD
        total: number; // USD
      };
      infrastructure: {
        buildings: number; // USD
        greenhouses: number; // USD
        irrigation: number; // USD
        fencing: number; // USD
        total: number; // USD
      };
      land: {
        purchase: number; // USD
        improvement: number; // USD
        total: number; // USD
      };
      vehicles: {
        trucks: number; // USD
        tractors: number; // USD
        other: number; // USD
        total: number; // USD
      };
      other: number; // USD
    };
  };
  
  // Financial Metrics
  metrics: {
    grossProfit: number; // USD
    operatingProfit: number; // USD
    netProfit: number; // USD
    ebitda: number; // USD (Earnings Before Interest, Taxes, Depreciation, Amortization)
    grossMargin: number; // percentage
    operatingMargin: number; // percentage
    netMargin: number; // percentage
    roi: number; // percentage (Return on Investment)
    roe: number; // percentage (Return on Equity)
    assetTurnover: number;
    currentRatio: number;
    quickRatio: number;
    debtToEquity: number;
  };
  
  // Cash Flow
  cashFlow: {
    operating: number; // USD
    investing: number; // USD
    financing: number; // USD
    netChange: number; // USD
    beginningBalance: number; // USD
    endingBalance: number; // USD
  };
  
  // Budget vs Actual
  budgetComparison: {
    revenue: {
      budgeted: number; // USD
      actual: number; // USD
      variance: number; // USD
      variancePercentage: number; // percentage
    };
    expenses: {
      budgeted: number; // USD
      actual: number; // USD
      variance: number; // USD
      variancePercentage: number; // percentage
    };
    profit: {
      budgeted: number; // USD
      actual: number; // USD
      variance: number; // USD
      variancePercentage: number; // percentage
    };
  };
  
  // Cost Analysis
  costAnalysis: {
    costPerKg: number; // USD per kg
    costPerSqm: number; // USD per square meter
    costPerPlant: number; // USD per plant
    laborCostPerKg: number; // USD per kg
    materialCostPerKg: number; // USD per kg
    utilityCostPerKg: number; // USD per kg
    overheadCostPerKg: number; // USD per kg
  };
  
  // Depreciation
  depreciation: {
    total: number; // USD
    breakdown: {
      equipment: number; // USD
      buildings: number; // USD
      vehicles: number; // USD
      other: number; // USD
    };
    methods: {
      straightLine: number; // USD
      decliningBalance: number; // USD
      unitsOfProduction: number; // USD
    };
  };
  
  // Taxes
  taxes: {
    income: number; // USD
    property: number; // USD
    sales: number; // USD
    payroll: number; // USD
    other: number; // USD
    total: number; // USD
  };
  
  // Investments
  investments: {
    total: number; // USD
    breakdown: {
      equipment: number; // USD
      technology: number; // USD
      research: number; // USD
      expansion: number; // USD
      other: number; // USD
    };
    expectedReturns: {
      equipment: number; // USD
      technology: number; // USD
      research: number; // USD
      expansion: number; // USD
      other: number; // USD
    };
  };
  
  // Loans and Debt
  debt: {
    total: number; // USD
    breakdown: {
      shortTerm: number; // USD
      longTerm: number; // USD
    };
    payments: {
      principal: number; // USD
      interest: number; // USD
      total: number; // USD
    };
    interestRate: number; // percentage
    maturityDate: Date;
  };
  
  // Financial Ratios
  ratios: {
    liquidity: {
      currentRatio: number;
      quickRatio: number;
      cashRatio: number;
    };
    leverage: {
      debtToEquity: number;
      debtToAssets: number;
      interestCoverage: number;
    };
    efficiency: {
      assetTurnover: number;
      inventoryTurnover: number;
      receivablesTurnover: number;
    };
    profitability: {
      grossMargin: number;
      operatingMargin: number;
      netMargin: number;
      roa: number; // Return on Assets
      roe: number; // Return on Equity
    };
  };
  
  // Forecasts
  forecasts: {
    nextPeriod: {
      revenue: number; // USD
      expenses: number; // USD
      profit: number; // USD
    };
    confidence: number; // percentage
    assumptions: string[];
    lastUpdated: Date;
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Financial Data Document Interface
 */
export interface IFinancialDataDocument extends Omit<IFinancialData, '_id'>, Document {}

/**
 * Financial Data Schema
 */
const financialDataSchema = new Schema<IFinancialDataDocument>({
  farmId: {
    type: String,
    required: true,
    ref: 'FarmData'
  },
  
  period: {
    type: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually']
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    year: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12 },
    quarter: { type: Number, min: 1, max: 4 },
    week: { type: Number, min: 1, max: 53 }
  },
  
  revenue: {
    total: { type: Number, required: true, min: 0 },
    breakdown: {
      cropSales: { type: Number, default: 0, min: 0 },
      seedSales: { type: Number, default: 0, min: 0 },
      consulting: { type: Number, default: 0, min: 0 },
      equipmentRental: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    sources: [{
      customerId: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      description: { type: String, required: true, trim: true },
      date: { type: Date, required: true }
    }]
  },
  
  operatingExpenses: {
    total: { type: Number, required: true, min: 0 },
    breakdown: {
      labor: {
        salaries: { type: Number, default: 0, min: 0 },
        benefits: { type: Number, default: 0, min: 0 },
        overtime: { type: Number, default: 0, min: 0 },
        bonuses: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      materials: {
        seeds: { type: Number, default: 0, min: 0 },
        fertilizer: { type: Number, default: 0, min: 0 },
        pesticides: { type: Number, default: 0, min: 0 },
        equipment: { type: Number, default: 0, min: 0 },
        packaging: { type: Number, default: 0, min: 0 },
        other: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      utilities: {
        electricity: { type: Number, default: 0, min: 0 },
        water: { type: Number, default: 0, min: 0 },
        gas: { type: Number, default: 0, min: 0 },
        internet: { type: Number, default: 0, min: 0 },
        phone: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      maintenance: {
        equipment: { type: Number, default: 0, min: 0 },
        facilities: { type: Number, default: 0, min: 0 },
        vehicles: { type: Number, default: 0, min: 0 },
        other: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      logistics: {
        fuel: { type: Number, default: 0, min: 0 },
        vehicleMaintenance: { type: Number, default: 0, min: 0 },
        insurance: { type: Number, default: 0, min: 0 },
        tolls: { type: Number, default: 0, min: 0 },
        fines: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      marketing: {
        advertising: { type: Number, default: 0, min: 0 },
        promotions: { type: Number, default: 0, min: 0 },
        events: { type: Number, default: 0, min: 0 },
        website: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      professional: {
        legal: { type: Number, default: 0, min: 0 },
        accounting: { type: Number, default: 0, min: 0 },
        consulting: { type: Number, default: 0, min: 0 },
        licenses: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  
  capitalExpenses: {
    total: { type: Number, required: true, min: 0 },
    breakdown: {
      equipment: {
        machinery: { type: Number, default: 0, min: 0 },
        tools: { type: Number, default: 0, min: 0 },
        technology: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      infrastructure: {
        buildings: { type: Number, default: 0, min: 0 },
        greenhouses: { type: Number, default: 0, min: 0 },
        irrigation: { type: Number, default: 0, min: 0 },
        fencing: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      land: {
        purchase: { type: Number, default: 0, min: 0 },
        improvement: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      vehicles: {
        trucks: { type: Number, default: 0, min: 0 },
        tractors: { type: Number, default: 0, min: 0 },
        other: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
      },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  
  metrics: {
    grossProfit: { type: Number, default: 0 },
    operatingProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    ebitda: { type: Number, default: 0 },
    grossMargin: { type: Number, default: 0, min: 0, max: 100 },
    operatingMargin: { type: Number, default: 0, min: 0, max: 100 },
    netMargin: { type: Number, default: 0, min: 0, max: 100 },
    roi: { type: Number, default: 0 },
    roe: { type: Number, default: 0 },
    assetTurnover: { type: Number, default: 0, min: 0 },
    currentRatio: { type: Number, default: 0, min: 0 },
    quickRatio: { type: Number, default: 0, min: 0 },
    debtToEquity: { type: Number, default: 0, min: 0 }
  },
  
  cashFlow: {
    operating: { type: Number, default: 0 },
    investing: { type: Number, default: 0 },
    financing: { type: Number, default: 0 },
    netChange: { type: Number, default: 0 },
    beginningBalance: { type: Number, default: 0 },
    endingBalance: { type: Number, default: 0 }
  },
  
  budgetComparison: {
    revenue: {
      budgeted: { type: Number, default: 0, min: 0 },
      actual: { type: Number, default: 0, min: 0 },
      variance: { type: Number, default: 0 },
      variancePercentage: { type: Number, default: 0 }
    },
    expenses: {
      budgeted: { type: Number, default: 0, min: 0 },
      actual: { type: Number, default: 0, min: 0 },
      variance: { type: Number, default: 0 },
      variancePercentage: { type: Number, default: 0 }
    },
    profit: {
      budgeted: { type: Number, default: 0 },
      actual: { type: Number, default: 0 },
      variance: { type: Number, default: 0 },
      variancePercentage: { type: Number, default: 0 }
    }
  },
  
  costAnalysis: {
    costPerKg: { type: Number, default: 0, min: 0 },
    costPerSqm: { type: Number, default: 0, min: 0 },
    costPerPlant: { type: Number, default: 0, min: 0 },
    laborCostPerKg: { type: Number, default: 0, min: 0 },
    materialCostPerKg: { type: Number, default: 0, min: 0 },
    utilityCostPerKg: { type: Number, default: 0, min: 0 },
    overheadCostPerKg: { type: Number, default: 0, min: 0 }
  },
  
  depreciation: {
    total: { type: Number, default: 0, min: 0 },
    breakdown: {
      equipment: { type: Number, default: 0, min: 0 },
      buildings: { type: Number, default: 0, min: 0 },
      vehicles: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    methods: {
      straightLine: { type: Number, default: 0, min: 0 },
      decliningBalance: { type: Number, default: 0, min: 0 },
      unitsOfProduction: { type: Number, default: 0, min: 0 }
    }
  },
  
  taxes: {
    income: { type: Number, default: 0, min: 0 },
    property: { type: Number, default: 0, min: 0 },
    sales: { type: Number, default: 0, min: 0 },
    payroll: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 }
  },
  
  investments: {
    total: { type: Number, default: 0, min: 0 },
    breakdown: {
      equipment: { type: Number, default: 0, min: 0 },
      technology: { type: Number, default: 0, min: 0 },
      research: { type: Number, default: 0, min: 0 },
      expansion: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    expectedReturns: {
      equipment: { type: Number, default: 0, min: 0 },
      technology: { type: Number, default: 0, min: 0 },
      research: { type: Number, default: 0, min: 0 },
      expansion: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  
  debt: {
    total: { type: Number, default: 0, min: 0 },
    breakdown: {
      shortTerm: { type: Number, default: 0, min: 0 },
      longTerm: { type: Number, default: 0, min: 0 }
    },
    payments: {
      principal: { type: Number, default: 0, min: 0 },
      interest: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 }
    },
    interestRate: { type: Number, default: 0, min: 0, max: 100 },
    maturityDate: { type: Date }
  },
  
  ratios: {
    liquidity: {
      currentRatio: { type: Number, default: 0, min: 0 },
      quickRatio: { type: Number, default: 0, min: 0 },
      cashRatio: { type: Number, default: 0, min: 0 }
    },
    leverage: {
      debtToEquity: { type: Number, default: 0, min: 0 },
      debtToAssets: { type: Number, default: 0, min: 0 },
      interestCoverage: { type: Number, default: 0, min: 0 }
    },
    efficiency: {
      assetTurnover: { type: Number, default: 0, min: 0 },
      inventoryTurnover: { type: Number, default: 0, min: 0 },
      receivablesTurnover: { type: Number, default: 0, min: 0 }
    },
    profitability: {
      grossMargin: { type: Number, default: 0, min: 0, max: 100 },
      operatingMargin: { type: Number, default: 0, min: 0, max: 100 },
      netMargin: { type: Number, default: 0, min: 0, max: 100 },
      roa: { type: Number, default: 0 },
      roe: { type: Number, default: 0 }
    }
  },
  
  forecasts: {
    nextPeriod: {
      revenue: { type: Number, default: 0, min: 0 },
      expenses: { type: Number, default: 0, min: 0 },
      profit: { type: Number, default: 0 }
    },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    assumptions: [{ type: String, trim: true }],
    lastUpdated: { type: Date, default: Date.now }
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
  collection: 'financialdata'
});

// Indexes for performance
financialDataSchema.index({ farmId: 1, 'period.type': 1, 'period.year': 1 });
financialDataSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
financialDataSchema.index({ 'period.year': 1, 'period.month': 1 });
financialDataSchema.index({ 'period.year': 1, 'period.quarter': 1 });
financialDataSchema.index({ 'metrics.netProfit': -1 });
financialDataSchema.index({ 'metrics.roi': -1 });
financialDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations
financialDataSchema.pre('save', function(next) {
  // Calculate totals
  this.operatingExpenses.breakdown.labor.total = 
    this.operatingExpenses.breakdown.labor.salaries +
    this.operatingExpenses.breakdown.labor.benefits +
    this.operatingExpenses.breakdown.labor.overtime +
    this.operatingExpenses.breakdown.labor.bonuses;
  
  this.operatingExpenses.breakdown.materials.total = 
    this.operatingExpenses.breakdown.materials.seeds +
    this.operatingExpenses.breakdown.materials.fertilizer +
    this.operatingExpenses.breakdown.materials.pesticides +
    this.operatingExpenses.breakdown.materials.equipment +
    this.operatingExpenses.breakdown.materials.packaging +
    this.operatingExpenses.breakdown.materials.other;
  
  this.operatingExpenses.breakdown.utilities.total = 
    this.operatingExpenses.breakdown.utilities.electricity +
    this.operatingExpenses.breakdown.utilities.water +
    this.operatingExpenses.breakdown.utilities.gas +
    this.operatingExpenses.breakdown.utilities.internet +
    this.operatingExpenses.breakdown.utilities.phone;
  
  this.operatingExpenses.breakdown.maintenance.total = 
    this.operatingExpenses.breakdown.maintenance.equipment +
    this.operatingExpenses.breakdown.maintenance.facilities +
    this.operatingExpenses.breakdown.maintenance.vehicles +
    this.operatingExpenses.breakdown.maintenance.other;
  
  this.operatingExpenses.breakdown.logistics.total = 
    this.operatingExpenses.breakdown.logistics.fuel +
    this.operatingExpenses.breakdown.logistics.vehicleMaintenance +
    this.operatingExpenses.breakdown.logistics.insurance +
    this.operatingExpenses.breakdown.logistics.tolls +
    this.operatingExpenses.breakdown.logistics.fines;
  
  this.operatingExpenses.breakdown.marketing.total = 
    this.operatingExpenses.breakdown.marketing.advertising +
    this.operatingExpenses.breakdown.marketing.promotions +
    this.operatingExpenses.breakdown.marketing.events +
    this.operatingExpenses.breakdown.marketing.website;
  
  this.operatingExpenses.breakdown.professional.total = 
    this.operatingExpenses.breakdown.professional.legal +
    this.operatingExpenses.breakdown.professional.accounting +
    this.operatingExpenses.breakdown.professional.consulting +
    this.operatingExpenses.breakdown.professional.licenses;
  
  // Calculate total operating expenses
  this.operatingExpenses.total = 
    this.operatingExpenses.breakdown.labor.total +
    this.operatingExpenses.breakdown.materials.total +
    this.operatingExpenses.breakdown.utilities.total +
    this.operatingExpenses.breakdown.maintenance.total +
    this.operatingExpenses.breakdown.logistics.total +
    this.operatingExpenses.breakdown.marketing.total +
    this.operatingExpenses.breakdown.professional.total +
    this.operatingExpenses.breakdown.other;
  
  // Calculate CAPEX totals
  this.capitalExpenses.breakdown.equipment.total = 
    this.capitalExpenses.breakdown.equipment.machinery +
    this.capitalExpenses.breakdown.equipment.tools +
    this.capitalExpenses.breakdown.equipment.technology;
  
  this.capitalExpenses.breakdown.infrastructure.total = 
    this.capitalExpenses.breakdown.infrastructure.buildings +
    this.capitalExpenses.breakdown.infrastructure.greenhouses +
    this.capitalExpenses.breakdown.infrastructure.irrigation +
    this.capitalExpenses.breakdown.infrastructure.fencing;
  
  this.capitalExpenses.breakdown.land.total = 
    this.capitalExpenses.breakdown.land.purchase +
    this.capitalExpenses.breakdown.land.improvement;
  
  this.capitalExpenses.breakdown.vehicles.total = 
    this.capitalExpenses.breakdown.vehicles.trucks +
    this.capitalExpenses.breakdown.vehicles.tractors +
    this.capitalExpenses.breakdown.vehicles.other;
  
  // Calculate total CAPEX
  this.capitalExpenses.total = 
    this.capitalExpenses.breakdown.equipment.total +
    this.capitalExpenses.breakdown.infrastructure.total +
    this.capitalExpenses.breakdown.land.total +
    this.capitalExpenses.breakdown.vehicles.total +
    this.capitalExpenses.breakdown.other;
  
  // Calculate financial metrics
  this.metrics.grossProfit = this.revenue.total - this.operatingExpenses.breakdown.materials.total;
  this.metrics.operatingProfit = this.metrics.grossProfit - this.operatingExpenses.total;
  this.metrics.netProfit = this.metrics.operatingProfit - this.taxes.total - this.depreciation.total;
  
  // Calculate margins
  if (this.revenue.total > 0) {
    this.metrics.grossMargin = (this.metrics.grossProfit / this.revenue.total) * 100;
    this.metrics.operatingMargin = (this.metrics.operatingProfit / this.revenue.total) * 100;
    this.metrics.netMargin = (this.metrics.netProfit / this.revenue.total) * 100;
  }
  
  // Calculate budget variances
  this.budgetComparison.revenue.variance = this.budgetComparison.revenue.actual - this.budgetComparison.revenue.budgeted;
  this.budgetComparison.expenses.variance = this.budgetComparison.expenses.actual - this.budgetComparison.expenses.budgeted;
  this.budgetComparison.profit.variance = this.budgetComparison.profit.actual - this.budgetComparison.profit.budgeted;
  
  if (this.budgetComparison.revenue.budgeted > 0) {
    this.budgetComparison.revenue.variancePercentage = (this.budgetComparison.revenue.variance / this.budgetComparison.revenue.budgeted) * 100;
  }
  if (this.budgetComparison.expenses.budgeted > 0) {
    this.budgetComparison.expenses.variancePercentage = (this.budgetComparison.expenses.variance / this.budgetComparison.expenses.budgeted) * 100;
  }
  if (this.budgetComparison.profit.budgeted > 0) {
    this.budgetComparison.profit.variancePercentage = (this.budgetComparison.profit.variance / this.budgetComparison.profit.budgeted) * 100;
  }
  
  // Calculate cash flow
  this.cashFlow.netChange = this.cashFlow.operating + this.cashFlow.investing + this.cashFlow.financing;
  this.cashFlow.endingBalance = this.cashFlow.beginningBalance + this.cashFlow.netChange;
  
  next();
});

// Instance methods
financialDataSchema.methods.getProfitability = function(): string {
  if (this.metrics.netProfit > 0) return 'profitable';
  if (this.metrics.netProfit === 0) return 'break_even';
  return 'loss';
};

financialDataSchema.methods.getEfficiency = function(): string {
  if (this.metrics.assetTurnover > 1) return 'high';
  if (this.metrics.assetTurnover > 0.5) return 'medium';
  return 'low';
};

financialDataSchema.methods.getLiquidity = function(): string {
  if (this.ratios.liquidity.currentRatio > 2) return 'excellent';
  if (this.ratios.liquidity.currentRatio > 1.5) return 'good';
  if (this.ratios.liquidity.currentRatio > 1) return 'adequate';
  return 'poor';
};

financialDataSchema.methods.getLeverage = function(): string {
  if (this.ratios.leverage.debtToEquity < 0.3) return 'low';
  if (this.ratios.leverage.debtToEquity < 0.7) return 'moderate';
  return 'high';
};

financialDataSchema.methods.calculateROI = function(investment: number): number {
  if (investment === 0) return 0;
  return (this.metrics.netProfit / investment) * 100;
};

financialDataSchema.methods.getCostBreakdown = function() {
  return {
    labor: this.operatingExpenses.breakdown.labor.total,
    materials: this.operatingExpenses.breakdown.materials.total,
    utilities: this.operatingExpenses.breakdown.utilities.total,
    maintenance: this.operatingExpenses.breakdown.maintenance.total,
    logistics: this.operatingExpenses.breakdown.logistics.total,
    marketing: this.operatingExpenses.breakdown.marketing.total,
    professional: this.operatingExpenses.breakdown.professional.total,
    other: this.operatingExpenses.breakdown.other
  };
};

// Static methods
financialDataSchema.statics.findByFarm = function(farmId: string) {
  return this.find({ farmId, isActive: true });
};

financialDataSchema.statics.findByPeriod = function(type: string, year: number, month?: number, quarter?: number) {
  const query: any = { 'period.type': type, 'period.year': year, isActive: true };
  if (month) query['period.month'] = month;
  if (quarter) query['period.quarter'] = quarter;
  return this.find(query);
};

financialDataSchema.statics.findProfitable = function() {
  return this.find({ 'metrics.netProfit': { $gt: 0 }, isActive: true });
};

financialDataSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    'period.startDate': { $gte: startDate },
    'period.endDate': { $lte: endDate },
    isActive: true
  });
};

financialDataSchema.statics.getFinancialSummary = function(farmId: string, year: number) {
  return this.aggregate([
    { $match: { farmId, 'period.year': year, isActive: true } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$revenue.total' },
        totalExpenses: { $sum: '$operatingExpenses.total' },
        totalProfit: { $sum: '$metrics.netProfit' },
        averageMargin: { $avg: '$metrics.netMargin' }
      }
    }
  ]);
};

// Transform to JSON
financialDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const FinancialData = mongoose.model<IFinancialDataDocument>('FinancialData', financialDataSchema);
