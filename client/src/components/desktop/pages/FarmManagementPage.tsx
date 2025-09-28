import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Agriculture as FarmIcon,
  GridView as BlockIcon,
  TrendingUp as PerformanceIcon,
  Lightbulb as OptimizationIcon,
  Assignment as AssignmentIcon,
  SwapHoriz as StateChangeIcon
} from '@mui/icons-material';
import { 
  farmManagementApi, 
  IFarm, 
  IBlock, 
  IPerformanceDashboard, 
  IBlockOptimization 
} from '../../../services/farmManagementApi';
import { IPlantData } from '../../../services/plantDataApi';
import { useThemeStyles } from '../../../hooks/useThemeStyles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`farm-tabpanel-${index}`}
      aria-labelledby={`farm-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FarmManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [farms, setFarms] = useState<IFarm[]>([]);
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const [plants, setPlants] = useState<IPlantData[]>([]);
  const [performanceData, setPerformanceData] = useState<IPerformanceDashboard | null>(null);
  const [optimizationData, setOptimizationData] = useState<IBlockOptimization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Theme styles
  const { backgroundStyles, cardStyles, buttonStyles, chipStyles, textStyles } = useThemeStyles();
  
  // Dialog states
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [stateChangeDialogOpen, setStateChangeDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<IFarm | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<IBlock | null>(null);
  const [farmDialogTab, setFarmDialogTab] = useState(0);
  const [newBlockState, setNewBlockState] = useState<string>('');
  const [stateChangeNotes, setStateChangeNotes] = useState<string>('');
  const [plantAssignmentForm, setPlantAssignmentForm] = useState<{
    blockId?: string;
    selectedPlants: Array<{
      plantDataId: string;
      plantName: string;
      count: number;
    }>;
  }>({
    selectedPlants: []
  });
  
  // Helper function to update financial data
  const updateFinancialField = (field: string, value: number | string) => {
    setFarmForm({
      ...farmForm,
      financials: {
        landRentPerMonth: farmForm.financials?.landRentPerMonth || 0,
        electricityCostPerKw: farmForm.financials?.electricityCostPerKw || 0,
        waterCostPerCm3: farmForm.financials?.waterCostPerCm3 || 0,
        initialCapitalInvestment: farmForm.financials?.initialCapitalInvestment || 0,
        depreciation: farmForm.financials?.depreciation || 0,
        incentives: farmForm.financials?.incentives || 0,
        otherCosts: farmForm.financials?.otherCosts || 0,
        currency: farmForm.financials?.currency || 'USD',
        lastUpdated: new Date().toISOString(),
        totalInvestment: farmForm.financials?.totalInvestment || 0,
        monthlyOperatingCost: farmForm.financials?.monthlyOperatingCost || 0,
        monthlyRevenue: farmForm.financials?.monthlyRevenue || 0,
        monthlyProfit: farmForm.financials?.monthlyProfit || 0,
        roi: farmForm.financials?.roi || 0,
        breakEvenPoint: farmForm.financials?.breakEvenPoint || '',
        [field]: value
      }
    });
  };
  
  // Form states
  const [farmForm, setFarmForm] = useState<Partial<IFarm>>({
    name: '',
    farmId: '',
    farmOwner: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates: { latitude: 0, longitude: 0 },
      timezone: ''
    },
    specifications: {
      totalArea: 0,
      usableArea: 0,
      maxBlocks: 0,
      establishedDate: '',
      farmType: 'organic',
      certification: [],
      climate: 'temperate',
      soilType: 'loamy'
    },
    mapLocation: {
      mapUrl: '',
      mapDescription: '',
      boundaries: {
        north: 0,
        south: 0,
        east: 0,
        west: 0
      }
    },
    status: 'active'
  });
  const [blockForm, setBlockForm] = useState<Partial<IBlock>>({
    dimensions: {
      length: 0,
      width: 0,
      area: 0
    }
  });
  
  // Debug block form state
  useEffect(() => {
    console.log('Block form state:', blockForm);
  }, [blockForm]);
  const [assignmentForm, setAssignmentForm] = useState({
    blockId: '',
    plantDataId: '',
    plantCount: 0,
    plantingDate: ''
  });
  
  // Search and filter states
  // Filter states (for future implementation)
  // const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState<string>('all');
  // const [typeFilter, setTypeFilter] = useState<string>('all');

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [farmsData, blocksData, plantsData, performanceData, optimizationData] = await Promise.all([
        farmManagementApi.getFarms(),
        farmManagementApi.getBlocks(),
        farmManagementApi.getPlants(),
        farmManagementApi.getPerformanceDashboard(),
        farmManagementApi.getBlockOptimization()
      ]);
      
      const farmsArray = Array.isArray(farmsData) ? farmsData : [];
      const blocksArray = Array.isArray(blocksData) ? blocksData : [];
      const plantsArray = Array.isArray(plantsData) ? plantsData : [];
      const optimizationArray = Array.isArray(optimizationData) ? optimizationData : [];
      
      console.log('Loaded farms:', farmsArray);
      console.log('Loaded blocks:', blocksArray);
      
      // Debug block structure
      if (blocksArray.length > 0) {
        console.log('First block structure:', blocksArray[0]);
        console.log('Block ID field:', blocksArray[0]._id);
        console.log('All block object keys:', Object.keys(blocksArray[0]));
      }
      
      // Debug farm structure
      if (farmsArray.length > 0) {
        console.log('First farm structure:', farmsArray[0]);
        console.log('Farm _id field:', farmsArray[0]._id);
        console.log('Farm name field:', farmsArray[0].name);
        console.log('All farm object keys:', Object.keys(farmsArray[0]));
        console.log('Farm object entries:', Object.entries(farmsArray[0]));
      }
      
      // Map the data to include _id field for compatibility
      const farmsWithId = farmsArray.map((farm: any) => ({
        ...farm,
        _id: farm._id || farm.id || `farm-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      const blocksWithId = blocksArray.map((block: any) => ({
        ...block,
        _id: block._id || block.id || `block-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      console.log('Mapped farms with _id:', farmsWithId.map(f => ({ name: f.name, _id: f._id, id: f.id })));
      console.log('Mapped blocks with _id:', blocksWithId.map(b => ({ name: b.name, _id: b._id, id: b.id })));
      
      setFarms(farmsWithId);
      setBlocks(blocksWithId);
      setPlants(plantsArray);
      setPerformanceData(performanceData);
      setOptimizationData(optimizationArray);
    } catch (err) {
      setError('Failed to load farm management data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Farm management handlers
  const handleCreateFarm = async () => {
    try {
      const farmData = {
        ...farmForm,
        ownerId: '68d2698e7ce115d82039ac85', // Use current user ID
        // Add required location fields
        location: {
          address: farmForm.location?.address || 'Not specified',
          city: farmForm.location?.city || 'Not specified',
          state: farmForm.location?.state || 'Not specified',
          country: farmForm.location?.country || 'Not specified',
          zipCode: farmForm.location?.zipCode || '00000',
          coordinates: farmForm.location?.coordinates || { latitude: 0, longitude: 0 },
          timezone: farmForm.location?.timezone || 'UTC'
        },
        // Add required specifications
        specifications: {
          ...farmForm.specifications,
          establishedDate: farmForm.specifications?.establishedDate || new Date().toISOString(),
          totalArea: farmForm.specifications?.totalArea || 0,
          usableArea: farmForm.specifications?.usableArea || 0,
          maxBlocks: farmForm.specifications?.maxBlocks || 0,
          farmType: farmForm.specifications?.farmType || 'organic',
          certification: farmForm.specifications?.certification || [],
          climate: farmForm.specifications?.climate || 'temperate',
          soilType: farmForm.specifications?.soilType || 'loamy'
        },
        // Add required resources
        resources: {
          water: {
            source: 'municipal',
            dailyUsage: 1000,
            monthlyCost: 100,
            quality: 'good'
          },
          electricity: {
            source: 'grid',
            dailyUsage: 50,
            monthlyCost: 200,
            efficiency: 85
          },
          labor: {
            totalWorkers: 5,
            fullTime: 3,
            partTime: 2,
            seasonal: 0,
            monthlyCost: 5000
          }
        },
        // Add required risks
        risks: {
          weather: {
            riskLevel: 'medium',
            mitigation: ['Greenhouse protection', 'Weather monitoring'],
            insurance: true,
            coverage: 100000
          },
          market: {
            riskLevel: 'medium',
            diversification: ['Multiple crops', 'Direct sales'],
            contracts: 50
          },
          operational: {
            riskLevel: 'low',
            backupSystems: ['Backup irrigation', 'Generator'],
            contingencyPlans: ['Emergency protocols', 'Staff training']
          }
        },
        // Add required production
        production: {
          currentCrops: [],
          monthlyProduction: [],
          annualTarget: {
            year: new Date().getFullYear(),
            targetYield: 1000,
            targetRevenue: 50000,
            actualYield: 0,
            actualRevenue: 0
          }
        }
      } as Omit<IFarm, '_id' | 'createdAt' | 'updatedAt'>;
      
      await farmManagementApi.createFarm(farmData);
      setFarmDialogOpen(false);
      setFarmForm({
        name: '',
        farmId: '',
        farmOwner: '',
        location: {
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          coordinates: { latitude: 0, longitude: 0 },
          timezone: ''
        },
        specifications: {
          totalArea: 0,
          usableArea: 0,
          maxBlocks: 0,
          establishedDate: '',
          farmType: 'organic',
          certification: [],
          climate: 'temperate',
          soilType: 'loamy'
        },
        mapLocation: {
          mapUrl: '',
          mapDescription: '',
          boundaries: {
            north: 0,
            south: 0,
            east: 0,
            west: 0
          }
        },
        financials: {
          // Basic Financial Data
          landRentPerMonth: 0,
          electricityCostPerKw: 0,
          waterCostPerCm3: 0,
          initialCapitalInvestment: 0,
          depreciation: 0,
          incentives: 0,
          otherCosts: 0,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
          
          // Calculated Financial Metrics
          totalInvestment: 0,
          monthlyOperatingCost: 0,
          monthlyRevenue: 0,
          monthlyProfit: 0,
          roi: 0,
          breakEvenPoint: ''
        },
        status: 'active'
      });
      loadData();
    } catch (err) {
      setError('Failed to create farm');
      console.error('Error creating farm:', err);
    }
  };

  const handleUpdateFarm = async () => {
    if (!selectedFarm) return;
    
    try {
      const farmData = {
        ...farmForm,
        ownerId: '68d2698e7ce115d82039ac85', // Use current user ID
        // Add required location fields
        location: {
          address: farmForm.location?.address || 'Not specified',
          city: farmForm.location?.city || 'Not specified',
          state: farmForm.location?.state || 'Not specified',
          country: farmForm.location?.country || 'Not specified',
          zipCode: farmForm.location?.zipCode || '00000',
          coordinates: farmForm.location?.coordinates || { latitude: 0, longitude: 0 },
          timezone: farmForm.location?.timezone || 'UTC'
        },
        // Add required specifications
        specifications: {
          ...farmForm.specifications,
          establishedDate: farmForm.specifications?.establishedDate || new Date().toISOString(),
          totalArea: farmForm.specifications?.totalArea || 0,
          usableArea: farmForm.specifications?.usableArea || 0,
          maxBlocks: farmForm.specifications?.maxBlocks || 0,
          farmType: farmForm.specifications?.farmType || 'organic',
          certification: farmForm.specifications?.certification || [],
          climate: farmForm.specifications?.climate || 'temperate',
          soilType: farmForm.specifications?.soilType || 'loamy'
        },
        // Add required resources
        resources: {
          water: {
            source: 'municipal',
            dailyUsage: 1000,
            monthlyCost: 100,
            quality: 'good'
          },
          electricity: {
            source: 'grid',
            dailyUsage: 50,
            monthlyCost: 200,
            efficiency: 85
          },
          labor: {
            totalWorkers: 5,
            fullTime: 3,
            partTime: 2,
            seasonal: 0,
            monthlyCost: 5000
          }
        },
        // Add required risks
        risks: {
          weather: {
            riskLevel: 'medium',
            mitigation: ['Greenhouse protection', 'Weather monitoring'],
            insurance: true,
            coverage: 100000
          },
          market: {
            riskLevel: 'medium',
            diversification: ['Multiple crops', 'Direct sales'],
            contracts: 50
          },
          operational: {
            riskLevel: 'low',
            backupSystems: ['Backup irrigation', 'Generator'],
            contingencyPlans: ['Emergency protocols', 'Staff training']
          }
        },
        // Add required production
        production: {
          currentCrops: [],
          monthlyProduction: [],
          annualTarget: {
            year: new Date().getFullYear(),
            targetYield: 1000,
            targetRevenue: 50000,
            actualYield: 0,
            actualRevenue: 0
          }
        }
      };
      
      await farmManagementApi.updateFarm(selectedFarm._id, farmData);
      setFarmDialogOpen(false);
      setSelectedFarm(null);
      setFarmForm({
        name: '',
        farmId: '',
        farmOwner: '',
        location: {
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          coordinates: { latitude: 0, longitude: 0 },
          timezone: ''
        },
        specifications: {
          totalArea: 0,
          usableArea: 0,
          maxBlocks: 0,
          establishedDate: '',
          farmType: 'organic',
          certification: [],
          climate: 'temperate',
          soilType: 'loamy'
        },
        mapLocation: {
          mapUrl: '',
          mapDescription: '',
          boundaries: {
            north: 0,
            south: 0,
            east: 0,
            west: 0
          }
        },
        financials: {
          // Basic Financial Data
          landRentPerMonth: 0,
          electricityCostPerKw: 0,
          waterCostPerCm3: 0,
          initialCapitalInvestment: 0,
          depreciation: 0,
          incentives: 0,
          otherCosts: 0,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
          
          // Calculated Financial Metrics
          totalInvestment: 0,
          monthlyOperatingCost: 0,
          monthlyRevenue: 0,
          monthlyProfit: 0,
          roi: 0,
          breakEvenPoint: ''
        },
        status: 'active'
      });
      loadData();
    } catch (err) {
      setError('Failed to update farm');
      console.error('Error updating farm:', err);
    }
  };

  // Block management handlers
  const handleCreateBlock = async () => {
    try {
      if (!blockForm.farmId) {
        setError('Please select a farm for the block');
        return;
      }
      
      if (!blockForm.name) {
        setError('Please enter a block name');
        return;
      }
      
      if (!blockForm.blockType) {
        setError('Please select a block type');
        return;
      }
      
      // Create block data with all required fields
      const blockData = {
        ...blockForm,
        // Add required location fields
        location: {
          coordinates: {
            x: blockForm.location?.coordinates?.x || 0,
            y: blockForm.location?.coordinates?.y || 0,
            z: blockForm.location?.coordinates?.z || 0
          },
          orientation: blockForm.location?.orientation || 0
        },
        // Add required infrastructure fields
        infrastructure: {
          irrigation: {
            type: 'drip',
            capacity: 100,
            coverage: 100,
            automation: false
          },
          lighting: {
            type: 'natural',
            intensity: 1000,
            duration: 12,
            automation: false
          },
          climateControl: {
            heating: false,
            cooling: false,
            ventilation: false,
            humidityControl: false,
            automation: false
          },
          power: {
            connected: true,
            capacity: 1000,
            backup: false
          },
          water: {
            source: 'municipal',
            quality: 'good',
            ph: 7.0,
            tds: 200
          }
        },
        // Add required plant assignment fields
        plantAssignment: {
          maxPlantCapacity: 100,
          assignedPlants: [],
          totalAssigned: 0,
          remainingCapacity: 100
        },
        // Add required status
        status: 'empty',
        // Add required metadata
        isActive: true,
        createdBy: '68d2698e7ce115d82039ac85', // Use current user ID
        lastModifiedBy: '68d2698e7ce115d82039ac85'
      } as Omit<IBlock, '_id' | 'createdAt' | 'updatedAt'>;
      
      await farmManagementApi.createBlock(blockData);
      setBlockDialogOpen(false);
      setBlockForm({});
      loadData();
    } catch (err) {
      setError('Failed to create block');
      console.error('Error creating block:', err);
    }
  };

  const handleUpdateBlock = async () => {
    if (!selectedBlock) return;
    
    console.log('Updating block:', selectedBlock);
    console.log('Block ID:', selectedBlock._id);
    console.log('Block ID type:', typeof selectedBlock._id);
    
    if (!selectedBlock._id) {
      setError('Block ID is missing. Cannot update block.');
      return;
    }
    
    // Check if the ID looks like a MongoDB ObjectId (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(selectedBlock._id)) {
      setError(`Invalid block ID format: ${selectedBlock._id}. Expected MongoDB ObjectId.`);
      return;
    }
    
    try {
      // Create block data with only the changed fields
      const blockData = {
        name: blockForm.name,
        farmId: blockForm.farmId,
        blockType: blockForm.blockType,
        dimensions: blockForm.dimensions,
        // Only include plantAssignment if it was changed
        ...(blockForm.plantAssignment && {
          plantAssignment: {
            maxPlantCapacity: blockForm.plantAssignment.maxPlantCapacity,
            assignedPlants: blockForm.plantAssignment.assignedPlants || [],
            totalAssigned: blockForm.plantAssignment.totalAssigned || 0,
            remainingCapacity: blockForm.plantAssignment.maxPlantCapacity || 100
          }
        }),
        lastModifiedBy: '68d2698e7ce115d82039ac85'
      };
      
      console.log('Sending block update with data:', blockData);
      console.log('Block ID being used:', selectedBlock._id);
      
      const result = await farmManagementApi.updateBlock(selectedBlock._id, blockData);
      console.log('Block update result:', result);
      
      setBlockDialogOpen(false);
      setSelectedBlock(null);
      setBlockForm({});
      loadData();
    } catch (err) {
      setError('Failed to update block');
      console.error('Error updating block:', err);
    }
  };

  // Plant assignment handler
  const handleAssignPlant = async () => {
    try {
      setLoading(true);
      if (!selectedBlock || plantAssignmentForm.selectedPlants.length === 0) {
        setError('Please select a block and at least one plant');
        return;
      }
      
      // Check if total plants exceed block capacity
      const totalPlants = plantAssignmentForm.selectedPlants.reduce((sum, plant) => sum + plant.count, 0);
      if (totalPlants > selectedBlock.plantAssignment.remainingCapacity) {
        setError(`Cannot assign ${totalPlants} plants. Block only has ${selectedBlock.plantAssignment.remainingCapacity} capacity remaining.`);
        return;
      }
      
      // Assign plants to block
      for (const plant of plantAssignmentForm.selectedPlants) {
        await farmManagementApi.assignPlantToBlock(selectedBlock._id, plant.plantDataId, plant.plantName, plant.count);
      }
      
      setAssignmentDialogOpen(false);
      setPlantAssignmentForm({ selectedPlants: [] });
      loadData();
    } catch (err) {
      setError('Failed to assign plants');
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async () => {
    if (!selectedBlock || !newBlockState) {
      setError('Please select a block and new state');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the state change API
      await farmManagementApi.changeBlockState(
        selectedBlock._id || (selectedBlock as any).id,
        newBlockState,
        stateChangeNotes
      );

      // Refresh data
      await loadData();
      setStateChangeDialogOpen(false);
      setNewBlockState('');
      setStateChangeNotes('');
      setSelectedBlock(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change block state');
    } finally {
      setLoading(false);
    }
  };
  
  const addPlantToAssignment = (plant: IPlantData, count: number) => {
    console.log('🔍 addPlantToAssignment called:', { plant, count, currentForm: plantAssignmentForm });
    
    if (!plant._id) {
      console.error('Plant ID is undefined');
      return;
    }
    
    const existingIndex = plantAssignmentForm.selectedPlants.findIndex(p => p.plantDataId === plant._id);
    console.log('🔍 Existing plant index:', existingIndex);
    
    if (existingIndex >= 0) {
      const updatedPlants = [...plantAssignmentForm.selectedPlants];
      updatedPlants[existingIndex].count += count;
      console.log('🔍 Updating existing plant:', updatedPlants);
      setPlantAssignmentForm({ 
        ...plantAssignmentForm, // Preserve all existing form data including blockId
        selectedPlants: updatedPlants 
      });
    } else {
      const newPlant = {
        plantDataId: plant._id,
        plantName: plant.name,
        count: count
      };
      const newSelectedPlants = [...plantAssignmentForm.selectedPlants, newPlant];
      console.log('🔍 Adding new plant:', newPlant);
      console.log('🔍 New selected plants:', newSelectedPlants);
      setPlantAssignmentForm({
        ...plantAssignmentForm, // Preserve all existing form data including blockId
        selectedPlants: newSelectedPlants
      });
    }
  };
  
  const removePlantFromAssignment = (plantDataId: string) => {
    setPlantAssignmentForm({
      ...plantAssignmentForm, // Preserve all existing form data including blockId
      selectedPlants: plantAssignmentForm.selectedPlants.filter(p => p.plantDataId !== plantDataId)
    });
  };
  
  const updatePlantCount = (plantDataId: string, count: number) => {
    if (count <= 0) {
      removePlantFromAssignment(plantDataId);
      return;
    }
    
    const updatedPlants = plantAssignmentForm.selectedPlants.map(p => 
      p.plantDataId === plantDataId ? { ...p, count } : p
    );
    setPlantAssignmentForm({ 
      ...plantAssignmentForm, // Preserve all existing form data including blockId
      selectedPlants: updatedPlants 
    });
  };

  // For now, show all farms and blocks (filtering can be implemented later)
  const filteredFarms = farms;
  const filteredBlocks = blocks;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'default';
      case 'assigned': return 'info';
      case 'planted': return 'primary';
      case 'harvesting': return 'secondary';
      case 'alert': return 'error';
      default: return 'default';
    }
  };

  // Get block type display name
  const getBlockTypeDisplay = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ ...backgroundStyles, pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            ...textStyles.primary,
            mb: 1
          }}>
            Farm Management
          </Typography>
          <Typography variant="body1" sx={textStyles.secondary}>
            Manage your farms, blocks, and agricultural operations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<FarmIcon />} 
            label={`${farms.length} Farms`} 
            sx={{ 
              backgroundColor: '#E91E63', 
              color: '#FFFFFF',
              '&:hover': { backgroundColor: '#C2185B' }
            }}
          />
          <Chip 
            icon={<BlockIcon />} 
            label={`${blocks.length} Blocks`} 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="farm management tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': {
                opacity: 0.3,
              },
            },
          }}
        >
          <Tab 
            icon={<PerformanceIcon />} 
            label="Strategic Planning" 
            iconPosition="start"
          />
          <Tab 
            icon={<FarmIcon />} 
            label="Farms" 
            iconPosition="start"
          />
          <Tab 
            icon={<BlockIcon />} 
            label="Blocks" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="Plant Assignment" 
            iconPosition="start"
          />
          <Tab 
            icon={<PerformanceIcon />} 
            label="Performance" 
            iconPosition="start"
          />
          <Tab 
            icon={<OptimizationIcon />} 
            label="Optimization" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Strategic Planning Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" sx={{ mb: 3 }}>Strategic Farm Planning Dashboard</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Historical Performance Review</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Analyze previous plantation data for strategic planning
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">• Yield performance by plant type and block type</Typography>
                  <Typography variant="body2">• Quality grades and customer satisfaction</Typography>
                  <Typography variant="body2">• Cost analysis and profitability by crop</Typography>
                  <Typography variant="body2">• Seasonal performance patterns</Typography>
                </Box>
                <Button variant="outlined" sx={{ mt: 2 }}>View Historical Data</Button>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Market Analysis</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Review sales price history and market trends
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">• Price trends by plant type and quality grade</Typography>
                  <Typography variant="body2">• Seasonal price variations and market demand</Typography>
                  <Typography variant="body2">• Customer preferences and order patterns</Typography>
                  <Typography variant="body2">• Competitive pricing and market positioning</Typography>
                </Box>
                <Button variant="outlined" sx={{ mt: 2 }}>View Market Data</Button>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Resource Assessment</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Evaluate available resources for planning
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">• Block availability and condition</Typography>
                  <Typography variant="body2">• Infrastructure capacity and limitations</Typography>
                  <Typography variant="body2">• Labor availability and skill requirements</Typography>
                  <Typography variant="body2">• Material inventory and procurement needs</Typography>
                </Box>
                <Button variant="outlined" sx={{ mt: 2 }}>Assess Resources</Button>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Planting Plan Creation Process</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Strategic block assignment and plant selection workflow
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label="1. Block Evaluation" color="primary" />
              <Chip label="2. Plant Selection" color="primary" />
              <Chip label="3. Preview & Optimization" color="primary" />
              <Chip label="4. Target Setting" color="primary" />
              <Chip label="5. Performance Management" color="primary" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Decision Support Tools</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Profitability Calculator</Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time profit projections based on PlantData yield expectations, current market prices, and block-specific cost factors.
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Risk Analysis</Typography>
                <Typography variant="body2" color="text.secondary">
                  Assessment of weather patterns, market volatility, resource availability, and operational capacity risks.
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Scenario Planning</Typography>
                <Typography variant="body2" color="text.secondary">
                  Multiple planning scenarios for comparison: conservative, moderate, and aggressive growth plans.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Farms Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Farm Overview</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedFarm(null);
              setFarmForm({
        name: '',
        farmId: '',
        farmOwner: '',
        location: {
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          coordinates: { latitude: 0, longitude: 0 },
          timezone: ''
        },
        specifications: {
          totalArea: 0,
          usableArea: 0,
          maxBlocks: 0,
          establishedDate: '',
          farmType: 'organic',
          certification: [],
          climate: 'temperate',
          soilType: 'loamy'
        },
        mapLocation: {
          mapUrl: '',
          mapDescription: '',
          boundaries: {
            north: 0,
            south: 0,
            east: 0,
            west: 0
          }
        },
        financials: {
          // Basic Financial Data
          landRentPerMonth: 0,
          electricityCostPerKw: 0,
          waterCostPerCm3: 0,
          initialCapitalInvestment: 0,
          depreciation: 0,
          incentives: 0,
          otherCosts: 0,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
          
          // Calculated Financial Metrics
          totalInvestment: 0,
          monthlyOperatingCost: 0,
          monthlyRevenue: 0,
          monthlyProfit: 0,
          roi: 0,
          breakEvenPoint: ''
        },
        status: 'active'
      });
              setFarmDialogOpen(true);
            }}
          >
            Add Farm
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filteredFarms.map((farm) => (
              <Box key={farm._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Card sx={cardStyles}>
                  <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {farm.name}
                    </Typography>
                    <Chip 
                      label={farm.status || 'unknown'} 
                      color={getStatusColor(farm.status || 'unknown') as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Farm ID:</strong> {farm.farmId || 'N/A'} • <strong>Owner:</strong> {farm.farmOwner || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {farm.location?.city || 'N/A'}, {farm.location?.state || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Coordinates:</strong> {farm.location?.coordinates?.latitude?.toFixed(4) || 'N/A'}, {farm.location?.coordinates?.longitude?.toFixed(4) || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {farm.specifications?.totalArea || 0} hectares • {farm.specifications?.farmType || 'N/A'} • Max Blocks: {farm.specifications?.maxBlocks || 0}
                  </Typography>
                  
                  {farm.financials && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Financial Summary:</strong> Monthly Rent: {farm.financials.currency} {farm.financials.landRentPerMonth?.toLocaleString() || '0'} • 
                        Investment: {farm.financials.currency} {farm.financials.initialCapitalInvestment?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ROI: {farm.financials.roi?.toFixed(1) || '0'}% • Monthly Profit: {farm.financials.currency} {farm.financials.monthlyProfit?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Blocks
                      </Typography>
                      <Typography variant="h6">
                        {blocks.filter(block => block.farmId === farm._id).length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        In Use
                      </Typography>
                      <Typography variant="h6">
                        {blocks.filter(block => block.farmId === farm._id && ['assigned', 'planted', 'harvesting'].includes(block.status)).length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Available
                      </Typography>
                      <Typography variant="h6">
                        {Math.max(0, (farm.specifications?.maxBlocks || 0) - blocks.filter(block => block.farmId === farm._id).length)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedFarm(farm);
                        setFarmForm(farm);
                        setFarmDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Blocks Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Block Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedBlock(null);
              setBlockForm({});
              setBlockDialogOpen(true);
            }}
          >
            Add Block
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Define farm structure, block allocation, and planting capacity planning per Process Flow #2.
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Plant Capacity Planning</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              System calculates optimal plant capacity based on:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label="Block dimensions and area" color="primary" />
              <Chip label="Plant space requirements from PlantData" color="primary" />
              <Chip label="Block type optimization (hydroponic = higher density)" color="primary" />
              <Chip label="Infrastructure limitations (irrigation, power)" color="primary" />
              <Chip label="Planting density calculations" color="primary" />
              <Chip label="Seasonal capacity adjustments" color="primary" />
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Farm</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Area (m²)</TableCell>
                <TableCell>Current Plant</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBlocks.map((block) => (
                <TableRow key={block._id}>
                  <TableCell>{block.name}</TableCell>
                  <TableCell>
                    {farms.find(f => f._id === block.farmId)?.name || 'Unknown Farm'}
                  </TableCell>
                  <TableCell>{getBlockTypeDisplay(block.blockType)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={block.status} 
                      color={getStatusColor(block.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{block.dimensions.area}</TableCell>
                  <TableCell>
                    {block.plantAssignment.assignedPlants.length > 0 ? (
                      <Box>
                        {block.plantAssignment.assignedPlants.map((plant, index) => (
                          <Box key={index} sx={{ mb: 0.5 }}>
                            <Typography variant="body2">{plant.plantName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                              {plant.assignedCount} plants
                              {plant.plantingDate && ` • Planted: ${new Date(plant.plantingDate).toLocaleDateString()}`}
                            </Typography>
                          </Box>
                        ))}
                        <Typography variant="caption" color="text.secondary">
                          Total: {block.plantAssignment.totalAssigned}/{block.plantAssignment.maxPlantCapacity}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No plants assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        console.log('Block data for editing:', block);
                        console.log('Block _id:', block._id);
                        console.log('Block id:', (block as any).id);
                        console.log('All block keys:', Object.keys(block));
                        
                        // Use the actual ID field that exists in the data
                        const blockId = block._id || (block as any).id;
                        
                        if (!blockId) {
                          setError('Cannot edit block: No valid ID found');
                          return;
                        }
                        
                        // Use the actual ID from the block data
                        const blockWithId = {
                          ...block,
                          _id: blockId
                        };
                        console.log('Editing block with ID:', blockWithId._id);
                        setSelectedBlock(blockWithId);
                        setBlockForm(blockWithId);
                        setBlockDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const blockId = block._id || (block as any).id;
                        if (!blockId) {
                          setError('Cannot change state: No valid ID found');
                          return;
                        }
                        const blockWithId = {
                          ...block,
                          _id: blockId
                        };
                        setSelectedBlock(blockWithId);
                        setNewBlockState('');
                        setStateChangeNotes('');
                        setStateChangeDialogOpen(true);
                      }}
                      title="Change Block State"
                    >
                      <StateChangeIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Plant Assignment Tab */}
      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" sx={{ mb: 3 }}>Performance Dashboard</Typography>
        
        {performanceData && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {performanceData.totalBlocks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Blocks
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {performanceData.activeBlocks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Blocks
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="info.main">
                    {performanceData.totalYield?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Yield (kg)
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="warning.main">
                    ${performanceData.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </TabPanel>

      {/* Optimization Tab */}
      <TabPanel value={activeTab} index={5}>
        <Typography variant="h6" sx={{ mb: 3 }}>Block Optimization</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {Array.isArray(optimizationData) && optimizationData.length > 0 ? (
            optimizationData.map((optimization) => (
            <Box key={optimization.blockId} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{optimization.blockName}</Typography>
                    <Chip 
                      label={`${Math.round(optimization.optimizationScore * 100)}%`}
                      color={optimization.optimizationScore > 0.7 ? 'success' : 'warning'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Current Status: {optimization.currentStatus}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Recommendations:
                  </Typography>
                  {optimization.recommendations.map((rec, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        • {rec.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Impact: {rec.impact} • Cost: ${rec.cost} • Benefit: ${rec.expectedBenefit}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
            ))
          ) : (
            <Box sx={{ flex: '1 1 100%', textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No optimization data available. Create some blocks to see optimization recommendations.
              </Typography>
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={activeTab} index={4}>
        <Typography variant="h6" sx={{ mb: 3 }}>Performance Dashboard</Typography>
        
        {performanceData && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {performanceData.totalBlocks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Blocks
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {performanceData.activeBlocks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Blocks
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="info.main">
                    {performanceData.totalYield?.toLocaleString() || '0'} kg
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Yield (kg)
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="warning.main">
                    ${performanceData.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Recent Harvests</Typography>
        <Typography variant="body2" color="text.secondary">
          Harvest data will be available after implementing Task Management and Plant Data modules.
        </Typography>
      </TabPanel>

      {/* Plant Assignment Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Plant-to-Block Assignment</Typography>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => setAssignmentDialogOpen(true)}
          >
            Assign Plant to Block
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Match optimal plant varieties to appropriate block types and assign growing schedules based on Process Flow #3.
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Block Type Optimization</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label="Hydroponics: High-density, fast-growing varieties" color="primary" />
              <Chip label="Open Field: Weather-resistant varieties" color="primary" />
              <Chip label="Greenhouse: Climate-controlled varieties" color="primary" />
              <Chip label="Nethouse: Pest protection varieties" color="primary" />
              <Chip label="Container: Compact varieties" color="primary" />
              <Chip label="Vertical: Space-efficient varieties" color="primary" />
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary">
          Plant assignment data will be available after implementing Plant Data Management module.
        </Typography>
      </TabPanel>

      {/* Farm Dialog */}
      <Dialog open={farmDialogOpen} onClose={() => setFarmDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedFarm ? 'Edit Farm' : 'Create New Farm'}
        </DialogTitle>
        <DialogContent>
          <Tabs value={farmDialogTab} onChange={(e, newValue) => setFarmDialogTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Basic Information" />
            <Tab label="Financial Data" />
          </Tabs>
          
          {farmDialogTab === 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {/* Farm Name */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Farm Name"
                value={farmForm.name || ''}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                required
              />
            </Box>
            
            {/* Farm ID */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Farm ID"
                value={farmForm.farmId || ''}
                onChange={(e) => setFarmForm({ ...farmForm, farmId: e.target.value })}
                placeholder="e.g., FARM-001"
                required
                helperText="Unique identifier for the farm"
              />
            </Box>
            
            {/* Farm Owner */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Farm Owner"
                value={farmForm.farmOwner || ''}
                onChange={(e) => setFarmForm({ ...farmForm, farmOwner: e.target.value })}
                placeholder="Owner's full name"
                required
              />
            </Box>
            
            {/* City */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="City"
                value={farmForm.location?.city || ''}
                onChange={(e) => setFarmForm({ 
                  ...farmForm, 
                  location: { 
                    ...farmForm.location,
                    address: farmForm.location?.address || '',
                    city: e.target.value,
                    state: farmForm.location?.state || '',
                    country: farmForm.location?.country || '',
                    zipCode: farmForm.location?.zipCode || '',
                    coordinates: farmForm.location?.coordinates || { latitude: 0, longitude: 0 },
                    timezone: farmForm.location?.timezone || ''
                  }
                })}
                required
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="State"
                value={farmForm.location?.state || ''}
                onChange={(e) => setFarmForm({ 
                  ...farmForm, 
                  location: { 
                    ...farmForm.location,
                    address: farmForm.location?.address || '',
                    city: farmForm.location?.city || '',
                    state: e.target.value,
                    country: farmForm.location?.country || '',
                    zipCode: farmForm.location?.zipCode || '',
                    coordinates: farmForm.location?.coordinates || { latitude: 0, longitude: 0 },
                    timezone: farmForm.location?.timezone || ''
                  }
                })}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Farm Type</InputLabel>
                <Select
                  value={farmForm.specifications?.farmType || ''}
                  onChange={(e) => setFarmForm({
                    ...farmForm,
                    specifications: { 
                      ...farmForm.specifications,
                      totalArea: farmForm.specifications?.totalArea || 0,
                      usableArea: farmForm.specifications?.usableArea || 0,
                      maxBlocks: farmForm.specifications?.maxBlocks || 0,
                      establishedDate: farmForm.specifications?.establishedDate || '',
                      farmType: e.target.value as any,
                      certification: farmForm.specifications?.certification || [],
                      climate: farmForm.specifications?.climate || 'temperate',
                      soilType: farmForm.specifications?.soilType || 'loamy'
                    }
                  })}
                >
                  <MenuItem value="organic">Organic</MenuItem>
                  <MenuItem value="conventional">Conventional</MenuItem>
                  <MenuItem value="hydroponic">Hydroponic</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                  <MenuItem value="research">Research</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Total Area (hectares)"
                type="number"
                value={farmForm.specifications?.totalArea || ''}
                onChange={(e) => setFarmForm({
                  ...farmForm,
                  specifications: { 
                    ...farmForm.specifications,
                    totalArea: parseFloat(e.target.value) || 0,
                    usableArea: farmForm.specifications?.usableArea || 0,
                    maxBlocks: farmForm.specifications?.maxBlocks || 0,
                    establishedDate: farmForm.specifications?.establishedDate || '',
                    farmType: farmForm.specifications?.farmType || 'organic',
                    certification: farmForm.specifications?.certification || [],
                    climate: farmForm.specifications?.climate || 'temperate',
                    soilType: farmForm.specifications?.soilType || 'loamy'
                  }
                })}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Usable Area (hectares)"
                type="number"
                value={farmForm.specifications?.usableArea || ''}
                onChange={(e) => setFarmForm({
                  ...farmForm,
                  specifications: { 
                    ...farmForm.specifications,
                    totalArea: farmForm.specifications?.totalArea || 0,
                    usableArea: parseFloat(e.target.value) || 0,
                    maxBlocks: farmForm.specifications?.maxBlocks || 0,
                    establishedDate: farmForm.specifications?.establishedDate || '',
                    farmType: farmForm.specifications?.farmType || 'organic',
                    certification: farmForm.specifications?.certification || [],
                    climate: farmForm.specifications?.climate || 'temperate',
                    soilType: farmForm.specifications?.soilType || 'loamy'
                  }
                })}
              />
            </Box>
            
            {/* Total Number of Blocks */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Total Number of Blocks"
                type="number"
                value={farmForm.specifications?.maxBlocks || ''}
                onChange={(e) => setFarmForm({
                  ...farmForm,
                  specifications: { 
                    ...farmForm.specifications,
                    totalArea: farmForm.specifications?.totalArea || 0,
                    usableArea: farmForm.specifications?.usableArea || 0,
                    maxBlocks: parseInt(e.target.value) || 0,
                    establishedDate: farmForm.specifications?.establishedDate || '',
                    farmType: farmForm.specifications?.farmType || 'organic',
                    certification: farmForm.specifications?.certification || [],
                    climate: farmForm.specifications?.climate || 'temperate',
                    soilType: farmForm.specifications?.soilType || 'loamy'
                  }
                })}
                helperText="Maximum blocks that can be assigned to this farm"
                required
              />
          </Box>
            
            {/* Farm Coordinates */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={farmForm.location?.coordinates?.latitude || ''}
                onChange={(e) => setFarmForm({ 
                  ...farmForm, 
                  location: { 
                    ...farmForm.location,
                    address: farmForm.location?.address || '',
                    city: farmForm.location?.city || '',
                    state: farmForm.location?.state || '',
                    country: farmForm.location?.country || '',
                    zipCode: farmForm.location?.zipCode || '',
                    coordinates: { 
                      latitude: parseFloat(e.target.value) || 0,
                      longitude: farmForm.location?.coordinates?.longitude || 0
                    },
                    timezone: farmForm.location?.timezone || ''
                  }
                })}
                placeholder="e.g., 40.7128"
                helperText="Farm latitude coordinate"
              />
            </Box>
            
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={farmForm.location?.coordinates?.longitude || ''}
                onChange={(e) => setFarmForm({ 
                  ...farmForm, 
                  location: { 
                    ...farmForm.location,
                    address: farmForm.location?.address || '',
                    city: farmForm.location?.city || '',
                    state: farmForm.location?.state || '',
                    country: farmForm.location?.country || '',
                    zipCode: farmForm.location?.zipCode || '',
                    coordinates: { 
                      latitude: farmForm.location?.coordinates?.latitude || 0,
                      longitude: parseFloat(e.target.value) || 0
                    },
                    timezone: farmForm.location?.timezone || ''
                  }
                })}
                placeholder="e.g., -74.0060"
                helperText="Farm longitude coordinate"
              />
            </Box>
            
            {/* Farm Map Location */}
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Farm Map URL"
                value={farmForm.mapLocation?.mapUrl || ''}
                onChange={(e) => setFarmForm({
                  ...farmForm,
                  mapLocation: {
                    ...farmForm.mapLocation,
                    mapUrl: e.target.value,
                    mapDescription: farmForm.mapLocation?.mapDescription || '',
                    boundaries: farmForm.mapLocation?.boundaries || {
                      north: 0,
                      south: 0,
                      east: 0,
                      west: 0
                    }
                  }
                })}
                placeholder="https://maps.google.com/..."
                helperText="URL to farm map or satellite image"
              />
            </Box>
            
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Map Description"
                value={farmForm.mapLocation?.mapDescription || ''}
                onChange={(e) => setFarmForm({
                  ...farmForm,
                  mapLocation: {
                    ...farmForm.mapLocation,
                    mapUrl: farmForm.mapLocation?.mapUrl || '',
                    mapDescription: e.target.value,
                    boundaries: farmForm.mapLocation?.boundaries || {
                      north: 0,
                      south: 0,
                      east: 0,
                      west: 0
                    }
                  }
                })}
                placeholder="Description of farm layout"
                helperText="Brief description of the farm layout"
              />
            </Box>
          </Box>
          )}
          
          {farmDialogTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Land Rent per Month"
                    type="number"
                    value={farmForm.financials?.landRentPerMonth || ''}
                    onChange={(e) => updateFinancialField('landRentPerMonth', parseFloat(e.target.value) || 0)}
                    helperText="Monthly rent for the farm land"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Electricity Cost per kW"
                    type="number"
                    value={farmForm.financials?.electricityCostPerKw || ''}
                    onChange={(e) => updateFinancialField('electricityCostPerKw', parseFloat(e.target.value) || 0)}
                    helperText="Cost per kilowatt of electricity"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Water Cost per cm³"
                    type="number"
                    value={farmForm.financials?.waterCostPerCm3 || ''}
                    onChange={(e) => updateFinancialField('waterCostPerCm3', parseFloat(e.target.value) || 0)}
                    helperText="Cost per cubic centimeter of water"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Initial Capital Investment"
                    type="number"
                    value={farmForm.financials?.initialCapitalInvestment || ''}
                    onChange={(e) => updateFinancialField('initialCapitalInvestment', parseFloat(e.target.value) || 0)}
                    helperText="Total initial investment in the farm"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Depreciation"
                    type="number"
                    value={farmForm.financials?.depreciation || ''}
                    onChange={(e) => updateFinancialField('depreciation', parseFloat(e.target.value) || 0)}
                    helperText="Annual depreciation amount"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Incentives"
                    type="number"
                    value={farmForm.financials?.incentives || ''}
                    onChange={(e) => updateFinancialField('incentives', parseFloat(e.target.value) || 0)}
                    helperText="Government incentives received"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Other Costs"
                    type="number"
                    value={farmForm.financials?.otherCosts || ''}
                    onChange={(e) => updateFinancialField('otherCosts', parseFloat(e.target.value) || 0)}
                    helperText="Additional miscellaneous costs"
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={farmForm.financials?.currency || 'USD'}
                      onChange={(e) => updateFinancialField('currency', e.target.value)}
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="AED">AED - UAE Dirham</MenuItem>
                      <MenuItem value="SAR">SAR - Saudi Riyal</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFarmDialogOpen(false)}>Cancel</Button>
          <Button onClick={selectedFarm ? handleUpdateFarm : handleCreateFarm} variant="contained">
            {selectedFarm ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBlock ? 'Edit Block' : 'Create New Block'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Block Name"
                value={blockForm.name || ''}
                onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth required>
                <InputLabel>Farm</InputLabel>
                <Select
                  value={blockForm.farmId || ''}
                  onChange={(e) => {
                    console.log('Farm selected:', e.target.value);
                    console.log('Current blockForm.farmId:', blockForm.farmId);
                    console.log('Event target value:', e.target.value);
                    setBlockForm({ ...blockForm, farmId: e.target.value });
                  }}
                  label="Farm"
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em>Select a farm</em>
                    </MenuItem>
                  {farms.length > 0 ? (
                    farms.map((farm, index) => {
                      const farmId = farm._id || `farm-${index}`;
                      console.log('Rendering farm option:', farmId, farm.name, farm.farmId);
                      return (
                        <MenuItem key={farmId} value={farmId}>
                          {farm.name} ({farm.farmId})
                        </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem disabled>
                      No farms available. Create a farm first.
                    </MenuItem>
                  )}
                </Select>
                {farms.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Please create a farm before creating blocks.
                  </Typography>
                )}
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Block Type</InputLabel>
                <Select
                  value={blockForm.blockType || ''}
                  onChange={(e) => setBlockForm({ ...blockForm, blockType: e.target.value as any })}
                >
                  <MenuItem value="open_field">Open Field</MenuItem>
                  <MenuItem value="greenhouse">Greenhouse</MenuItem>
                  <MenuItem value="nethouse">Nethouse</MenuItem>
                  <MenuItem value="hydroponic">Hydroponic</MenuItem>
                  <MenuItem value="container">Container</MenuItem>
                  <MenuItem value="vertical">Vertical</MenuItem>
                  <MenuItem value="aquaponic">Aquaponic</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Length (meters)"
                type="number"
                value={blockForm.dimensions?.length || ''}
                onChange={(e) => {
                  const length = parseFloat(e.target.value) || 0;
                  const width = blockForm.dimensions?.width || 0;
                  const area = length * width;
                  setBlockForm({
                  ...blockForm,
                  dimensions: { 
                    ...blockForm.dimensions,
                      length,
                      width,
                      area
                    }
                  });
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Width (meters)"
                type="number"
                value={blockForm.dimensions?.width || ''}
                onChange={(e) => {
                  const width = parseFloat(e.target.value) || 0;
                  const length = blockForm.dimensions?.length || 0;
                  const area = length * width;
                  setBlockForm({
                  ...blockForm,
                  dimensions: { 
                    ...blockForm.dimensions,
                      length,
                      width,
                      area
                    }
                  });
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Area (m²)"
                type="number"
                value={blockForm.dimensions?.area || ''}
                disabled
                helperText="Automatically calculated from length × width"
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.7)'
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Maximum Plant Capacity"
                type="number"
                value={blockForm.plantAssignment?.maxPlantCapacity || ''}
                onChange={(e) => setBlockForm({
                  ...blockForm,
                  plantAssignment: {
                    ...blockForm.plantAssignment,
                    maxPlantCapacity: parseInt(e.target.value) || 0,
                    assignedPlants: blockForm.plantAssignment?.assignedPlants || [],
                    totalAssigned: blockForm.plantAssignment?.totalAssigned || 0,
                    remainingCapacity: parseInt(e.target.value) || 0
                  }
                })}
                helperText="Maximum number of plants this block can hold"
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
          <Button onClick={selectedBlock ? handleUpdateBlock : handleCreateBlock} variant="contained">
            {selectedBlock ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Plant Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Assign Plants to Block
        </DialogTitle>
        <DialogContent>
          {/* Block Selection */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Select Block</InputLabel>
                <Select
                value={plantAssignmentForm.blockId || ''}
                onChange={(e) => {
                  const blockId = e.target.value;
                  const block = blocks.find(b => (b._id || (b as any).id) === blockId);
                  console.log('Block selected:', blockId, block);
                  setPlantAssignmentForm({ 
                    ...plantAssignmentForm, 
                    blockId,
                    selectedPlants: [] // Reset plants when block changes
                  });
                  setSelectedBlock(block || null);
                }}
                label="Select Block"
              >
                {blocks.length > 0 ? (
                  blocks.map((block, index) => {
                    const blockId = block._id || (block as any).id || `block-${index}`;
                    console.log('Rendering block option:', blockId, block.name, block.blockType);
                    return (
                      <MenuItem key={blockId} value={blockId}>
                        {block.name} ({block.blockType}) - Capacity: {block.plantAssignment?.remainingCapacity || 0}
                    </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem disabled>No blocks available</MenuItem>
                )}
                </Select>
              </FormControl>
            
            {selectedBlock && (
              <Box sx={{ p: 2, bgcolor: 'grey.800', borderRadius: 1, border: '1px solid', borderColor: 'grey.600' }}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Selected Block Details</Typography>
                <Typography variant="body2" sx={{ color: 'grey.300', mt: 1 }}>
                  Block: {selectedBlock.name} | Type: {selectedBlock.blockType} | 
                  Capacity: {selectedBlock.plantAssignment?.remainingCapacity || 0} plants remaining
                </Typography>
            </Box>
            )}
          </Box>

          {selectedBlock && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Available Plants - Filtered by Block Type */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Available Plants (Filtered for {selectedBlock.blockType})
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Plant</InputLabel>
                <Select
                    value={assignmentForm.plantDataId || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, plantDataId: e.target.value })}
                    label="Select Plant"
                  >
                    {plants
                      .filter(plant => {
                        // Filter plants based on block type
                        const blockType = selectedBlock.blockType;
                        if (blockType === 'open_field') {
                          return plant.farmingType === 'open_field_soil' || plant.farmingType === 'open_field_desert';
                        } else if (blockType === 'greenhouse') {
                          return plant.farmingType === 'greenhouse';
                        } else if (blockType === 'hydroponic') {
                          return plant.farmingType === 'hydroponic';
                        } else if (blockType === 'vertical') {
                          return plant.farmingType === 'special';
                        } else if (blockType === 'aquaponic') {
                          return plant.farmingType === 'aquaponic';
                        }
                        return true; // Show all if no specific filter
                      })
                      .map((plant, index) => {
                        const plantId = plant._id || (plant as any).id || `plant-${index}`;
                        console.log('Rendering plant option:', plantId, plant.name, plant.farmingType);
                        return (
                          <MenuItem key={plantId} value={plantId}>
                            {plant.name} ({plant.farmingType})
                    </MenuItem>
                        );
                      })}
                </Select>
              </FormControl>
                
                {assignmentForm.plantDataId && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Plant Count"
                type="number"
                      value={assignmentForm.plantCount || ''}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, plantCount: parseInt(e.target.value) || 0 })}
                      sx={{ width: 120 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const plant = plants.find(p => (p._id || (p as any).id) === assignmentForm.plantDataId);
                        console.log('Adding plant:', assignmentForm.plantDataId, plant);
                        if (plant && assignmentForm.plantCount > 0) {
                          addPlantToAssignment(plant, assignmentForm.plantCount);
                          setAssignmentForm({ ...assignmentForm, plantDataId: '', plantCount: 0 });
                        }
                      }}
                      disabled={!assignmentForm.plantDataId || !assignmentForm.plantCount}
                    >
                      Add Plant
                    </Button>
            </Box>
                )}
              </Box>
              
              {/* Selected Plants */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Selected Plants</Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {plantAssignmentForm.selectedPlants.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No plants selected
                    </Typography>
                  ) : (
                    plantAssignmentForm.selectedPlants.map((plant) => (
                      <Card key={plant.plantDataId} sx={{ mb: 1, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">{plant.plantName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {plant.count} plants
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                              size="small"
                              type="number"
                              value={plant.count}
                              onChange={(e) => updatePlantCount(plant.plantDataId, parseInt(e.target.value) || 0)}
                              sx={{ width: 80 }}
                            />
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removePlantFromAssignment(plant.plantDataId)}
                            >
                              Remove
                            </Button>
            </Box>
          </Box>
                      </Card>
                    ))
                  )}
                </Box>
                
                {/* Summary */}
                {plantAssignmentForm.selectedPlants.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.800', borderRadius: 1, border: '1px solid', borderColor: 'grey.600' }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Assignment Summary</Typography>
                    <Typography variant="body2" sx={{ color: 'grey.300', mt: 1 }}>
                      Total Plants: {plantAssignmentForm.selectedPlants.reduce((sum, p) => sum + p.count, 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.300' }}>
                      Remaining Capacity: {selectedBlock.plantAssignment?.remainingCapacity - plantAssignmentForm.selectedPlants.reduce((sum, p) => sum + p.count, 0)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAssignmentDialogOpen(false);
            setPlantAssignmentForm({ selectedPlants: [] });
            setSelectedBlock(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('Assign Plants clicked');
              console.log('Selected plants:', plantAssignmentForm.selectedPlants);
              console.log('Block ID:', plantAssignmentForm.blockId);
              console.log('Button disabled:', plantAssignmentForm.selectedPlants.length === 0 || !plantAssignmentForm.blockId);
              handleAssignPlant();
            }} 
            variant="contained"
            disabled={(() => {
              const isDisabled = plantAssignmentForm.selectedPlants.length === 0 || !plantAssignmentForm.blockId;
              console.log('🔍 Assign Plants Button Debug:', {
                selectedPlantsLength: plantAssignmentForm.selectedPlants.length,
                blockId: plantAssignmentForm.blockId,
                selectedPlants: plantAssignmentForm.selectedPlants,
                isDisabled: isDisabled,
                plantAssignmentForm: plantAssignmentForm
              });
              return isDisabled;
            })()}
            sx={{
              backgroundColor: plantAssignmentForm.selectedPlants.length === 0 || !plantAssignmentForm.blockId 
                ? 'grey.600' 
                : 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: plantAssignmentForm.selectedPlants.length === 0 || !plantAssignmentForm.blockId 
                  ? 'grey.600' 
                  : 'primary.dark'
              }
            }}
          >
            Assign Plants
          </Button>
        </DialogActions>
      </Dialog>

      {/* State Change Dialog */}
      <Dialog open={stateChangeDialogOpen} onClose={() => setStateChangeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Change Block State
        </DialogTitle>
        <DialogContent>
          {selectedBlock && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Block: {selectedBlock.name} ({selectedBlock.blockType})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current State: <Chip label={selectedBlock.status} color={getStatusColor(selectedBlock.status) as any} size="small" />
              </Typography>
            </Box>
          )}
          
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>New State</InputLabel>
            <Select
              value={newBlockState}
              onChange={(e) => setNewBlockState(e.target.value)}
              label="New State"
            >
              <MenuItem value="empty">Empty</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="planted">Planted</MenuItem>
              <MenuItem value="harvesting">Harvesting</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={stateChangeNotes}
            onChange={(e) => setStateChangeNotes(e.target.value)}
            placeholder="Add notes about this state change..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStateChangeDialogOpen(false);
            setNewBlockState('');
            setStateChangeNotes('');
            setSelectedBlock(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleStateChange}
            variant="contained"
            disabled={!newBlockState}
            sx={{
              backgroundColor: !newBlockState ? 'grey.600' : 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: !newBlockState ? 'grey.600' : 'primary.dark'
              }
            }}
          >
            Change State
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FarmManagementPage;