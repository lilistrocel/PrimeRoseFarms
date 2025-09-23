import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';
import { PlantData } from '../models/PlantData';
import { BlockData } from '../models/BlockData';
import { FarmData } from '../models/FarmData';
import { MarketData } from '../models/MarketData';
import { FinancialData } from '../models/FinancialData';

const router = Router();

// All manager routes require authentication and manager role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.MANAGER));

/**
 * @route GET /api/manager/profitability-analysis
 * @desc Get profitability analysis for plant/block combinations
 * @access Manager, Admin
 */
router.get('/profitability-analysis', async (req: Request, res: Response) => {
  try {
    const { farmId, plantDataId, blockType, harvestMonth } = req.query;

    logger.info(LogCategory.API, 'Manager profitability analysis requested', {
      userId: req.user?.userId,
      farmId,
      plantDataId,
      blockType,
      harvestMonth
    });

    // Get available plants
    const plants = await PlantData.find({ isActive: true });
    
    // Get available blocks
    const blockFilter: any = { isActive: true };
    if (farmId) blockFilter.farmId = farmId;
    if (blockType) blockFilter.blockType = blockType;
    const blocks = await BlockData.find(blockFilter);

    // Get market data for profitability calculations
    const marketData = await MarketData.find({ isActive: true });

    // Calculate profitability for each plant/block combination
    const profitabilityAnalysis = [];

    for (const plant of plants) {
      for (const block of blocks) {
        // Calculate expected harvest date
        const plantingDate = new Date();
        const harvestDate = new Date();
        harvestDate.setDate(plantingDate.getDate() + (plant as any).growthTimeline.totalDays);

        // Get market price prediction for harvest date
        const relevantMarketData = marketData.find(m => m.productId === plant._id?.toString());
        const predictedPrice = relevantMarketData ? (relevantMarketData as any).pricing.current.price : 0;

        // Calculate costs from PlantData
        const plantCount = Math.floor((block as any).dimensions.area / 
          ((plant as any).resourceRequirements.spaceRequirement.width * 
           (plant as any).resourceRequirements.spaceRequirement.length / 10000)); // Convert cm to m

        const materialCost = (
          (plant as any).resourceRequirements.fertilizerAmount * plantCount * 2 + // Assuming $2 per unit fertilizer
          (plant as any).resourceRequirements.pesticideAmount * plantCount * 5   // Assuming $5 per unit pesticide
        );

        const laborCost = plantCount * 0.5; // Assuming $0.5 labor cost per plant

        const expectedYield = plantCount * (plant as any).yieldInfo.expectedYieldPerPlant;
        const expectedRevenue = expectedYield * predictedPrice;
        const expectedProfit = expectedRevenue - materialCost - laborCost;
        const profitMargin = expectedRevenue > 0 ? (expectedProfit / expectedRevenue) * 100 : 0;

        profitabilityAnalysis.push({
          plantId: plant._id,
          plantName: plant.name,
          blockId: block._id,
          blockName: block.name,
          blockType: block.blockType,
          plantCount,
          expectedHarvestDate: harvestDate,
          costs: {
            material: materialCost,
            labor: laborCost,
            total: materialCost + laborCost
          },
          revenue: {
            expectedYield,
            pricePerUnit: predictedPrice,
            total: expectedRevenue
          },
          profitability: {
            profit: expectedProfit,
            margin: profitMargin,
            roi: (materialCost + laborCost) > 0 ? (expectedProfit / (materialCost + laborCost)) * 100 : 0
          }
        });
      }
    }

    // Sort by profitability (highest profit margin first)
    profitabilityAnalysis.sort((a, b) => b.profitability.margin - a.profitability.margin);

    return res.json({
      success: true,
      message: 'Profitability analysis generated successfully',
      data: {
        analysis: profitabilityAnalysis,
        summary: {
          totalCombinations: profitabilityAnalysis.length,
          avgProfitMargin: profitabilityAnalysis.reduce((sum, item) => sum + item.profitability.margin, 0) / profitabilityAnalysis.length,
          topOpportunities: profitabilityAnalysis.slice(0, 10)
        }
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Profitability analysis failed', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to generate profitability analysis',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/manager/assign-plant-to-block
 * @desc Assign a plant to a specific block with preview and commitment
 * @access Manager, Admin
 */
router.post('/assign-plant-to-block', async (req: Request, res: Response) => {
  try {
    const { blockId, plantDataId, plantCount, plantingDate, preview = false } = req.body;

    logger.info(LogCategory.FARM, 'Plant assignment requested', {
      userId: req.user?.userId,
      blockId,
      plantDataId,
      plantCount,
      plantingDate,
      preview
    });

    // Validate inputs
    if (!blockId || !plantDataId || !plantCount || !plantingDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: blockId, plantDataId, plantCount, plantingDate'
      });
    }

    // Get block and plant data
    const block = await BlockData.findById(blockId);
    const plant = await PlantData.findById(plantDataId);

    if (!block || !plant) {
      return res.status(404).json({
        success: false,
        message: 'Block or plant data not found'
      });
    }

    // Calculate space requirements and validate capacity
    const plantSpaceRequired = (plant as any).resourceRequirements.spaceRequirement.width * 
                              (plant as any).resourceRequirements.spaceRequirement.length / 10000; // Convert cm² to m²
    const totalSpaceRequired = plantCount * plantSpaceRequired;
    const blockArea = (block as any).dimensions.area;

    if (totalSpaceRequired > blockArea) {
      return res.status(400).json({
        success: false,
        message: `Insufficient space. Required: ${totalSpaceRequired}m², Available: ${blockArea}m²`
      });
    }

    // Calculate expected harvest date
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + (plant as any).growthTimeline.totalDays);

    // Calculate resource requirements
    const resourceRequirements = {
      fertilizer: {
        total: (plant as any).resourceRequirements.fertilizerAmount * plantCount,
        types: (plant as any).resourceRequirements.fertilizerType,
        schedule: 'Based on PlantData fertilizer schedule' // This would be detailed in actual implementation
      },
      pesticide: {
        total: (plant as any).resourceRequirements.pesticideAmount * plantCount,
        types: (plant as any).resourceRequirements.pesticideType,
        schedule: 'Based on PlantData pesticide schedule' // This would be detailed in actual implementation
      },
      water: {
        daily: (plant as any).growingRequirements.waterRequirements.daily * plantCount,
        frequency: (plant as any).growingRequirements.waterRequirements.frequency
      }
    };

    // Calculate expected yield and revenue
    const expectedYield = plantCount * (plant as any).yieldInfo.expectedYieldPerPlant;
    
    // Get market data for revenue calculation
    const marketData = await MarketData.findOne({ productId: plantDataId });
    const pricePerUnit = marketData ? (marketData as any).pricing.current.price : 0;
    const expectedRevenue = expectedYield * pricePerUnit;

    // Calculate costs
    const costs = {
      seeds: plantCount * 1, // Assuming $1 per seed/seedling
      fertilizer: resourceRequirements.fertilizer.total * 2, // Assuming $2 per unit
      pesticide: resourceRequirements.pesticide.total * 5, // Assuming $5 per unit
      labor: plantCount * 0.5, // Assuming $0.5 labor per plant
      get total() { return this.seeds + this.fertilizer + this.pesticide + this.labor; }
    };

    const projectedProfit = expectedRevenue - costs.total;
    const profitMargin = expectedRevenue > 0 ? (projectedProfit / expectedRevenue) * 100 : 0;

    const assignmentPreview = {
      block: {
        id: block._id,
        name: block.name,
        type: block.blockType,
        area: blockArea,
        utilizationAfterAssignment: (totalSpaceRequired / blockArea) * 100
      },
      plant: {
        id: plant._id,
        name: plant.name,
        variety: plant.variety,
        category: plant.category
      },
      assignment: {
        plantCount,
        plantingDate,
        expectedHarvestDate: harvestDate,
        spaceUtilization: totalSpaceRequired,
        plantingDensity: plantCount / blockArea
      },
      resourceRequirements,
      financialProjection: {
        expectedYield,
        pricePerUnit,
        expectedRevenue,
        costs,
        projectedProfit,
        profitMargin,
        roi: costs.total > 0 ? (projectedProfit / costs.total) * 100 : 0
      }
    };

    // If this is just a preview, return the data without committing
    if (preview) {
      return res.json({
        success: true,
        message: 'Plant assignment preview generated',
        data: {
          preview: assignmentPreview,
          canAssign: totalSpaceRequired <= blockArea
        }
      });
    }

    // Commit the assignment
    const updatedBlock = await BlockData.findByIdAndUpdate(blockId, {
      status: 'planting',
      currentPlanting: {
        plantDataId,
        plantingDate,
        expectedHarvestDate: harvestDate,
        plantCount,
        plantingDensity: plantCount / blockArea,
        growthStage: 'germination',
        notes: `Assigned by Manager ${req.user?.userId}`
      },
      lastModifiedBy: req.user?.userId
    }, { new: true });

    logger.info(LogCategory.FARM, 'Plant assignment committed', {
      userId: req.user?.userId,
      blockId,
      plantDataId,
      plantCount,
      expectedYield,
      projectedProfit
    });

    return res.json({
      success: true,
      message: 'Plant successfully assigned to block',
      data: {
        assignment: assignmentPreview,
        updatedBlock
      }
    });

  } catch (error) {
    logger.error(LogCategory.FARM, 'Plant assignment failed', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to assign plant to block',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/manager/performance-dashboard
 * @desc Get comprehensive performance dashboard data
 * @access Manager, Admin
 */
router.get('/performance-dashboard', async (req: Request, res: Response) => {
  try {
    const { farmId, timeRange = '30' } = req.query;

    logger.info(LogCategory.API, 'Performance dashboard requested', {
      userId: req.user?.userId,
      farmId,
      timeRange
    });

    const days = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build farm filter
    const farmFilter: any = { isActive: true };
    if (farmId) farmFilter._id = farmId;

    // Get farms data
    const farms = await FarmData.find(farmFilter);
    
    // Get blocks data
    const blockFilter: any = { isActive: true };
    if (farmId) blockFilter.farmId = farmId;
    const blocks = await BlockData.find(blockFilter);

    // Get financial data
    const financialFilter: any = { 
      isActive: true,
      'period.startDate': { $gte: startDate }
    };
    if (farmId) financialFilter.farmId = farmId;
    const financialData = await FinancialData.find(financialFilter);

    // Calculate performance metrics
    const totalBlocks = blocks.length;
    const activeBlocks = blocks.filter(b => b.status === 'growing' || b.status === 'planting').length;
    const availableBlocks = blocks.filter(b => b.status === 'available').length;
    const harvestingBlocks = blocks.filter(b => b.status === 'harvesting').length;

    // Calculate yield performance
    const blocksWithHarvest = blocks.filter(b => (b as any).performance?.lastHarvestYield);
    const totalYield = blocksWithHarvest.reduce((sum, b) => sum + ((b as any).performance?.lastHarvestYield || 0), 0);
    const avgYieldPerBlock = blocksWithHarvest.length > 0 ? totalYield / blocksWithHarvest.length : 0;

    // Calculate financial performance
    const totalRevenue = financialData.reduce((sum, f) => sum + (f as any).revenue.total, 0);
    const totalCosts = financialData.reduce((sum, f) => sum + (f as any).operatingExpenses.total, 0);
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Get upcoming harvests (next 30 days)
    const upcomingHarvestDate = new Date();
    upcomingHarvestDate.setDate(upcomingHarvestDate.getDate() + 30);
    
    const upcomingHarvests = blocks.filter(b => 
      b.currentPlanting?.expectedHarvestDate &&
      new Date(b.currentPlanting.expectedHarvestDate) <= upcomingHarvestDate
    ).map(b => ({
      blockId: b._id,
      blockName: b.name,
      plantDataId: b.currentPlanting?.plantDataId,
      expectedHarvestDate: b.currentPlanting?.expectedHarvestDate,
      plantCount: b.currentPlanting?.plantCount,
      growthStage: b.currentPlanting?.growthStage
    }));

    // Performance alerts
    const alerts = [];
    
    // Low-performing blocks
    const lowPerformingBlocks = blocks.filter(b => 
      (b as any).performance?.successRate && (b as any).performance.successRate < 70
    );
    if (lowPerformingBlocks.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'performance',
        message: `${lowPerformingBlocks.length} blocks have success rate below 70%`,
        actionRequired: 'Review block conditions and management practices'
      });
    }

    // Overdue maintenance
    const maintenanceOverdue = blocks.filter(b => 
      b.maintenance?.nextMaintenance && new Date(b.maintenance.nextMaintenance) < new Date()
    );
    if (maintenanceOverdue.length > 0) {
      alerts.push({
        type: 'error',
        category: 'maintenance',
        message: `${maintenanceOverdue.length} blocks have overdue maintenance`,
        actionRequired: 'Schedule immediate maintenance'
      });
    }

    const dashboard = {
      overview: {
        totalFarms: farms.length,
        totalBlocks,
        activeBlocks,
        availableBlocks,
        utilizationRate: totalBlocks > 0 ? (activeBlocks / totalBlocks) * 100 : 0
      },
      production: {
        totalYield,
        avgYieldPerBlock,
        harvestingBlocks,
        upcomingHarvests: upcomingHarvests.length,
        nextHarvests: upcomingHarvests.slice(0, 5)
      },
      financial: {
        totalRevenue,
        totalCosts,
        totalProfit,
        profitMargin,
        timeRange: `${days} days`
      },
      performance: {
        blockPerformance: {
          excellent: blocks.filter(b => (b as any).performance?.successRate >= 90).length,
          good: blocks.filter(b => (b as any).performance?.successRate >= 70 && (b as any).performance?.successRate < 90).length,
          needsImprovement: blocks.filter(b => (b as any).performance?.successRate < 70).length
        },
        alerts,
        alertCount: alerts.length
      },
      trends: {
        // This would include trend analysis in a real implementation
        yieldTrend: 'stable', // 'increasing', 'decreasing', 'stable'
        costTrend: 'stable',
        profitabilityTrend: 'stable'
      }
    };

    return res.json({
      success: true,
      message: 'Performance dashboard data retrieved',
      data: dashboard
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Performance dashboard failed', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance dashboard',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/manager/block-optimization
 * @desc Get block optimization recommendations
 * @access Manager, Admin
 */
router.get('/block-optimization', async (req: Request, res: Response) => {
  try {
    const { farmId } = req.query;

    logger.info(LogCategory.FARM, 'Block optimization requested', {
      userId: req.user?.userId,
      farmId
    });

    // Get available blocks
    const blockFilter: any = { isActive: true };
    if (farmId) blockFilter.farmId = farmId;
    const blocks = await BlockData.find(blockFilter);

    // Get all plants for optimization analysis
    const plants = await PlantData.find({ isActive: true });

    // Analyze each block for optimization opportunities
    const optimizationRecommendations = [];

    for (const block of blocks) {
      const blockAnalysis: any = {
        blockId: block._id,
        blockName: block.name,
        blockType: block.blockType,
        currentStatus: block.status,
        area: (block as any).dimensions.area,
        recommendations: []
      };

      // Check utilization
      if (block.status === 'available') {
        blockAnalysis.recommendations.push({
          type: 'opportunity',
          priority: 'high',
          title: 'Unused Capacity',
          description: 'Block is available and could be assigned to high-value crops',
          action: 'Consider planting high-profit crops based on market analysis'
        });
      }

      // Check performance history
      if ((block as any).performance?.successRate && (block as any).performance.successRate < 80) {
        blockAnalysis.recommendations.push({
          type: 'improvement',
          priority: 'medium',
          title: 'Performance Below Target',
          description: `Success rate is ${(block as any).performance.successRate}%, below 80% target`,
          action: 'Review growing conditions, infrastructure, and plant variety suitability'
        });
      }

      // Check infrastructure optimization
      if (block.blockType === 'greenhouse' && (block as any).infrastructure.climateControl.automation === false) {
        blockAnalysis.recommendations.push({
          type: 'upgrade',
          priority: 'medium',
          title: 'Automation Opportunity',
          description: 'Greenhouse could benefit from automated climate control',
          action: 'Consider installing automated climate control systems'
        });
      }

      // Check maintenance
      if (block.maintenance?.nextMaintenance && new Date(block.maintenance.nextMaintenance) < new Date()) {
        blockAnalysis.recommendations.push({
          type: 'maintenance',
          priority: 'high',
          title: 'Overdue Maintenance',
          description: 'Block maintenance is overdue',
          action: 'Schedule immediate maintenance to prevent performance degradation'
        });
      }

      // Suggest optimal plants for this block type
      const suitablePlants = plants.filter(plant => {
        // Simple suitability logic - in reality this would be more complex
        const plantData = plant as any;
        if (block.blockType === 'hydroponic') {
          return plantData.category === 'herb' || plantData.category === 'vegetable';
        } else if (block.blockType === 'greenhouse') {
          return plantData.category !== 'grain';
        } else if (block.blockType === 'open_field') {
          return plantData.category === 'grain' || plantData.category === 'vegetable';
        }
        return true;
      }).slice(0, 3); // Top 3 suitable plants

      if (suitablePlants.length > 0 && block.status === 'available') {
        blockAnalysis.recommendations.push({
          type: 'suggestion',
          priority: 'low',
          title: 'Optimal Plant Suggestions',
          description: `Consider these plants for optimal performance: ${suitablePlants.map(p => p.name).join(', ')}`,
          action: 'Run profitability analysis for suggested plants'
        });
      }

      optimizationRecommendations.push(blockAnalysis);
    }

    // Summary statistics
    const summary = {
      totalBlocks: blocks.length,
      needsAttention: optimizationRecommendations.filter(r => 
        r.recommendations.some((rec: any) => rec.priority === 'high')
      ).length,
      opportunitiesAvailable: optimizationRecommendations.filter(r => 
        r.recommendations.some((rec: any) => rec.type === 'opportunity')
      ).length,
      maintenanceRequired: optimizationRecommendations.filter(r => 
        r.recommendations.some((rec: any) => rec.type === 'maintenance')
      ).length
    };

    return res.json({
      success: true,
      message: 'Block optimization recommendations generated',
      data: {
        recommendations: optimizationRecommendations,
        summary
      }
    });

  } catch (error) {
    logger.error(LogCategory.FARM, 'Block optimization failed', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to generate block optimization recommendations',
      error: (error as Error).message
    });
  }
});

export default router;
