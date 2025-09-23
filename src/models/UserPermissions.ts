import mongoose, { Document, Schema } from 'mongoose';

// Interface for granular user permissions
export interface IUserPermissions {
  userId: string;
  assignedBy: string; // Manager or Admin who assigned these permissions
  
  // Farm-specific access
  farmAccess: {
    [farmId: string]: {
      role: 'admin' | 'manager' | 'farmer' | 'worker' | 'sales' | 'hr' | 'agronomist' | 'demo';
      permissions: string[]; // Specific permissions for this farm
      restrictions?: {
        blocksOnly?: string[]; // Specific block IDs this user can access
        plantsOnly?: string[]; // Specific plant types this user can work with
        customersOnly?: string[]; // Specific customer IDs for sales users
        scheduleRestrictions?: {
          allowedHours?: { start: string; end: string }; // HH:MM format
          allowedDays?: number[]; // 0-6 (Sunday-Saturday)
          blackoutDates?: Date[]; // Dates when access is not allowed
        };
      };
      
      // Farm-specific capabilities
      capabilities: {
        canViewReports: boolean;
        canEditData: boolean;
        canDeleteData: boolean;
        canManageUsers: boolean;
        canManageEquipment: boolean;
        canAccessFinancials: boolean;
        canOverrideSystems: boolean;
        canApproveOrders: boolean;
        maxOrderValue?: number; // Maximum order value for sales users
        
        // Task-specific capabilities
        taskPermissions: {
          canCreateTasks: boolean;
          canAssignTasks: boolean;
          canModifyTasks: boolean;
          canViewAllTasks: boolean;
          taskCategories: string[]; // Which task categories they can handle
        };
        
        // Data access levels
        dataAccess: {
          level: 'read_only' | 'read_write' | 'full_access';
          sensitiveData: boolean; // Can access financial, personal data
          historicalData: boolean; // Can access historical records
          analyticsData: boolean; // Can access analytics and reports
        };
      };
    };
  };

  // Global permissions (across all farms)
  globalPermissions?: {
    systemAdmin: boolean;
    crossFarmReports: boolean;
    userManagement: boolean;
    systemConfiguration: boolean;
    auditAccess: boolean;
    emergencyOverride: boolean;
  };

  // Role hierarchy and delegation
  hierarchy: {
    canDelegateTo?: string[]; // User IDs this user can delegate tasks to
    reportsTo?: string; // User ID of supervisor
    canSupervise?: string[]; // User IDs this user supervises
    approvalAuthority?: {
      maxAmount: number; // Maximum amount they can approve
      requiresCountersignature?: boolean;
      categories: string[]; // What categories they can approve
    };
  };

  // Time-based permissions
  temporaryAccess?: {
    [farmId: string]: {
      startDate: Date;
      endDate: Date;
      reason: string;
      grantedBy: string;
      specialPermissions: string[];
    };
  };

  // Compliance and certification
  compliance: {
    certifications: {
      [certificationType: string]: {
        certificationId: string;
        issuedDate: Date;
        expiryDate: Date;
        issuingBody: string;
        status: 'active' | 'expired' | 'suspended' | 'pending_renewal';
      };
    };
    
    trainingCompleted: {
      [trainingType: string]: {
        completedDate: Date;
        instructor: string;
        validUntil?: Date;
        score?: number;
      };
    };
    
    safetyRequirements: {
      [requirement: string]: {
        status: 'compliant' | 'non_compliant' | 'pending';
        lastChecked: Date;
        nextDue?: Date;
      };
    };
  };

  // Activity tracking
  activity: {
    lastLogin?: Date;
    lastFarmAccess?: { [farmId: string]: Date };
    loginHistory: {
      timestamp: Date;
      location?: string;
      ipAddress?: string;
      userAgent?: string;
    }[];
    
    permissionUsage: {
      [permission: string]: {
        timesUsed: number;
        lastUsed: Date;
        averageFrequency: number; // Uses per day
      };
    };
  };

  // Security and monitoring
  security: {
    alertPreferences: {
      securityAlerts: boolean;
      systemAlerts: boolean;
      taskAlerts: boolean;
      performanceAlerts: boolean;
      emergencyAlerts: boolean;
      
      notificationChannels: ('app' | 'email' | 'sms' | 'dashboard')[];
    };
    
    securityFlags: {
      requireTwoFactor: boolean;
      suspiciousActivity: boolean;
      accountLocked: boolean;
      passwordExpired: boolean;
      lastSecurityCheck: Date;
    };
    
    auditTrail: {
      action: string;
      timestamp: Date;
      farmId?: string;
      blockId?: string;
      details: string;
      ipAddress?: string;
    }[];
  };

  // Performance and analytics
  performance: {
    productivity: {
      [farmId: string]: {
        tasksCompleted: number;
        averageTaskTime: number;
        qualityRating: number;
        efficiencyScore: number;
        lastCalculated: Date;
      };
    };
    
    goals: {
      [metric: string]: {
        target: number;
        current: number;
        deadline?: Date;
        farmSpecific?: string; // Farm ID if goal is farm-specific
      };
    };
    
    achievements: {
      type: string;
      title: string;
      description: string;
      earnedDate: Date;
      farmId?: string;
    }[];
  };

  // Metadata
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface IUserPermissionsDocument extends Omit<IUserPermissions, '_id'>, Document {}

const userPermissionsSchema = new Schema<IUserPermissionsDocument>({
  userId: { type: String, required: true, unique: true, index: true },
  assignedBy: { type: String, required: true, index: true },

  farmAccess: {
    type: Map,
    of: {
      role: { 
        type: String, 
        required: true,
        enum: ['admin', 'manager', 'farmer', 'worker', 'sales', 'hr', 'agronomist', 'demo']
      },
      permissions: [{ type: String }],
      restrictions: {
        blocksOnly: [{ type: String }],
        plantsOnly: [{ type: String }],
        customersOnly: [{ type: String }],
        scheduleRestrictions: {
          allowedHours: {
            start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
            end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
          },
          allowedDays: [{ type: Number, min: 0, max: 6 }],
          blackoutDates: [{ type: Date }]
        }
      },
      capabilities: {
        canViewReports: { type: Boolean, default: false },
        canEditData: { type: Boolean, default: false },
        canDeleteData: { type: Boolean, default: false },
        canManageUsers: { type: Boolean, default: false },
        canManageEquipment: { type: Boolean, default: false },
        canAccessFinancials: { type: Boolean, default: false },
        canOverrideSystems: { type: Boolean, default: false },
        canApproveOrders: { type: Boolean, default: false },
        maxOrderValue: { type: Number, min: 0 },
        
        taskPermissions: {
          canCreateTasks: { type: Boolean, default: false },
          canAssignTasks: { type: Boolean, default: false },
          canModifyTasks: { type: Boolean, default: false },
          canViewAllTasks: { type: Boolean, default: false },
          taskCategories: [{ type: String }]
        },
        
        dataAccess: {
          level: { 
            type: String, 
            enum: ['read_only', 'read_write', 'full_access'],
            default: 'read_only'
          },
          sensitiveData: { type: Boolean, default: false },
          historicalData: { type: Boolean, default: true },
          analyticsData: { type: Boolean, default: false }
        }
      }
    },
    default: new Map()
  },

  globalPermissions: {
    systemAdmin: { type: Boolean, default: false },
    crossFarmReports: { type: Boolean, default: false },
    userManagement: { type: Boolean, default: false },
    systemConfiguration: { type: Boolean, default: false },
    auditAccess: { type: Boolean, default: false },
    emergencyOverride: { type: Boolean, default: false }
  },

  hierarchy: {
    canDelegateTo: [{ type: String }],
    reportsTo: { type: String },
    canSupervise: [{ type: String }],
    approvalAuthority: {
      maxAmount: { type: Number, min: 0, default: 0 },
      requiresCountersignature: { type: Boolean, default: false },
      categories: [{ type: String }]
    }
  },

  temporaryAccess: {
    type: Map,
    of: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, required: true },
      grantedBy: { type: String, required: true },
      specialPermissions: [{ type: String }]
    },
    default: new Map()
  },

  compliance: {
    certifications: {
      type: Map,
      of: {
        certificationId: { type: String, required: true },
        issuedDate: { type: Date, required: true },
        expiryDate: { type: Date, required: true },
        issuingBody: { type: String, required: true },
        status: { 
          type: String, 
          enum: ['active', 'expired', 'suspended', 'pending_renewal'],
          default: 'active'
        }
      },
      default: new Map()
    },
    
    trainingCompleted: {
      type: Map,
      of: {
        completedDate: { type: Date, required: true },
        instructor: { type: String, required: true },
        validUntil: { type: Date },
        score: { type: Number, min: 0, max: 100 }
      },
      default: new Map()
    },
    
    safetyRequirements: {
      type: Map,
      of: {
        status: { 
          type: String, 
          enum: ['compliant', 'non_compliant', 'pending'],
          default: 'pending'
        },
        lastChecked: { type: Date, required: true },
        nextDue: { type: Date }
      },
      default: new Map()
    }
  },

  activity: {
    lastLogin: { type: Date },
    lastFarmAccess: {
      type: Map,
      of: Date,
      default: new Map()
    },
    loginHistory: [{
      timestamp: { type: Date, required: true, default: Date.now },
      location: { type: String },
      ipAddress: { type: String },
      userAgent: { type: String }
    }],
    
    permissionUsage: {
      type: Map,
      of: {
        timesUsed: { type: Number, default: 0 },
        lastUsed: { type: Date },
        averageFrequency: { type: Number, default: 0 }
      },
      default: new Map()
    }
  },

  security: {
    alertPreferences: {
      securityAlerts: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      taskAlerts: { type: Boolean, default: true },
      performanceAlerts: { type: Boolean, default: false },
      emergencyAlerts: { type: Boolean, default: true },
      notificationChannels: [{ 
        type: String, 
        enum: ['app', 'email', 'sms', 'dashboard']
      }]
    },
    
    securityFlags: {
      requireTwoFactor: { type: Boolean, default: false },
      suspiciousActivity: { type: Boolean, default: false },
      accountLocked: { type: Boolean, default: false },
      passwordExpired: { type: Boolean, default: false },
      lastSecurityCheck: { type: Date, default: Date.now }
    },
    
    auditTrail: [{
      action: { type: String, required: true },
      timestamp: { type: Date, required: true, default: Date.now },
      farmId: { type: String },
      blockId: { type: String },
      details: { type: String, required: true },
      ipAddress: { type: String }
    }]
  },

  performance: {
    productivity: {
      type: Map,
      of: {
        tasksCompleted: { type: Number, default: 0 },
        averageTaskTime: { type: Number, default: 0 },
        qualityRating: { type: Number, default: 5, min: 1, max: 5 },
        efficiencyScore: { type: Number, default: 100, min: 0, max: 100 },
        lastCalculated: { type: Date, default: Date.now }
      },
      default: new Map()
    },
    
    goals: {
      type: Map,
      of: {
        target: { type: Number, required: true },
        current: { type: Number, default: 0 },
        deadline: { type: Date },
        farmSpecific: { type: String }
      },
      default: new Map()
    },
    
    achievements: [{
      type: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      earnedDate: { type: Date, required: true, default: Date.now },
      farmId: { type: String }
    }]
  },

  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  effectiveDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }
});

// Indexes for performance
userPermissionsSchema.index({ userId: 1 });
userPermissionsSchema.index({ assignedBy: 1, createdAt: -1 });
userPermissionsSchema.index({ 'hierarchy.reportsTo': 1 });
userPermissionsSchema.index({ effectiveDate: 1, expiryDate: 1 });
userPermissionsSchema.index({ isActive: 1, effectiveDate: -1 });

// Pre-save middleware
userPermissionsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
userPermissionsSchema.methods.hasPermission = function(farmId: string, permission: string): boolean {
  if (!this.isActive) return false;
  
  // Check if current date is within effective period
  const now = new Date();
  if (now < this.effectiveDate) return false;
  if (this.expiryDate && now > this.expiryDate) return false;
  
  // Check global permissions first
  if (this.globalPermissions?.systemAdmin) return true;
  
  // Check farm-specific permissions
  const farmAccess = this.farmAccess.get(farmId);
  if (!farmAccess) return false;
  
  return farmAccess.permissions.includes(permission);
};

userPermissionsSchema.methods.canAccessFarm = function(farmId: string): boolean {
  if (!this.isActive) return false;
  
  // Check if current date is within effective period
  const now = new Date();
  if (now < this.effectiveDate) return false;
  if (this.expiryDate && now > this.expiryDate) return false;
  
  // Check global admin access
  if (this.globalPermissions?.systemAdmin) return true;
  
  // Check farm-specific access
  const farmAccess = this.farmAccess.get(farmId);
  if (!farmAccess) return false;
  
  // Check temporary access
  const tempAccess = this.temporaryAccess?.get(farmId);
  if (tempAccess) {
    return now >= tempAccess.startDate && now <= tempAccess.endDate;
  }
  
  return true;
};

userPermissionsSchema.methods.canAccessBlock = function(farmId: string, blockId: string): boolean {
  if (!this.canAccessFarm(farmId)) return false;
  
  const farmAccess = this.farmAccess.get(farmId);
  if (!farmAccess) return false;
  
  // If no block restrictions, can access any block in the farm
  if (!farmAccess.restrictions?.blocksOnly) return true;
  
  // Check if user has access to this specific block
  return farmAccess.restrictions.blocksOnly.includes(blockId);
};

userPermissionsSchema.methods.canManageCustomer = function(farmId: string, customerId: string): boolean {
  if (!this.canAccessFarm(farmId)) return false;
  
  const farmAccess = this.farmAccess.get(farmId);
  if (!farmAccess) return false;
  
  // Only sales users with customer restrictions need to be checked
  if (farmAccess.role !== 'sales') return true;
  
  // If no customer restrictions, can manage any customer
  if (!farmAccess.restrictions?.customersOnly) return true;
  
  // Check if user has access to this specific customer
  return farmAccess.restrictions.customersOnly.includes(customerId);
};

userPermissionsSchema.methods.isWithinSchedule = function(farmId: string): boolean {
  const farmAccess = this.farmAccess.get(farmId);
  if (!farmAccess?.restrictions?.scheduleRestrictions) return true;
  
  const restrictions = farmAccess.restrictions.scheduleRestrictions;
  const now = new Date();
  
  // Check allowed days
  if (restrictions.allowedDays && !restrictions.allowedDays.includes(now.getDay())) {
    return false;
  }
  
  // Check allowed hours
  if (restrictions.allowedHours) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTimeString(restrictions.allowedHours.start);
    const endTime = this.parseTimeString(restrictions.allowedHours.end);
    
    if (startTime <= endTime) {
      if (currentTime < startTime || currentTime > endTime) return false;
    } else {
      // Overnight range
      if (currentTime < startTime && currentTime > endTime) return false;
    }
  }
  
  // Check blackout dates
  if (restrictions.blackoutDates) {
    const today = now.toDateString();
    return !restrictions.blackoutDates.some((date: any) => date.toDateString() === today);
  }
  
  return true;
};

userPermissionsSchema.methods.parseTimeString = function(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

userPermissionsSchema.methods.getFarmRole = function(farmId: string): string | null {
  const farmAccess = this.farmAccess.get(farmId);
  return farmAccess ? farmAccess.role : null;
};

userPermissionsSchema.methods.canApproveAmount = function(amount: number): boolean {
  const approvalAuthority = this.hierarchy.approvalAuthority;
  if (!approvalAuthority) return false;
  
  return amount <= approvalAuthority.maxAmount;
};

userPermissionsSchema.methods.updateActivity = function(action: string, farmId?: string, blockId?: string, details?: string, ipAddress?: string) {
  // Update permission usage
  const usage = this.activity.permissionUsage.get(action) || {
    timesUsed: 0,
    lastUsed: new Date(),
    averageFrequency: 0
  };
  
  usage.timesUsed += 1;
  usage.lastUsed = new Date();
  this.activity.permissionUsage.set(action, usage);
  
  // Update farm access time
  if (farmId) {
    this.activity.lastFarmAccess.set(farmId, new Date());
  }
  
  // Add to audit trail
  this.security.auditTrail.push({
    action,
    timestamp: new Date(),
    farmId,
    blockId,
    details: details || `User performed ${action}`,
    ipAddress
  });
  
  // Keep only last 1000 audit entries
  if (this.security.auditTrail.length > 1000) {
    this.security.auditTrail = this.security.auditTrail.slice(-1000);
  }
};

userPermissionsSchema.methods.addTemporaryAccess = function(farmId: string, startDate: Date, endDate: Date, reason: string, grantedBy: string, permissions: string[] = []) {
  this.temporaryAccess = this.temporaryAccess || new Map();
  this.temporaryAccess.set(farmId, {
    startDate,
    endDate,
    reason,
    grantedBy,
    specialPermissions: permissions
  });
};

userPermissionsSchema.methods.revokeTemporaryAccess = function(farmId: string) {
  if (this.temporaryAccess) {
    this.temporaryAccess.delete(farmId);
  }
};

// Transform function for JSON output
userPermissionsSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete (ret as any).__v;
    return ret;
  }
});

export const UserPermissions = mongoose.model<IUserPermissionsDocument>('UserPermissions', userPermissionsSchema);
