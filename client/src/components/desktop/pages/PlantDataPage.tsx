import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalFlorist as PlantIcon,
  Science as ScienceIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  LocalFlorist,
  WaterDrop as WaterIcon,
  WbSunny as SunIcon,
  Thermostat as TempIcon
} from '@mui/icons-material';
// import { useAppSelector } from '../../../store';
import { IPlantData, FarmingType } from '../../../services/plantDataApi';
import plantDataApi from '../../../services/plantDataApi';
import { useThemeUtils } from '../../../utils/themeUtils';

const PlantDataPage: React.FC = () => {
  const themeUtils = useThemeUtils();
  const [activeTab, setActiveTab] = useState(0);
  const [dialogTab, setDialogTab] = useState(0);
  const [plantData, setPlantData] = useState<IPlantData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure all required properties are provided
  const ensureCompletePlantForm = (partialForm: Partial<IPlantData>): IPlantData => {
    const result: IPlantData = {
      name: partialForm.name || '',
      scientificName: partialForm.scientificName || '',
      variety: partialForm.variety || '',
      category: partialForm.category || 'vegetable',
      farmingType: partialForm.farmingType || FarmingType.OPEN_FIELD_SOIL,
      family: partialForm.family || '',
      growthCharacteristics: {
        height: partialForm.growthCharacteristics?.height || 100,
        spread: partialForm.growthCharacteristics?.spread || 50,
        rootDepth: partialForm.growthCharacteristics?.rootDepth || 30,
        lifecycle: partialForm.growthCharacteristics?.lifecycle || 'annual'
      },
      growingRequirements: {
        soilType: partialForm.growingRequirements?.soilType || 'Well-drained soil',
        temperature: {
          min: partialForm.growingRequirements?.temperature?.min || 18,
          max: partialForm.growingRequirements?.temperature?.max || 30,
          optimal: partialForm.growingRequirements?.temperature?.optimal || 24
        },
        humidity: {
          min: partialForm.growingRequirements?.humidity?.min || 40,
          max: partialForm.growingRequirements?.humidity?.max || 70,
          optimal: partialForm.growingRequirements?.humidity?.optimal || 60
        },
        lightRequirements: partialForm.growingRequirements?.lightRequirements || 'full_sun',
        lightHours: {
          min: partialForm.growingRequirements?.lightHours?.min || 6,
          max: partialForm.growingRequirements?.lightHours?.max || 8,
          optimal: partialForm.growingRequirements?.lightHours?.optimal || 7
        },
        soilPh: {
          min: partialForm.growingRequirements?.soilPh?.min || 6.0,
          max: partialForm.growingRequirements?.soilPh?.max || 6.8,
          optimal: partialForm.growingRequirements?.soilPh?.optimal || 6.5
        },
        waterRequirements: {
          level: partialForm.growingRequirements?.waterRequirements?.level || 'moderate',
          daily: partialForm.growingRequirements?.waterRequirements?.daily || 2.5,
          frequency: partialForm.growingRequirements?.waterRequirements?.frequency || 'daily'
        }
      },
      fertilizerSchedule: partialForm.fertilizerSchedule || [],
      pesticideSchedule: partialForm.pesticideSchedule || [],
      growthTimeline: {
        germinationTime: partialForm.growthTimeline?.germinationTime || 7,
        daysToMaturity: partialForm.growthTimeline?.daysToMaturity || 115,
        harvestWindow: partialForm.growthTimeline?.harvestWindow || 30,
        seasonalPlanting: partialForm.growthTimeline?.seasonalPlanting || [],
        germinationDays: partialForm.growthTimeline?.germinationDays || 7,
        seedlingDays: partialForm.growthTimeline?.seedlingDays || 14,
        vegetativeDays: partialForm.growthTimeline?.vegetativeDays || 35,
        floweringDays: partialForm.growthTimeline?.floweringDays || 14,
        fruitingDays: partialForm.growthTimeline?.fruitingDays || 45,
        totalDays: partialForm.growthTimeline?.totalDays || 115
      },
      yieldInfo: {
        expectedYieldPerPlant: partialForm.yieldInfo?.expectedYieldPerPlant || 3.5,
        yieldPerSquareMeter: partialForm.yieldInfo?.yieldPerSquareMeter || 8.5,
        yieldUnit: partialForm.yieldInfo?.yieldUnit || 'kg',
        harvestWindow: partialForm.yieldInfo?.harvestWindow || 30,
        shelfLife: partialForm.yieldInfo?.shelfLife || 14,
        qualityMetrics: {
          size: partialForm.yieldInfo?.qualityMetrics?.size || 'Standard size',
          color: partialForm.yieldInfo?.qualityMetrics?.color || 'Natural color',
          texture: partialForm.yieldInfo?.qualityMetrics?.texture || 'Firm texture',
          brix: partialForm.yieldInfo?.qualityMetrics?.brix || 5.0
        }
      },
      resourceRequirements: {
        seedsPerUnit: partialForm.resourceRequirements?.seedsPerUnit || 1,
        fertilizerType: partialForm.resourceRequirements?.fertilizerType || [],
        fertilizerAmount: partialForm.resourceRequirements?.fertilizerAmount || 0.5,
        pesticideType: partialForm.resourceRequirements?.pesticideType || [],
        pesticideAmount: partialForm.resourceRequirements?.pesticideAmount || 10,
        spaceRequirement: {
          width: partialForm.resourceRequirements?.spaceRequirement?.width || 60,
          length: partialForm.resourceRequirements?.spaceRequirement?.length || 60,
          height: partialForm.resourceRequirements?.spaceRequirement?.height || 150
        }
      },
      marketInfo: {
        basePrice: partialForm.marketInfo?.basePrice || 2.50,
        priceUnit: partialForm.marketInfo?.priceUnit || 'kg',
        seasonality: {
          peakSeason: partialForm.marketInfo?.seasonality?.peakSeason || [],
          offSeason: partialForm.marketInfo?.seasonality?.offSeason || []
        },
        demandLevel: partialForm.marketInfo?.demandLevel || 'high'
      },
      qualityStandards: {
        size: {
          min: partialForm.qualityStandards?.size?.min || 2,
          max: partialForm.qualityStandards?.size?.max || 4,
          unit: partialForm.qualityStandards?.size?.unit || 'cm'
        },
        color: partialForm.qualityStandards?.color || [],
        texture: partialForm.qualityStandards?.texture || [],
        defects: partialForm.qualityStandards?.defects || []
      },
      environmentalImpact: {
        waterFootprint: partialForm.environmentalImpact?.waterFootprint || 214,
        carbonFootprint: partialForm.environmentalImpact?.carbonFootprint || 2.3,
        sustainabilityScore: partialForm.environmentalImpact?.sustainabilityScore || 7
      },
      isActive: partialForm.isActive !== undefined ? partialForm.isActive : true,
      createdBy: partialForm.createdBy || '',
      lastModifiedBy: partialForm.lastModifiedBy || '',
      createdAt: partialForm.createdAt || new Date(),
      updatedAt: partialForm.updatedAt || new Date()
    };

    // Only add _id if it exists and is not empty
    if (partialForm._id && partialForm._id !== '') {
      result._id = partialForm._id;
    }

    return result;
  };

  const [plantDialogOpen, setPlantDialogOpen] = useState(false);
  const [jsonImportDialogOpen, setJsonImportDialogOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<IPlantData | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [plantForm, setPlantForm] = useState<Partial<IPlantData>>({
    name: '',
    scientificName: '',
    variety: '',
    category: 'vegetable',
    farmingType: FarmingType.OPEN_FIELD_SOIL,
    family: '',
    growthCharacteristics: {
      height: 100,
      spread: 50,
      rootDepth: 30,
      lifecycle: 'annual'
    },
    growingRequirements: {
      soilType: 'Well-drained soil',
      temperature: { min: 18, max: 30, optimal: 24 },
      humidity: { min: 40, max: 70, optimal: 60 },
      lightRequirements: 'full_sun',
      lightHours: { min: 6, max: 8, optimal: 7 },
      soilPh: { min: 6.0, max: 6.8, optimal: 6.5 },
      waterRequirements: { level: 'moderate', daily: 2.5, frequency: 'daily' }
    },
    fertilizerSchedule: [],
    pesticideSchedule: [],
    growthTimeline: {
      germinationTime: 7,
      daysToMaturity: 115,
      harvestWindow: 30,
      seasonalPlanting: [],
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
        size: 'Standard size',
        color: 'Natural color',
        texture: 'Firm texture',
        brix: 5.0
      }
    },
    resourceRequirements: {
      seedsPerUnit: 1,
      fertilizerType: [],
      fertilizerAmount: 0.5,
      pesticideType: [],
      pesticideAmount: 10,
      spaceRequirement: { width: 60, length: 60, height: 150 }
    },
    marketInfo: {
      basePrice: 2.50,
      priceUnit: 'kg',
      seasonality: { peakSeason: [], offSeason: [] },
      demandLevel: 'high'
    },
    qualityStandards: {
      size: { min: 2, max: 4, unit: 'cm' },
      color: [],
      texture: [],
      defects: []
    },
    environmentalImpact: {
      waterFootprint: 214,
      carbonFootprint: 2.3,
      sustainabilityScore: 7
    }
  });

  // Load data
  const loadData = useCallback(async () => {
    setError(null);
    try {
      // Explicitly request only active plants
      const response = await plantDataApi.getPlantData({ isActive: true });
      console.log('API response:', response);
      console.log('Plants from API:', response.data.plants);
      console.log('Number of plants:', response.data.plants.length);
      if (response.data.plants.length > 0) {
        console.log('First plant ID:', response.data.plants[0]._id);
      }
      setPlantData(response.data.plants);
    } catch (err) {
      setError('Failed to load plant data.');
      console.error('Error loading data:', err);
      // Use mock data as fallback
      const mockData = plantDataApi.getMockPlantData();
      console.log('Using mock data:', mockData);
      console.log('Number of mock plants:', mockData.length);
      if (mockData.length > 0) {
        console.log('First mock plant ID:', mockData[0]._id);
      }
      setPlantData(mockData);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDialogTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDialogTab(newValue);
  };

  const handleCreatePlant = async () => {
    if (!plantForm.name || !plantForm.scientificName) {
      setError('Plant name and scientific name are required.');
      return;
    }
    try {
      console.log('Original form:', plantForm);
      const completeForm = ensureCompletePlantForm(plantForm);
      console.log('Complete form:', completeForm);
      console.log('Sending complete form:', completeForm);
      await plantDataApi.createPlantData(completeForm);
      setPlantDialogOpen(false);
      setPlantForm({});
      loadData();
    } catch (err) {
      setError('Failed to create plant data.');
      console.error('Error creating plant data:', err);
    }
  };

  const handleUpdatePlant = async () => {
    if (!selectedPlant) return;
    try {
      const completeForm = ensureCompletePlantForm(plantForm);
      await plantDataApi.updatePlantData(selectedPlant._id!, completeForm);
      setPlantDialogOpen(false);
      setSelectedPlant(null);
      setPlantForm({});
      loadData();
    } catch (err) {
      setError('Failed to update plant data.');
      console.error('Error updating plant data:', err);
    }
  };

  const handleDeletePlant = async (id: string) => {
    console.log('Delete plant called with ID:', id);
    
    if (!id) {
      setError('Cannot delete plant: Invalid plant ID.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this plant data?')) {
      try {
        console.log('Attempting to delete plant with ID:', id);
        await plantDataApi.deletePlantData(id);
        loadData();
      } catch (err) {
        setError('Failed to delete plant data.');
        console.error('Error deleting plant data:', err);
      }
    }
  };

  const handleJsonImport = () => {
    try {
      setJsonParseError(null);
      const plantData = JSON.parse(jsonInput);
      
      // Validate required fields
      if (!plantData.name || !plantData.scientificName) {
        setJsonParseError('Plant name and scientific name are required.');
        return;
      }
      
      // Validate and fix enum values
      const validApplicationMethods = ['foliar_spray', 'soil_drench', 'injection', 'broadcast'];
      const validPesticideMethods = ['foliar_spray', 'dust', 'injection', 'soil_drench'];
      const validMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Fix fertilizer schedule application methods
      if (plantData.fertilizerSchedule && Array.isArray(plantData.fertilizerSchedule)) {
        plantData.fertilizerSchedule = plantData.fertilizerSchedule.map((schedule: any) => ({
          ...schedule,
          applicationMethod: validApplicationMethods.includes(schedule.applicationMethod) 
            ? schedule.applicationMethod 
            : 'soil_drench' // Default to valid value
        }));
      }
      
      // Fix pesticide schedule application methods
      if (plantData.pesticideSchedule && Array.isArray(plantData.pesticideSchedule)) {
        plantData.pesticideSchedule = plantData.pesticideSchedule.map((schedule: any) => ({
          ...schedule,
          applicationMethod: validPesticideMethods.includes(schedule.applicationMethod) 
            ? schedule.applicationMethod 
            : 'foliar_spray' // Default to valid value
        }));
      }
      
      // Fix seasonal planting months
      if (plantData.growthTimeline?.seasonalPlanting && Array.isArray(plantData.growthTimeline.seasonalPlanting)) {
        plantData.growthTimeline.seasonalPlanting = plantData.growthTimeline.seasonalPlanting
          .map((month: string) => validMonths.includes(month) ? month : 'Mar') // Default to March
          .filter((month: string, index: number, arr: string[]) => arr.indexOf(month) === index); // Remove duplicates
      }
      
      // Fix market info seasonality
      if (plantData.marketInfo?.seasonality) {
        if (plantData.marketInfo.seasonality.peakSeason && Array.isArray(plantData.marketInfo.seasonality.peakSeason)) {
          plantData.marketInfo.seasonality.peakSeason = plantData.marketInfo.seasonality.peakSeason
            .map((month: string) => validMonths.includes(month) ? month : 'Jun')
            .filter((month: string, index: number, arr: string[]) => arr.indexOf(month) === index);
        }
        if (plantData.marketInfo.seasonality.offSeason && Array.isArray(plantData.marketInfo.seasonality.offSeason)) {
          plantData.marketInfo.seasonality.offSeason = plantData.marketInfo.seasonality.offSeason
            .map((month: string) => validMonths.includes(month) ? month : 'Dec')
            .filter((month: string, index: number, arr: string[]) => arr.indexOf(month) === index);
        }
      }
      
      // Use the ensureCompletePlantForm to fill in any missing fields
      const completePlantData = ensureCompletePlantForm(plantData);
      
      // Set the form data and open the dialog
      setPlantForm(completePlantData);
      setSelectedPlant(null);
      setDialogTab(0);
      setPlantDialogOpen(true);
      setJsonImportDialogOpen(false);
      setJsonInput('');
      
    } catch (err) {
      setJsonParseError('Invalid JSON format. Please check your input.');
      console.error('JSON parse error:', err);
    }
  };

  const handleJsonImportMultiple = async () => {
    try {
      setJsonParseError(null);
      const plantDataArray = JSON.parse(jsonInput);
      
      if (!Array.isArray(plantDataArray)) {
        setJsonParseError('JSON must be an array of plant objects.');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const plantData of plantDataArray) {
        try {
          if (!plantData.name || !plantData.scientificName) {
            console.warn('Skipping plant without name or scientific name:', plantData);
            errorCount++;
            continue;
          }
          
          // Validate and fix enum values
          const validApplicationMethods = ['foliar_spray', 'soil_drench', 'injection', 'broadcast'];
          const validPesticideMethods = ['foliar_spray', 'dust', 'injection', 'soil_drench'];
          const validMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          // Fix fertilizer schedule application methods
          if (plantData.fertilizerSchedule && Array.isArray(plantData.fertilizerSchedule)) {
            plantData.fertilizerSchedule = plantData.fertilizerSchedule.map((schedule: any) => ({
              ...schedule,
              applicationMethod: validApplicationMethods.includes(schedule.applicationMethod) 
                ? schedule.applicationMethod 
                : 'soil_drench' // Default to valid value
            }));
          }
          
          // Fix pesticide schedule application methods
          if (plantData.pesticideSchedule && Array.isArray(plantData.pesticideSchedule)) {
            plantData.pesticideSchedule = plantData.pesticideSchedule.map((schedule: any) => ({
              ...schedule,
              applicationMethod: validPesticideMethods.includes(schedule.applicationMethod) 
                ? schedule.applicationMethod 
                : 'foliar_spray' // Default to valid value
            }));
          }
          
          // Fix seasonal planting months
          if (plantData.growthTimeline?.seasonalPlanting && Array.isArray(plantData.growthTimeline.seasonalPlanting)) {
            plantData.growthTimeline.seasonalPlanting = plantData.growthTimeline.seasonalPlanting
              .map((month: string) => validMonths.includes(month) ? month : 'Mar') // Default to March
              .filter((month: string, index: number, arr: string[]) => arr.indexOf(month) === index); // Remove duplicates
          }
          
          // Fix market info seasonality
          if (plantData.marketInfo?.seasonality) {
            if (plantData.marketInfo.seasonality.peakSeason && Array.isArray(plantData.marketInfo.seasonality.peakSeason)) {
              plantData.marketInfo.seasonality.peakSeason = plantData.marketInfo.seasonality.peakSeason
                .map((month: string) => validMonths.includes(month) ? month : 'Jun')
                .filter((month: string, index: number, arr: string[]) => arr.indexOf(month) === index);
            }
            if (plantData.marketInfo.seasonality.offSeason && Array.isArray(plantData.marketInfo.seasonality.offSeason)) {
              plantData.marketInfo.seasonality.offSeason = plantData.marketInfo.seasonality.offSeason
                .map((month: string) => validMonths.includes(month) ? month : 'Dec')
                .filter((month: string, index: number, arr: string[]) => arr.indexOf(month) === index);
            }
          }
          
          const completePlantData = ensureCompletePlantForm(plantData);
          await plantDataApi.createPlantData(completePlantData);
          successCount++;
        } catch (err) {
          console.error('Error importing plant:', plantData.name, err);
          errorCount++;
        }
      }
      
      setJsonImportDialogOpen(false);
      setJsonInput('');
      setError(null);
      
      if (successCount > 0) {
        loadData();
        alert(`Successfully imported ${successCount} plants. ${errorCount > 0 ? `${errorCount} plants failed to import.` : ''}`);
      } else {
        setError('No plants were successfully imported.');
      }
      
    } catch (err) {
      setJsonParseError('Invalid JSON format. Please check your input.');
      console.error('JSON parse error:', err);
    }
  };


  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(255,107,107,0.05) 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        border: '1px solid rgba(0,212,170,0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              color: themeUtils.colors.text.primary,
              mb: 1
            }}>
              Plant Data Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Define plant specifications, care requirements, and growth schedules
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<ScienceIcon />} 
                label={`${plantData.length} Plant Varieties`} 
                color="primary" 
                variant="outlined"
                sx={{ borderColor: themeUtils.colors.success, color: themeUtils.colors.success }}
              />
              <Chip 
                icon={<ScheduleIcon />} 
                label="Growth Schedules" 
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'text.secondary' }}
              />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, color: themeUtils.colors.success, mb: 0 }}>
              {plantData.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Plants
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
          border: '1px solid rgba(0,212,170,0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${themeUtils.colors.success}, ${themeUtils.colors.info})`,
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.success }}>
                {plantData.length}
              </Typography>
              <LocalFlorist sx={{ color: themeUtils.colors.success, fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Plant Varieties</Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.success }}>Active in system</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
          border: '1px solid rgba(255,107,107,0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${themeUtils.colors.error}, ${themeUtils.colors.warning})`,
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.error }}>
                {plantData.reduce((acc, plant) => acc + (plant.resourceRequirements?.fertilizerType?.length || 0), 0)}
              </Typography>
              <ScheduleIcon sx={{ color: themeUtils.colors.error, fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Fertilizer Schedules</Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.success }}>Across all plants</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
          border: '1px solid rgba(33,150,243,0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${themeUtils.colors.info}, ${themeUtils.colors.primary})`,
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.info }}>
                {plantData.reduce((acc, plant) => acc + (plant.resourceRequirements?.pesticideType?.length || 0), 0)}
              </Typography>
              <ScienceIcon sx={{ color: themeUtils.colors.info, fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Pesticide Schedules</Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.success }}>Safety protocols</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
          border: '1px solid rgba(76,175,80,0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${themeUtils.colors.success}, ${themeUtils.colors.primary})`,
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.success }}>
                {Math.round(plantData.reduce((acc, plant) => acc + (plant.growthTimeline?.totalDays || 0), 0) / plantData.length) || 0}
              </Typography>
              <TimelineIcon sx={{ color: themeUtils.colors.success, fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Avg. Maturity (Days)</Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.success }}>Growth timeline</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {/* Plant Categories */}
        <Card sx={{ 
          flex: '1 1 300px', 
          minWidth: '300px',
          background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceIcon color="primary" />
              Plant Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { name: 'Vegetables', count: plantData.filter(p => p.category === 'vegetable').length, color: themeUtils.colors.success },
                { name: 'Fruits', count: plantData.filter(p => p.category === 'fruit').length, color: themeUtils.colors.error },
                { name: 'Herbs', count: plantData.filter(p => p.category === 'herb').length, color: themeUtils.colors.info },
                { name: 'Flowers', count: plantData.filter(p => p.category === 'flower').length, color: themeUtils.colors.success },
              ].map((category, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2, 
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.05)',
                    transform: 'translateX(4px)',
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: category.color }} />
                    <Typography variant="body2">{category.name}</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: category.color, fontWeight: 700 }}>
                    {category.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ 
          flex: '1 1 300px', 
          minWidth: '300px',
          background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: <AddIcon />, text: "Add New Plant", color: themeUtils.colors.success, action: () => { setSelectedPlant(null); setPlantForm({}); setPlantDialogOpen(true); } },
                { icon: <ScienceIcon />, text: "View Requirements", color: themeUtils.colors.error, action: () => setActiveTab(1) },
                { icon: <ScheduleIcon />, text: "Fertilizer Schedule", color: themeUtils.colors.info, action: () => setActiveTab(2) },
                { icon: <ScienceIcon />, text: "Pesticide Schedule", color: themeUtils.colors.error, action: () => setActiveTab(3) },
                { icon: <TimelineIcon />, text: "Growth Timeline", color: themeUtils.colors.success, action: () => setActiveTab(6) },
                { icon: <AssessmentIcon />, text: "Yield Analysis", color: themeUtils.colors.warning, action: () => setActiveTab(7) },
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={action.action}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 2,
                    borderRadius: 2,
                    borderColor: action.color,
                    color: action.color,
                    '&:hover': {
                      backgroundColor: `${action.color}20`,
                      borderColor: action.color,
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {action.text}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Enhanced Tabs Section */}
      <Card sx={{ 
        background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
        border: '1px solid rgba(255,255,255,0.1)',
        mb: 3
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="plant data management tabs"
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
              icon={<PlantIcon />} 
              label="Plant Overview" 
              iconPosition="start"
            />
            <Tab 
              icon={<ScienceIcon />} 
              label="Growing Requirements" 
              iconPosition="start"
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Fertilizer Schedule" 
              iconPosition="start"
            />
            <Tab 
              icon={<ScienceIcon />} 
              label="Pesticide Schedule" 
              iconPosition="start"
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Resource Requirements" 
              iconPosition="start"
            />
            <Tab 
              icon={<ScienceIcon />} 
              label="Market Information" 
              iconPosition="start"
            />
            <Tab 
              icon={<TimelineIcon />} 
              label="Growth Timeline" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Yield Information" 
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Card>

      {/* Plant Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Plant Specifications</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPlant(null);
                setPlantForm(ensureCompletePlantForm({}));
                setDialogTab(0);
              setPlantDialogOpen(true);
            }}
          >
            Add Plant Data
          </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setJsonImportDialogOpen(true)}
            >
              Import JSON
          </Button>
          </Box>
        </Box>

        {plantData.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Plant Data Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by creating plant data for your farm operations
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedPlant(null);
                setPlantForm({
                  name: 'Tomato (Cherry)',
                  scientificName: 'Solanum lycopersicum var. cerasiforme',
                  variety: 'Sweet 100',
                  category: 'vegetable'
                });
                setDialogTab(0);
                setPlantDialogOpen(true);
              }}
            >
              Create First Plant Data
            </Button>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plant Name</TableCell>
                  <TableCell>Scientific Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Variety</TableCell>
                  <TableCell>Farming Type</TableCell>
                  <TableCell>Total Days</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plantData.map((plant, index) => {
                  console.log('Rendering plant:', plant.name, 'ID:', plant._id);
                  return (
                  <TableRow key={plant._id || `plant-${index}`}>
                    <TableCell>{plant.name}</TableCell>
                    <TableCell>{plant.scientificName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={plant.category} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{plant.variety}</TableCell>
                    <TableCell>
                      <Chip 
                        label={plant.farmingType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'} 
                        color="secondary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{plant.growthTimeline?.totalDays || 'Not specified'} days</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setSelectedPlant(plant); setPlantForm(plant); setDialogTab(0); setPlantDialogOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => {
                          console.log('Delete button clicked for plant:', plant.name, 'ID:', plant._id);
                          plant._id ? handleDeletePlant(plant._id) : setError('Cannot delete plant: Missing ID');
                        }}
                        disabled={!plant._id}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Growing Requirements Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" sx={{ mb: 3 }}>Growing Requirements</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      <strong>Plant Family:</strong> {plant.family || 'Not specified'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Soil Type:</strong> {plant.growingRequirements?.soilType || 'Not specified'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TempIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Temperature: {plant.growingRequirements?.temperature?.min || 'Not specified'}°C - {plant.growingRequirements?.temperature?.max || 'Not specified'}°C (Optimal: {plant.growingRequirements?.temperature?.optimal || 'Not specified'}°C)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Water: {plant.growingRequirements?.waterRequirements?.daily || 'Not specified'}L daily ({plant.growingRequirements?.waterRequirements?.frequency || 'Not specified'}) - {plant.growingRequirements?.waterRequirements?.level || 'Not specified'} level
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SunIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Light: {plant.growingRequirements.lightRequirements?.replace('_', ' ') || 'Not specified'} - {plant.growingRequirements.lightHours?.min || 0}-{plant.growingRequirements.lightHours?.max || 0} hours
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      pH: {plant.growingRequirements?.soilPh?.min || 'Not specified'} - {plant.growingRequirements?.soilPh?.max || 'Not specified'} (Optimal: {plant.growingRequirements?.soilPh?.optimal || 'Not specified'})
                    </Typography>
                    <Typography variant="body2">
                      Humidity: {plant.growingRequirements?.humidity?.min || 'Not specified'}% - {plant.growingRequirements?.humidity?.max || 'Not specified'}% (Optimal: {plant.growingRequirements?.humidity?.optimal || 'Not specified'}%)
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Growth Characteristics:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Height: {plant.growthCharacteristics?.height || 'Not specified'}cm | Spread: {plant.growthCharacteristics?.spread || 'Not specified'}cm | Root Depth: {plant.growthCharacteristics?.rootDepth || 'Not specified'}cm
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Lifecycle: {plant.growthCharacteristics?.lifecycle || 'Not specified'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Fertilizer Schedule Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>Fertilizer Schedules</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  {plant.fertilizerSchedule && plant.fertilizerSchedule.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {plant.fertilizerSchedule?.map((schedule, index) => (
                        <Box key={index} sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: 'rgba(0,212,170,0.05)',
                          border: '1px solid rgba(0,212,170,0.2)'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Day {schedule.day} - {schedule.fertilizerType}
                            </Typography>
                            <Chip 
                              label={schedule.growthStage} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Rate:</strong> {schedule.applicationRate}ml/g per plant
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Frequency:</strong> {schedule.frequency}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Method:</strong> {schedule.applicationMethod?.replace('_', ' ') || 'Not specified'}
                          </Typography>
                          {schedule.notes && (
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {schedule.notes}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No fertilizer schedule defined
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Pesticide Schedule Tab */}
      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" sx={{ mb: 3 }}>Pesticide/Chemical Schedules</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  {plant.pesticideSchedule && plant.pesticideSchedule.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {plant.pesticideSchedule?.map((schedule, index) => (
                        <Box key={index} sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: 'rgba(255,107,107,0.05)',
                          border: '1px solid rgba(255,107,107,0.2)'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Day {schedule.day} - {schedule.chemicalType}
                            </Typography>
                            <Chip 
                              label={schedule.growthStage} 
                              size="small" 
                              color="error"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Rate:</strong> {schedule.applicationRate}ml/g per plant
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Frequency:</strong> {schedule.frequency}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Method:</strong> {schedule.applicationMethod?.replace('_', ' ') || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Safety:</strong> {schedule.safetyRequirements}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Re-entry:</strong> {schedule.reEntryInterval}h | <strong>Harvest restriction:</strong> {schedule.harvestRestriction} days
                          </Typography>
                          {schedule.notes && (
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {schedule.notes}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No pesticide schedule defined
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Resource Requirements Tab */}
      <TabPanel value={activeTab} index={4}>
        <Typography variant="h6" sx={{ mb: 3 }}>Resource Requirements</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Seeds per Unit:</strong> {plant.resourceRequirements.seedsPerUnit}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fertilizer Types:</strong> {plant.resourceRequirements?.fertilizerType?.join(', ') || 'None specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fertilizer Amount:</strong> {plant.resourceRequirements.fertilizerAmount} kg per plant
                    </Typography>
                    <Typography variant="body2">
                      <strong>Pesticide Types:</strong> {plant.resourceRequirements?.pesticideType?.join(', ') || 'None specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Pesticide Amount:</strong> {plant.resourceRequirements.pesticideAmount} ml per plant
                    </Typography>
                    <Typography variant="body2">
                      <strong>Space Required:</strong> {plant.resourceRequirements?.spaceRequirement?.width || 'Not specified'}cm × {plant.resourceRequirements?.spaceRequirement?.length || 'Not specified'}cm × {plant.resourceRequirements?.spaceRequirement?.height || 'Not specified'}cm
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Market Information Tab */}
      <TabPanel value={activeTab} index={5}>
        <Typography variant="h6" sx={{ mb: 3 }}>Market Information</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Base Price:</strong> ${plant.marketInfo.basePrice} per {plant.marketInfo.priceUnit}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Demand Level:</strong> 
                      <Chip 
                        label={plant.marketInfo.demandLevel} 
                        size="small" 
                        color={plant.marketInfo.demandLevel === 'very_high' ? 'error' : 
                               plant.marketInfo.demandLevel === 'high' ? 'warning' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Peak Season:</strong> {plant.marketInfo?.seasonality?.peakSeason?.join(', ') || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Off Season:</strong> {plant.marketInfo?.seasonality?.offSeason?.join(', ') || 'Not specified'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Growth Timeline Tab */}
      <TabPanel value={activeTab} index={6}>
        <Typography variant="h6" sx={{ mb: 3 }}>Growth Timelines</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      <strong>Key Timeline:</strong>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Germination Time:</strong> {plant.growthTimeline?.germinationTime || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Days to Maturity:</strong> {plant.growthTimeline?.daysToMaturity || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Harvest Window:</strong> {plant.growthTimeline?.harvestWindow || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Seasonal Planting:</strong> {plant.growthTimeline?.seasonalPlanting?.join(', ') || 'Not specified'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      <strong>Detailed Phases:</strong>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Germination:</strong> {plant.growthTimeline?.germinationDays || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Seedling:</strong> {plant.growthTimeline?.seedlingDays || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Vegetative:</strong> {plant.growthTimeline?.vegetativeDays || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Flowering:</strong> {plant.growthTimeline?.floweringDays || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fruiting:</strong> {plant.growthTimeline?.fruitingDays || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <strong>Total:</strong> {plant.growthTimeline?.totalDays || 'Not specified'} days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Yield Information Tab */}
      <TabPanel value={activeTab} index={7}>
        <Typography variant="h6" sx={{ mb: 3 }}>Yield Information</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Yield per Plant:</strong> {plant.yieldInfo?.expectedYieldPerPlant || 'Not specified'} {plant.yieldInfo?.yieldUnit || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Yield per m²:</strong> {plant.yieldInfo?.yieldPerSquareMeter || 'Not specified'} kg/m²
                    </Typography>
                    <Typography variant="body2">
                      <strong>Harvest Window:</strong> {plant.yieldInfo?.harvestWindow || 'Not specified'} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Shelf Life:</strong> {plant.yieldInfo?.shelfLife || 'Not specified'} days
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Quality Size:</strong> {plant.yieldInfo?.qualityMetrics?.size || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Quality Color:</strong> {plant.yieldInfo?.qualityMetrics?.color || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Quality Texture:</strong> {plant.yieldInfo?.qualityMetrics?.texture || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Brix Level:</strong> {plant.yieldInfo?.qualityMetrics?.brix || 'Not specified'}%
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Size Range:</strong> {plant.qualityStandards?.size?.min || 'Not specified'}-{plant.qualityStandards?.size?.max || 'Not specified'} {plant.qualityStandards?.size?.unit || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Colors:</strong> {plant.qualityStandards?.color?.join(', ') || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Textures:</strong> {plant.qualityStandards?.texture?.join(', ') || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Common Defects:</strong> {plant.qualityStandards?.defects?.join(', ') || 'None specified'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Enhanced Plant Dialog with Advanced Data */}
      <Dialog open={plantDialogOpen} onClose={() => setPlantDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedPlant ? 'Edit Plant Data' : 'Create New Plant Data'}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflow: 'auto' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={dialogTab} onChange={handleDialogTabChange} aria-label="plant data tabs">
              <Tab label="Basic Info" />
              <Tab label="Growing Requirements" />
              <Tab label="Growth Timeline" />
              <Tab label="Yield & Quality" />
            </Tabs>
          </Box>

          {/* Basic Information Tab */}
          <Box sx={{ display: dialogTab === 0 ? 'block' : 'none' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Plant Name"
                value={plantForm.name || ''}
                onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Scientific Name"
                value={plantForm.scientificName || ''}
                onChange={(e) => setPlantForm({ ...plantForm, scientificName: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={plantForm.category || 'vegetable'}
                  onChange={(e) => setPlantForm({ ...plantForm, category: e.target.value as any })}
                >
                  <MenuItem value="vegetable">Vegetable</MenuItem>
                  <MenuItem value="fruit">Fruit</MenuItem>
                  <MenuItem value="herb">Herb</MenuItem>
                  <MenuItem value="flower">Flower</MenuItem>
                  <MenuItem value="grain">Grain</MenuItem>
                  <MenuItem value="legume">Legume</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Variety"
                value={plantForm.variety || ''}
                onChange={(e) => setPlantForm({ ...plantForm, variety: e.target.value })}
              />
              </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <FormControl fullWidth>
                <InputLabel>Farming Type</InputLabel>
                <Select
                  value={plantForm.farmingType || 'open_field_soil'}
                  onChange={(e) => setPlantForm({ ...plantForm, farmingType: e.target.value as FarmingType })}
                >
                  <MenuItem value="open_field_soil">Open Field Soil</MenuItem>
                  <MenuItem value="open_field_desert">Open Field Desert</MenuItem>
                  <MenuItem value="greenhouse">Greenhouse</MenuItem>
                  <MenuItem value="nethouse">Nethouse</MenuItem>
                  <MenuItem value="hydroponic">Hydroponic</MenuItem>
                  <MenuItem value="aquaponic">Aquaponic</MenuItem>
                  <MenuItem value="aeroponic">Aeroponic</MenuItem>
                  <MenuItem value="special">Special</MenuItem>
                </Select>
              </FormControl>
            </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Plant Family"
                  value={plantForm.family || ''}
                  onChange={(e) => setPlantForm({ ...plantForm, family: e.target.value })}
                />
              </Box>
            </Box>
          </Box>

          {/* Growing Requirements Tab */}
          <Box sx={{ display: dialogTab === 1 ? 'block' : 'none' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Growing Requirements</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Soil Type"
                  value={plantForm.growingRequirements?.soilType || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growingRequirements: { 
                      soilType: e.target.value,
                      temperature: plantForm.growingRequirements?.temperature || { min: 18, max: 30, optimal: 24 },
                      humidity: plantForm.growingRequirements?.humidity || { min: 40, max: 70, optimal: 60 },
                      lightRequirements: plantForm.growingRequirements?.lightRequirements || 'full_sun',
                      lightHours: plantForm.growingRequirements?.lightHours || { min: 6, max: 8, optimal: 7 },
                      soilPh: plantForm.growingRequirements?.soilPh || { min: 6.0, max: 6.8, optimal: 6.5 },
                      waterRequirements: plantForm.growingRequirements?.waterRequirements || { level: 'moderate', daily: 2.5, frequency: 'daily' }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Min Temperature (°C)"
                  type="number"
                  value={plantForm.growingRequirements?.temperature?.min || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growingRequirements: { 
                      soilType: plantForm.growingRequirements?.soilType || 'Well-drained soil',
                      temperature: { 
                        min: parseFloat(e.target.value) || 0,
                        max: plantForm.growingRequirements?.temperature?.max || 30,
                        optimal: plantForm.growingRequirements?.temperature?.optimal || 24
                      },
                      humidity: plantForm.growingRequirements?.humidity || { min: 40, max: 70, optimal: 60 },
                      lightRequirements: plantForm.growingRequirements?.lightRequirements || 'full_sun',
                      lightHours: plantForm.growingRequirements?.lightHours || { min: 6, max: 8, optimal: 7 },
                      soilPh: plantForm.growingRequirements?.soilPh || { min: 6.0, max: 6.8, optimal: 6.5 },
                      waterRequirements: plantForm.growingRequirements?.waterRequirements || { level: 'moderate', daily: 2.5, frequency: 'daily' }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Max Temperature (°C)"
                  type="number"
                  value={plantForm.growingRequirements?.temperature?.max || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growingRequirements: { 
                      soilType: plantForm.growingRequirements?.soilType || 'Well-drained soil',
                      temperature: { 
                        min: plantForm.growingRequirements?.temperature?.min || 18,
                        max: parseFloat(e.target.value) || 0,
                        optimal: plantForm.growingRequirements?.temperature?.optimal || 24
                      },
                      humidity: plantForm.growingRequirements?.humidity || { min: 40, max: 70, optimal: 60 },
                      lightRequirements: plantForm.growingRequirements?.lightRequirements || 'full_sun',
                      lightHours: plantForm.growingRequirements?.lightHours || { min: 6, max: 8, optimal: 7 },
                      soilPh: plantForm.growingRequirements?.soilPh || { min: 6.0, max: 6.8, optimal: 6.5 },
                      waterRequirements: plantForm.growingRequirements?.waterRequirements || { level: 'moderate', daily: 2.5, frequency: 'daily' }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Optimal Temperature (°C)"
                  type="number"
                  value={plantForm.growingRequirements?.temperature?.optimal || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growingRequirements: { 
                      soilType: plantForm.growingRequirements?.soilType || 'Well-drained soil',
                      temperature: { 
                        min: plantForm.growingRequirements?.temperature?.min || 18,
                        max: plantForm.growingRequirements?.temperature?.max || 30,
                        optimal: parseFloat(e.target.value) || 0
                      },
                      humidity: plantForm.growingRequirements?.humidity || { min: 40, max: 70, optimal: 60 },
                      lightRequirements: plantForm.growingRequirements?.lightRequirements || 'full_sun',
                      lightHours: plantForm.growingRequirements?.lightHours || { min: 6, max: 8, optimal: 7 },
                      soilPh: plantForm.growingRequirements?.soilPh || { min: 6.0, max: 6.8, optimal: 6.5 },
                      waterRequirements: plantForm.growingRequirements?.waterRequirements || { level: 'moderate', daily: 2.5, frequency: 'daily' }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Water Daily (L)"
                  type="number"
                  value={plantForm.growingRequirements?.waterRequirements?.daily || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growingRequirements: { 
                      soilType: plantForm.growingRequirements?.soilType || 'Well-drained soil',
                      temperature: plantForm.growingRequirements?.temperature || { min: 18, max: 30, optimal: 24 },
                      humidity: plantForm.growingRequirements?.humidity || { min: 40, max: 70, optimal: 60 },
                      lightRequirements: plantForm.growingRequirements?.lightRequirements || 'full_sun',
                      lightHours: plantForm.growingRequirements?.lightHours || { min: 6, max: 8, optimal: 7 },
                      soilPh: plantForm.growingRequirements?.soilPh || { min: 6.0, max: 6.8, optimal: 6.5 },
                      waterRequirements: { 
                        level: plantForm.growingRequirements?.waterRequirements?.level || 'moderate',
                        daily: parseFloat(e.target.value) || 0,
                        frequency: plantForm.growingRequirements?.waterRequirements?.frequency || 'daily'
                      }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Water Level</InputLabel>
                  <Select
                    value={plantForm.growingRequirements?.waterRequirements?.level || 'moderate'}
                    onChange={(e) => setPlantForm({ 
                      ...plantForm, 
                      growingRequirements: { 
                        soilType: plantForm.growingRequirements?.soilType || 'Well-drained soil',
                        temperature: plantForm.growingRequirements?.temperature || { min: 18, max: 30, optimal: 24 },
                        humidity: plantForm.growingRequirements?.humidity || { min: 40, max: 70, optimal: 60 },
                        lightRequirements: plantForm.growingRequirements?.lightRequirements || 'full_sun',
                        lightHours: plantForm.growingRequirements?.lightHours || { min: 6, max: 8, optimal: 7 },
                        soilPh: plantForm.growingRequirements?.soilPh || { min: 6.0, max: 6.8, optimal: 6.5 },
                        waterRequirements: { 
                          level: e.target.value as any,
                          daily: plantForm.growingRequirements?.waterRequirements?.daily || 2.5,
                          frequency: plantForm.growingRequirements?.waterRequirements?.frequency || 'daily'
                        }
                      } 
                    })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* Growth Timeline Tab */}
          <Box sx={{ display: dialogTab === 2 ? 'block' : 'none' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Growth Timeline</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Germination Time (days)"
                  type="number"
                  value={plantForm.growthTimeline?.germinationTime || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growthTimeline: { 
                      germinationTime: parseInt(e.target.value) || 0,
                      daysToMaturity: plantForm.growthTimeline?.daysToMaturity || 115,
                      harvestWindow: plantForm.growthTimeline?.harvestWindow || 30,
                      seasonalPlanting: plantForm.growthTimeline?.seasonalPlanting || [],
                      germinationDays: plantForm.growthTimeline?.germinationDays || 7,
                      seedlingDays: plantForm.growthTimeline?.seedlingDays || 14,
                      vegetativeDays: plantForm.growthTimeline?.vegetativeDays || 35,
                      floweringDays: plantForm.growthTimeline?.floweringDays || 14,
                      fruitingDays: plantForm.growthTimeline?.fruitingDays || 45,
                      totalDays: plantForm.growthTimeline?.totalDays || 115
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Days to Maturity"
                  type="number"
                  value={plantForm.growthTimeline?.daysToMaturity || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growthTimeline: { 
                      germinationTime: plantForm.growthTimeline?.germinationTime || 7,
                      daysToMaturity: parseInt(e.target.value) || 0,
                      harvestWindow: plantForm.growthTimeline?.harvestWindow || 30,
                      seasonalPlanting: plantForm.growthTimeline?.seasonalPlanting || [],
                      germinationDays: plantForm.growthTimeline?.germinationDays || 7,
                      seedlingDays: plantForm.growthTimeline?.seedlingDays || 14,
                      vegetativeDays: plantForm.growthTimeline?.vegetativeDays || 35,
                      floweringDays: plantForm.growthTimeline?.floweringDays || 14,
                      fruitingDays: plantForm.growthTimeline?.fruitingDays || 45,
                      totalDays: plantForm.growthTimeline?.totalDays || 115
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Harvest Window (days)"
                  type="number"
                  value={plantForm.growthTimeline?.harvestWindow || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growthTimeline: { 
                      germinationTime: plantForm.growthTimeline?.germinationTime || 7,
                      daysToMaturity: plantForm.growthTimeline?.daysToMaturity || 115,
                      harvestWindow: parseInt(e.target.value) || 0,
                      seasonalPlanting: plantForm.growthTimeline?.seasonalPlanting || [],
                      germinationDays: plantForm.growthTimeline?.germinationDays || 7,
                      seedlingDays: plantForm.growthTimeline?.seedlingDays || 14,
                      vegetativeDays: plantForm.growthTimeline?.vegetativeDays || 35,
                      floweringDays: plantForm.growthTimeline?.floweringDays || 14,
                      fruitingDays: plantForm.growthTimeline?.fruitingDays || 45,
                      totalDays: plantForm.growthTimeline?.totalDays || 115
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Total Days"
                  type="number"
                  value={plantForm.growthTimeline?.totalDays || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    growthTimeline: { 
                      germinationTime: plantForm.growthTimeline?.germinationTime || 7,
                      daysToMaturity: plantForm.growthTimeline?.daysToMaturity || 115,
                      harvestWindow: plantForm.growthTimeline?.harvestWindow || 30,
                      seasonalPlanting: plantForm.growthTimeline?.seasonalPlanting || [],
                      germinationDays: plantForm.growthTimeline?.germinationDays || 7,
                      seedlingDays: plantForm.growthTimeline?.seedlingDays || 14,
                      vegetativeDays: plantForm.growthTimeline?.vegetativeDays || 35,
                      floweringDays: plantForm.growthTimeline?.floweringDays || 14,
                      fruitingDays: plantForm.growthTimeline?.fruitingDays || 45,
                      totalDays: parseInt(e.target.value) || 0
                    } 
                  })}
                />
              </Box>
            </Box>
          </Box>

          {/* Yield & Quality Tab */}
          <Box sx={{ display: dialogTab === 3 ? 'block' : 'none' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Yield & Quality Information</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Yield per Plant"
                  type="number"
                  value={plantForm.yieldInfo?.expectedYieldPerPlant || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    yieldInfo: { 
                      expectedYieldPerPlant: parseFloat(e.target.value) || 0,
                      yieldPerSquareMeter: plantForm.yieldInfo?.yieldPerSquareMeter || 8.5,
                      yieldUnit: plantForm.yieldInfo?.yieldUnit || 'kg',
                      harvestWindow: plantForm.yieldInfo?.harvestWindow || 30,
                      shelfLife: plantForm.yieldInfo?.shelfLife || 14,
                      qualityMetrics: plantForm.yieldInfo?.qualityMetrics || { size: 'Standard size', color: 'Natural color', texture: 'Firm texture', brix: 5.0 }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Yield per m²"
                  type="number"
                  value={plantForm.yieldInfo?.yieldPerSquareMeter || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    yieldInfo: { 
                      expectedYieldPerPlant: plantForm.yieldInfo?.expectedYieldPerPlant || 3.5,
                      yieldPerSquareMeter: parseFloat(e.target.value) || 0,
                      yieldUnit: plantForm.yieldInfo?.yieldUnit || 'kg',
                      harvestWindow: plantForm.yieldInfo?.harvestWindow || 30,
                      shelfLife: plantForm.yieldInfo?.shelfLife || 14,
                      qualityMetrics: plantForm.yieldInfo?.qualityMetrics || { size: 'Standard size', color: 'Natural color', texture: 'Firm texture', brix: 5.0 }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Shelf Life (days)"
                  type="number"
                  value={plantForm.yieldInfo?.shelfLife || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    yieldInfo: { 
                      expectedYieldPerPlant: plantForm.yieldInfo?.expectedYieldPerPlant || 3.5,
                      yieldPerSquareMeter: plantForm.yieldInfo?.yieldPerSquareMeter || 8.5,
                      yieldUnit: plantForm.yieldInfo?.yieldUnit || 'kg',
                      harvestWindow: plantForm.yieldInfo?.harvestWindow || 30,
                      shelfLife: parseInt(e.target.value) || 0,
                      qualityMetrics: plantForm.yieldInfo?.qualityMetrics || { size: 'Standard size', color: 'Natural color', texture: 'Firm texture', brix: 5.0 }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Quality Size"
                  value={plantForm.yieldInfo?.qualityMetrics?.size || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    yieldInfo: { 
                      expectedYieldPerPlant: plantForm.yieldInfo?.expectedYieldPerPlant || 3.5,
                      yieldPerSquareMeter: plantForm.yieldInfo?.yieldPerSquareMeter || 8.5,
                      yieldUnit: plantForm.yieldInfo?.yieldUnit || 'kg',
                      harvestWindow: plantForm.yieldInfo?.harvestWindow || 30,
                      shelfLife: plantForm.yieldInfo?.shelfLife || 14,
                      qualityMetrics: { 
                        size: e.target.value,
                        color: plantForm.yieldInfo?.qualityMetrics?.color || 'Natural color',
                        texture: plantForm.yieldInfo?.qualityMetrics?.texture || 'Firm texture',
                        brix: plantForm.yieldInfo?.qualityMetrics?.brix || 5.0
                      }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Quality Color"
                  value={plantForm.yieldInfo?.qualityMetrics?.color || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    yieldInfo: { 
                      expectedYieldPerPlant: plantForm.yieldInfo?.expectedYieldPerPlant || 3.5,
                      yieldPerSquareMeter: plantForm.yieldInfo?.yieldPerSquareMeter || 8.5,
                      yieldUnit: plantForm.yieldInfo?.yieldUnit || 'kg',
                      harvestWindow: plantForm.yieldInfo?.harvestWindow || 30,
                      shelfLife: plantForm.yieldInfo?.shelfLife || 14,
                      qualityMetrics: { 
                        size: plantForm.yieldInfo?.qualityMetrics?.size || 'Standard size',
                        color: e.target.value,
                        texture: plantForm.yieldInfo?.qualityMetrics?.texture || 'Firm texture',
                        brix: plantForm.yieldInfo?.qualityMetrics?.brix || 5.0
                      }
                    } 
                  })}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Brix Level (%)"
                  type="number"
                  value={plantForm.yieldInfo?.qualityMetrics?.brix || ''}
                  onChange={(e) => setPlantForm({ 
                    ...plantForm, 
                    yieldInfo: { 
                      expectedYieldPerPlant: plantForm.yieldInfo?.expectedYieldPerPlant || 3.5,
                      yieldPerSquareMeter: plantForm.yieldInfo?.yieldPerSquareMeter || 8.5,
                      yieldUnit: plantForm.yieldInfo?.yieldUnit || 'kg',
                      harvestWindow: plantForm.yieldInfo?.harvestWindow || 30,
                      shelfLife: plantForm.yieldInfo?.shelfLife || 14,
                      qualityMetrics: { 
                        size: plantForm.yieldInfo?.qualityMetrics?.size || 'Standard size',
                        color: plantForm.yieldInfo?.qualityMetrics?.color || 'Natural color',
                        texture: plantForm.yieldInfo?.qualityMetrics?.texture || 'Firm texture',
                        brix: parseFloat(e.target.value) || 0
                      }
                    } 
                  })}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlantDialogOpen(false)}>Cancel</Button>
          <Button onClick={selectedPlant ? handleUpdatePlant : handleCreatePlant} variant="contained">
            {selectedPlant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* System Status Section */}
      <Card sx={{ 
        background: `linear-gradient(135deg, ${themeUtils.colors.surface} 0%, ${themeUtils.colors.background} 100%)`,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="success" />
            Plant Data System Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Data Integrity</Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: themeUtils.colors.success,
                  }
                }} 
              />
              <Typography variant="caption" sx={{ color: themeUtils.colors.success, mt: 0.5, display: 'block' }}>All Data Valid</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Schedule Coverage</Typography>
              <LinearProgress 
                variant="determinate" 
                value={85} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: themeUtils.colors.success,
                  }
                }} 
              />
              <Typography variant="caption" sx={{ color: themeUtils.colors.success, mt: 0.5, display: 'block' }}>85% Complete</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Growth Tracking</Typography>
              <LinearProgress 
                variant="determinate" 
                value={92} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: themeUtils.colors.success,
                  }
                }} 
              />
              <Typography variant="caption" sx={{ color: themeUtils.colors.success, mt: 0.5, display: 'block' }}>Excellent</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* JSON Import Dialog */}
      <Dialog open={jsonImportDialogOpen} onClose={() => setJsonImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Plant Data from JSON</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste your JSON data below. You can import a single plant object or an array of plants.
          </Typography>
          
          {jsonParseError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {jsonParseError}
            </Alert>
          )}
          
          <TextField
            multiline
            rows={12}
            fullWidth
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON data here..."
            variant="outlined"
            sx={{ fontFamily: 'monospace' }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Example: {"{"}"name": "Tomato", "scientificName": "Solanum lycopersicum", ...{"}"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonImportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleJsonImport} variant="outlined">
            Preview & Edit
          </Button>
          <Button onClick={handleJsonImportMultiple} variant="contained">
            Import Directly
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

export default PlantDataPage;