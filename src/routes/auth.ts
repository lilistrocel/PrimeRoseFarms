import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';

const router = Router();

// Debug: Check if auth routes are loading
console.log('🔐 Auth routes loaded successfully');

// Register new user
router.post('/register', async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    logger.debug(LogCategory.AUTH, 'Registration attempt started', { body: req.body });
    const { email, password, firstName, lastName, role, phoneNumber, address } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, firstName, lastName, role'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber: phoneNumber || '',
      address: address || '',
      isActive: true
    });

    await user.save();

    // Generate tokens
    const token = generateToken({ userId: (user._id as any).toString(), email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: (user._id as any).toString(), email: user.email, role: user.role });

    logger.info(LogCategory.AUTH, 'User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(LogCategory.AUTH, 'Registration failed', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(LogCategory.AUTH, 'Login attempt with non-existent email', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(LogCategory.AUTH, 'Login attempt with inactive user', { userId: user._id, email });
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(LogCategory.AUTH, 'Login attempt with invalid password', { userId: user._id, email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({ userId: (user._id as any).toString(), email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: (user._id as any).toString(), email: user.email, role: user.role });

    logger.info(LogCategory.AUTH, 'User logged in successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(LogCategory.AUTH, 'Login failed', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newToken = generateToken({ userId: (user._id as any).toString(), email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: (user._id as any).toString(), email: user.email, role: user.role });

    logger.info(LogCategory.AUTH, 'Token refreshed successfully', {
      userId: user._id,
      email: user.email
    });

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error(LogCategory.AUTH, 'Token refresh failed', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Logout user
router.post('/logout', async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just return a success response
    logger.info(LogCategory.AUTH, 'User logged out', {
      userId: req.user?.userId,
      email: req.user?.email
    });

    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error(LogCategory.AUTH, 'Logout failed', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/me', async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          address: user.address,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    logger.error(LogCategory.AUTH, 'Get profile failed', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

export default router;
