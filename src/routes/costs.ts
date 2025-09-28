import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';

const router = Router();

// Apply authentication to all cost routes
router.use(authenticate);

// GET /api/v1/costs - Get all cost data
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info(LogCategory.API, 'Cost data requested', {
      userId: req.user?.userId,
      userRole: req.user?.role
    });

    // Mock cost data for now - in a real implementation, this would come from the database
    const costData = {
      success: true,
      data: {
        categories: [
          {
            id: 'materials',
            name: 'Materials & Supplies',
            total: 15420.50,
            items: [
              { name: 'Seeds', cost: 2500.00, quantity: 100, unit: 'kg' },
              { name: 'Fertilizers', cost: 3200.00, quantity: 50, unit: 'bags' },
              { name: 'Pesticides', cost: 1800.00, quantity: 25, unit: 'liters' },
              { name: 'Equipment', cost: 7920.50, quantity: 1, unit: 'set' }
            ]
          },
          {
            id: 'labor',
            name: 'Labor Costs',
            total: 8750.00,
            items: [
              { name: 'Field Workers', cost: 4500.00, hours: 300, rate: 15.00 },
              { name: 'Supervisors', cost: 2500.00, hours: 100, rate: 25.00 },
              { name: 'Maintenance Staff', cost: 1750.00, hours: 70, rate: 25.00 }
            ]
          },
          {
            id: 'utilities',
            name: 'Utilities & Services',
            total: 3200.00,
            items: [
              { name: 'Electricity', cost: 1800.00, usage: 1200, unit: 'kWh' },
              { name: 'Water', cost: 800.00, usage: 400, unit: 'm³' },
              { name: 'Fuel', cost: 600.00, usage: 200, unit: 'liters' }
            ]
          },
          {
            id: 'overhead',
            name: 'Overhead Costs',
            total: 2100.00,
            items: [
              { name: 'Insurance', cost: 1200.00, period: 'monthly' },
              { name: 'Administration', cost: 600.00, period: 'monthly' },
              { name: 'Maintenance', cost: 300.00, period: 'monthly' }
            ]
          }
        ],
        summary: {
          totalCosts: 29470.50,
          monthlyAverage: 2455.88,
          costPerHectare: 1473.53,
          costTrend: 'stable',
          lastUpdated: new Date().toISOString()
        },
        trends: [
          { month: 'Jan', total: 2800.00 },
          { month: 'Feb', total: 2650.00 },
          { month: 'Mar', total: 2900.00 },
          { month: 'Apr', total: 3100.00 },
          { month: 'May', total: 2800.00 },
          { month: 'Jun', total: 2455.88 }
        ]
      }
    };

    logger.info(LogCategory.API, 'Cost data retrieved successfully', {
      userId: req.user?.userId,
      totalCategories: costData.data.categories.length,
      totalCosts: costData.data.summary.totalCosts
    });

    res.json(costData);

  } catch (error) {
    logger.error(LogCategory.API, 'Error retrieving cost data', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cost data',
      error: (error as Error).message
    });
  }
});

// GET /api/v1/costs/summary - Get cost summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    logger.info(LogCategory.API, 'Cost summary requested', {
      userId: req.user?.userId
    });

    const summary = {
      success: true,
      data: {
        totalCosts: 29470.50,
        monthlyAverage: 2455.88,
        costPerHectare: 1473.53,
        costTrend: 'stable',
        breakdown: {
          materials: 15420.50,
          labor: 8750.00,
          utilities: 3200.00,
          overhead: 2100.00
        },
        lastUpdated: new Date().toISOString()
      }
    };

    res.json(summary);

  } catch (error) {
    logger.error(LogCategory.API, 'Error retrieving cost summary', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cost summary',
      error: (error as Error).message
    });
  }
});

// POST /api/v1/costs - Add new cost entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { category, name, cost, quantity, unit, description } = req.body;

    logger.info(LogCategory.API, 'New cost entry requested', {
      userId: req.user?.userId,
      category,
      name,
      cost
    });

    // In a real implementation, this would save to the database
    const newCostEntry = {
      id: Date.now().toString(),
      category,
      name,
      cost,
      quantity,
      unit,
      description,
      createdBy: req.user?.userId,
      createdAt: new Date().toISOString()
    };

    logger.info(LogCategory.API, 'Cost entry created successfully', {
      userId: req.user?.userId,
      costEntryId: newCostEntry.id
    });

    res.status(201).json({
      success: true,
      message: 'Cost entry created successfully',
      data: newCostEntry
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Error creating cost entry', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create cost entry',
      error: (error as Error).message
    });
  }
});

export default router;
