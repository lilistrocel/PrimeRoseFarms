import mongoose, { Document, Schema } from 'mongoose';

// Interface for manager-input operational costs
export interface ICostsData {
  farmId: string;
  managerId: string;
  
  // Labor Costs
  laborRates: {
    base: {
      plantingPerPlant: number; // Cost per plant for planting
      harvestPerKg: number; // Cost per kg for harvesting
      maintenancePerHour: number; // Hourly rate for maintenance tasks
      irrigationPerHour: number; // Hourly rate for irrigation tasks
      fertilizingPerHour: number; // Hourly rate for fertilizer application
    };
    overtime: {
      multiplier: number; // Overtime rate multiplier (e.g., 1.5x)
      threshold: number; // Hours per day before overtime kicks in
    };
    seasonal: {
      peakSeasonMultiplier: number; // Peak season rate multiplier
      peakMonths: number[]; // Months considered peak season (1-12)
    };
    skillPremiums: {
      [skillLevel: string]: number; // Premium for specialized skills
    };
  };

  // Infrastructure and Operational Costs
  infrastructure: {
    landCosts: {
      rentPerSqMeter: number; // Monthly rent per square meter
      propertyTaxPerSqMeter: number; // Annual property tax per square meter
      maintenancePerSqMeter: number; // Monthly maintenance per square meter
    };
    
    utilities: {
      electricityPerKwh: number; // Cost per kilowatt-hour
      waterPerLiter: number; // Cost per liter of water
      gasPerCubicMeter: number; // Cost per cubic meter of gas (heating)
      internetMonthly: number; // Monthly internet/communication costs
    };
    
    equipment: {
      depreciationRates: {
        [equipmentType: string]: {
          purchasePrice: number;
          usefulLifeYears: number;
          salvageValue: number;
          monthlyDepreciation: number;
        };
      };
      maintenanceSchedule: {
        [equipmentType: string]: {
          monthlyMaintenanceCost: number;
          majorServiceInterval: number; // Months between major services
          majorServiceCost: number;
        };
      };
    };
  };

  // Transportation and Logistics
  logistics: {
    fleet: {
      numberOfTrucks: number;
      trucksCapacity: number[]; // Capacity of each truck in kg
      fuelCostPerKm: number;
      maintenanceCostPerKm: number;
      insuranceMonthly: number;
      licensingAnnual: number;
      driverWagesPerHour: number;
    };
    
    delivery: {
      standardDeliveryRadius: number; // km
      costPerKmBeyondRadius: number;
      packagingCostPerKg: number;
      handlingFeePerOrder: number;
    };
  };

  // Materials and Supplies
  materials: {
    fertilizer: {
      [fertilizerType: string]: {
        costPerUnit: number; // Cost per ml/g
        supplierInfo: string;
        bulkDiscountThreshold: number;
        bulkDiscountPercentage: number;
      };
    };
    
    pesticides: {
      [pesticideType: string]: {
        costPerUnit: number; // Cost per ml/g
        supplierInfo: string;
        specialHandlingCost: number; // Additional cost for safety compliance
      };
    };
    
    seeds: {
      [plantType: string]: {
        costPerSeed: number;
        supplierInfo: string;
        minimumOrderQuantity: number;
      };
    };
    
    packaging: {
      [packageType: string]: {
        costPerUnit: number;
        capacityKg: number;
        supplierInfo: string;
      };
    };
  };

  // Administrative and Overhead
  overhead: {
    insurance: {
      cropInsuranceAnnual: number;
      liabilityInsuranceAnnual: number;
      equipmentInsuranceAnnual: number;
    };
    
    licenses: {
      [licenseType: string]: {
        costAnnual: number;
        renewalDate: Date;
        complianceRequirements: string[];
      };
    };
    
    professional: {
      accountingMonthly: number;
      legalMonthly: number;
      consultingHourlyRate: number;
      certificationCosts: number;
    };
    
    marketing: {
      advertisingMonthly: number;
      websiteMaintenanceMonthly: number;
      tradeshowsAnnual: number;
    };
  };

  // Financial Parameters
  financial: {
    taxRate: number; // Corporate tax rate as percentage
    interestRate: number; // Cost of capital/loan interest rate
    inflationAdjustment: number; // Annual inflation adjustment percentage
    contingencyPercentage: number; // Contingency fund percentage
  };

  // Metadata
  effectiveDate: Date;
  validUntil?: Date;
  notes: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ICostsDataDocument extends Omit<ICostsData, '_id'>, Document {}

const costsDataSchema = new Schema<ICostsDataDocument>({
  farmId: { type: String, required: true, index: true },
  managerId: { type: String, required: true, index: true },
  
  laborRates: {
    base: {
      plantingPerPlant: { type: Number, required: true, min: 0 },
      harvestPerKg: { type: Number, required: true, min: 0 },
      maintenancePerHour: { type: Number, required: true, min: 0 },
      irrigationPerHour: { type: Number, required: true, min: 0 },
      fertilizingPerHour: { type: Number, required: true, min: 0 }
    },
    overtime: {
      multiplier: { type: Number, default: 1.5, min: 1 },
      threshold: { type: Number, default: 8, min: 1 }
    },
    seasonal: {
      peakSeasonMultiplier: { type: Number, default: 1.0, min: 1 },
      peakMonths: [{ type: Number, min: 1, max: 12 }]
    },
    skillPremiums: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },

  infrastructure: {
    landCosts: {
      rentPerSqMeter: { type: Number, required: true, min: 0 },
      propertyTaxPerSqMeter: { type: Number, default: 0, min: 0 },
      maintenancePerSqMeter: { type: Number, default: 0, min: 0 }
    },
    utilities: {
      electricityPerKwh: { type: Number, required: true, min: 0 },
      waterPerLiter: { type: Number, required: true, min: 0 },
      gasPerCubicMeter: { type: Number, default: 0, min: 0 },
      internetMonthly: { type: Number, default: 0, min: 0 }
    },
    equipment: {
      depreciationRates: {
        type: Map,
        of: {
          purchasePrice: { type: Number, required: true, min: 0 },
          usefulLifeYears: { type: Number, required: true, min: 1 },
          salvageValue: { type: Number, default: 0, min: 0 },
          monthlyDepreciation: { type: Number, required: true, min: 0 }
        },
        default: new Map()
      },
      maintenanceSchedule: {
        type: Map,
        of: {
          monthlyMaintenanceCost: { type: Number, required: true, min: 0 },
          majorServiceInterval: { type: Number, required: true, min: 1 },
          majorServiceCost: { type: Number, required: true, min: 0 }
        },
        default: new Map()
      }
    }
  },

  logistics: {
    fleet: {
      numberOfTrucks: { type: Number, default: 0, min: 0 },
      trucksCapacity: [{ type: Number, min: 0 }],
      fuelCostPerKm: { type: Number, default: 0, min: 0 },
      maintenanceCostPerKm: { type: Number, default: 0, min: 0 },
      insuranceMonthly: { type: Number, default: 0, min: 0 },
      licensingAnnual: { type: Number, default: 0, min: 0 },
      driverWagesPerHour: { type: Number, default: 0, min: 0 }
    },
    delivery: {
      standardDeliveryRadius: { type: Number, default: 50, min: 0 },
      costPerKmBeyondRadius: { type: Number, default: 0, min: 0 },
      packagingCostPerKg: { type: Number, default: 0, min: 0 },
      handlingFeePerOrder: { type: Number, default: 0, min: 0 }
    }
  },

  materials: {
    fertilizer: {
      type: Map,
      of: {
        costPerUnit: { type: Number, required: true, min: 0 },
        supplierInfo: { type: String, required: true },
        bulkDiscountThreshold: { type: Number, default: 0, min: 0 },
        bulkDiscountPercentage: { type: Number, default: 0, min: 0, max: 100 }
      },
      default: new Map()
    },
    pesticides: {
      type: Map,
      of: {
        costPerUnit: { type: Number, required: true, min: 0 },
        supplierInfo: { type: String, required: true },
        specialHandlingCost: { type: Number, default: 0, min: 0 }
      },
      default: new Map()
    },
    seeds: {
      type: Map,
      of: {
        costPerSeed: { type: Number, required: true, min: 0 },
        supplierInfo: { type: String, required: true },
        minimumOrderQuantity: { type: Number, default: 1, min: 1 }
      },
      default: new Map()
    },
    packaging: {
      type: Map,
      of: {
        costPerUnit: { type: Number, required: true, min: 0 },
        capacityKg: { type: Number, required: true, min: 0 },
        supplierInfo: { type: String, required: true }
      },
      default: new Map()
    }
  },

  overhead: {
    insurance: {
      cropInsuranceAnnual: { type: Number, default: 0, min: 0 },
      liabilityInsuranceAnnual: { type: Number, default: 0, min: 0 },
      equipmentInsuranceAnnual: { type: Number, default: 0, min: 0 }
    },
    licenses: {
      type: Map,
      of: {
        costAnnual: { type: Number, required: true, min: 0 },
        renewalDate: { type: Date, required: true },
        complianceRequirements: [{ type: String }]
      },
      default: new Map()
    },
    professional: {
      accountingMonthly: { type: Number, default: 0, min: 0 },
      legalMonthly: { type: Number, default: 0, min: 0 },
      consultingHourlyRate: { type: Number, default: 0, min: 0 },
      certificationCosts: { type: Number, default: 0, min: 0 }
    },
    marketing: {
      advertisingMonthly: { type: Number, default: 0, min: 0 },
      websiteMaintenanceMonthly: { type: Number, default: 0, min: 0 },
      tradeshowsAnnual: { type: Number, default: 0, min: 0 }
    }
  },

  financial: {
    taxRate: { type: Number, required: true, min: 0, max: 100 },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    inflationAdjustment: { type: Number, default: 3, min: 0, max: 100 },
    contingencyPercentage: { type: Number, default: 10, min: 0, max: 100 }
  },

  effectiveDate: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date },
  notes: { type: String, default: '' },
  approvedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Indexes for performance
costsDataSchema.index({ farmId: 1, effectiveDate: -1 });
costsDataSchema.index({ managerId: 1, createdAt: -1 });
costsDataSchema.index({ isActive: 1, effectiveDate: -1 });

// Pre-save middleware
costsDataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate monthly depreciation for equipment
  if (this.infrastructure?.equipment?.depreciationRates) {
    for (const [equipmentType, rates] of (this.infrastructure.equipment.depreciationRates as any).entries()) {
      const monthlyDepreciation = (rates.purchasePrice - rates.salvageValue) / (rates.usefulLifeYears * 12);
      rates.monthlyDepreciation = monthlyDepreciation;
    }
  }
  
  next();
});

// Instance methods
costsDataSchema.methods.calculatePlantingCost = function(plantCount: number, skillLevel: string = 'standard'): number {
  const baseCost = this.laborRates.base.plantingPerPlant * plantCount;
  const skillPremium = this.laborRates.skillPremiums.get(skillLevel) || 1;
  return baseCost * skillPremium;
};

costsDataSchema.methods.calculateHarvestCost = function(harvestKg: number, skillLevel: string = 'standard'): number {
  const baseCost = this.laborRates.base.harvestPerKg * harvestKg;
  const skillPremium = this.laborRates.skillPremiums.get(skillLevel) || 1;
  return baseCost * skillPremium;
};

costsDataSchema.methods.calculateWaterCost = function(litersUsed: number): number {
  return litersUsed * this.infrastructure.utilities.waterPerLiter;
};

costsDataSchema.methods.calculateElectricityCost = function(kwhUsed: number): number {
  return kwhUsed * this.infrastructure.utilities.electricityPerKwh;
};

costsDataSchema.methods.calculateFertilizerCost = function(fertilizerType: string, quantity: number): number {
  const fertilizerInfo = this.materials.fertilizer.get(fertilizerType);
  if (!fertilizerInfo) return 0;
  
  let costPerUnit = fertilizerInfo.costPerUnit;
  
  // Apply bulk discount if applicable
  if (quantity >= fertilizerInfo.bulkDiscountThreshold) {
    costPerUnit *= (1 - fertilizerInfo.bulkDiscountPercentage / 100);
  }
  
  return quantity * costPerUnit;
};

costsDataSchema.methods.calculatePesticideCost = function(pesticideType: string, quantity: number): number {
  const pesticideInfo = this.materials.pesticides.get(pesticideType);
  if (!pesticideInfo) return 0;
  
  return (quantity * pesticideInfo.costPerUnit) + pesticideInfo.specialHandlingCost;
};

costsDataSchema.methods.calculateDeliveryCost = function(distanceKm: number, orderKg: number): number {
  let deliveryCost = this.logistics.delivery.handlingFeePerOrder;
  
  // Add distance cost if beyond standard radius
  if (distanceKm > this.logistics.delivery.standardDeliveryRadius) {
    const extraDistance = distanceKm - this.logistics.delivery.standardDeliveryRadius;
    deliveryCost += extraDistance * this.logistics.delivery.costPerKmBeyondRadius;
  }
  
  // Add packaging cost
  deliveryCost += orderKg * this.logistics.delivery.packagingCostPerKg;
  
  return deliveryCost;
};

costsDataSchema.methods.calculateMonthlyOverhead = function(): number {
  let totalOverhead = 0;
  
  // Insurance (monthly portion)
  totalOverhead += (this.overhead.insurance.cropInsuranceAnnual / 12);
  totalOverhead += (this.overhead.insurance.liabilityInsuranceAnnual / 12);
  totalOverhead += (this.overhead.insurance.equipmentInsuranceAnnual / 12);
  
  // Professional services
  totalOverhead += this.overhead.professional.accountingMonthly;
  totalOverhead += this.overhead.professional.legalMonthly;
  totalOverhead += (this.overhead.professional.certificationCosts / 12);
  
  // Marketing
  totalOverhead += this.overhead.marketing.advertisingMonthly;
  totalOverhead += this.overhead.marketing.websiteMaintenanceMonthly;
  totalOverhead += (this.overhead.marketing.tradeshowsAnnual / 12);
  
  // Utilities
  totalOverhead += this.infrastructure.utilities.internetMonthly;
  
  // Fleet costs
  totalOverhead += this.logistics.fleet.insuranceMonthly;
  totalOverhead += (this.logistics.fleet.licensingAnnual / 12);
  
  return totalOverhead;
};

// Transform function for JSON output
costsDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete (ret as any).__v;
    return ret;
  }
});

export const CostsData = mongoose.model<ICostsDataDocument>('CostsData', costsDataSchema);
