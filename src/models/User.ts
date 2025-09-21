import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole, DataProtectionLevel } from '@/types';
import { encryptionService } from '@/utils/encryption';

// User Document Interface
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  isRole(role: UserRole): boolean;
  hasPermission(permission: string): boolean;
}

// User Schema
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.WORKER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Encrypted fields
  phoneNumber: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  emergencyContact: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await encryptionService.hashPassword(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware for encrypting sensitive fields
userSchema.pre('save', async function(next) {
  try {
    // Encrypt sensitive fields before saving
    if (this.isModified('phoneNumber') && this.phoneNumber) {
      const encrypted = encryptionService.encrypt(this.phoneNumber, DataProtectionLevel.CONFIDENTIAL);
      this.phoneNumber = JSON.stringify(encrypted);
    }
    
    if (this.isModified('address') && this.address) {
      const encrypted = encryptionService.encrypt(this.address, DataProtectionLevel.CONFIDENTIAL);
      this.address = JSON.stringify(encrypted);
    }
    
    if (this.isModified('emergencyContact') && this.emergencyContact) {
      const encrypted = encryptionService.encrypt(this.emergencyContact, DataProtectionLevel.CONFIDENTIAL);
      this.emergencyContact = JSON.stringify(encrypted);
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Post-find middleware for decrypting sensitive fields
userSchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
  if (!docs) return;
  
  const decryptFields = (doc: any) => {
    if (doc.phoneNumber) {
      try {
        const encrypted = JSON.parse(doc.phoneNumber);
        doc.phoneNumber = encryptionService.decrypt(encrypted, DataProtectionLevel.CONFIDENTIAL);
      } catch (error) {
        console.error('Failed to decrypt phoneNumber:', error);
      }
    }
    
    if (doc.address) {
      try {
        const encrypted = JSON.parse(doc.address);
        doc.address = encryptionService.decrypt(encrypted, DataProtectionLevel.CONFIDENTIAL);
      } catch (error) {
        console.error('Failed to decrypt address:', error);
      }
    }
    
    if (doc.emergencyContact) {
      try {
        const encrypted = JSON.parse(doc.emergencyContact);
        doc.emergencyContact = encryptionService.decrypt(encrypted, DataProtectionLevel.CONFIDENTIAL);
      } catch (error) {
        console.error('Failed to decrypt emergencyContact:', error);
      }
    }
  };
  
  if (Array.isArray(docs)) {
    docs.forEach(decryptFields);
  } else {
    decryptFields(docs);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return encryptionService.verifyPassword(candidatePassword, this.password);
};

userSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.isRole = function(role: UserRole): boolean {
  return this.role === role;
};

userSchema.methods.hasPermission = function(permission: string): boolean {
  // Define role-based permissions
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ['*'], // All permissions
    [UserRole.MANAGER]: ['farm.read', 'farm.write', 'user.read', 'report.read', 'report.write'],
    [UserRole.AGRONOMIST]: ['farm.read', 'crop.read', 'crop.write', 'report.read'],
    [UserRole.FARMER]: ['farm.read', 'field.read', 'field.write', 'worker.read', 'worker.write'],
    [UserRole.WORKER]: ['field.read', 'task.read', 'task.write'],
    [UserRole.HR]: ['user.read', 'user.write', 'worker.read', 'worker.write', 'report.read'],
    [UserRole.SALES]: ['customer.read', 'customer.write', 'order.read', 'order.write', 'report.read'],
    [UserRole.DEMO]: ['farm.read', 'field.read', 'report.read'] // Limited demo access
  };
  
  const userPermissions = rolePermissions[this.role] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
