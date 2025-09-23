import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';
import { CustomerData } from '../models/CustomerData';
import { InventoryData } from '../models/InventoryData';
import { BlockData } from '../models/BlockData';
import { PlantData } from '../models/PlantData';
import { MarketData } from '../models/MarketData';

const router = Router();

// All sales routes require authentication and sales role
router.use(authenticate);
router.use(authorize(UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN));

/**
 * @route GET /api/sales/predicted-stock
 * @desc Get predicted stock levels for sales planning
 * @access Sales, Manager, Admin
 */
router.get('/predicted-stock', async (req: Request, res: Response) => {
  try {
    const { plantType, timeframe = '30' } = req.query;
    const salesUserId = req.user?.userId;

    logger.info(LogCategory.API, 'Predicted stock requested', {
      userId: salesUserId,
      plantType,
      timeframe
    });

    const days = parseInt(timeframe as string);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // Get current actual inventory
    const inventoryFilter: any = { isActive: true };
    if (plantType) {
      // Find plant data to match with inventory
      const plants = await PlantData.find({ 
        name: { $regex: plantType, $options: 'i' }, 
        isActive: true 
      });
      inventoryFilter['plantRequirements.applicablePlants'] = { 
        $in: plants.map(p => p._id?.toString()) 
      };
    }

    const currentInventory = await InventoryData.find(inventoryFilter);

    // Get blocks with expected harvests within timeframe
    const harvestingBlocks = await BlockData.find({
      isActive: true,
      'currentPlanting.expectedHarvestDate': { 
        $gte: new Date(), 
        $lte: endDate 
      },
      'currentPlanting.plantDataId': { $exists: true }
    });

    // Get plant data for harvest calculations
    const plantIds = harvestingBlocks.map(b => b.currentPlanting?.plantDataId).filter(Boolean);
    const plants = await PlantData.find({ _id: { $in: plantIds } });
    const plantsMap = new Map(plants.map(p => [p._id?.toString(), p]));

    // Calculate predicted harvest by plant type
    const predictedHarvests: { [key: string]: any } = {};

    for (const block of harvestingBlocks) {
      const plantId = block.currentPlanting?.plantDataId;
      const plant = plantsMap.get(plantId || '');
      
      if (!plant) continue;

      const plantName = plant.name;
      const expectedYield = (plant as any).yieldInfo.expectedYieldPerPlant * (block.currentPlanting?.plantCount || 0);
      const harvestDate = block.currentPlanting?.expectedHarvestDate;

      if (!predictedHarvests[plantName]) {
        predictedHarvests[plantName] = {
          plantId: plant._id,
          plantName,
          category: plant.category,
          currentStock: 0, // Will be filled from inventory
          predictedHarvests: [],
          totalPredictedYield: 0,
          allocatedStock: 0, // Stock already committed to orders
          availableForSale: 0
        };
      }

      predictedHarvests[plantName].predictedHarvests.push({
        blockId: block._id,
        blockName: block.name,
        expectedYield,
        harvestDate,
        qualityEstimate: 'standard' // In reality, this would be predicted based on conditions
      });

      predictedHarvests[plantName].totalPredictedYield += expectedYield;
    }

    // Add current inventory data
    for (const item of currentInventory) {
      const applicablePlants = (item as any).plantRequirements?.applicablePlants || [];
      
      for (const plantId of applicablePlants) {
        const plant = plantsMap.get(plantId);
        if (plant && predictedHarvests[plant.name]) {
          predictedHarvests[plant.name].currentStock += (item as any).stock.currentStock;
          predictedHarvests[plant.name].allocatedStock += (item as any).stock.reservedStock;
        }
      }
    }

    // Calculate available stock for each plant type
    Object.values(predictedHarvests).forEach((stock: any) => {
      stock.availableForSale = stock.currentStock + stock.totalPredictedYield - stock.allocatedStock;
      stock.stockStatus = stock.availableForSale > 100 ? 'abundant' : 
                         stock.availableForSale > 50 ? 'adequate' : 
                         stock.availableForSale > 0 ? 'limited' : 'unavailable';
    });

    // Get market prices for revenue projections
    const marketData = await MarketData.find({ isActive: true });
    const marketPricesMap = new Map(
      marketData.map(m => [m.productId, (m as any).pricing.current.price])
    );

    Object.values(predictedHarvests).forEach((stock: any) => {
      const marketPrice = marketPricesMap.get(stock.plantId?.toString()) || 0;
      stock.marketPrice = marketPrice;
      stock.projectedRevenue = stock.availableForSale * marketPrice;
    });

    // Sort by availability and revenue potential
    const stockArray = Object.values(predictedHarvests)
      .sort((a: any, b: any) => b.projectedRevenue - a.projectedRevenue);

    // Calculate summary statistics
    const summary = {
      totalPlantTypes: stockArray.length,
      totalAvailableValue: stockArray.reduce((sum: number, stock: any) => sum + stock.projectedRevenue, 0),
      stockByStatus: {
        abundant: stockArray.filter((s: any) => s.stockStatus === 'abundant').length,
        adequate: stockArray.filter((s: any) => s.stockStatus === 'adequate').length,
        limited: stockArray.filter((s: any) => s.stockStatus === 'limited').length,
        unavailable: stockArray.filter((s: any) => s.stockStatus === 'unavailable').length
      },
      upcomingHarvests: harvestingBlocks.length,
      timeframe: `${days} days`
    };

    return res.json({
      success: true,
      message: 'Predicted stock levels retrieved successfully',
      data: {
        predictedStock: stockArray,
        summary
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to retrieve predicted stock', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve predicted stock levels',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/sales/create-order
 * @desc Create a new customer order with stock allocation
 * @access Sales, Manager, Admin
 */
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      orderItems,
      orderType = 'direct', // 'direct', 'online', 'phone'
      notes
    } = req.body;
    const salesUserId = req.user?.userId;

    logger.info(LogCategory.API, 'Order creation requested', {
      userId: salesUserId,
      customerId,
      orderType,
      itemCount: orderItems?.length
    });

    // Validate inputs
    if (!customerId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId, orderItems (array)'
      });
    }

    // Get customer data
    const customer = await CustomerData.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate and calculate order items
    const processedItems = [];
    let totalOrderValue = 0;
    const stockChecks = [];

    for (const item of orderItems) {
      const { plantId, quantity, requestedQuality = 'standard', specialRequirements } = item;

      if (!plantId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order item: plantId and positive quantity required'
        });
      }

      // Get plant data
      const plant = await PlantData.findById(plantId);
      if (!plant) {
        return res.status(400).json({
          success: false,
          message: `Plant not found: ${plantId}`
        });
      }

      // Get market price
      const marketData = await MarketData.findOne({ productId: plantId });
      const basePrice = marketData ? (marketData as any).pricing.current.price : 0;
      
      // Apply quality multiplier
      const qualityMultiplier = requestedQuality === 'premium' ? 1.3 : 
                               requestedQuality === 'standard' ? 1.0 : 0.7; // economy
      const unitPrice = basePrice * qualityMultiplier;
      const itemTotal = quantity * unitPrice;

      // Check stock availability (simplified - in reality, check predicted stock)
      const availableStock = 100; // This would come from predicted stock calculation
      const canFulfill = quantity <= availableStock;

      stockChecks.push({
        plantId,
        plantName: plant.name,
        requested: quantity,
        available: availableStock,
        canFulfill
      });

      processedItems.push({
        plantId,
        plantName: plant.name,
        quantity,
        requestedQuality,
        unitPrice,
        itemTotal,
        specialRequirements: specialRequirements || [],
        stockStatus: canFulfill ? 'available' : 'insufficient'
      });

      totalOrderValue += itemTotal;
    }

    // Check if all items can be fulfilled
    const canFulfillOrder = stockChecks.every(check => check.canFulfill);
    const insufficientItems = stockChecks.filter(check => !check.canFulfill);

    if (!canFulfillOrder) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for order',
        data: {
          insufficientItems,
          availableAlternatives: 'Check predicted stock for upcoming harvests'
        }
      });
    }

    // Create order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order record (in reality, this would be a separate Order model)
    const orderData = {
      orderId,
      customerId,
      customerName: `${(customer as any).basicInfo.name}`,
      salesUserId,
      orderType,
      status: 'pending', // pending -> confirmed -> prepared -> shipped -> delivered
      createdAt: new Date(),
      items: processedItems,
      totals: {
        subtotal: totalOrderValue,
        tax: totalOrderValue * 0.1, // 10% tax
        shipping: totalOrderValue > 500 ? 0 : 50, // Free shipping over $500
        get total() { return this.subtotal + this.tax + this.shipping; }
      },
      notes: notes || '',
      allocation: {
        allocated: false,
        allocationDate: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours to confirm
      }
    };

    // Temporarily allocate stock (in reality, update inventory reservations)
    logger.info(LogCategory.API, 'Stock temporarily allocated for order', {
      userId: salesUserId,
      orderId,
      allocations: stockChecks
    });

    // Update customer order history (simplified)
    const customerUpdate = {
      'purchaseHistory.totalOrders': ((customer as any).purchaseHistory?.totalOrders || 0) + 1,
      'purchaseHistory.lastOrderDate': new Date()
    };

    await CustomerData.findByIdAndUpdate(customerId, customerUpdate);

    logger.info(LogCategory.API, 'Order created successfully', {
      userId: salesUserId,
      orderId,
      customerId,
      totalValue: orderData.totals.total
    });

    return res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: orderData,
        nextSteps: [
          'Customer needs to confirm payment',
          'Stock will be allocated upon payment confirmation',
          'Order will expire in 24 hours without payment'
        ]
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to create order', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/sales/confirm-order
 * @desc Confirm order payment and finalize stock allocation
 * @access Sales, Manager, Admin
 */
router.post('/confirm-order', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      paymentMethod,
      paymentReference,
      invoiceNumber
    } = req.body;
    const salesUserId = req.user?.userId;

    logger.info(LogCategory.API, 'Order confirmation requested', {
      userId: salesUserId,
      orderId,
      paymentMethod
    });

    // Validate inputs
    if (!orderId || !paymentMethod || !invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, paymentMethod, invoiceNumber'
      });
    }

    // In reality, you'd fetch the order from database
    // For now, we'll simulate the confirmation process

    const confirmedOrder = {
      orderId,
      status: 'confirmed',
      paymentDetails: {
        method: paymentMethod,
        reference: paymentReference,
        invoiceNumber,
        confirmedAt: new Date(),
        confirmedBy: salesUserId
      },
      allocation: {
        allocated: true,
        allocationDate: new Date(),
        expiresAt: null // No longer expires
      }
    };

    // Finalize stock allocation (in reality, update inventory reservations)
    logger.info(LogCategory.API, 'Stock allocation finalized', {
      userId: salesUserId,
      orderId
    });

    // Create delivery task for logistics
    const deliveryTask = {
      deliveryId: `DEL-${Date.now()}`,
      orderId,
      status: 'pending_pickup',
      createdAt: new Date(),
      availableForDrivers: true
    };

    logger.info(LogCategory.API, 'Delivery task created', {
      userId: salesUserId,
      deliveryId: deliveryTask.deliveryId,
      orderId
    });

    return res.json({
      success: true,
      message: 'Order confirmed and payment processed',
      data: {
        confirmedOrder,
        deliveryTask,
        nextSteps: [
          'Stock has been allocated',
          'Delivery task created for drivers',
          'Customer will receive confirmation notification'
        ]
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to confirm order', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to confirm order',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/sales/customer-insights
 * @desc Get customer analysis and sales insights
 * @access Sales, Manager, Admin
 */
router.get('/customer-insights', async (req: Request, res: Response) => {
  try {
    const { customerId, timeRange = '90' } = req.query;
    const salesUserId = req.user?.userId;

    logger.info(LogCategory.API, 'Customer insights requested', {
      userId: salesUserId,
      customerId,
      timeRange
    });

    const days = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (customerId) {
      // Get specific customer insights
      const customer = await CustomerData.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customerData = customer as any;
      
      // Calculate customer metrics
      const insights = {
        customer: {
          id: customer._id,
          name: customerData.basicInfo.name,
          type: customerData.basicInfo.type,
          status: customerData.basicInfo.status,
          registrationDate: customerData.basicInfo.registrationDate
        },
        purchaseHistory: {
          totalOrders: customerData.purchaseHistory.totalOrders,
          totalSpent: customerData.purchaseHistory.totalSpent,
          averageOrderValue: customerData.purchaseHistory.averageOrderValue,
          lastOrderDate: customerData.purchaseHistory.lastOrderDate,
          frequency: customerData.purchaseHistory.totalOrders > 0 ? 
            Math.round(days / customerData.purchaseHistory.totalOrders) : 0
        },
        loyalty: {
          tier: customerData.loyaltyProgram?.tier || 'standard',
          points: customerData.loyaltyProgram?.totalPoints || 0,
          lifetimeValue: customerData.purchaseHistory.totalSpent
        },
        preferences: {
          preferredProducts: customerData.preferences?.preferredProducts || [],
          qualityPreference: customerData.preferences?.qualityGrade || 'standard',
          deliveryPreference: customerData.preferences?.deliverySchedule || 'standard'
        },
        riskFactors: {
          creditLimit: customerData.creditTerms?.creditLimit || 0,
          paymentTerms: customerData.creditTerms?.paymentTerms || 'immediate',
          churnRisk: customerData.purchaseHistory.totalOrders < 3 ? 'high' : 
                    days - new Date(customerData.purchaseHistory.lastOrderDate).getTime() / (1000 * 60 * 60 * 24) > 60 ? 'medium' : 'low'
        }
      };

      return res.json({
        success: true,
        message: 'Customer insights retrieved',
        data: insights
      });

    } else {
      // Get overall sales insights
      const allCustomers = await CustomerData.find({ 
        isActive: true,
        'basicInfo.lastContactDate': { $gte: startDate }
      });

      // Calculate aggregate insights
      const totalCustomers = allCustomers.length;
      const totalRevenue = allCustomers.reduce((sum, c) => sum + ((c as any).purchaseHistory?.totalSpent || 0), 0);
      const totalOrders = allCustomers.reduce((sum, c) => sum + ((c as any).purchaseHistory?.totalOrders || 0), 0);

      const customerSegments = {
        premium: allCustomers.filter(c => (c as any).purchaseHistory?.totalSpent > 1000).length,
        standard: allCustomers.filter(c => (c as any).purchaseHistory?.totalSpent > 100 && (c as any).purchaseHistory?.totalSpent <= 1000).length,
        budget: allCustomers.filter(c => (c as any).purchaseHistory?.totalSpent <= 100).length
      };

      const insights = {
        overview: {
          totalCustomers,
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          timeRange: `${days} days`
        },
        segmentation: {
          byValue: customerSegments,
          byType: {
            individual: allCustomers.filter(c => (c as any).basicInfo.type === 'individual').length,
            business: allCustomers.filter(c => (c as any).basicInfo.type === 'business').length,
            wholesale: allCustomers.filter(c => (c as any).basicInfo.type === 'wholesale').length
          }
        },
        trends: {
          newCustomers: allCustomers.filter(c => 
            new Date((c as any).basicInfo.registrationDate) >= startDate
          ).length,
          returningCustomers: allCustomers.filter(c => 
            (c as any).purchaseHistory?.totalOrders > 1
          ).length,
          atRiskCustomers: allCustomers.filter(c => {
            const lastOrder = (c as any).purchaseHistory?.lastOrderDate;
            return lastOrder && (new Date().getTime() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24) > 60;
          }).length
        },
        topOpportunities: [
          {
            type: 'upsell',
            description: 'Premium customers ready for bulk orders',
            count: customerSegments.premium,
            potential: customerSegments.premium * 500
          },
          {
            type: 'retention',
            description: 'At-risk customers needing attention',
            count: allCustomers.filter(c => {
              const lastOrder = (c as any).purchaseHistory?.lastOrderDate;
              return lastOrder && (new Date().getTime() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24) > 30;
            }).length,
            potential: 'Prevent churn'
          }
        ]
      };

      return res.json({
        success: true,
        message: 'Sales insights retrieved',
        data: insights
      });
    }

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to retrieve customer insights', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer insights',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/sales/available-deliveries
 * @desc Get available delivery orders for driver assignment
 * @access Sales, Manager, Admin (also accessible by drivers)
 */
router.get('/available-deliveries', async (req: Request, res: Response) => {
  try {
    const { region, maxDistance } = req.query;
    const userId = req.user?.userId;

    logger.info(LogCategory.API, 'Available deliveries requested', {
      userId,
      region,
      maxDistance
    });

    // In reality, this would query a deliveries/orders collection
    // For now, we'll return mock delivery data
    const availableDeliveries = [
      {
        deliveryId: 'DEL-001',
        orderId: 'ORD-001',
        customer: {
          name: 'ABC Restaurant',
          address: '123 Main St, City Center',
          phone: '+1-555-0123',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        items: [
          { product: 'Fresh Lettuce', quantity: '50 kg', quality: 'premium' },
          { product: 'Tomatoes', quantity: '30 kg', quality: 'standard' }
        ],
        deliveryWindow: {
          earliest: '2024-12-20T08:00:00Z',
          latest: '2024-12-20T12:00:00Z',
          flexible: false
        },
        priority: 'high',
        distance: 15.2, // km
        estimatedTime: 45, // minutes
        value: 450.00,
        specialInstructions: 'Call before arrival, loading dock access',
        createdAt: new Date('2024-12-19T10:00:00Z')
      },
      {
        deliveryId: 'DEL-002',
        orderId: 'ORD-002',
        customer: {
          name: 'Green Market Co.',
          address: '456 Oak Ave, Riverside',
          phone: '+1-555-0456',
          coordinates: { lat: 40.7589, lng: -73.9851 }
        },
        items: [
          { product: 'Mixed Herbs', quantity: '20 kg', quality: 'premium' },
          { product: 'Bell Peppers', quantity: '40 kg', quality: 'standard' }
        ],
        deliveryWindow: {
          earliest: '2024-12-20T13:00:00Z',
          latest: '2024-12-20T17:00:00Z',
          flexible: true
        },
        priority: 'medium',
        distance: 8.7, // km
        estimatedTime: 30, // minutes
        value: 320.00,
        specialInstructions: 'Use rear entrance, sign delivery receipt',
        createdAt: new Date('2024-12-19T11:30:00Z')
      },
      {
        deliveryId: 'DEL-003',
        orderId: 'ORD-003',
        customer: {
          name: 'Farm Fresh Store',
          address: '789 Pine Rd, Suburb',
          phone: '+1-555-0789',
          coordinates: { lat: 40.6892, lng: -74.0445 }
        },
        items: [
          { product: 'Organic Spinach', quantity: '25 kg', quality: 'premium' }
        ],
        deliveryWindow: {
          earliest: '2024-12-21T09:00:00Z',
          latest: '2024-12-21T11:00:00Z',
          flexible: false
        },
        priority: 'low',
        distance: 22.1, // km
        estimatedTime: 60, // minutes
        value: 275.00,
        specialInstructions: 'Temperature controlled transport required',
        createdAt: new Date('2024-12-19T14:15:00Z')
      }
    ];

    // Filter by distance if specified
    let filteredDeliveries = availableDeliveries;
    if (maxDistance) {
      const maxDist = parseFloat(maxDistance as string);
      filteredDeliveries = availableDeliveries.filter(d => d.distance <= maxDist);
    }

    // Sort by priority and value
    const priorityOrder: { [key: string]: number } = { 'high': 0, 'medium': 1, 'low': 2 };
    filteredDeliveries.sort((a: any, b: any) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.value - a.value; // Higher value first within same priority
    });

    // Calculate summary statistics
    const summary = {
      totalDeliveries: filteredDeliveries.length,
      totalValue: filteredDeliveries.reduce((sum, d) => sum + d.value, 0),
      averageDistance: filteredDeliveries.length > 0 ? 
        filteredDeliveries.reduce((sum, d) => sum + d.distance, 0) / filteredDeliveries.length : 0,
      byPriority: {
        high: filteredDeliveries.filter(d => d.priority === 'high').length,
        medium: filteredDeliveries.filter(d => d.priority === 'medium').length,
        low: filteredDeliveries.filter(d => d.priority === 'low').length
      },
      estimatedTotalTime: filteredDeliveries.reduce((sum, d) => sum + d.estimatedTime, 0)
    };

    return res.json({
      success: true,
      message: 'Available deliveries retrieved',
      data: {
        deliveries: filteredDeliveries,
        summary
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to retrieve available deliveries', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available deliveries',
      error: (error as Error).message
    });
  }
});

export default router;
