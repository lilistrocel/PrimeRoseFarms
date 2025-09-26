import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';
import { PlantData } from '../models/PlantData';

const router = Router();

// All plant data routes require authentication
router.use(authenticate);

/**
 * @route GET /api/plant-data
 * @desc Get all plant data with filtering and pagination
 * @access Admin, Manager, Agronomist
 */
router.get('/', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      category, 
      search, 
      isActive = 'true' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== 'all') filter.isActive = isActive === 'true';

    // Get total count for pagination
    const total = await PlantData.countDocuments(filter);

    // Get plant data with pagination
    const plants = await PlantData.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    logger.info(LogCategory.API, 'Plant data retrieved', {
      userId: req.user?.userId,
      total,
      returned: plants.length,
      filters: { category, search, isActive }
    });

    return res.json({
      success: true,
      data: {
        plants,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to get plant data', { 
      error: (error as Error).message,
      userId: req.user?.userId 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to get plant data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/plant-data/:id
 * @desc Get specific plant data by ID
 * @access Admin, Manager, Agronomist
 */
router.get('/:id', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await PlantData.findById(id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    logger.info(LogCategory.API, 'Plant data retrieved by ID', {
      userId: req.user?.userId,
      plantId: id
    });

    return res.json({
      success: true,
      data: { plant }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to get plant data by ID', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to get plant data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/plant-data
 * @desc Create new plant data
 * @access Admin, Manager, Agronomist
 */
router.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const plantData = new PlantData({
      ...req.body,
      createdBy: req.user?.userId,
      lastModifiedBy: req.user?.userId,
      isActive: true
    });

    await plantData.save();

    logger.info(LogCategory.API, 'Plant data created', {
      userId: req.user?.userId,
      plantId: plantData._id,
      plantName: plantData.name
    });

    return res.status(201).json({
      success: true,
      message: 'Plant data created successfully',
      data: { plant: plantData }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to create plant data', { 
      error: (error as Error).message,
      userId: req.user?.userId 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to create plant data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/plant-data/:id
 * @desc Update plant data
 * @access Admin, Manager, Agronomist
 */
router.put('/:id', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await PlantData.findById(id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    // Update plant data
    Object.assign(plant, req.body);
    plant.lastModifiedBy = req.user?.userId as string;
    plant.updatedAt = new Date();

    await plant.save();

    logger.info(LogCategory.API, 'Plant data updated', {
      userId: req.user?.userId,
      plantId: id,
      plantName: plant.name
    });

    return res.json({
      success: true,
      message: 'Plant data updated successfully',
      data: { plant }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to update plant data', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to update plant data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route DELETE /api/plant-data/:id
 * @desc Soft delete plant data (set isActive to false)
 * @access Admin, Manager
 */
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.MANAGER), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await PlantData.findById(id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    // Soft delete using updateOne to avoid validation issues
    await PlantData.updateOne(
      { _id: id },
      {
        $set: {
          isActive: false,
          lastModifiedBy: req.user?.userId,
          updatedAt: new Date()
        }
      }
    );

    logger.info(LogCategory.API, 'Plant data deactivated', {
      userId: req.user?.userId,
      plantId: id,
      plantName: plant.name
    });

    return res.json({
      success: true,
      message: 'Plant data deactivated successfully'
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to deactivate plant data', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate plant data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/plant-data/categories
 * @desc Get all plant categories
 * @access Admin, Manager, Agronomist
 */
router.get('/categories', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const categories = await PlantData.distinct('category', { isActive: true });

    logger.info(LogCategory.API, 'Plant categories retrieved', {
      userId: req.user?.userId,
      categoriesCount: categories.length
    });

    return res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to get plant categories', { 
      error: (error as Error).message,
      userId: req.user?.userId 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to get plant categories',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/plant-data/:id/fertilizer-schedule
 * @desc Get fertilizer schedule for a specific plant
 * @access Admin, Manager, Agronomist
 */
router.get('/:id/fertilizer-schedule', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await PlantData.findById(id).select('name fertilizerSchedule');
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    logger.info(LogCategory.API, 'Fertilizer schedule retrieved', {
      userId: req.user?.userId,
      plantId: id,
      plantName: plant.name,
      scheduleItems: plant.fertilizerSchedule?.length || 0
    });

    return res.json({
      success: true,
      data: {
        plantName: plant.name,
        fertilizerSchedule: plant.fertilizerSchedule || []
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to get fertilizer schedule', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to get fertilizer schedule',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/plant-data/:id/pesticide-schedule
 * @desc Get pesticide schedule for a specific plant
 * @access Admin, Manager, Agronomist
 */
router.get('/:id/pesticide-schedule', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plant = await PlantData.findById(id).select('name pesticideSchedule');
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    logger.info(LogCategory.API, 'Pesticide schedule retrieved', {
      userId: req.user?.userId,
      plantId: id,
      plantName: plant.name,
      scheduleItems: plant.pesticideSchedule?.length || 0
    });

    return res.json({
      success: true,
      data: {
        plantName: plant.name,
        pesticideSchedule: plant.pesticideSchedule || []
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to get pesticide schedule', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to get pesticide schedule',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/plant-data/:id/fertilizer-schedule
 * @desc Update fertilizer schedule for a specific plant
 * @access Admin, Manager, Agronomist
 */
router.put('/:id/fertilizer-schedule', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fertilizerSchedule } = req.body;

    const plant = await PlantData.findById(id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    // Update fertilizer schedule
    plant.fertilizerSchedule = fertilizerSchedule;
    plant.lastModifiedBy = req.user?.userId as string;
    plant.updatedAt = new Date();

    await plant.save();

    logger.info(LogCategory.API, 'Fertilizer schedule updated', {
      userId: req.user?.userId,
      plantId: id,
      plantName: plant.name,
      scheduleItems: fertilizerSchedule?.length || 0
    });

    return res.json({
      success: true,
      message: 'Fertilizer schedule updated successfully',
      data: { fertilizerSchedule: plant.fertilizerSchedule }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to update fertilizer schedule', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to update fertilizer schedule',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/plant-data/:id/pesticide-schedule
 * @desc Update pesticide schedule for a specific plant
 * @access Admin, Manager, Agronomist
 */
router.put('/:id/pesticide-schedule', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pesticideSchedule } = req.body;

    const plant = await PlantData.findById(id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant data not found'
      });
    }

    // Update pesticide schedule
    plant.pesticideSchedule = pesticideSchedule;
    plant.lastModifiedBy = req.user?.userId as string;
    plant.updatedAt = new Date();

    await plant.save();

    logger.info(LogCategory.API, 'Pesticide schedule updated', {
      userId: req.user?.userId,
      plantId: id,
      plantName: plant.name,
      scheduleItems: pesticideSchedule?.length || 0
    });

    return res.json({
      success: true,
      message: 'Pesticide schedule updated successfully',
      data: { pesticideSchedule: plant.pesticideSchedule }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to update pesticide schedule', { 
      error: (error as Error).message,
      userId: req.user?.userId,
      plantId: req.params.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to update pesticide schedule',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

export default router;
