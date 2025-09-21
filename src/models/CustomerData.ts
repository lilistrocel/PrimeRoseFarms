import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel } from '../types';

/**
 * Customer Data Interface
 * CRM data for tracking customers and their relationships
 */
export interface ICustomerData {
  _id?: string;
  customerId: string; // Unique customer identifier
  
  // Basic Information
  basicInfo: {
    name: string;
    type: 'individual' | 'business' | 'wholesale' | 'retail' | 'restaurant' | 'distributor';
    status: 'active' | 'inactive' | 'prospect' | 'suspended' | 'blacklisted';
    category: 'premium' | 'standard' | 'budget' | 'bulk';
    source: 'referral' | 'website' | 'social_media' | 'advertisement' | 'trade_show' | 'cold_call' | 'other';
    registrationDate: Date;
    lastContactDate: Date;
  };
  
  // Contact Information
  contactInfo: {
    primaryContact: {
      name: string;
      title?: string;
      phone: string;
      email: string;
      preferredContactMethod: 'phone' | 'email' | 'sms' | 'whatsapp';
    };
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    shippingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      isSameAsBilling: boolean;
    };
    alternateContacts: {
      name: string;
      title?: string;
      phone?: string;
      email?: string;
      relationship: string;
    }[];
  };
  
  // Business Information (for business customers)
  businessInfo?: {
    companyName: string;
    industry: string;
    businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit';
    taxId: string;
    website?: string;
    annualRevenue?: number; // USD
    employeeCount?: number;
    businessHours: {
      timezone: string;
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
  };
  
  // Purchase History
  purchaseHistory: {
    totalOrders: number;
    totalSpent: number; // USD
    averageOrderValue: number; // USD
    lastOrderDate?: Date;
    firstOrderDate?: Date;
    orders: {
      orderId: string;
      date: Date;
      amount: number; // USD
      items: {
        productId: string; // Reference to PlantData
        productName: string;
        quantity: number;
        unitPrice: number; // USD
        totalPrice: number; // USD
      }[];
      status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
      paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'cryptocurrency';
      paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue' | 'refunded';
    }[];
  };
  
  // Preferences and Requirements
  preferences: {
    preferredProducts: string[]; // PlantData IDs
    preferredDeliveryDays: string[]; // ['monday', 'tuesday', etc.]
    preferredDeliveryTime: {
      start: string; // HH:MM
      end: string; // HH:MM
    };
    qualityRequirements: {
      grade: 'premium' | 'standard' | 'budget';
      organic: boolean;
      local: boolean;
      sustainable: boolean;
    };
    packagingPreferences: {
      type: 'standard' | 'eco_friendly' | 'premium' | 'bulk';
      size: 'small' | 'medium' | 'large' | 'custom';
      specialInstructions?: string;
    };
    communicationPreferences: {
      newsletter: boolean;
      promotions: boolean;
      orderUpdates: boolean;
      qualityReports: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
  };
  
  // Loyalty Program
  loyalty: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    points: number;
    pointsEarned: number;
    pointsRedeemed: number;
    pointsExpired: number;
    nextTierPoints: number;
    benefits: {
      discountPercentage: number;
      freeShipping: boolean;
      prioritySupport: boolean;
      exclusiveProducts: boolean;
      earlyAccess: boolean;
    };
    referrals: {
      totalReferred: number;
      successfulReferrals: number;
      referralRewards: number; // USD
    };
  };
  
  // Credit and Payment
  credit: {
    creditLimit: number; // USD
    currentBalance: number; // USD
    availableCredit: number; // USD
    paymentTerms: 'net_15' | 'net_30' | 'net_60' | 'net_90' | 'cash_on_delivery' | 'prepaid';
    creditScore?: number;
    paymentHistory: {
      date: Date;
      amount: number; // USD
      status: 'on_time' | 'late' | 'overdue' | 'default';
      daysLate?: number;
    }[];
    outstandingInvoices: {
      invoiceId: string;
      amount: number; // USD
      dueDate: Date;
      daysOverdue: number;
    }[];
  };
  
  // Communication History
  communication: {
    totalInteractions: number;
    lastInteraction: Date;
    interactions: {
      id: string;
      date: Date;
      type: 'call' | 'email' | 'meeting' | 'chat' | 'support_ticket';
      subject: string;
      outcome: 'positive' | 'neutral' | 'negative' | 'resolved' | 'escalated';
      notes: string;
      followUpRequired: boolean;
      followUpDate?: Date;
      assignedTo: string; // User ID
    }[];
    supportTickets: {
      ticketId: string;
      subject: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      status: 'open' | 'in_progress' | 'resolved' | 'closed';
      createdDate: Date;
      resolvedDate?: Date;
      satisfaction: number; // 1-5 scale
    }[];
  };
  
  // Analytics and Insights
  analytics: {
    customerLifetimeValue: number; // USD
    averageOrderFrequency: number; // days between orders
    churnRisk: 'low' | 'medium' | 'high';
    satisfactionScore: number; // 1-10 scale
    netPromoterScore: number; // -100 to 100
    growthPotential: 'low' | 'medium' | 'high';
    seasonalPatterns: {
      peakMonths: string[];
      lowMonths: string[];
      averageMonthlySpend: number; // USD
    };
  };
  
  // Notes and Tags
  notes: {
    general: string;
    internal: string; // Internal notes not visible to customer
    tags: string[];
    customFields: {
      [key: string]: any;
    };
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer Data Document Interface
 */
export interface ICustomerDataDocument extends Omit<ICustomerData, '_id'>, Document {}

/**
 * Customer Data Schema
 */
const customerDataSchema = new Schema<ICustomerDataDocument>({
  customerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  basicInfo: {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    type: {
      type: String,
      required: true,
      enum: ['individual', 'business', 'wholesale', 'retail', 'restaurant', 'distributor']
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'prospect', 'suspended', 'blacklisted'],
      default: 'prospect'
    },
    category: {
      type: String,
      required: true,
      enum: ['premium', 'standard', 'budget', 'bulk'],
      default: 'standard'
    },
    source: {
      type: String,
      required: true,
      enum: ['referral', 'website', 'social_media', 'advertisement', 'trade_show', 'cold_call', 'other']
    },
    registrationDate: { type: Date, default: Date.now },
    lastContactDate: { type: Date, default: Date.now }
  },
  
  contactInfo: {
    primaryContact: {
      name: { type: String, required: true, trim: true },
      title: { type: String, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      preferredContactMethod: {
        type: String,
        required: true,
        enum: ['phone', 'email', 'sms', 'whatsapp'],
        default: 'email'
      }
    },
    billingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true }
    },
    shippingAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
      isSameAsBilling: { type: Boolean, default: true }
    },
    alternateContacts: [{
      name: { type: String, required: true, trim: true },
      title: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      relationship: { type: String, required: true, trim: true }
    }]
  },
  
  businessInfo: {
    companyName: { type: String, trim: true },
    industry: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ['corporation', 'llc', 'partnership', 'sole_proprietorship', 'non_profit']
    },
    taxId: { type: String, trim: true },
    website: { type: String, trim: true },
    annualRevenue: { type: Number, min: 0 },
    employeeCount: { type: Number, min: 0 },
    businessHours: {
      timezone: { type: String, required: true },
      monday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      },
      tuesday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      },
      wednesday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      },
      thursday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      },
      friday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      },
      saturday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      },
      sunday: {
        open: { type: String },
        close: { type: String },
        closed: { type: Boolean, default: false }
      }
    }
  },
  
  purchaseHistory: {
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    averageOrderValue: { type: Number, default: 0, min: 0 },
    lastOrderDate: { type: Date },
    firstOrderDate: { type: Date },
    orders: [{
      orderId: { type: String, required: true },
      date: { type: Date, required: true },
      amount: { type: Number, required: true, min: 0 },
      items: [{
        productId: { type: String, required: true, ref: 'PlantData' },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 }
      }],
      status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']
      },
      paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'credit_card', 'bank_transfer', 'check', 'cryptocurrency']
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'partial', 'overdue', 'refunded']
      }
    }]
  },
  
  preferences: {
    preferredProducts: [{ type: String, ref: 'PlantData' }],
    preferredDeliveryDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredDeliveryTime: {
      start: { type: String },
      end: { type: String }
    },
    qualityRequirements: {
      grade: {
        type: String,
        enum: ['premium', 'standard', 'budget'],
        default: 'standard'
      },
      organic: { type: Boolean, default: false },
      local: { type: Boolean, default: false },
      sustainable: { type: Boolean, default: false }
    },
    packagingPreferences: {
      type: {
        type: String,
        enum: ['standard', 'eco_friendly', 'premium', 'bulk'],
        default: 'standard'
      },
      size: {
        type: String,
        enum: ['small', 'medium', 'large', 'custom'],
        default: 'medium'
      },
      specialInstructions: { type: String, maxlength: 500 }
    },
    communicationPreferences: {
      newsletter: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      qualityReports: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
        default: 'weekly'
      }
    }
  },
  
  loyalty: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    points: { type: Number, default: 0, min: 0 },
    pointsEarned: { type: Number, default: 0, min: 0 },
    pointsRedeemed: { type: Number, default: 0, min: 0 },
    pointsExpired: { type: Number, default: 0, min: 0 },
    nextTierPoints: { type: Number, default: 1000 },
    benefits: {
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
      freeShipping: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      exclusiveProducts: { type: Boolean, default: false },
      earlyAccess: { type: Boolean, default: false }
    },
    referrals: {
      totalReferred: { type: Number, default: 0, min: 0 },
      successfulReferrals: { type: Number, default: 0, min: 0 },
      referralRewards: { type: Number, default: 0, min: 0 }
    }
  },
  
  credit: {
    creditLimit: { type: Number, default: 0, min: 0 },
    currentBalance: { type: Number, default: 0, min: 0 },
    availableCredit: { type: Number, default: 0, min: 0 },
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_60', 'net_90', 'cash_on_delivery', 'prepaid'],
      default: 'net_30'
    },
    creditScore: { type: Number, min: 300, max: 850 },
    paymentHistory: [{
      date: { type: Date, required: true },
      amount: { type: Number, required: true, min: 0 },
      status: {
        type: String,
        required: true,
        enum: ['on_time', 'late', 'overdue', 'default']
      },
      daysLate: { type: Number, min: 0 }
    }],
    outstandingInvoices: [{
      invoiceId: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      dueDate: { type: Date, required: true },
      daysOverdue: { type: Number, min: 0 }
    }]
  },
  
  communication: {
    totalInteractions: { type: Number, default: 0, min: 0 },
    lastInteraction: { type: Date, default: Date.now },
    interactions: [{
      id: { type: String, required: true },
      date: { type: Date, required: true },
      type: {
        type: String,
        required: true,
        enum: ['call', 'email', 'meeting', 'chat', 'support_ticket']
      },
      subject: { type: String, required: true, trim: true },
      outcome: {
        type: String,
        required: true,
        enum: ['positive', 'neutral', 'negative', 'resolved', 'escalated']
      },
      notes: { type: String, trim: true },
      followUpRequired: { type: Boolean, default: false },
      followUpDate: { type: Date },
      assignedTo: { type: String, required: true }
    }],
    supportTickets: [{
      ticketId: { type: String, required: true },
      subject: { type: String, required: true, trim: true },
      priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent']
      },
      status: {
        type: String,
        required: true,
        enum: ['open', 'in_progress', 'resolved', 'closed']
      },
      createdDate: { type: Date, required: true },
      resolvedDate: { type: Date },
      satisfaction: { type: Number, min: 1, max: 5 }
    }]
  },
  
  analytics: {
    customerLifetimeValue: { type: Number, default: 0, min: 0 },
    averageOrderFrequency: { type: Number, default: 0, min: 0 },
    churnRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    satisfactionScore: { type: Number, default: 5, min: 1, max: 10 },
    netPromoterScore: { type: Number, default: 0, min: -100, max: 100 },
    growthPotential: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    seasonalPatterns: {
      peakMonths: [{ type: String }],
      lowMonths: [{ type: String }],
      averageMonthlySpend: { type: Number, default: 0, min: 0 }
    }
  },
  
  notes: {
    general: { type: String, maxlength: 1000 },
    internal: { type: String, maxlength: 1000 },
    tags: [{ type: String, trim: true }],
    customFields: { type: Schema.Types.Mixed, default: {} }
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
  collection: 'customerdata'
});

// Indexes for performance
customerDataSchema.index({ customerId: 1 }, { unique: true });
customerDataSchema.index({ 'basicInfo.status': 1 });
customerDataSchema.index({ 'basicInfo.type': 1 });
customerDataSchema.index({ 'basicInfo.category': 1 });
customerDataSchema.index({ 'contactInfo.primaryContact.email': 1 });
customerDataSchema.index({ 'contactInfo.primaryContact.phone': 1 });
customerDataSchema.index({ 'purchaseHistory.totalSpent': -1 });
customerDataSchema.index({ 'purchaseHistory.lastOrderDate': -1 });
customerDataSchema.index({ 'loyalty.tier': 1 });
customerDataSchema.index({ 'analytics.churnRisk': 1 });
customerDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
customerDataSchema.pre('save', function(next) {
  // Calculate average order value
  if (this.purchaseHistory.totalOrders > 0) {
    this.purchaseHistory.averageOrderValue = this.purchaseHistory.totalSpent / this.purchaseHistory.totalOrders;
  }
  
  // Calculate available credit
  this.credit.availableCredit = this.credit.creditLimit - this.credit.currentBalance;
  
  // Update loyalty tier based on points
  if (this.loyalty.points >= 10000) {
    this.loyalty.tier = 'diamond';
  } else if (this.loyalty.points >= 5000) {
    this.loyalty.tier = 'platinum';
  } else if (this.loyalty.points >= 2000) {
    this.loyalty.tier = 'gold';
  } else if (this.loyalty.points >= 500) {
    this.loyalty.tier = 'silver';
  } else {
    this.loyalty.tier = 'bronze';
  }
  
  // Update loyalty benefits based on tier
  switch (this.loyalty.tier) {
    case 'diamond':
      this.loyalty.benefits.discountPercentage = 20;
      this.loyalty.benefits.freeShipping = true;
      this.loyalty.benefits.prioritySupport = true;
      this.loyalty.benefits.exclusiveProducts = true;
      this.loyalty.benefits.earlyAccess = true;
      break;
    case 'platinum':
      this.loyalty.benefits.discountPercentage = 15;
      this.loyalty.benefits.freeShipping = true;
      this.loyalty.benefits.prioritySupport = true;
      this.loyalty.benefits.exclusiveProducts = true;
      this.loyalty.benefits.earlyAccess = false;
      break;
    case 'gold':
      this.loyalty.benefits.discountPercentage = 10;
      this.loyalty.benefits.freeShipping = true;
      this.loyalty.benefits.prioritySupport = false;
      this.loyalty.benefits.exclusiveProducts = false;
      this.loyalty.benefits.earlyAccess = false;
      break;
    case 'silver':
      this.loyalty.benefits.discountPercentage = 5;
      this.loyalty.benefits.freeShipping = false;
      this.loyalty.benefits.prioritySupport = false;
      this.loyalty.benefits.exclusiveProducts = false;
      this.loyalty.benefits.earlyAccess = false;
      break;
    default:
      this.loyalty.benefits.discountPercentage = 0;
      this.loyalty.benefits.freeShipping = false;
      this.loyalty.benefits.prioritySupport = false;
      this.loyalty.benefits.exclusiveProducts = false;
      this.loyalty.benefits.earlyAccess = false;
  }
  
  // Calculate next tier points
  switch (this.loyalty.tier) {
    case 'bronze':
      this.loyalty.nextTierPoints = 500 - this.loyalty.points;
      break;
    case 'silver':
      this.loyalty.nextTierPoints = 2000 - this.loyalty.points;
      break;
    case 'gold':
      this.loyalty.nextTierPoints = 5000 - this.loyalty.points;
      break;
    case 'platinum':
      this.loyalty.nextTierPoints = 10000 - this.loyalty.points;
      break;
    default:
      this.loyalty.nextTierPoints = 0;
  }
  
  next();
});

// Instance methods
customerDataSchema.methods.getFullName = function(): string {
  return this.basicInfo.name;
};

customerDataSchema.methods.getTotalOrders = function(): number {
  return this.purchaseHistory.totalOrders;
};

customerDataSchema.methods.getAverageOrderValue = function(): number {
  return this.purchaseHistory.averageOrderValue;
};

customerDataSchema.methods.getCustomerLifetimeValue = function(): number {
  return this.analytics.customerLifetimeValue;
};

customerDataSchema.methods.isHighValue = function(): boolean {
  return this.analytics.customerLifetimeValue > 10000; // $10,000 threshold
};

customerDataSchema.methods.getDaysSinceLastOrder = function(): number {
  if (!this.purchaseHistory.lastOrderDate) return 0;
  const now = new Date();
  const lastOrder = new Date(this.purchaseHistory.lastOrderDate);
  const diffTime = now.getTime() - lastOrder.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

customerDataSchema.methods.isAtRisk = function(): boolean {
  const daysSinceLastOrder = this.getDaysSinceLastOrder();
  return daysSinceLastOrder > 90 || this.analytics.churnRisk === 'high';
};

customerDataSchema.methods.getOutstandingAmount = function(): number {
  return this.credit.outstandingInvoices.reduce((total: number, invoice: any) => total + invoice.amount, 0);
};

customerDataSchema.methods.getPaymentScore = function(): number {
  if (this.credit.paymentHistory.length === 0) return 0;
  
  const onTimePayments = this.credit.paymentHistory.filter((payment: any) => payment.status === 'on_time').length;
  return (onTimePayments / this.credit.paymentHistory.length) * 100;
};

customerDataSchema.methods.addOrder = function(orderData: any) {
  this.purchaseHistory.orders.push(orderData);
  this.purchaseHistory.totalOrders += 1;
  this.purchaseHistory.totalSpent += orderData.amount;
  
  if (!this.purchaseHistory.firstOrderDate) {
    this.purchaseHistory.firstOrderDate = orderData.date;
  }
  this.purchaseHistory.lastOrderDate = orderData.date;
  
  // Add loyalty points (1 point per dollar spent)
  this.loyalty.points += Math.floor(orderData.amount);
  this.loyalty.pointsEarned += Math.floor(orderData.amount);
};

customerDataSchema.methods.addInteraction = function(interactionData: any) {
  this.communication.interactions.push(interactionData);
  this.communication.totalInteractions += 1;
  this.communication.lastInteraction = interactionData.date;
};

// Static methods
customerDataSchema.statics.findByStatus = function(status: string) {
  return this.find({ 'basicInfo.status': status, isActive: true });
};

customerDataSchema.statics.findByType = function(type: string) {
  return this.find({ 'basicInfo.type': type, isActive: true });
};

customerDataSchema.statics.findByTier = function(tier: string) {
  return this.find({ 'loyalty.tier': tier, isActive: true });
};

customerDataSchema.statics.findHighValue = function(threshold: number = 10000) {
  return this.find({ 
    'analytics.customerLifetimeValue': { $gte: threshold },
    isActive: true 
  });
};

customerDataSchema.statics.findAtRisk = function() {
  return this.find({
    $or: [
      { 'analytics.churnRisk': 'high' },
      { 'purchaseHistory.lastOrderDate': { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
    ],
    isActive: true
  });
};

customerDataSchema.statics.findByChurnRisk = function(risk: string) {
  return this.find({ 'analytics.churnRisk': risk, isActive: true });
};

customerDataSchema.statics.findOverdue = function() {
  return this.find({ 
    'credit.outstandingInvoices': { $exists: true, $ne: [] },
    isActive: true 
  });
};

// Transform to JSON
customerDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const CustomerData = mongoose.model<ICustomerDataDocument>('CustomerData', customerDataSchema);
