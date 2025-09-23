import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';
import { BlockData } from '../models/BlockData';
import { PlantData } from '../models/PlantData';
import { UserData } from '../models/UserData';

const router = Router();

// All worker routes require authentication and worker role
router.use(authenticate);
router.use(authorize(UserRole.WORKER, UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN));

/**
 * @route GET /api/worker/daily-tasks
 * @desc Get daily task list for worker based on assigned blocks
 * @access Worker, Farmer, Manager, Admin
 */
router.get('/daily-tasks', async (req: Request, res: Response) => {
  try {
    const { farmId, blockId, date = new Date().toISOString().split('T')[0] } = req.query;
    const workerId = req.user?.userId;

    logger.info(LogCategory.WORKER, 'Daily tasks requested', {
      userId: workerId,
      farmId,
      blockId,
      date
    });

    // Get worker's assigned blocks
    const blockFilter: any = { isActive: true, status: { $in: ['planting', 'growing', 'harvesting'] } };
    if (farmId) blockFilter.farmId = farmId;
    if (blockId) blockFilter._id = blockId;
    
    // In a real implementation, you'd filter by worker assignments
    const assignedBlocks = await BlockData.find(blockFilter);

    const tasks = [];
    const currentDate = new Date(date as string);

    for (const block of assignedBlocks) {
      if (!block.currentPlanting?.plantDataId) continue;

      // Get plant data to determine tasks
      const plant = await PlantData.findById(block.currentPlanting.plantDataId);
      if (!plant) continue;

      const plantingDate = new Date(block.currentPlanting.plantingDate!);
      const daysSincePlanting = Math.floor((currentDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
      const plantData = plant as any;

      // Generate tasks based on plant schedule and growth stage
      const blockTasks = [];

      // Watering tasks
      const wateringFreq = plantData.growingRequirements.waterRequirements.frequency;
      let needsWatering = false;

      switch (wateringFreq) {
        case 'daily':
          needsWatering = true;
          break;
        case 'every_other_day':
          needsWatering = daysSincePlanting % 2 === 0;
          break;
        case 'weekly':
          needsWatering = daysSincePlanting % 7 === 0;
          break;
        case 'twice_weekly':
          needsWatering = daysSincePlanting % 3 === 0;
          break;
      }

      if (needsWatering) {
        blockTasks.push({
          id: `watering_${block._id}_${date}`,
          type: 'watering',
          priority: 'high',
          title: 'Watering',
          description: `Water plants in ${block.name}`,
          estimatedTime: 30, // minutes
          requirements: {
            waterAmount: plantData.growingRequirements.waterRequirements.daily * (block.currentPlanting.plantCount || 0),
            equipment: ['irrigation_system', 'water_meter'],
            safety: []
          },
          instructions: [
            'Check soil moisture levels',
            'Apply water evenly across all plants',
            'Record actual water amount used',
            'Check for any signs of overwatering or underwatering'
          ]
        });
      }

      // Fertilizer tasks (example: weekly during vegetative stage)
      if (daysSincePlanting > 7 && daysSincePlanting % 7 === 0 && block.currentPlanting.growthStage === 'vegetative') {
        blockTasks.push({
          id: `fertilizing_${block._id}_${date}`,
          type: 'fertilizing',
          priority: 'medium',
          title: 'Fertilizer Application',
          description: `Apply fertilizer to plants in ${block.name}`,
          estimatedTime: 45, // minutes
          requirements: {
            fertilizerType: plantData.resourceRequirements.fertilizerType,
            amount: plantData.resourceRequirements.fertilizerAmount * (block.currentPlanting.plantCount || 0),
            equipment: ['sprayer', 'measuring_tools', 'mixing_container'],
            safety: ['gloves', 'mask', 'protective_clothing']
          },
          instructions: [
            'Wear all required safety equipment',
            'Mix fertilizer according to specifications',
            'Apply evenly to all plants',
            'Record actual amount used',
            'Clean equipment after use'
          ]
        });
      }

      // Inspection tasks (daily for all blocks)
      blockTasks.push({
        id: `inspection_${block._id}_${date}`,
        type: 'inspection',
        priority: 'medium',
        title: 'Plant Health Inspection',
        description: `Inspect plants in ${block.name} for health and growth`,
        estimatedTime: 20, // minutes
        requirements: {
          equipment: ['inspection_sheet', 'camera'],
          safety: []
        },
        instructions: [
          'Check each plant for signs of disease or pests',
          'Look for proper growth and development',
          'Note any unusual observations',
          'Take photos of any issues found',
          'Update growth stage if plants have progressed'
        ]
      });

      // Harvest tasks (if ready for harvest)
      if (block.status === 'harvesting' || 
          (block.currentPlanting.expectedHarvestDate && 
           new Date(block.currentPlanting.expectedHarvestDate) <= currentDate)) {
        blockTasks.push({
          id: `harvest_${block._id}_${date}`,
          type: 'harvest',
          priority: 'urgent',
          title: 'Harvest',
          description: `Harvest ready plants in ${block.name}`,
          estimatedTime: 90, // minutes
          requirements: {
            equipment: ['harvest_containers', 'cutting_tools', 'scale', 'quality_assessment_sheet'],
            safety: ['gloves']
          },
          instructions: [
            'Harvest only fully mature plants',
            'Sort by quality grade (premium, standard, economy)',
            'Weigh and record harvest quantities',
            'Note any quality issues',
            'Prepare for packaging and storage'
          ]
        });
      }

      // Add block information to each task
      blockTasks.forEach((task: any) => {
        task.block = {
          id: block._id,
          name: block.name,
          type: block.blockType,
          plantName: plant.name,
          plantCount: block.currentPlanting?.plantCount,
          growthStage: block.currentPlanting?.growthStage,
          daysSincePlanting
        };
      });

      tasks.push(...blockTasks);
    }

    // Sort tasks by priority
    const priorityOrder: { [key: string]: number } = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
    tasks.sort((a: any, b: any) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Calculate total estimated time
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0);

    return res.json({
      success: true,
      message: 'Daily tasks retrieved successfully',
      data: {
        date,
        tasks,
        summary: {
          totalTasks: tasks.length,
          urgentTasks: tasks.filter(t => t.priority === 'urgent').length,
          estimatedTotalTime: totalEstimatedTime,
          tasksByType: {
            watering: tasks.filter(t => t.type === 'watering').length,
            fertilizing: tasks.filter(t => t.type === 'fertilizing').length,
            inspection: tasks.filter(t => t.type === 'inspection').length,
            harvest: tasks.filter(t => t.type === 'harvest').length
          }
        }
      }
    });

  } catch (error) {
    logger.error(LogCategory.WORKER, 'Failed to retrieve daily tasks', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve daily tasks',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/worker/start-task
 * @desc Start a specific task and update status
 * @access Worker, Farmer, Manager, Admin
 */
router.post('/start-task', async (req: Request, res: Response) => {
  try {
    const { taskId, blockId, notes } = req.body;
    const workerId = req.user?.userId;

    logger.info(LogCategory.WORKER, 'Task started', {
      userId: workerId,
      taskId,
      blockId,
      startTime: new Date()
    });

    // Validate inputs
    if (!taskId || !blockId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskId, blockId'
      });
    }

    // Get block to update
    const block = await BlockData.findById(blockId);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    // Update block with task status (in a real implementation, you'd have a separate task tracking collection)
    const taskStatus = {
      taskId,
      workerId,
      status: 'in_progress',
      startTime: new Date(),
      notes: notes || ''
    };

    // For now, we'll just log the task start
    logger.info(LogCategory.WORKER, 'Task in progress', {
      userId: workerId,
      taskId,
      blockId,
      taskStatus
    });

    return res.json({
      success: true,
      message: 'Task started successfully',
      data: {
        taskId,
        blockId,
        status: 'in_progress',
        startTime: new Date(),
        workerId
      }
    });

  } catch (error) {
    logger.error(LogCategory.WORKER, 'Failed to start task', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to start task',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/worker/complete-task
 * @desc Complete a task and record results
 * @access Worker, Farmer, Manager, Admin
 */
router.post('/complete-task', async (req: Request, res: Response) => {
  try {
    const { 
      taskId, 
      blockId, 
      taskType,
      results,
      timeSpent,
      materialsUsed,
      qualityNotes,
      issues
    } = req.body;
    const workerId = req.user?.userId;

    logger.info(LogCategory.WORKER, 'Task completion requested', {
      userId: workerId,
      taskId,
      blockId,
      taskType
    });

    // Validate inputs
    if (!taskId || !blockId || !taskType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskId, blockId, taskType'
      });
    }

    // Get block to update
    const block = await BlockData.findById(blockId);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    const completionData = {
      taskId,
      workerId,
      completedAt: new Date(),
      timeSpent: timeSpent || 0,
      results: results || {},
      materialsUsed: materialsUsed || {},
      qualityNotes: qualityNotes || '',
      issues: issues || []
    };

    // Handle different task types
    let updateData: any = {
      lastModifiedBy: workerId
    };

    switch (taskType) {
      case 'harvest':
        if (results?.quantity && results?.quality) {
          // Update block harvest performance
          updateData = {
            ...updateData,
            status: 'harvested',
            'performance.lastHarvestDate': new Date(),
            'performance.lastHarvestYield': results.quantity,
            'currentPlanting.growthStage': 'harvesting'
          };

          logger.info(LogCategory.WORKER, 'Harvest completed', {
            userId: workerId,
            blockId,
            quantity: results.quantity,
            quality: results.quality
          });
        }
        break;

      case 'watering':
        if (results?.waterUsed) {
          logger.info(LogCategory.WORKER, 'Watering completed', {
            userId: workerId,
            blockId,
            waterUsed: results.waterUsed
          });
        }
        break;

      case 'fertilizing':
        if (results?.fertilizerUsed) {
          logger.info(LogCategory.WORKER, 'Fertilizing completed', {
            userId: workerId,
            blockId,
            fertilizerUsed: results.fertilizerUsed
          });
        }
        break;

      case 'inspection':
        if (results?.healthStatus) {
          // Update growth stage if specified
          if (results.newGrowthStage) {
            updateData['currentPlanting.growthStage'] = results.newGrowthStage;
          }

          logger.info(LogCategory.WORKER, 'Inspection completed', {
            userId: workerId,
            blockId,
            healthStatus: results.healthStatus,
            newGrowthStage: results.newGrowthStage
          });
        }
        break;
    }

    // Update the block
    await BlockData.findByIdAndUpdate(blockId, updateData);

    // In a real implementation, you'd also update a task completion log
    logger.info(LogCategory.WORKER, 'Task completed successfully', {
      userId: workerId,
      taskId,
      blockId,
      taskType,
      completionData
    });

    // Calculate performance metrics
    const performance = {
      efficiency: timeSpent > 0 ? 'normal' : 'unknown', // In reality, compare against standards
      quality: qualityNotes ? 'good' : 'unknown',
      issuesReported: issues ? issues.length : 0
    };

    return res.json({
      success: true,
      message: 'Task completed successfully',
      data: {
        taskId,
        blockId,
        completedAt: new Date(),
        performance,
        results: results || {},
        nextRecommendedTasks: [] // In reality, suggest next tasks based on completion
      }
    });

  } catch (error) {
    logger.error(LogCategory.WORKER, 'Failed to complete task', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to complete task',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/worker/record-harvest
 * @desc Record detailed harvest data with quality assessment
 * @access Worker, Farmer, Manager, Admin
 */
router.post('/record-harvest', async (req: Request, res: Response) => {
  try {
    const {
      blockId,
      harvestData
    } = req.body;
    const harvesterId = req.user?.userId;

    logger.info(LogCategory.WORKER, 'Harvest recording requested', {
      userId: harvesterId,
      blockId,
      totalQuantity: harvestData?.totalQuantity
    });

    // Validate inputs
    if (!blockId || !harvestData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: blockId, harvestData'
      });
    }

    const {
      totalQuantity,
      qualityGrades,
      defects,
      harvestDate = new Date(),
      notes
    } = harvestData;

    if (!totalQuantity || !qualityGrades) {
      return res.status(400).json({
        success: false,
        message: 'Missing harvest details: totalQuantity, qualityGrades'
      });
    }

    // Get block to update
    const block = await BlockData.findById(blockId);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    // Get plant data for yield comparison
    let expectedYield = 0;
    if (block.currentPlanting?.plantDataId) {
      const plant = await PlantData.findById(block.currentPlanting.plantDataId);
      if (plant) {
        expectedYield = (plant as any).yieldInfo.expectedYieldPerPlant * (block.currentPlanting.plantCount || 0);
      }
    }

    // Calculate quality distribution
    const totalGraded = Object.values(qualityGrades).reduce((sum: number, qty: any) => sum + (qty || 0), 0);
    const qualityDistribution = {
      premium: ((qualityGrades.premium || 0) / totalGraded) * 100,
      standard: ((qualityGrades.standard || 0) / totalGraded) * 100,
      economy: ((qualityGrades.economy || 0) / totalGraded) * 100
    };

    // Calculate performance metrics
    const yieldEfficiency = expectedYield > 0 ? (totalQuantity / expectedYield) * 100 : 0;
    const qualityScore = (qualityDistribution.premium * 1.0 + qualityDistribution.standard * 0.7 + qualityDistribution.economy * 0.4);
    const wastePercentage = defects?.totalWaste ? (defects.totalWaste / (totalQuantity + defects.totalWaste)) * 100 : 0;

    // Update block with harvest data
    const updateData = {
      status: 'harvested',
      'performance.lastHarvestDate': harvestDate,
      'performance.lastHarvestYield': totalQuantity,
      'performance.totalCycles': ((block as any).performance?.totalCycles || 0) + 1,
      'performance.averageYield': totalQuantity, // Simplified - in reality, calculate running average
      'performance.successRate': yieldEfficiency > 80 ? 100 : Math.max(0, yieldEfficiency),
      lastModifiedBy: harvesterId,
      // Clear current planting since harvest is complete
      currentPlanting: null
    };

    await BlockData.findByIdAndUpdate(blockId, updateData);

    // Create harvest record (in reality, this would be a separate collection)
    const harvestRecord = {
      blockId,
      harvesterId,
      harvestDate,
      plantDataId: block.currentPlanting?.plantDataId,
      plantCount: block.currentPlanting?.plantCount,
      harvest: {
        totalQuantity,
        qualityGrades,
        qualityDistribution,
        defects: defects || {},
        notes: notes || ''
      },
      performance: {
        expectedYield,
        actualYield: totalQuantity,
        yieldEfficiency,
        qualityScore,
        wastePercentage
      }
    };

    logger.info(LogCategory.WORKER, 'Harvest recorded successfully', {
      userId: harvesterId,
      blockId,
      harvestRecord
    });

    // Update inventory (in reality, this would update InventoryData)
    logger.info(LogCategory.WORKER, 'Inventory updated with harvest', {
      userId: harvesterId,
      productUpdates: qualityGrades
    });

    return res.json({
      success: true,
      message: 'Harvest recorded successfully',
      data: {
        harvestRecord,
        performance: {
          yieldEfficiency: Math.round(yieldEfficiency),
          qualityScore: Math.round(qualityScore),
          wastePercentage: Math.round(wastePercentage * 100) / 100,
          grade: yieldEfficiency > 90 ? 'Excellent' : yieldEfficiency > 70 ? 'Good' : 'Needs Improvement'
        },
        blockStatus: {
          newStatus: 'harvested',
          readyForNextPlanting: true
        }
      }
    });

  } catch (error) {
    logger.error(LogCategory.WORKER, 'Failed to record harvest', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to record harvest',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/worker/performance
 * @desc Get worker performance metrics and history
 * @access Worker, Farmer, Manager, Admin
 */
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const workerId = req.user?.userId;
    const { timeRange = '30' } = req.query;

    logger.info(LogCategory.WORKER, 'Worker performance requested', {
      userId: workerId,
      timeRange
    });

    const days = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // In a real implementation, you'd query task completion logs
    // For now, we'll provide mock performance data
    const performanceData = {
      overview: {
        timeRange: `${days} days`,
        totalTasks: 45,
        completedTasks: 42,
        completionRate: 93.3,
        avgTimePerTask: 38, // minutes
        efficiency: 'Good'
      },
      taskBreakdown: {
        watering: { completed: 15, avgTime: 25 },
        fertilizing: { completed: 8, avgTime: 40 },
        inspection: { completed: 12, avgTime: 20 },
        harvest: { completed: 7, avgTime: 85 }
      },
      qualityMetrics: {
        harvestAccuracy: 95, // percentage
        taskQualityRating: 4.2, // out of 5
        issuesReported: 3,
        safetyIncidents: 0
      },
      trends: {
        productivity: 'stable', // 'improving', 'declining', 'stable'
        quality: 'improving',
        efficiency: 'improving'
      },
      achievements: [
        { title: 'Perfect Safety Record', description: 'No safety incidents this month', earned: new Date() },
        { title: 'Quality Excellence', description: 'Maintained >95% harvest accuracy', earned: new Date() }
      ],
      areas_for_improvement: [
        { area: 'Fertilizing Speed', suggestion: 'Consider attending efficiency training' },
        { area: 'Documentation', suggestion: 'Improve detail in task notes' }
      ]
    };

    return res.json({
      success: true,
      message: 'Worker performance data retrieved',
      data: performanceData
    });

  } catch (error) {
    logger.error(LogCategory.WORKER, 'Failed to retrieve worker performance', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve worker performance',
      error: (error as Error).message
    });
  }
});

export default router;
