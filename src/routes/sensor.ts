import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { logger, LogCategory } from '../utils/logger';
import { UserRole } from '../types';
import { SensorData } from '../models/SensorData';
import { BlockData } from '../models/BlockData';
import { PlantData } from '../models/PlantData';
import { EnvironmentData } from '../models/EnvironmentData';

const router = Router();

// Sensor routes have different access patterns
// Some are for system automation, others for monitoring

/**
 * @route POST /api/sensor/data-reading
 * @desc Receive sensor data reading from IoT devices
 * @access System/IoT devices (API key authentication would be used in reality)
 */
router.post('/data-reading', async (req: Request, res: Response) => {
  try {
    const {
      sensorId,
      blockId,
      sensorType,
      readings,
      timestamp = new Date(),
      metadata
    } = req.body;

    logger.info(LogCategory.SYSTEM, 'Sensor data received', {
      sensorId,
      blockId,
      sensorType,
      timestamp
    });

    // Validate inputs
    if (!sensorId || !sensorType || !readings) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sensorId, sensorType, readings'
      });
    }

    // Get sensor information
    const sensor = await SensorData.findOne({ sensorId });
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // Process readings and check against thresholds
    const processedReadings = [];
    const alerts = [];

    for (const reading of readings) {
      const { type, value, unit } = reading;
      
      // Get sensor thresholds
      const thresholds = (sensor as any).configuration.thresholds;
      
      // Check for threshold violations
      let alertLevel = null;
      if (value < thresholds.critical.min || value > thresholds.critical.max) {
        alertLevel = 'critical';
      } else if (value < thresholds.warning.min || value > thresholds.warning.max) {
        alertLevel = 'warning';
      }

      processedReadings.push({
        type,
        value,
        unit,
        timestamp,
        quality: 'good', // In reality, this would be calculated based on sensor calibration
        alertLevel
      });

      // Generate alerts if thresholds exceeded
      if (alertLevel) {
        alerts.push({
          sensorId,
          blockId,
          alertType: alertLevel,
          message: `${type} ${alertLevel} threshold exceeded: ${value}${unit}`,
          timestamp,
          value,
          thresholds
        });
      }
    }

    // Update sensor with new readings
    await SensorData.findOneAndUpdate(
      { sensorId },
      {
        $push: {
          readings: {
            $each: processedReadings,
            $slice: -1000 // Keep only latest 1000 readings
          }
        },
        'performance.lastDataReceived': timestamp,
        'performance.totalReadings': ((sensor as any).performance?.totalReadings || 0) + readings.length
      }
    );

    // If there's a block associated, check against plant requirements
    if (blockId) {
      const block = await BlockData.findById(blockId);
      if (block && block.currentPlanting?.plantDataId) {
        const plant = await PlantData.findById(block.currentPlanting.plantDataId);
        if (plant) {
          await checkPlantRequirements(readings, plant, alerts, sensorId, blockId);
        }
      }
    }

    // Process alerts
    if (alerts.length > 0) {
      await processAlerts(alerts);
    }

    // Trigger automated responses if configured
    const automationResults = await triggerAutomatedResponses(sensorId, readings, blockId);

    logger.info(LogCategory.SYSTEM, 'Sensor data processed', {
      sensorId,
      readingsCount: readings.length,
      alertsGenerated: alerts.length,
      automationTriggered: automationResults.length
    });

    return res.json({
      success: true,
      message: 'Sensor data processed successfully',
      data: {
        readingsProcessed: processedReadings.length,
        alertsGenerated: alerts.length,
        automationTriggered: automationResults
      }
    });

  } catch (error) {
    logger.error(LogCategory.SYSTEM, 'Failed to process sensor data', {
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to process sensor data',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/sensor/real-time-data
 * @desc Get real-time sensor data for monitoring dashboard
 * @access Manager, Admin, Farmer
 */
router.get('/real-time-data', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN, UserRole.FARMER), 
  async (req: Request, res: Response) => {
  try {
    const { farmId, blockId, sensorType, timeRange = '1' } = req.query;

    logger.info(LogCategory.API, 'Real-time sensor data requested', {
      userId: req.user?.userId,
      farmId,
      blockId,
      sensorType,
      timeRange
    });

    const hours = parseInt(timeRange as string);
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    // Build sensor filter
    const sensorFilter: any = { 'sensorInfo.status': 'active' };
    if (farmId) sensorFilter.farmId = farmId;
    if (blockId) sensorFilter.blockId = blockId;
    if (sensorType) sensorFilter['sensorInfo.type'] = sensorType;

    // Get sensors and their recent data
    const sensors = await SensorData.find(sensorFilter);

    const realTimeData = [];

    for (const sensor of sensors) {
      const sensorData = sensor as any;
      
      // Get recent readings
      const recentReadings = sensorData.readings
        .filter((r: any) => new Date(r.timestamp) >= startTime)
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Get latest reading for current status
      const latestReading = recentReadings[0];
      
      // Calculate status
      let status = 'normal';
      if (latestReading) {
        const thresholds = sensorData.configuration.thresholds;
        if (latestReading.value < thresholds.critical.min || latestReading.value > thresholds.critical.max) {
          status = 'critical';
        } else if (latestReading.value < thresholds.warning.min || latestReading.value > thresholds.warning.max) {
          status = 'warning';
        }
      }

      realTimeData.push({
        sensorId: sensorData.sensorId,
        sensorInfo: {
          name: sensorData.sensorInfo.name,
          type: sensorData.sensorInfo.type,
          location: sensorData.sensorInfo.location,
          status: sensorData.sensorInfo.status
        },
        farmId: sensorData.farmId,
        blockId: sensorData.blockId,
        currentReading: latestReading ? {
          value: latestReading.value,
          unit: latestReading.unit,
          timestamp: latestReading.timestamp,
          quality: latestReading.quality
        } : null,
        status,
        trends: {
          dataPoints: recentReadings.length,
          average: recentReadings.length > 0 ? 
            recentReadings.reduce((sum: number, r: any) => sum + r.value, 0) / recentReadings.length : 0,
          trend: calculateTrend(recentReadings)
        },
        thresholds: sensorData.configuration.thresholds,
        performance: {
          uptime: sensorData.performance.uptime,
          lastDataReceived: sensorData.performance.lastDataReceived,
          dataQuality: sensorData.performance.dataQuality
        }
      });
    }

    // Sort by status priority (critical first, then warning, then normal)
    const statusPriority: { [key: string]: number } = { 'critical': 0, 'warning': 1, 'normal': 2 };
    realTimeData.sort((a: any, b: any) => statusPriority[a.status] - statusPriority[b.status]);

    // Calculate summary statistics
    const summary = {
      totalSensors: realTimeData.length,
      activeSensors: realTimeData.filter(s => s.sensorInfo.status === 'active').length,
      criticalAlerts: realTimeData.filter(s => s.status === 'critical').length,
      warningAlerts: realTimeData.filter(s => s.status === 'warning').length,
      averageUptime: realTimeData.length > 0 ? 
        realTimeData.reduce((sum, s) => sum + s.performance.uptime, 0) / realTimeData.length : 0,
      sensorTypes: [...new Set(realTimeData.map(s => s.sensorInfo.type))],
      timeRange: `${hours} hours`
    };

    return res.json({
      success: true,
      message: 'Real-time sensor data retrieved',
      data: {
        sensors: realTimeData,
        summary
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to retrieve real-time sensor data', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve real-time sensor data',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/sensor/manual-override
 * @desc Manually override automated sensor controls
 * @access Manager, Admin, Farmer, Worker
 */
router.post('/manual-override', authenticate, 
  authorize(UserRole.MANAGER, UserRole.ADMIN, UserRole.FARMER, UserRole.WORKER),
  async (req: Request, res: Response) => {
  try {
    const {
      sensorId,
      overrideType,
      overrideValue,
      duration,
      reason
    } = req.body;
    const userId = req.user?.userId;

    logger.info(LogCategory.SYSTEM, 'Manual sensor override requested', {
      userId,
      sensorId,
      overrideType,
      overrideValue,
      duration,
      reason
    });

    // Validate inputs
    if (!sensorId || !overrideType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sensorId, overrideType, reason'
      });
    }

    // Get sensor
    const sensor = await SensorData.findOne({ sensorId });
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // Create override record
    const override = {
      overrideId: `OVR-${Date.now()}`,
      sensorId,
      userId,
      overrideType, // 'stop', 'manual_control', 'emergency_stop', 'maintenance'
      overrideValue,
      startTime: new Date(),
      duration: duration || 3600, // Default 1 hour
      reason,
      status: 'active'
    };

    // Apply the override based on type
    let systemResponse = '';
    switch (overrideType) {
      case 'emergency_stop':
        systemResponse = 'All automated controls halted immediately';
        break;
      case 'stop':
        systemResponse = 'Automated control stopped for this sensor';
        break;
      case 'manual_control':
        systemResponse = `Manual control activated: ${overrideValue}`;
        break;
      case 'maintenance':
        systemResponse = 'Sensor placed in maintenance mode';
        break;
      default:
        systemResponse = 'Override applied';
    }

    // Log the override for audit trail
    logger.info(LogCategory.SECURITY, 'Sensor override applied', {
      userId,
      override,
      systemResponse
    });

    // In reality, this would send commands to the actual sensor/control system
    logger.info(LogCategory.SYSTEM, 'Sensor control command sent', {
      sensorId,
      command: overrideType,
      value: overrideValue
    });

    return res.json({
      success: true,
      message: 'Manual override applied successfully',
      data: {
        override,
        systemResponse,
        expiresAt: new Date(Date.now() + (duration || 3600) * 1000),
        nextSteps: [
          'Override will automatically expire after duration',
          'Use /api/sensor/clear-override to remove early',
          'Monitor system carefully during override period'
        ]
      }
    });

  } catch (error) {
    logger.error(LogCategory.SYSTEM, 'Failed to apply manual override', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to apply manual override',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/sensor/alerts
 * @desc Get sensor alerts and notifications
 * @access Manager, Admin, Farmer
 */
router.get('/alerts', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN, UserRole.FARMER),
  async (req: Request, res: Response) => {
  try {
    const { severity, status = 'active', timeRange = '24' } = req.query;

    logger.info(LogCategory.API, 'Sensor alerts requested', {
      userId: req.user?.userId,
      severity,
      status,
      timeRange
    });

    const hours = parseInt(timeRange as string);
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    // In reality, this would query an alerts collection
    // For now, we'll generate mock alerts based on current sensor data
    const mockAlerts = [
      {
        alertId: 'ALT-001',
        sensorId: 'TEMP-GH-01',
        sensorName: 'Greenhouse 1 Temperature',
        blockId: 'BLK-001',
        blockName: 'Greenhouse Block A',
        alertType: 'critical',
        category: 'temperature',
        message: 'Temperature exceeds critical threshold: 38°C (max: 35°C)',
        value: 38,
        unit: '°C',
        thresholds: { min: 15, max: 35, critical: { min: 10, max: 35 } },
        triggeredAt: new Date(),
        status: 'active',
        acknowledgedBy: null,
        resolvedAt: null,
        automationTriggered: ['cooling_system_activated'],
        impact: 'Plant stress risk - immediate action required',
        recommendedActions: [
          'Activate emergency cooling',
          'Check cooling system operation',
          'Increase ventilation',
          'Monitor plant stress indicators'
        ]
      },
      {
        alertId: 'ALT-002',
        sensorId: 'MOIST-FLD-03',
        sensorName: 'Field 3 Soil Moisture',
        blockId: 'BLK-003',
        blockName: 'Open Field Block C',
        alertType: 'warning',
        category: 'soil_moisture',
        message: 'Soil moisture below optimal range: 25% (optimal: 30-60%)',
        value: 25,
        unit: '%',
        thresholds: { min: 30, max: 80, warning: { min: 25, max: 75 } },
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'active',
        acknowledgedBy: null,
        resolvedAt: null,
        automationTriggered: ['irrigation_scheduled'],
        impact: 'Reduced plant growth efficiency',
        recommendedActions: [
          'Schedule irrigation',
          'Check irrigation system',
          'Verify weather forecast',
          'Monitor plant stress'
        ]
      },
      {
        alertId: 'ALT-003',
        sensorId: 'PH-HYD-02',
        sensorName: 'Hydroponic pH Sensor 2',
        blockId: 'BLK-002',
        blockName: 'Hydroponic Block B',
        alertType: 'info',
        category: 'nutrient_level',
        message: 'pH adjusted automatically: 6.8 → 6.5',
        value: 6.5,
        unit: 'pH',
        thresholds: { min: 5.5, max: 7.0, optimal: { min: 6.0, max: 6.5 } },
        triggeredAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: 'resolved',
        acknowledgedBy: 'system',
        resolvedAt: new Date(Date.now() - 25 * 60 * 1000),
        automationTriggered: ['ph_adjustment_system'],
        impact: 'None - automatic correction successful',
        recommendedActions: []
      }
    ];

    // Filter alerts
    let filteredAlerts = mockAlerts.filter(alert => {
      if (severity && alert.alertType !== severity) return false;
      if (status && alert.status !== status) return false;
      return new Date(alert.triggeredAt) >= startTime;
    });

    // Sort by severity and time
    const severityOrder: { [key: string]: number } = { 'critical': 0, 'warning': 1, 'info': 2 };
    filteredAlerts.sort((a: any, b: any) => {
      if (severityOrder[a.alertType] !== severityOrder[b.alertType]) {
        return severityOrder[a.alertType] - severityOrder[b.alertType];
      }
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime();
    });

    // Calculate summary
    const summary = {
      totalAlerts: filteredAlerts.length,
      activeAlerts: filteredAlerts.filter(a => a.status === 'active').length,
      criticalAlerts: filteredAlerts.filter(a => a.alertType === 'critical').length,
      warningAlerts: filteredAlerts.filter(a => a.alertType === 'warning').length,
      resolvedAlerts: filteredAlerts.filter(a => a.status === 'resolved').length,
      categories: {
        temperature: filteredAlerts.filter(a => a.category === 'temperature').length,
        soil_moisture: filteredAlerts.filter(a => a.category === 'soil_moisture').length,
        nutrient_level: filteredAlerts.filter(a => a.category === 'nutrient_level').length
      },
      requiresAttention: filteredAlerts.filter(a => 
        a.status === 'active' && (a.alertType === 'critical' || a.alertType === 'warning')
      ).length
    };

    return res.json({
      success: true,
      message: 'Sensor alerts retrieved',
      data: {
        alerts: filteredAlerts,
        summary
      }
    });

  } catch (error) {
    logger.error(LogCategory.API, 'Failed to retrieve sensor alerts', {
      userId: req.user?.userId,
      error: (error as Error).message
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sensor alerts',
      error: (error as Error).message
    });
  }
});

// Helper functions

async function checkPlantRequirements(readings: any[], plant: any, alerts: any[], sensorId: string, blockId: string) {
  const plantData = plant as any;
  
  for (const reading of readings) {
    switch (reading.type) {
      case 'temperature':
        const tempReq = plantData.growingRequirements.temperature;
        if (reading.value < tempReq.min || reading.value > tempReq.max) {
          alerts.push({
            sensorId,
            blockId,
            alertType: 'warning',
            message: `Temperature outside plant requirements: ${reading.value}°C (optimal: ${tempReq.optimal}°C)`,
            timestamp: new Date(),
            value: reading.value,
            plantRequirement: tempReq
          });
        }
        break;
      
      case 'humidity':
        const humidityReq = plantData.growingRequirements.humidity;
        if (reading.value < humidityReq.min || reading.value > humidityReq.max) {
          alerts.push({
            sensorId,
            blockId,
            alertType: 'warning',
            message: `Humidity outside plant requirements: ${reading.value}% (optimal: ${humidityReq.optimal}%)`,
            timestamp: new Date(),
            value: reading.value,
            plantRequirement: humidityReq
          });
        }
        break;
    }
  }
}

async function processAlerts(alerts: any[]) {
  for (const alert of alerts) {
    // Log alert
    logger.info(LogCategory.SYSTEM, 'Sensor alert generated', alert);
    
    // In reality, this would:
    // 1. Save alert to database
    // 2. Send notifications to users
    // 3. Trigger automated responses
    // 4. Update monitoring dashboards
  }
}

async function triggerAutomatedResponses(sensorId: string, readings: any[], blockId?: string): Promise<string[]> {
  const automationResults = [];
  
  for (const reading of readings) {
    // Example automation rules
    if (reading.type === 'soil_moisture' && reading.value < 30) {
      automationResults.push('irrigation_activated');
      logger.info(LogCategory.SYSTEM, 'Automated irrigation triggered', {
        sensorId,
        blockId,
        soilMoisture: reading.value
      });
    }
    
    if (reading.type === 'temperature' && reading.value > 35) {
      automationResults.push('cooling_activated');
      logger.info(LogCategory.SYSTEM, 'Automated cooling triggered', {
        sensorId,
        blockId,
        temperature: reading.value
      });
    }
  }
  
  return automationResults;
}

function calculateTrend(readings: any[]): string {
  if (readings.length < 2) return 'insufficient_data';
  
  const recent = readings.slice(0, Math.min(10, readings.length));
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  const threshold = Math.abs(firstAvg) * 0.05; // 5% threshold
  
  if (Math.abs(diff) < threshold) return 'stable';
  return diff > 0 ? 'increasing' : 'decreasing';
}

export default router;
