import axios from 'axios';
import { IPlantData } from '../types';
import { testModeService } from '../config/testMode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Mock plant data for development - comprehensive plant specifications
const mockPlantData: IPlantData[] = [
  {
    _id: 'plant-1',
    name: 'Tomato (Cherry)',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    family: 'Solanaceae',
    variety: 'Sweet 100',
    growthCharacteristics: {
      height: 1.5,
      spread: 0.8,
      rootDepth: 0.3,
      lifecycle: 'annual'
    },
    growingRequirements: {
      soilType: 'loamy',
      phRange: { min: 6.0, max: 6.8 },
      temperatureRange: { min: 18, max: 30, optimal: 24 },
      humidityRange: { min: 50, max: 70 },
      lightRequirements: 'full_sun',
      waterRequirements: 'moderate'
    },
    fertilizerSchedule: [
      {
        day: 0,
        fertilizerType: 'NPK 10-10-10',
        applicationRate: 5,
        frequency: 'weekly',
        growthStage: 'seedling',
        applicationMethod: 'soil_drench'
      },
      {
        day: 14,
        fertilizerType: 'NPK 15-15-15',
        applicationRate: 8,
        frequency: 'bi_weekly',
        growthStage: 'vegetative',
        applicationMethod: 'foliar_spray'
      },
      {
        day: 42,
        fertilizerType: 'NPK 5-10-15',
        applicationRate: 10,
        frequency: 'weekly',
        growthStage: 'flowering',
        applicationMethod: 'soil_drench'
      }
    ],
    pesticideSchedule: [
      {
        day: 7,
        chemicalType: 'Neem Oil',
        applicationRate: 2,
        frequency: 'preventive',
        growthStage: 'seedling',
        applicationMethod: 'foliar_spray',
        safetyRequirements: 'gloves, mask',
        reEntryInterval: 24,
        harvestRestriction: 0
      },
      {
        day: 28,
        chemicalType: 'Bacillus thuringiensis',
        applicationRate: 1.5,
        frequency: 'as_needed',
        growthStage: 'vegetative',
        applicationMethod: 'foliar_spray',
        safetyRequirements: 'gloves, protective clothing',
        reEntryInterval: 12,
        harvestRestriction: 0
      }
    ],
    growthTimeline: {
      germinationTime: 7,
      daysToMaturity: 75,
      harvestWindow: 14,
      seasonalPlanting: ['spring', 'summer']
    },
    yieldInformation: {
      expectedYieldPerPlant: 2.5,
      yieldPerSquareMeter: 8.0,
      qualityMetrics: {
        size: '15-20mm diameter',
        color: 'deep red',
        texture: 'firm, smooth',
        brix: 8.5
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    _id: 'plant-2',
    name: 'Lettuce (Romaine)',
    scientificName: 'Lactuca sativa var. longifolia',
    family: 'Asteraceae',
    variety: 'Parris Island',
    growthCharacteristics: {
      height: 0.3,
      spread: 0.25,
      rootDepth: 0.15,
      lifecycle: 'annual'
    },
    growingRequirements: {
      soilType: 'well_drained',
      phRange: { min: 6.0, max: 7.0 },
      temperatureRange: { min: 4, max: 24, optimal: 18 },
      humidityRange: { min: 60, max: 80 },
      lightRequirements: 'partial_shade',
      waterRequirements: 'high'
    },
    fertilizerSchedule: [
      {
        day: 0,
        fertilizerType: 'NPK 20-10-10',
        applicationRate: 3,
        frequency: 'weekly',
        growthStage: 'seedling',
        applicationMethod: 'soil_drench'
      },
      {
        day: 21,
        fertilizerType: 'NPK 15-5-10',
        applicationRate: 4,
        frequency: 'bi_weekly',
        growthStage: 'vegetative',
        applicationMethod: 'foliar_spray'
      }
    ],
    pesticideSchedule: [
      {
        day: 14,
        chemicalType: 'Pyrethrin',
        applicationRate: 1,
        frequency: 'preventive',
        growthStage: 'vegetative',
        applicationMethod: 'foliar_spray',
        safetyRequirements: 'gloves, mask',
        reEntryInterval: 12,
        harvestRestriction: 1
      }
    ],
    growthTimeline: {
      germinationTime: 5,
      daysToMaturity: 45,
      harvestWindow: 7,
      seasonalPlanting: ['spring', 'fall']
    },
    yieldInformation: {
      expectedYieldPerPlant: 0.8,
      yieldPerSquareMeter: 12.0,
      qualityMetrics: {
        size: '25-30cm length',
        color: 'dark green',
        texture: 'crisp, tender',
        brix: 3.2
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    _id: 'plant-3',
    name: 'Basil (Sweet)',
    scientificName: 'Ocimum basilicum',
    family: 'Lamiaceae',
    variety: 'Genovese',
    growthCharacteristics: {
      height: 0.6,
      spread: 0.4,
      rootDepth: 0.2,
      lifecycle: 'annual'
    },
    growingRequirements: {
      soilType: 'well_drained',
      phRange: { min: 6.0, max: 7.5 },
      temperatureRange: { min: 15, max: 28, optimal: 22 },
      humidityRange: { min: 40, max: 60 },
      lightRequirements: 'full_sun',
      waterRequirements: 'moderate'
    },
    fertilizerSchedule: [
      {
        day: 0,
        fertilizerType: 'NPK 10-5-5',
        applicationRate: 2,
        frequency: 'bi_weekly',
        growthStage: 'seedling',
        applicationMethod: 'soil_drench'
      },
      {
        day: 30,
        fertilizerType: 'NPK 5-10-10',
        applicationRate: 3,
        frequency: 'monthly',
        growthStage: 'vegetative',
        applicationMethod: 'foliar_spray'
      }
    ],
    pesticideSchedule: [
      {
        day: 21,
        chemicalType: 'Neem Oil',
        applicationRate: 1.5,
        frequency: 'preventive',
        growthStage: 'vegetative',
        applicationMethod: 'foliar_spray',
        safetyRequirements: 'gloves',
        reEntryInterval: 24,
        harvestRestriction: 0
      }
    ],
    growthTimeline: {
      germinationTime: 10,
      daysToMaturity: 60,
      harvestWindow: 30,
      seasonalPlanting: ['spring', 'summer']
    },
    yieldInformation: {
      expectedYieldPerPlant: 0.3,
      yieldPerSquareMeter: 4.0,
      qualityMetrics: {
        size: '5-8cm leaves',
        color: 'bright green',
        texture: 'tender, aromatic',
        brix: 4.8
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

class PlantDataApi {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getPlantData(farmId?: string): Promise<IPlantData[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('plant-data')) {
      console.log('🔧 Using mock plant data for plant-data');
      return Promise.resolve(farmId ? mockPlantData.filter(p => p.isActive) : mockPlantData);
    }
    console.log('🔧 Using real plant data from API for plant-data');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/plants`, {
        headers: this.getAuthHeader(),
        params: { farmId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching plant data:', error);
      throw error;
    }
  }

  async createPlantData(plantData: Omit<IPlantData, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<IPlantData> {
    if (testModeService.isTestMode() && !testModeService.useRealData('plant-data')) {
      console.log('🔧 Using mock plant creation');
      const newPlant = { 
        ...plantData, 
        _id: `mock-${Date.now()}`, 
        isActive: true, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      } as IPlantData;
      mockPlantData.push(newPlant);
      return Promise.resolve(newPlant);
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/plants`, plantData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating plant data:', error);
      throw error;
    }
  }

  async updatePlantData(id: string, plantData: Partial<IPlantData>): Promise<IPlantData> {
    if (testModeService.isTestMode() && !testModeService.useRealData('plant-data')) {
      console.log('🔧 Using mock plant update');
      const index = mockPlantData.findIndex(p => p._id === id);
      if (index > -1) {
        mockPlantData[index] = { ...mockPlantData[index], ...plantData, updatedAt: new Date().toISOString() };
        return Promise.resolve(mockPlantData[index]);
      }
      throw new Error('Mock plant not found');
    }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/plants/${id}`, plantData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating plant data:', error);
      throw error;
    }
  }

  async deletePlantData(id: string): Promise<void> {
    if (testModeService.isTestMode() && !testModeService.useRealData('plant-data')) {
      console.log('🔧 Using mock plant deletion');
      const index = mockPlantData.findIndex(p => p._id === id);
      if (index > -1) {
        mockPlantData.splice(index, 1);
        return Promise.resolve();
      }
      throw new Error('Mock plant not found');
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/plants/${id}`, {
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting plant data:', error);
      throw error;
    }
  }

  async getPlantDataById(id: string): Promise<IPlantData> {
    if (testModeService.isTestMode() && !testModeService.useRealData('plant-data')) {
      console.log('🔧 Using mock plant data by ID');
      const plant = mockPlantData.find(p => p._id === id);
      if (!plant) {
        throw new Error('Mock plant not found');
      }
      return Promise.resolve(plant);
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/plants/${id}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching plant data by ID:', error);
      throw error;
    }
  }
}

export const plantDataApi = new PlantDataApi();
