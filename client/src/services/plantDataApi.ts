import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Plant Data Interface
export interface IPlantData {
  _id?: string;
  name: string;
  scientificName: string;
  variety: string;
  category: 'vegetable' | 'fruit' | 'herb' | 'flower' | 'grain' | 'legume' | 'other';
  
  // Basic Plant Information
  family: string;
  growthCharacteristics: {
    height: number; // cm
    spread: number; // cm
    rootDepth: number; // cm
    lifecycle: 'annual' | 'perennial' | 'biennial';
  };
  
  // Advanced Growing Requirements
  growingRequirements: {
    soilType: string;
    temperature: {
      min: number;
      max: number;
      optimal: number;
    };
    humidity: {
      min: number;
      max: number;
      optimal: number;
    };
    lightRequirements: 'full_sun' | 'partial_shade' | 'shade';
    lightHours: {
      min: number;
      max: number;
      optimal: number;
    };
    soilPh: {
      min: number;
      max: number;
      optimal: number;
    };
    waterRequirements: {
      level: 'low' | 'moderate' | 'high';
      daily: number;
      frequency: 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly';
    };
  };
  
  // Detailed Fertilizer Schedule
  fertilizerSchedule: Array<{
    day: number; // Days after planting
    fertilizerType: string; // NPK ratios, micronutrients
    applicationRate: number; // ml or g per plant
    frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
    applicationMethod: 'foliar_spray' | 'soil_drench' | 'injection' | 'broadcast';
    notes?: string;
  }>;
  
  // Detailed Pesticide/Chemical Schedule
  pesticideSchedule: Array<{
    day: number; // Days after planting
    chemicalType: string; // Pesticide, fungicide, herbicide
    applicationRate: number; // ml or g per plant
    frequency: 'preventive' | 'curative' | 'as_needed';
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
    applicationMethod: 'foliar_spray' | 'dust' | 'injection' | 'soil_drench';
    safetyRequirements: string; // PPE needed
    reEntryInterval: number; // Hours
    harvestRestriction: number; // Days before harvest
    notes?: string;
  }>;
  
  // Enhanced Growth Timeline
  growthTimeline: {
    germinationTime: number; // Days
    daysToMaturity: number; // Days
    harvestWindow: number; // Days
    seasonalPlanting: string[]; // Months
    germinationDays: number;
    seedlingDays: number;
    vegetativeDays: number;
    floweringDays: number;
    fruitingDays: number;
    totalDays: number;
  };
  
  // Enhanced Yield Information
  yieldInfo: {
    expectedYieldPerPlant: number;
    yieldPerSquareMeter: number; // kg per m²
    yieldUnit: 'kg' | 'units' | 'bunches' | 'heads';
    harvestWindow: number;
    shelfLife: number;
    qualityMetrics: {
      size: string; // Size description
      color: string; // Expected color
      texture: string; // Expected texture
      brix: number; // Sugar content for fruits
    };
  };
  
  // Resource Requirements
  resourceRequirements: {
    seedsPerUnit: number;
    fertilizerType: string[];
    fertilizerAmount: number;
    pesticideType: string[];
    pesticideAmount: number;
    spaceRequirement: {
      width: number;
      length: number;
      height: number;
    };
  };
  
  // Market Information
  marketInfo: {
    basePrice: number;
    priceUnit: 'kg' | 'units' | 'bunches' | 'heads';
    seasonality: {
      peakSeason: string[];
      offSeason: string[];
    };
    demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  };
  
  // Quality Standards
  qualityStandards: {
    size: {
      min: number;
      max: number;
      unit: 'cm' | 'mm' | 'g';
    };
    color: string[];
    texture: string[];
    defects: string[];
  };
  
  // Environmental Impact
  environmentalImpact: {
    waterFootprint: number;
    carbonFootprint: number;
    sustainabilityScore: number;
  };
  
  // Metadata
  isActive: boolean;
  createdBy: string;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlantDataFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isActive?: boolean | 'all';
}

export interface IPlantDataResponse {
  success: boolean;
  data: {
    plants: IPlantData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface IPlantDataSingleResponse {
  success: boolean;
  data: {
    plant: IPlantData;
  };
}

export interface ICategoriesResponse {
  success: boolean;
  data: {
    categories: string[];
  };
}

class PlantDataApi {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get all plant data with filtering and pagination
   */
  async getPlantData(filters: IPlantDataFilters = {}): Promise<IPlantDataResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== undefined) {
        params.append('isActive', filters.isActive === 'all' ? 'all' : filters.isActive.toString());
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/plant-data?${params.toString()}`, {
        headers: this.getAuthHeader()
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to get plant data:', error);
      throw new Error(error.response?.data?.message || 'Failed to get plant data');
    }
  }

  /**
   * Get specific plant data by ID
   */
  async getPlantDataById(id: string): Promise<IPlantDataSingleResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/plant-data/${id}`, {
        headers: this.getAuthHeader()
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to get plant data by ID:', error);
      throw new Error(error.response?.data?.message || 'Failed to get plant data');
    }
  }

  /**
   * Create new plant data
   */
  async createPlantData(plantData: Partial<IPlantData>): Promise<IPlantDataSingleResponse> {
    try {
      console.log('API: Sending plant data:', plantData);
      const response = await axios.post(`${API_BASE_URL}/api/v1/plant-data`, plantData, {
        headers: this.getAuthHeader()
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to create plant data:', error);
      throw new Error(error.response?.data?.message || 'Failed to create plant data');
    }
  }

  /**
   * Update plant data
   */
  async updatePlantData(id: string, plantData: Partial<IPlantData>): Promise<IPlantDataSingleResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/plant-data/${id}`, plantData, {
        headers: this.getAuthHeader()
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to update plant data:', error);
      throw new Error(error.response?.data?.message || 'Failed to update plant data');
    }
  }

  /**
   * Soft delete plant data (set isActive to false)
   */
  async deletePlantData(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/plant-data/${id}`, {
        headers: this.getAuthHeader()
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to delete plant data:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete plant data');
    }
  }

  /**
   * Get all plant categories
   */
  async getCategories(): Promise<ICategoriesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/plant-data/categories`, {
        headers: this.getAuthHeader()
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to get plant categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to get plant categories');
    }
  }

  /**
   * Get mock plant data for development/testing
   */
  getMockPlantData(): IPlantData[] {
    return [
      {
        _id: '1',
        name: 'Tomato',
        scientificName: 'Solanum lycopersicum',
        variety: 'Cherry',
        category: 'vegetable',
        family: 'Solanaceae',
        growthCharacteristics: {
          height: 150,
          spread: 60,
          rootDepth: 45,
          lifecycle: 'annual'
        },
        growingRequirements: {
          soilType: 'Well-drained loamy soil',
          temperature: { min: 18, max: 30, optimal: 24 },
          humidity: { min: 40, max: 70, optimal: 60 },
          lightRequirements: 'full_sun',
          lightHours: { min: 6, max: 8, optimal: 7 },
          soilPh: { min: 6.0, max: 6.8, optimal: 6.5 },
          waterRequirements: { level: 'moderate', daily: 2.5, frequency: 'daily' }
        },
        fertilizerSchedule: [
          {
            day: 0,
            fertilizerType: 'NPK 15-15-15',
            applicationRate: 5,
            frequency: 'weekly',
            growthStage: 'seedling',
            applicationMethod: 'soil_drench',
            notes: 'Initial fertilization after transplanting'
          },
          {
            day: 14,
            fertilizerType: 'NPK 20-10-10',
            applicationRate: 10,
            frequency: 'bi_weekly',
            growthStage: 'vegetative',
            applicationMethod: 'foliar_spray',
            notes: 'Boost vegetative growth'
          }
        ],
        pesticideSchedule: [
          {
            day: 7,
            chemicalType: 'Neem Oil',
            applicationRate: 15,
            frequency: 'preventive',
            growthStage: 'seedling',
            applicationMethod: 'foliar_spray',
            safetyRequirements: 'Gloves, mask, long sleeves',
            reEntryInterval: 12,
            harvestRestriction: 0,
            notes: 'Preventive pest control'
          }
        ],
        growthTimeline: {
          germinationTime: 7,
          daysToMaturity: 115,
          harvestWindow: 30,
          seasonalPlanting: ['Mar', 'Apr', 'May'],
          germinationDays: 7,
          seedlingDays: 14,
          vegetativeDays: 35,
          floweringDays: 14,
          fruitingDays: 45,
          totalDays: 115
        },
        yieldInfo: {
          expectedYieldPerPlant: 3.5,
          yieldPerSquareMeter: 8.5,
          yieldUnit: 'kg',
          harvestWindow: 30,
          shelfLife: 14,
          qualityMetrics: {
            size: '2-4cm diameter',
            color: 'Red',
            texture: 'Firm and smooth',
            brix: 6.5
          }
        },
        resourceRequirements: {
          seedsPerUnit: 1,
          fertilizerType: ['NPK 15-15-15', 'Compost'],
          fertilizerAmount: 0.5,
          pesticideType: ['Neem Oil', 'Copper Fungicide'],
          pesticideAmount: 10,
          spaceRequirement: { width: 60, length: 60, height: 150 }
        },
        marketInfo: {
          basePrice: 2.50,
          priceUnit: 'kg',
          seasonality: { peakSeason: ['Jun', 'Jul', 'Aug'], offSeason: ['Dec', 'Jan', 'Feb'] },
          demandLevel: 'high'
        },
        qualityStandards: {
          size: { min: 2, max: 4, unit: 'cm' },
          color: ['Red', 'Orange', 'Yellow'],
          texture: ['Firm', 'Smooth'],
          defects: ['Cracks', 'Bruises', 'Soft spots']
        },
        environmentalImpact: {
          waterFootprint: 214,
          carbonFootprint: 2.3,
          sustainabilityScore: 7
        },
        isActive: true,
        createdBy: 'system',
        lastModifiedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'Lettuce',
        scientificName: 'Lactuca sativa',
        variety: 'Romaine',
        category: 'vegetable',
        family: 'Asteraceae',
        growthCharacteristics: {
          height: 30,
          spread: 25,
          rootDepth: 20,
          lifecycle: 'annual'
        },
        growingRequirements: {
          soilType: 'Rich, well-drained soil',
          temperature: { min: 10, max: 25, optimal: 18 },
          humidity: { min: 50, max: 80, optimal: 70 },
          lightRequirements: 'partial_shade',
          lightHours: { min: 4, max: 6, optimal: 5 },
          soilPh: { min: 6.0, max: 7.0, optimal: 6.5 },
          waterRequirements: { level: 'high', daily: 1.0, frequency: 'daily' }
        },
        fertilizerSchedule: [
          {
            day: 0,
            fertilizerType: 'Compost',
            applicationRate: 2,
            frequency: 'weekly',
            growthStage: 'seedling',
            applicationMethod: 'soil_drench',
            notes: 'Organic matter for soil health'
          }
        ],
        pesticideSchedule: [
          {
            day: 5,
            chemicalType: 'Neem Oil',
            applicationRate: 8,
            frequency: 'preventive',
            growthStage: 'seedling',
            applicationMethod: 'foliar_spray',
            safetyRequirements: 'Gloves, mask',
            reEntryInterval: 4,
            harvestRestriction: 0,
            notes: 'Prevent aphids and other pests'
          }
        ],
        growthTimeline: {
          germinationTime: 5,
          daysToMaturity: 40,
          harvestWindow: 14,
          seasonalPlanting: ['Mar', 'Apr', 'May', 'Sep', 'Oct'],
          germinationDays: 5,
          seedlingDays: 10,
          vegetativeDays: 25,
          floweringDays: 0,
          fruitingDays: 0,
          totalDays: 40
        },
        yieldInfo: {
          expectedYieldPerPlant: 0.5,
          yieldPerSquareMeter: 2.0,
          yieldUnit: 'units',
          harvestWindow: 14,
          shelfLife: 7,
          qualityMetrics: {
            size: '15-25cm length',
            color: 'Green',
            texture: 'Crisp and fresh',
            brix: 2.0
          }
        },
        resourceRequirements: {
          seedsPerUnit: 1,
          fertilizerType: ['Compost', 'Fish Emulsion'],
          fertilizerAmount: 0.2,
          pesticideType: ['Neem Oil'],
          pesticideAmount: 5,
          spaceRequirement: { width: 30, length: 30, height: 30 }
        },
        marketInfo: {
          basePrice: 1.20,
          priceUnit: 'units',
          seasonality: { peakSeason: ['Mar', 'Apr', 'May'], offSeason: ['Jul', 'Aug'] },
          demandLevel: 'very_high'
        },
        qualityStandards: {
          size: { min: 15, max: 25, unit: 'cm' },
          color: ['Green', 'Red'],
          texture: ['Crisp', 'Fresh'],
          defects: ['Wilting', 'Brown spots', 'Yellowing']
        },
        environmentalImpact: {
          waterFootprint: 130,
          carbonFootprint: 0.8,
          sustainabilityScore: 8
        },
        isActive: true,
        createdBy: 'system',
        lastModifiedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

export default new PlantDataApi();