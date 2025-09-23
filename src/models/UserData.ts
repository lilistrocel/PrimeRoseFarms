import mongoose, { Document, Schema } from 'mongoose';
import { encryptionService } from '../utils/encryption';
import { DataProtectionLevel, UserRole } from '../types';

/**
 * User Data Interface
 * Extended user information for employees and farm users
 */
export interface IUserData {
  _id?: string;
  userId: string; // Reference to base User model
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    nationality: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
  };
  
  // Contact Information
  contactInfo: {
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    alternatePhone?: string;
    alternateEmail?: string;
  };
  
  // Employment Information
  employment: {
    employeeId: string;
    position: string;
    department: 'management' | 'operations' | 'hr' | 'finance' | 'sales' | 'logistics' | 'maintenance' | 'field_work';
    employmentType: 'full_time' | 'part_time' | 'contract' | 'seasonal' | 'intern';
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'suspended';
    reportingManager: string; // User ID
    workLocation: string; // Farm ID or office location
    workSchedule: {
      type: 'fixed' | 'flexible' | 'shift' | 'rotating';
      hoursPerWeek: number;
      daysPerWeek: number;
      startTime?: string; // HH:MM format
      endTime?: string; // HH:MM format
      timezone: string;
    };
  };
  
  // Compensation
  compensation: {
    salary: {
      baseSalary: number; // USD per year
      hourlyRate?: number; // USD per hour
      currency: string;
      paymentFrequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually';
    };
    benefits: {
      healthInsurance: boolean;
      dentalInsurance: boolean;
      visionInsurance: boolean;
      lifeInsurance: boolean;
      retirementPlan: boolean;
      paidTimeOff: number; // days per year
      sickLeave: number; // days per year
      otherBenefits: string[];
    };
    bonuses: {
      performanceBonus: number; // USD
      annualBonus: number; // USD
      commission?: number; // percentage
    };
  };
  
  // Legal Documents
  legalDocuments: {
    passport: {
      number: string;
      country: string;
      issueDate: Date;
      expiryDate: Date;
      status: 'valid' | 'expired' | 'expiring_soon';
    };
    visa: {
      type: string;
      number: string;
      issueDate: Date;
      expiryDate: Date;
      status: 'valid' | 'expired' | 'expiring_soon';
    };
    workPermit: {
      number: string;
      issueDate: Date;
      expiryDate: Date;
      status: 'valid' | 'expired' | 'expiring_soon';
    };
    driverLicense: {
      number: string;
      state: string;
      issueDate: Date;
      expiryDate: Date;
      status: 'valid' | 'expired' | 'expiring_soon';
    };
  };
  
  // Insurance Information
  insurance: {
    healthInsurance: {
      provider: string;
      policyNumber: string;
      coverageStart: Date;
      coverageEnd: Date;
      status: 'active' | 'inactive' | 'expired';
    };
    lifeInsurance: {
      provider: string;
      policyNumber: string;
      coverageAmount: number; // USD
      beneficiary: string;
      status: 'active' | 'inactive' | 'expired';
    };
    workersCompensation: {
      provider: string;
      policyNumber: string;
      coverageStart: Date;
      coverageEnd: Date;
      status: 'active' | 'inactive' | 'expired';
    };
  };
  
  // Time Off Management
  timeOff: {
    totalDaysAllocated: number;
    daysUsed: number;
    daysRemaining: number;
    requests: {
      id: string;
      type: 'vacation' | 'sick' | 'personal' | 'bereavement' | 'maternity' | 'paternity';
      startDate: Date;
      endDate: Date;
      days: number;
      status: 'pending' | 'approved' | 'denied' | 'cancelled';
      reason: string;
      requestedDate: Date;
      approvedBy?: string; // User ID
      approvedDate?: Date;
    }[];
  };
  
  // Performance Management
  performance: {
    kpis: {
      name: string;
      target: number;
      actual: number;
      unit: string;
      period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
      lastUpdated: Date;
    }[];
    reviews: {
      id: string;
      period: string; // e.g., "2024-Q1"
      rating: number; // 1-5 scale
      goals: string[];
      achievements: string[];
      areasForImprovement: string[];
      reviewer: string; // User ID
      reviewDate: Date;
    }[];
    training: {
      id: string;
      name: string;
      type: 'mandatory' | 'optional' | 'certification';
      status: 'not_started' | 'in_progress' | 'completed' | 'expired';
      startDate: Date;
      endDate: Date;
      completionDate?: Date;
      certificate?: string; // URL or reference
    }[];
  };
  
  // Skills and Certifications
  skills: {
    technical: string[];
    soft: string[];
    languages: {
      language: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
    }[];
    certifications: {
      name: string;
      issuer: string;
      issueDate: Date;
      expiryDate?: Date;
      status: 'active' | 'expired' | 'expiring_soon';
    }[];
  };
  
  // Emergency Information
  emergency: {
    medicalConditions: string[];
    allergies: string[];
    medications: string[];
    bloodType?: string;
    emergencyProcedures: string[];
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string; // User ID
  lastModifiedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Data Document Interface
 */
export interface IUserDataDocument extends Omit<IUserData, '_id'>, Document {}

/**
 * User Data Schema
 */
const userDataSchema = new Schema<IUserDataDocument>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  personalInfo: {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    middleName: { type: String, trim: true, maxlength: 50 },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    nationality: { type: String, required: true, trim: true },
    maritalStatus: {
      type: String,
      required: true,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    emergencyContact: {
      name: { type: String, required: true, trim: true },
      relationship: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true }
    }
  },
  
  contactInfo: {
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true }
    },
    alternatePhone: { type: String, trim: true },
    alternateEmail: { type: String, trim: true, lowercase: true }
  },
  
  employment: {
    employeeId: { type: String, required: true, unique: true, trim: true },
    position: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      enum: ['management', 'operations', 'hr', 'finance', 'sales', 'logistics', 'maintenance', 'field_work']
    },
    employmentType: {
      type: String,
      required: true,
      enum: ['full_time', 'part_time', 'contract', 'seasonal', 'intern']
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'terminated', 'on_leave', 'suspended'],
      default: 'active'
    },
    reportingManager: { type: String, ref: 'UserData' },
    workLocation: { type: String, required: true },
    workSchedule: {
      type: {
        type: String,
        required: true,
        enum: ['fixed', 'flexible', 'shift', 'rotating']
      },
      hoursPerWeek: { type: Number, required: true, min: 0, max: 168 },
      daysPerWeek: { type: Number, required: true, min: 0, max: 7 },
      startTime: { type: String },
      endTime: { type: String },
      timezone: { type: String, required: true }
    }
  },
  
  compensation: {
    salary: {
      baseSalary: { type: Number, required: true, min: 0 },
      hourlyRate: { type: Number, min: 0 },
      currency: { type: String, required: true, default: 'USD' },
      paymentFrequency: {
        type: String,
        required: true,
        enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'annually']
      }
    },
    benefits: {
      healthInsurance: { type: Boolean, default: false },
      dentalInsurance: { type: Boolean, default: false },
      visionInsurance: { type: Boolean, default: false },
      lifeInsurance: { type: Boolean, default: false },
      retirementPlan: { type: Boolean, default: false },
      paidTimeOff: { type: Number, default: 0, min: 0 },
      sickLeave: { type: Number, default: 0, min: 0 },
      otherBenefits: [{ type: String, trim: true }]
    },
    bonuses: {
      performanceBonus: { type: Number, default: 0, min: 0 },
      annualBonus: { type: Number, default: 0, min: 0 },
      commission: { type: Number, min: 0, max: 100 }
    }
  },
  
  legalDocuments: {
    passport: {
      number: { type: String, trim: true },
      country: { type: String, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ['valid', 'expired', 'expiring_soon'],
        default: 'valid'
      }
    },
    visa: {
      type: { type: String, trim: true },
      number: { type: String, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ['valid', 'expired', 'expiring_soon'],
        default: 'valid'
      }
    },
    workPermit: {
      number: { type: String, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ['valid', 'expired', 'expiring_soon'],
        default: 'valid'
      }
    },
    driverLicense: {
      number: { type: String, trim: true },
      state: { type: String, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ['valid', 'expired', 'expiring_soon'],
        default: 'valid'
      }
    }
  },
  
  insurance: {
    healthInsurance: {
      provider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
      coverageStart: { type: Date },
      coverageEnd: { type: Date },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
      }
    },
    lifeInsurance: {
      provider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
      coverageAmount: { type: Number, min: 0 },
      beneficiary: { type: String, trim: true },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
      }
    },
    workersCompensation: {
      provider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
      coverageStart: { type: Date },
      coverageEnd: { type: Date },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
      }
    }
  },
  
  timeOff: {
    totalDaysAllocated: { type: Number, default: 0, min: 0 },
    daysUsed: { type: Number, default: 0, min: 0 },
    daysRemaining: { type: Number, default: 0, min: 0 },
    requests: [{
      id: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['vacation', 'sick', 'personal', 'bereavement', 'maternity', 'paternity']
      },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      days: { type: Number, required: true, min: 0 },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'denied', 'cancelled'],
        default: 'pending'
      },
      reason: { type: String, required: true, trim: true },
      requestedDate: { type: Date, default: Date.now },
      approvedBy: { type: String, ref: 'UserData' },
      approvedDate: { type: Date }
    }]
  },
  
  performance: {
    kpis: [{
      name: { type: String, required: true, trim: true },
      target: { type: Number, required: true },
      actual: { type: Number, required: true },
      unit: { type: String, required: true, trim: true },
      period: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually']
      },
      lastUpdated: { type: Date, default: Date.now }
    }],
    reviews: [{
      id: { type: String, required: true },
      period: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      goals: [{ type: String, trim: true }],
      achievements: [{ type: String, trim: true }],
      areasForImprovement: [{ type: String, trim: true }],
      reviewer: { type: String, required: true, ref: 'UserData' },
      reviewDate: { type: Date, required: true }
    }],
    training: [{
      id: { type: String, required: true },
      name: { type: String, required: true, trim: true },
      type: {
        type: String,
        required: true,
        enum: ['mandatory', 'optional', 'certification']
      },
      status: {
        type: String,
        required: true,
        enum: ['not_started', 'in_progress', 'completed', 'expired'],
        default: 'not_started'
      },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      completionDate: { type: Date },
      certificate: { type: String, trim: true }
    }]
  },
  
  skills: {
    technical: [{ type: String, trim: true }],
    soft: [{ type: String, trim: true }],
    languages: [{
      language: { type: String, required: true, trim: true },
      proficiency: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, required: true, trim: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ['active', 'expired', 'expiring_soon'],
        default: 'active'
      }
    }]
  },
  
  emergency: {
    medicalConditions: [{ type: String, trim: true }],
    allergies: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    bloodType: { type: String, trim: true },
    emergencyProcedures: [{ type: String, trim: true }]
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
  collection: 'userdata'
});

// Indexes for performance
userDataSchema.index({ userId: 1 }, { unique: true });
userDataSchema.index({ 'employment.employeeId': 1 }, { unique: true });
userDataSchema.index({ 'employment.status': 1 });
userDataSchema.index({ 'employment.department': 1 });
userDataSchema.index({ 'employment.position': 1 });
userDataSchema.index({ 'employment.startDate': 1 });
userDataSchema.index({ 'personalInfo.dateOfBirth': 1 });
userDataSchema.index({ 'contactInfo.email': 1 });
userDataSchema.index({ 'contactInfo.phone': 1 });
userDataSchema.index({ createdAt: -1 });

// Pre-save middleware for calculations and validation
userDataSchema.pre('save', function(next) {
  // Calculate remaining time off days
  this.timeOff.daysRemaining = this.timeOff.totalDaysAllocated - this.timeOff.daysUsed;
  
  // Validate time off requests
  if (this.timeOff.daysUsed > this.timeOff.totalDaysAllocated) {
    return next(new Error('Days used cannot exceed total allocated days'));
  }
  
  // Update document status based on expiry dates
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  // Check passport expiry
  if (this.legalDocuments.passport.expiryDate) {
    if (this.legalDocuments.passport.expiryDate < now) {
      this.legalDocuments.passport.status = 'expired';
    } else if (this.legalDocuments.passport.expiryDate < thirtyDaysFromNow) {
      this.legalDocuments.passport.status = 'expiring_soon';
    } else {
      this.legalDocuments.passport.status = 'valid';
    }
  }
  
  // Check visa expiry
  if (this.legalDocuments.visa.expiryDate) {
    if (this.legalDocuments.visa.expiryDate < now) {
      this.legalDocuments.visa.status = 'expired';
    } else if (this.legalDocuments.visa.expiryDate < thirtyDaysFromNow) {
      this.legalDocuments.visa.status = 'expiring_soon';
    } else {
      this.legalDocuments.visa.status = 'valid';
    }
  }
  
  // Check work permit expiry
  if (this.legalDocuments.workPermit.expiryDate) {
    if (this.legalDocuments.workPermit.expiryDate < now) {
      this.legalDocuments.workPermit.status = 'expired';
    } else if (this.legalDocuments.workPermit.expiryDate < thirtyDaysFromNow) {
      this.legalDocuments.workPermit.status = 'expiring_soon';
    } else {
      this.legalDocuments.workPermit.status = 'valid';
    }
  }
  
  // Check driver license expiry
  if (this.legalDocuments.driverLicense.expiryDate) {
    if (this.legalDocuments.driverLicense.expiryDate < now) {
      this.legalDocuments.driverLicense.status = 'expired';
    } else if (this.legalDocuments.driverLicense.expiryDate < thirtyDaysFromNow) {
      this.legalDocuments.driverLicense.status = 'expiring_soon';
    } else {
      this.legalDocuments.driverLicense.status = 'valid';
    }
  }
  
  next();
});

// Instance methods
userDataSchema.methods.getFullName = function(): string {
  const { firstName, middleName, lastName } = this.personalInfo;
  return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
};

userDataSchema.methods.getAge = function(): number {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

userDataSchema.methods.getYearsOfService = function(): number {
  const today = new Date();
  const startDate = new Date(this.employment.startDate);
  let years = today.getFullYear() - startDate.getFullYear();
  const monthDiff = today.getMonth() - startDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
    years--;
  }
  
  return years;
};

userDataSchema.methods.isDocumentExpiring = function(days: number = 30): boolean {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  return (
    (this.legalDocuments.passport.expiryDate && this.legalDocuments.passport.expiryDate < cutoffDate) ||
    (this.legalDocuments.visa.expiryDate && this.legalDocuments.visa.expiryDate < cutoffDate) ||
    (this.legalDocuments.workPermit.expiryDate && this.legalDocuments.workPermit.expiryDate < cutoffDate) ||
    (this.legalDocuments.driverLicense.expiryDate && this.legalDocuments.driverLicense.expiryDate < cutoffDate)
  );
};

userDataSchema.methods.getTotalCompensation = function(): number {
  const baseSalary = this.compensation.salary.baseSalary;
  const performanceBonus = this.compensation.bonuses.performanceBonus;
  const annualBonus = this.compensation.bonuses.annualBonus;
  
  return baseSalary + performanceBonus + annualBonus;
};

userDataSchema.methods.getAveragePerformanceRating = function(): number {
  if (this.performance.reviews.length === 0) return 0;
  
  const totalRating = this.performance.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
  return totalRating / this.performance.reviews.length;
};

userDataSchema.methods.getPendingTimeOffRequests = function() {
  return this.timeOff.requests.filter((request: any) => request.status === 'pending');
};

userDataSchema.methods.getUpcomingTraining = function() {
  const now = new Date();
  return this.performance.training.filter((training: any) => 
    training.status === 'not_started' || training.status === 'in_progress'
  );
};

// Static methods
userDataSchema.statics.findByDepartment = function(department: string) {
  return this.find({ 'employment.department': department, isActive: true });
};

userDataSchema.statics.findByStatus = function(status: string) {
  return this.find({ 'employment.status': status, isActive: true });
};

userDataSchema.statics.findByPosition = function(position: string) {
  return this.find({ 'employment.position': position, isActive: true });
};

userDataSchema.statics.findExpiringDocuments = function(days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  return this.find({
    $or: [
      { 'legalDocuments.passport.expiryDate': { $lte: cutoffDate } },
      { 'legalDocuments.visa.expiryDate': { $lte: cutoffDate } },
      { 'legalDocuments.workPermit.expiryDate': { $lte: cutoffDate } },
      { 'legalDocuments.driverLicense.expiryDate': { $lte: cutoffDate } }
    ],
    isActive: true
  });
};

userDataSchema.statics.findByManager = function(managerId: string) {
  return this.find({ 'employment.reportingManager': managerId, isActive: true });
};

userDataSchema.statics.findByWorkLocation = function(workLocation: string) {
  return this.find({ 'employment.workLocation': workLocation, isActive: true });
};

// Transform to JSON
userDataSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const UserData = mongoose.model<IUserDataDocument>('UserData', userDataSchema);
