/**
 * Universal Test Mode Configuration System
 * Controls whether modules use real data or mock data for dependencies
 */

export interface TestModeConfig {
  enabled: boolean;
  mockLevel: 'basic' | 'advanced' | 'full';
  realDataModules: string[];
  mockDataSets: {
    [key: string]: any;
  };
}

// Default test mode configuration
const defaultTestConfig: TestModeConfig = {
  enabled: process.env.REACT_APP_TEST_MODE === 'true', // Default to false unless explicitly enabled
  mockLevel: (process.env.REACT_APP_TEST_LEVEL as 'basic' | 'advanced' | 'full') || 'advanced',
  realDataModules: process.env.REACT_APP_REAL_DATA_MODULES?.split(',') || [
    'farm-management',
    'user-management', 
    'plant-data'
  ],
  mockDataSets: {}
};

class TestModeService {
  private config: TestModeConfig = defaultTestConfig;

  /**
   * Check if test mode is enabled
   */
  isTestMode(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if a specific module should use real data
   */
  useRealData(moduleName: string): boolean {
    if (!this.config.enabled) return true;
    return this.config.realDataModules.includes(moduleName);
  }

  /**
   * Get mock data for a specific data type
   */
  getMockData<T>(dataType: string): T | null {
    if (!this.config.enabled) return null;
    return this.config.mockDataSets[dataType] || null;
  }

  /**
   * Set mock data for a specific data type
   */
  setMockData(dataType: string, data: any): void {
    this.config.mockDataSets[dataType] = data;
  }

  /**
   * Update test mode configuration
   */
  updateConfig(newConfig: Partial<TestModeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): TestModeConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable test mode
   */
  setTestMode(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Add module to real data list
   */
  addRealDataModule(moduleName: string): void {
    if (!this.config.realDataModules.includes(moduleName)) {
      this.config.realDataModules.push(moduleName);
    }
  }

  /**
   * Remove module from real data list
   */
  removeRealDataModule(moduleName: string): void {
    this.config.realDataModules = this.config.realDataModules.filter(
      module => module !== moduleName
    );
  }

  /**
   * Log test mode status for debugging
   */
  logStatus(): void {
    console.log('🔧 Test Mode Status:', {
      enabled: this.config.enabled,
      mockLevel: this.config.mockLevel,
      realDataModules: this.config.realDataModules,
      mockDataSetsCount: Object.keys(this.config.mockDataSets).length,
      envVars: {
        REACT_APP_TEST_MODE: process.env.REACT_APP_TEST_MODE,
        REACT_APP_REAL_DATA_MODULES: process.env.REACT_APP_REAL_DATA_MODULES
      }
    });
  }
}

// Export singleton instance
export const testModeService = new TestModeService();

// Export mock data generators for common data types
export const mockDataGenerators = {
  /**
   * Generate mock farm data
   */
  farms: () => [
    { id: 'farm-1', name: 'North Valley Farm', location: 'California', area: 50, blocks: 12 },
    { id: 'farm-2', name: 'Sunny Ridge Farm', location: 'Florida', area: 75, blocks: 18 },
    { id: 'farm-3', name: 'Green Hills Farm', location: 'Texas', area: 30, blocks: 8 }
  ],

  /**
   * Generate mock block data
   */
  blocks: () => [
    { id: 'block-1', farmId: 'farm-1', name: 'Block A1', type: 'greenhouse', capacity: 500 },
    { id: 'block-2', farmId: 'farm-1', name: 'Block A2', type: 'open-field', capacity: 1000 },
    { id: 'block-3', farmId: 'farm-2', name: 'Block B1', type: 'hydroponic', capacity: 300 }
  ],

  /**
   * Generate mock plant data
   */
  plants: () => [
    { id: 'plant-1', name: 'Roma Tomato', family: 'Solanaceae', growthDays: 75, yieldPerPlant: 2.5 },
    { id: 'plant-2', name: 'Butter Lettuce', family: 'Asteraceae', growthDays: 45, yieldPerPlant: 0.3 },
    { id: 'plant-3', name: 'Bell Pepper', family: 'Solanaceae', growthDays: 80, yieldPerPlant: 1.8 }
  ],

  /**
   * Generate mock user data
   */
  users: () => [
    { id: 'user-1', name: 'John Smith', role: 'manager', farms: ['farm-1'], email: 'john@example.com' },
    { id: 'user-2', name: 'Maria Garcia', role: 'worker', farms: ['farm-1'], email: 'maria@example.com' },
    { id: 'user-3', name: 'David Kim', role: 'agronomist', farms: ['farm-1', 'farm-2'], email: 'david@example.com' }
  ]
};

// Initialize mock data if test mode is enabled
if (testModeService.isTestMode()) {
  testModeService.setMockData('farms', mockDataGenerators.farms());
  testModeService.setMockData('blocks', mockDataGenerators.blocks());
  testModeService.setMockData('plants', mockDataGenerators.plants());
  testModeService.setMockData('mockUsers', mockDataGenerators.users());
  testModeService.logStatus();
}

export default testModeService;
