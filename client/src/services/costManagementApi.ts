import axios from 'axios';
import { ICostsData } from '../types';
import { testModeService } from '../config/testMode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Mock cost data for development - start empty so managers can input their own data
const mockCostsData: ICostsData[] = [];

class CostManagementApi {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getCostsData(farmId?: string): Promise<ICostsData[]> {
    if (testModeService.isTestMode() && !testModeService.useRealData('cost-management')) {
      console.log('🔧 Using mock cost data for cost-management');
      return Promise.resolve(mockCostsData);
    }
    
    console.log('🔧 Using real cost data from API for cost-management');
    try {
      const url = farmId ? `${API_BASE_URL}/api/v1/costs?farmId=${farmId}` : `${API_BASE_URL}/api/v1/costs`;
      const response = await axios.get(url, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching costs data:', error);
      throw error;
    }
  }

  async createCostsData(costsData: Omit<ICostsData, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<ICostsData> {
    if (testModeService.isTestMode() && !testModeService.useRealData('cost-management')) {
      console.log('🔧 Using mock cost creation');
      const newCosts = { 
        ...costsData, 
        _id: `mock-costs-${Date.now()}`, 
        isActive: true, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      mockCostsData.push(newCosts);
      return Promise.resolve(newCosts);
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/costs`, costsData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating costs data:', error);
      throw error;
    }
  }

  async updateCostsData(id: string, costsData: Partial<ICostsData>): Promise<ICostsData> {
    if (testModeService.isTestMode() && !testModeService.useRealData('cost-management')) {
      console.log('🔧 Using mock cost update');
      const index = mockCostsData.findIndex(c => c._id === id);
      if (index !== -1) {
        mockCostsData[index] = { ...mockCostsData[index], ...costsData, updatedAt: new Date().toISOString() };
        return Promise.resolve(mockCostsData[index]);
      }
      throw new Error('Cost data not found');
    }
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/costs/${id}`, costsData, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating costs data:', error);
      throw error;
    }
  }

  async deleteCostsData(id: string): Promise<void> {
    if (testModeService.isTestMode() && !testModeService.useRealData('cost-management')) {
      console.log('🔧 Using mock cost deletion');
      const index = mockCostsData.findIndex(c => c._id === id);
      if (index !== -1) {
        mockCostsData.splice(index, 1);
      }
      return Promise.resolve();
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/costs/${id}`, {
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting costs data:', error);
      throw error;
    }
  }
}

export const costManagementApi = new CostManagementApi();
