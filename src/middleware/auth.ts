import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserPermissions } from '../models/UserPermissions';
import { IJWTPayload, UserRole } from '../types';
import { logger, LogCategory } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Authentication middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('_id email role isActive');
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // Add user info to request
    req.user = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }
};

/**
 * Authorization middleware - check if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      if (!user.hasPermission(permission)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;
      const user = await User.findById(decoded.userId).select('_id email role isActive');
      
      if (user && user.isActive) {
        req.user = {
          userId: (user._id as any).toString(),
          email: user.email,
          role: user.role
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Extract token from request headers
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<IJWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<IJWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  } as jwt.SignOptions);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): IJWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as IJWTPayload;
};

/**
 * Farm-specific authorization middleware
 */
export const requireFarmAccess = (farmIdParam: string = 'farmId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const farmId = req.params[farmIdParam] || req.query[farmIdParam] || req.body[farmIdParam];
      
      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID required'
        });
        return;
      }

      const permissions = await UserPermissions.findOne({ userId: req.user.userId, isActive: true });
      
      if (!permissions) {
        res.status(403).json({
          success: false,
          message: 'No permissions found for user'
        });
        return;
      }

      if (!(permissions as any).canAccessFarm(farmId as string)) {
        logger.info(LogCategory.SECURITY, 'Farm access denied', {
          userId: req.user.userId,
          farmId,
          reason: 'No farm access permission'
        });
        
        res.status(403).json({
          success: false,
          message: 'Access denied to this farm'
        });
        return;
      }

      // Check schedule restrictions
      if (!(permissions as any).isWithinSchedule(farmId as string)) {
        logger.info(LogCategory.SECURITY, 'Farm access denied due to schedule', {
          userId: req.user.userId,
          farmId,
          reason: 'Outside allowed schedule'
        });
        
        res.status(403).json({
          success: false,
          message: 'Access denied outside allowed schedule'
        });
        return;
      }

      // Update activity tracking
      (permissions as any).updateActivity('farm_access', farmId as string, undefined, 'Accessed farm', req.ip);
      await permissions.save();

      // Add permissions to request for further use
      (req as any).userPermissions = permissions;
      (req as any).currentFarmId = farmId;

      next();
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Farm access check failed', {
        userId: req.user?.userId,
        error: (error as Error).message
      });
      
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Block-specific authorization middleware
 */
export const requireBlockAccess = (blockIdParam: string = 'blockId', farmIdParam: string = 'farmId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const farmId = req.params[farmIdParam] || req.query[farmIdParam] || req.body[farmIdParam];
      const blockId = req.params[blockIdParam] || req.query[blockIdParam] || req.body[blockIdParam];
      
      if (!farmId || !blockId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID and Block ID required'
        });
        return;
      }

      const permissions = await UserPermissions.findOne({ userId: req.user.userId, isActive: true });
      
      if (!permissions) {
        res.status(403).json({
          success: false,
          message: 'No permissions found for user'
        });
        return;
      }

      if (!(permissions as any).canAccessBlock(farmId as string, blockId as string)) {
        logger.info(LogCategory.SECURITY, 'Block access denied', {
          userId: req.user.userId,
          farmId,
          blockId,
          reason: 'No block access permission'
        });
        
        res.status(403).json({
          success: false,
          message: 'Access denied to this block'
        });
        return;
      }

      // Update activity tracking
      (permissions as any).updateActivity('block_access', farmId as string, blockId as string, 'Accessed block', req.ip);
      await permissions.save();

      // Add permissions to request for further use
      (req as any).userPermissions = permissions;
      (req as any).currentFarmId = farmId;
      (req as any).currentBlockId = blockId;

      next();
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Block access check failed', {
        userId: req.user?.userId,
        error: (error as Error).message
      });
      
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Permission-based authorization with farm context
 */
export const requireFarmPermission = (permission: string, farmIdParam: string = 'farmId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const farmId = req.params[farmIdParam] || req.query[farmIdParam] || req.body[farmIdParam];
      
      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID required'
        });
        return;
      }

      const permissions = await UserPermissions.findOne({ userId: req.user.userId, isActive: true });
      
      if (!permissions) {
        res.status(403).json({
          success: false,
          message: 'No permissions found for user'
        });
        return;
      }

      if (!(permissions as any).hasPermission(farmId as string, permission)) {
        logger.info(LogCategory.SECURITY, 'Permission denied', {
          userId: req.user.userId,
          farmId,
          permission,
          reason: 'Insufficient permissions'
        });
        
        res.status(403).json({
          success: false,
          message: `Permission denied: ${permission}`
        });
        return;
      }

      // Update activity tracking
      (permissions as any).updateActivity(permission, farmId as string, undefined, `Used permission: ${permission}`, req.ip);
      await permissions.save();

      next();
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Permission check failed', {
        userId: req.user?.userId,
        permission,
        error: (error as Error).message
      });
      
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Customer access authorization for sales users
 */
export const requireCustomerAccess = (customerIdParam: string = 'customerId', farmIdParam: string = 'farmId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const farmId = req.params[farmIdParam] || req.query[farmIdParam] || req.body[farmIdParam];
      const customerId = req.params[customerIdParam] || req.query[customerIdParam] || req.body[customerIdParam];
      
      if (!farmId || !customerId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID and Customer ID required'
        });
        return;
      }

      const permissions = await UserPermissions.findOne({ userId: req.user.userId, isActive: true });
      
      if (!permissions) {
        res.status(403).json({
          success: false,
          message: 'No permissions found for user'
        });
        return;
      }

      if (!(permissions as any).canManageCustomer(farmId as string, customerId as string)) {
        logger.info(LogCategory.SECURITY, 'Customer access denied', {
          userId: req.user.userId,
          farmId,
          customerId,
          reason: 'No customer access permission'
        });
        
        res.status(403).json({
          success: false,
          message: 'Access denied to this customer'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Customer access check failed', {
        userId: req.user?.userId,
        error: (error as Error).message
      });
      
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Approval authorization middleware
 */
export const requireApprovalAuthority = (minimumAmount: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const permissions = await UserPermissions.findOne({ userId: req.user.userId, isActive: true });
      
      if (!permissions) {
        res.status(403).json({
          success: false,
          message: 'No permissions found for user'
        });
        return;
      }

      if (!(permissions as any).canApproveAmount(minimumAmount)) {
        logger.info(LogCategory.SECURITY, 'Approval authority insufficient', {
          userId: req.user.userId,
          requiredAmount: minimumAmount,
          userLimit: permissions.hierarchy.approvalAuthority?.maxAmount || 0,
          reason: 'Insufficient approval authority'
        });
        
        res.status(403).json({
          success: false,
          message: `Approval authority insufficient for amount: ${minimumAmount}`
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Approval authority check failed', {
        userId: req.user?.userId,
        error: (error as Error).message
      });
      
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};
