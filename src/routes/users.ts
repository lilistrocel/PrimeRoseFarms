import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';

const router = Router();

// Create new user (Admin only)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, address, department } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName, lastName, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Create new user
    const userData: any = {
      email,
      password,
      firstName,
      lastName,
      role,
      isActive: true
    };

    // Add optional fields if provided
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (address) userData.address = address;
    if (department) userData.department = department;

    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    logger.info(LogCategory.USER, 'User created successfully', {
      createdBy: req.user?.userId,
      newUserId: user._id,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });

  } catch (error: any) {
    logger.error(LogCategory.USER, 'Error creating user', {
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users (Admin only)
router.get('/', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    logger.info(LogCategory.USER, 'Users retrieved', {
      userId: req.user?.userId,
      count: users.length,
      total,
      filters: filter
    });

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to get users', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Users can view their own profile, admins/managers/hr can view any profile
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.MANAGER && req.user?.role !== UserRole.HR && req.user?.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(LogCategory.USER, 'User retrieved', {
      requestedBy: req.user?.userId,
      userId: id
    });

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to get user', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Update user profile
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Users can update their own profile (limited fields), admins/managers/hr can update any profile
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.MANAGER && req.user?.role !== UserRole.HR && req.user?.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Non-admin users can only update certain fields
    if (req.user?.role !== UserRole.ADMIN && req.user?.userId === id) {
      const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'address'];
      const filteredUpdates: any = {};
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }
      Object.assign(updates, filteredUpdates);
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(LogCategory.USER, 'User updated', {
      updatedBy: req.user?.userId,
      userId: id,
      updates: Object.keys(updates)
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to update user', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Change user password
router.put('/:id/password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password
    if (req.user?.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(LogCategory.USER, 'Password changed', {
      userId: id
    });

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to change password', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Deactivate user (Admin only)
router.put('/:id/deactivate', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(LogCategory.USER, 'User deactivated', {
      deactivatedBy: req.user?.userId,
      userId: id
    });

    return res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to deactivate user', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Activate user (Admin only)
router.put('/:id/activate', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(LogCategory.USER, 'User activated', {
      activatedBy: req.user?.userId,
      userId: id
    });

    return res.json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to activate user', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.userId === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(LogCategory.USER, 'User deleted', {
      deletedBy: req.user?.userId,
      userId: id
    });

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error(LogCategory.USER, 'Failed to delete user', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

export default router;
