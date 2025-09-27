import axios from 'axios';
import { testModeService } from '../config/testMode';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Types for Farm Management
export interface IFarm {
  _id: string;
  name: string;
  farmId: string;
  ownerId: string;
  farmOwner: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: string;
  };
  specifications: {
    totalArea: number;
    usableArea: number;
    maxBlocks: number;
    establishedDate: string;
    farmType: 'organic' | 'conventional' | 'hydroponic' | 'mixed' | 'research' | 'commercial';
    certification: string[];
    climate: 'tropical' | 'subtropical' | 'temperate' | 'continental' | 'arctic';
    soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'mixed';
  };
  mapLocation: {
    mapUrl?: string;
    mapDescription?: string;
    boundaries?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  status: 'active' | 'inactive' | 'maintenance' | 'expansion' | 'sale';
  financials: {
    // Basic Financial Data
    landRentPerMonth: number;
    electricityCostPerKw: number;
    waterCostPerCm3: number;
    initialCapitalInvestment: number;
    depreciation: number;
    incentives: number;
    otherCosts: number;
    currency: string;
    lastUpdated: string;
    
    // Calculated Financial Metrics
    totalInvestment: number;
    monthlyOperatingCost: number;
    monthlyRevenue: number;
    monthlyProfit: number;
    roi: number;
    breakEvenPoint: string;
  };
  currentOperations: {
    activeBlocks: string[];
    plannedBlocks: string[];
    harvestedBlocks: string[];
    maintenanceBlocks: string[];
  };
  production: {
    currentCrops: Array<{
      plantDataId: string;
      blockCount: number;
      totalPlants: number;
      expectedYield: number;
      expectedHarvestDate: string;
    }>;
    monthlyProduction: Array<{
      month: string;
      totalYield: number;
      revenue: number;
      cost: number;
      profit: number;
    }>;
    annualTarget: {
      year: number;
      targetYield: number;
      targetRevenue: number;
      actualYield: number;
      actualRevenue: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBlock {
  _id: string;
  name: string;
  farmId: string;
  blockType: 'open_field' | 'greenhouse' | 'nethouse' | 'hydroponic' | 'container' | 'vertical' | 'aquaponic' | 'other';
  dimensions: {
    length: number;
    width: number;
    height?: number;
    area: number;
    volume?: number;
  };
  location: {
    coordinates: {
      x: number;
      y: number;
      z?: number;
    };
    orientation: number;
    slope?: number;
  };
  infrastructure: {
    irrigation: {
      type: 'drip' | 'sprinkler' | 'flood' | 'mist' | 'none';
      capacity: number;
      coverage: number;
      automation: boolean;
    };
    lighting: {
      type: 'natural' | 'led' | 'fluorescent' | 'hps' | 'mixed';
      intensity: number;
      duration: number;
      automation: boolean;
    };
    climateControl: {
      heating: boolean;
      cooling: boolean;
      ventilation: boolean;
      humidityControl: boolean;
      automation: boolean;
    };
    power: {
      connected: boolean;
      capacity: number;
      backup: boolean;
    };
    water: {
      source: 'municipal' | 'well' | 'rainwater' | 'recycled' | 'mixed';
      quality: 'excellent' | 'good' | 'fair' | 'poor';
      ph: number;
      tds: number;
    };
  };
  status: 'empty' | 'assigned' | 'planted' | 'harvesting' | 'alert';
  plantAssignment: {
    maxPlantCapacity: number;
    assignedPlants: Array<{
      plantDataId: string;
      plantName: string;
      assignedCount: number;
      plantingDate?: string;
      expectedHarvestStart?: string;
      expectedHarvestEnd?: string;
      actualHarvestStart?: string;
      actualHarvestEnd?: string;
      harvestNotes?: string;
    }>;
    totalAssigned: number;
    remainingCapacity: number;
  };
  stateHistory: Array<{
    fromState: string;
    toState: string;
    timestamp: string;
    notes?: string;
    triggeredBy?: string;
  }>;
  alertInfo?: {
    alertType: 'disease' | 'pest' | 'weather' | 'equipment' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    startDate: string;
    endDate?: string;
    resolvedBy?: string;
    resolutionNotes?: string;
  };
  performance?: {
    lastHarvestYield: number;
    lastHarvestDate: string;
    averageYield: number;
    qualityGrade: 'premium' | 'standard' | 'economy';
    efficiency: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPlant {
  _id: string;
  name: string;
  scientificName: string;
  family: string;
  variety: string;
  growthCharacteristics: {
    height: number;
    spread: number;
    rootDepth: number;
    lifecycle: 'annual' | 'perennial' | 'biennial';
  };
  growingRequirements: {
    soilType: string[];
    phRange: {
      min: number;
      max: number;
    };
    temperatureRange: {
      min: number;
      max: number;
      optimal: number;
    };
    humidityRange: {
      min: number;
      max: number;
    };
    lightRequirements: string;
    waterRequirements: string;
  };
  growthTimeline: {
    germinationTime: number;
    daysToMaturity: number;
    harvestWindow: number;
    seasonalPlanting: string[];
  };
  yieldInformation: {
    expectedYieldPerPlant: number;
    yieldPerSquareMeter: number;
    qualityMetrics: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPerformanceDashboard {
  farms: IFarm[];
  blocks: IBlock[];
  totalBlocks: number;
  activeBlocks: number;
  availableBlocks: number;
  harvestingBlocks: number;
  totalYield: number;
  avgYieldPerBlock: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  performanceMetrics: {
    yieldEfficiency: number;
    costEfficiency: number;
    profitMargin: number;
    blockUtilization: number;
  };
}

export interface IBlockOptimization {
  blockId: string;
  blockName: string;
  currentStatus: string;
  optimizationScore: number;
  recommendations: Array<{
    type: 'plant_assignment' | 'infrastructure_upgrade' | 'maintenance' | 'capacity_optimization';
    description: string;
    impact: 'high' | 'medium' | 'low';
    cost: number;
    expectedBenefit: number;
  }>;
  suitablePlants: Array<{
    plantId: string;
    plantName: string;
    compatibilityScore: number;
    expectedYield: number;
    expectedRevenue: number;
  }>;
}

// Mock data for test mode
const mockFarms: IFarm[] = [
  {
    _id: 'mock-farm-1',
    name: 'PrimeRose Main Farm',
    farmId: 'FARM-001',
    ownerId: 'mock-owner-1',
    farmOwner: 'John Smith',
    location: {
      address: '123 Farm Road',
      city: 'Agricultural City',
      state: 'Farm State',
      country: 'USA',
      zipCode: '12345',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      timezone: 'America/New_York'
    },
    specifications: {
      totalArea: 100,
      usableArea: 85,
      maxBlocks: 20,
      establishedDate: '2020-01-15',
      farmType: 'organic',
      certification: ['USDA Organic', 'GAP'],
      climate: 'temperate',
      soilType: 'loamy'
    },
    mapLocation: {
      mapUrl: 'https://maps.google.com/example-farm',
      mapDescription: 'Main farm with 12 blocks arranged in 3 rows',
      boundaries: {
        north: 40.7200,
        south: 40.7000,
        east: -73.9900,
        west: -74.0200
      }
    },
    financials: {
      // Basic Financial Data
      landRentPerMonth: 5000,
      electricityCostPerKw: 0.12,
      waterCostPerCm3: 0.05,
      initialCapitalInvestment: 500000,
      depreciation: 50000,
      incentives: 10000,
      otherCosts: 2000,
      currency: 'USD',
      lastUpdated: '2024-01-15T10:30:00Z',
      
      // Calculated Financial Metrics
      totalInvestment: 500000,
      monthlyOperatingCost: 15000,
      monthlyRevenue: 25000,
      monthlyProfit: 10000,
      roi: 24.0,
      breakEvenPoint: '2024-06-15T00:00:00Z'
    },
    status: 'active',
    currentOperations: {
      activeBlocks: ['block-1', 'block-2', 'block-3'],
      plannedBlocks: ['block-4'],
      harvestedBlocks: ['block-5'],
      maintenanceBlocks: ['block-6']
    },
    production: {
      currentCrops: [
        {
          plantDataId: 'plant-1',
          blockCount: 3,
          totalPlants: 1500,
          expectedYield: 4500,
          expectedHarvestDate: '2024-03-15'
        }
      ],
      monthlyProduction: [
        {
          month: '2024-01',
          totalYield: 3200,
          revenue: 12800,
          cost: 8000,
          profit: 4800
        }
      ],
      annualTarget: {
        year: 2024,
        targetYield: 50000,
        targetRevenue: 200000,
        actualYield: 15000,
        actualRevenue: 60000
      }
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

const mockBlocks: IBlock[] = [
  {
    _id: 'mock-block-1',
    name: 'Greenhouse Block A',
    farmId: 'mock-farm-1',
    blockType: 'greenhouse',
    dimensions: {
      length: 50,
      width: 20,
      height: 4,
      area: 1000,
      volume: 4000
    },
    location: {
      coordinates: { x: 0, y: 0, z: 0 },
      orientation: 0,
      slope: 0
    },
    infrastructure: {
      irrigation: {
        type: 'drip',
        capacity: 1000,
        coverage: 100,
        automation: true
      },
      lighting: {
        type: 'led',
        intensity: 50000,
        duration: 16,
        automation: true
      },
      climateControl: {
        heating: true,
        cooling: true,
        ventilation: true,
        humidityControl: true,
        automation: true
      },
      power: {
        connected: true,
        capacity: 10000,
        backup: true
      },
      water: {
        source: 'municipal',
        quality: 'excellent',
        ph: 6.5,
        tds: 200
      }
    },
    status: 'planted',
    plantAssignment: {
      maxPlantCapacity: 1000,
      assignedPlants: [{
        plantDataId: 'plant-1',
        plantName: 'Tomatoes',
        assignedCount: 500,
        plantingDate: '2024-01-01',
        expectedHarvestStart: '2024-03-15',
        expectedHarvestEnd: '2024-03-29'
      }],
      totalAssigned: 500,
      remainingCapacity: 500
    },
    stateHistory: [{
      fromState: 'empty',
      toState: 'assigned',
      timestamp: '2024-01-01T00:00:00Z',
      notes: 'Assigned 500 Tomato plants',
      triggeredBy: 'user-1'
    }, {
      fromState: 'assigned',
      toState: 'planted',
      timestamp: '2024-01-01T10:00:00Z',
      notes: 'Plants planted in block',
      triggeredBy: 'user-1'
    }],
    performance: {
      lastHarvestYield: 1200,
      lastHarvestDate: '2023-12-15',
      averageYield: 1100,
      qualityGrade: 'premium',
      efficiency: 0.85
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

const mockPlants: IPlant[] = [
  {
    _id: 'mock-plant-1',
    name: 'Tomatoes',
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    variety: 'Cherry',
    growthCharacteristics: {
      height: 150,
      spread: 60,
      rootDepth: 30,
      lifecycle: 'annual'
    },
    growingRequirements: {
      soilType: ['loamy', 'sandy'],
      phRange: { min: 6.0, max: 6.8 },
      temperatureRange: { min: 18, max: 30, optimal: 24 },
      humidityRange: { min: 50, max: 70 },
      lightRequirements: 'full sun',
      waterRequirements: 'moderate'
    },
    growthTimeline: {
      germinationTime: 7,
      daysToMaturity: 75,
      harvestWindow: 30,
      seasonalPlanting: ['spring', 'summer']
    },
    yieldInformation: {
      expectedYieldPerPlant: 3.5,
      yieldPerSquareMeter: 12,
      qualityMetrics: ['size', 'color', 'firmness']
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

class FarmManagementApi {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Farm Management APIs
  async getFarms(): Promise<IFarm[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock farm data');
      return Promise.resolve(mockFarms);
    }
    
    console.log('🔧 Using real farm data from API');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/manager/farms`, {
        headers: this.getAuthHeader()
      });
      return response.data.data.farms || [];
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  }

  async getFarmById(farmId: string): Promise<IFarm> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock farm data');
      return Promise.resolve(mockFarms.find(f => f._id === farmId) || mockFarms[0]);
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/manager/farms/${farmId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching farm:', error);
      throw error;
    }
  }

  async createFarm(farmData: Omit<IFarm, '_id' | 'createdAt' | 'updatedAt'>): Promise<IFarm> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock farm creation');
      const newFarm = { 
        ...farmData, 
        _id: `mock-farm-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      mockFarms.push(newFarm);
      return Promise.resolve(newFarm);
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/manager/farms`, farmData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  }

  async updateFarm(farmId: string, farmData: Partial<IFarm>): Promise<IFarm> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock farm update');
      const farmIndex = mockFarms.findIndex(f => f._id === farmId);
      if (farmIndex !== -1) {
        mockFarms[farmIndex] = { ...mockFarms[farmIndex], ...farmData, updatedAt: new Date().toISOString() };
        return Promise.resolve(mockFarms[farmIndex]);
      }
      throw new Error('Farm not found');
    }
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/manager/farms/${farmId}`, farmData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  }

  // Block Management APIs
  async getBlocks(farmId?: string): Promise<IBlock[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock block data');
      const filteredBlocks = farmId ? mockBlocks.filter(b => b.farmId === farmId) : mockBlocks;
      return Promise.resolve(filteredBlocks);
    }
    
    console.log('🔧 Using real block data from API');
    try {
      const url = farmId 
        ? `${API_BASE_URL}/api/v1/manager/blocks?farmId=${farmId}`
        : `${API_BASE_URL}/api/v1/manager/blocks`;
      const response = await axios.get(url, {
        headers: this.getAuthHeader()
      });
      return response.data.data.blocks || [];
    } catch (error) {
      console.error('Error fetching blocks:', error);
      throw error;
    }
  }

  async getBlockById(blockId: string): Promise<IBlock> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock block data');
      return Promise.resolve(mockBlocks.find(b => b._id === blockId) || mockBlocks[0]);
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/manager/blocks/${blockId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching block:', error);
      throw error;
    }
  }

  async createBlock(blockData: Omit<IBlock, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBlock> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock block creation');
      const newBlock = { 
        ...blockData, 
        _id: `mock-block-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      mockBlocks.push(newBlock);
      return Promise.resolve(newBlock);
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/manager/blocks`, blockData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating block:', error);
      throw error;
    }
  }

  async updateBlock(blockId: string, blockData: Partial<IBlock>): Promise<IBlock> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock block update');
      const blockIndex = mockBlocks.findIndex(b => b._id === blockId);
      if (blockIndex !== -1) {
        mockBlocks[blockIndex] = { ...mockBlocks[blockIndex], ...blockData, updatedAt: new Date().toISOString() };
        return Promise.resolve(mockBlocks[blockIndex]);
      }
      throw new Error('Block not found');
    }
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/manager/blocks/${blockId}`, blockData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating block:', error);
      throw error;
    }
  }

  // Plant Management APIs
  async getPlants(blockType?: string): Promise<any[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock plant data');
      return Promise.resolve(mockPlants);
    }
    
    console.log('🔧 Using real plant data from API');
    try {
      // Map block types to farming types
      const blockTypeToFarmingType: { [key: string]: string } = {
        'open_field': 'open_field_soil',
        'greenhouse': 'greenhouse',
        'nethouse': 'nethouse',
        'hydroponic': 'hydroponic',
        'aquaponic': 'aquaponic',
        'container': 'special',
        'vertical': 'special',
        'other': 'special'
      };
      
      const farmingType = blockType ? blockTypeToFarmingType[blockType] : undefined;
      const params = new URLSearchParams();
      params.append('isActive', 'true');
      if (farmingType) {
        params.append('farmingType', farmingType);
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/plant-data?${params.toString()}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data.plants || [];
    } catch (error) {
      console.error('Error fetching plants:', error);
      throw error;
    }
  }

  // Performance Dashboard API
  async getPerformanceDashboard(farmId?: string, timeRange: string = '30'): Promise<IPerformanceDashboard> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock performance dashboard data');
      return Promise.resolve({
        farms: mockFarms,
        blocks: mockBlocks,
        totalBlocks: mockBlocks.length,
        activeBlocks: mockBlocks.filter(b => b.status === 'planted').length,
        availableBlocks: mockBlocks.filter(b => b.status === 'empty').length,
        harvestingBlocks: mockBlocks.filter(b => b.status === 'harvesting').length,
        totalYield: 5000,
        avgYieldPerBlock: 1250,
        totalRevenue: 20000,
        totalCost: 12000,
        totalProfit: 8000,
        performanceMetrics: {
          yieldEfficiency: 0.85,
          costEfficiency: 0.75,
          profitMargin: 0.40,
          blockUtilization: 0.80
        }
      });
    }
    
    try {
      const url = farmId 
        ? `${API_BASE_URL}/api/v1/manager/performance-dashboard?farmId=${farmId}&timeRange=${timeRange}`
        : `${API_BASE_URL}/api/v1/manager/performance-dashboard?timeRange=${timeRange}`;
      const response = await axios.get(url, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching performance dashboard:', error);
      throw error;
    }
  }

  // Block Optimization API
  async getBlockOptimization(farmId?: string): Promise<IBlockOptimization[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock block optimization data');
      return Promise.resolve([
        {
          blockId: 'mock-block-1',
          blockName: 'Greenhouse Block A',
          currentStatus: 'growing',
          optimizationScore: 0.75,
          recommendations: [
            {
              type: 'infrastructure_upgrade',
              description: 'Upgrade LED lighting system for better efficiency',
              impact: 'medium',
              cost: 5000,
              expectedBenefit: 8000
            }
          ],
          suitablePlants: [
            {
              plantId: 'mock-plant-1',
              plantName: 'Tomatoes',
              compatibilityScore: 0.90,
              expectedYield: 1200,
              expectedRevenue: 4800
            }
          ]
        }
      ]);
    }
    
    try {
      const url = farmId 
        ? `${API_BASE_URL}/api/v1/manager/block-optimization?farmId=${farmId}`
        : `${API_BASE_URL}/api/v1/manager/block-optimization`;
      const response = await axios.get(url, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching block optimization:', error);
      throw error;
    }
  }

  // Plant Assignment API
  async assignPlantToBlock(blockId: string, plantDataId: string, plantName: string, plantCount: number, preview: boolean = false): Promise<any> {
    if (testModeService.isTestMode() && !testModeService.useRealData('farm-management')) {
      console.log('🔧 Using mock plant assignment');
      return Promise.resolve({
        success: true,
        message: preview ? 'Assignment preview generated' : 'Plant assigned to block successfully',
        data: {
          blockId,
          plantDataId,
          plantName,
          plantCount,
          expectedHarvestDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          resourceRequirements: {
            fertilizer: 50,
            water: 200,
            labor: 8
          }
        }
      });
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/manager/assign-plant-to-block`, {
        blockId,
        plantDataId,
        plantName,
        plantCount,
        plantingDate: new Date().toISOString(), // Add current date as planting date
        preview
      }, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning plant to block:', error);
      throw error;
    }
  }
}

export const farmManagementApi = new FarmManagementApi();
