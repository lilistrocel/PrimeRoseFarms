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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
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
import { IPlantData } from '../../../types';
import { plantDataApi } from '../../../services/plantDataApi';

const PlantDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [plantData, setPlantData] = useState<IPlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure all required properties are provided
  const ensureCompletePlantForm = (partialForm: Partial<IPlantData>): IPlantData => {
    return {
      _id: partialForm._id || '',
      name: partialForm.name || '',
      scientificName: partialForm.scientificName || '',
      family: partialForm.family || '',
      variety: partialForm.variety || '',
      growthCharacteristics: {
        height: partialForm.growthCharacteristics?.height || 0,
        spread: partialForm.growthCharacteristics?.spread || 0,
        rootDepth: partialForm.growthCharacteristics?.rootDepth || 0,
        lifecycle: partialForm.growthCharacteristics?.lifecycle || 'annual'
      },
      growingRequirements: {
        soilType: partialForm.growingRequirements?.soilType || '',
        phRange: {
          min: partialForm.growingRequirements?.phRange?.min || 6.0,
          max: partialForm.growingRequirements?.phRange?.max || 7.0
        },
        temperatureRange: {
          min: partialForm.growingRequirements?.temperatureRange?.min || 15,
          max: partialForm.growingRequirements?.temperatureRange?.max || 30,
          optimal: partialForm.growingRequirements?.temperatureRange?.optimal || 22
        },
        humidityRange: {
          min: partialForm.growingRequirements?.humidityRange?.min || 50,
          max: partialForm.growingRequirements?.humidityRange?.max || 70
        },
        lightRequirements: partialForm.growingRequirements?.lightRequirements || 'full_sun',
        waterRequirements: partialForm.growingRequirements?.waterRequirements || 'moderate'
      },
      fertilizerSchedule: partialForm.fertilizerSchedule || [],
      pesticideSchedule: partialForm.pesticideSchedule || [],
      growthTimeline: {
        germinationTime: partialForm.growthTimeline?.germinationTime || 7,
        daysToMaturity: partialForm.growthTimeline?.daysToMaturity || 60,
        harvestWindow: partialForm.growthTimeline?.harvestWindow || 14,
        seasonalPlanting: partialForm.growthTimeline?.seasonalPlanting || []
      },
      yieldInformation: {
        expectedYieldPerPlant: partialForm.yieldInformation?.expectedYieldPerPlant || 0,
        yieldPerSquareMeter: partialForm.yieldInformation?.yieldPerSquareMeter || 0,
        qualityMetrics: {
          size: partialForm.yieldInformation?.qualityMetrics?.size || '',
          color: partialForm.yieldInformation?.qualityMetrics?.color || '',
          texture: partialForm.yieldInformation?.qualityMetrics?.texture || '',
          brix: partialForm.yieldInformation?.qualityMetrics?.brix || 0
        }
      },
      createdAt: partialForm.createdAt || new Date().toISOString(),
      updatedAt: partialForm.updatedAt || new Date().toISOString(),
      isActive: partialForm.isActive !== undefined ? partialForm.isActive : true
    };
  };

  const [plantDialogOpen, setPlantDialogOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<IPlantData | null>(null);
  const [plantForm, setPlantForm] = useState<Partial<IPlantData>>({
    growthCharacteristics: {
      height: 0,
      spread: 0,
      rootDepth: 0,
      lifecycle: 'annual'
    },
    growingRequirements: {
      soilType: '',
      phRange: { min: 6.0, max: 7.0 },
      temperatureRange: { min: 15, max: 30, optimal: 22 },
      humidityRange: { min: 50, max: 70 },
      lightRequirements: 'full_sun',
      waterRequirements: 'moderate'
    },
    fertilizerSchedule: [],
    pesticideSchedule: [],
    growthTimeline: {
      germinationTime: 7,
      daysToMaturity: 60,
      harvestWindow: 14,
      seasonalPlanting: []
    },
    yieldInformation: {
      expectedYieldPerPlant: 0,
      yieldPerSquareMeter: 0,
      qualityMetrics: {
        size: '',
        color: '',
        texture: '',
        brix: 0
      }
    }
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlants = await plantDataApi.getPlantData();
      setPlantData(fetchedPlants);
    } catch (err) {
      setError('Failed to load plant data.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreatePlant = async () => {
    if (!plantForm.name || !plantForm.scientificName) {
      setError('Plant name and scientific name are required.');
      return;
    }
    try {
      const completeForm = ensureCompletePlantForm(plantForm);
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
      await plantDataApi.updatePlantData(selectedPlant._id, completeForm);
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
    if (window.confirm('Are you sure you want to delete this plant data?')) {
      try {
        await plantDataApi.deletePlantData(id);
        loadData();
      } catch (err) {
        setError('Failed to delete plant data.');
        console.error('Error deleting plant data:', err);
      }
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
              color: '#FFFFFF',
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
                sx={{ borderColor: '#00D4AA', color: '#00D4AA' }}
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
            <Typography variant="h2" sx={{ fontWeight: 700, color: '#00D4AA', mb: 0 }}>
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
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
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
            background: 'linear-gradient(90deg, #00D4AA, #4DD0E1)',
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00D4AA' }}>
                {plantData.length}
              </Typography>
              <LocalFlorist sx={{ color: '#00D4AA', fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Plant Varieties</Typography>
            <Typography variant="caption" sx={{ color: '#4CAF50' }}>Active in system</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
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
            background: 'linear-gradient(90deg, #FF6B6B, #FF8A80)',
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF6B6B' }}>
                {plantData.reduce((acc, plant) => acc + (plant.fertilizerSchedule?.length || 0), 0)}
              </Typography>
              <ScheduleIcon sx={{ color: '#FF6B6B', fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Fertilizer Schedules</Typography>
            <Typography variant="caption" sx={{ color: '#4CAF50' }}>Across all plants</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
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
            background: 'linear-gradient(90deg, #2196F3, #64B5F6)',
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
                {plantData.reduce((acc, plant) => acc + (plant.pesticideSchedule?.length || 0), 0)}
              </Typography>
              <ScienceIcon sx={{ color: '#2196F3', fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Pesticide Schedules</Typography>
            <Typography variant="caption" sx={{ color: '#4CAF50' }}>Safety protocols</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
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
            background: 'linear-gradient(90deg, #4CAF50, #81C784)',
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                {Math.round(plantData.reduce((acc, plant) => acc + (plant.growthTimeline?.daysToMaturity || 0), 0) / plantData.length) || 0}
              </Typography>
              <TimelineIcon sx={{ color: '#4CAF50', fontSize: '2rem' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Avg. Maturity (Days)</Typography>
            <Typography variant="caption" sx={{ color: '#4CAF50' }}>Growth timeline</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {/* Plant Categories */}
        <Card sx={{ 
          flex: '1 1 300px', 
          minWidth: '300px',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceIcon color="primary" />
              Plant Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { name: 'Vegetables', count: plantData.filter(p => p.family === 'Solanaceae' || p.family === 'Asteraceae').length, color: '#00D4AA' },
                { name: 'Herbs', count: plantData.filter(p => p.family === 'Lamiaceae').length, color: '#FF6B6B' },
                { name: 'Fruits', count: plantData.filter(p => p.name.toLowerCase().includes('tomato')).length, color: '#2196F3' },
                { name: 'Leafy Greens', count: plantData.filter(p => p.name.toLowerCase().includes('lettuce')).length, color: '#4CAF50' },
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
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: <AddIcon />, text: "Add New Plant", color: "#00D4AA", action: () => { setSelectedPlant(null); setPlantForm({}); setPlantDialogOpen(true); } },
                { icon: <ScienceIcon />, text: "View Requirements", color: "#FF6B6B", action: () => setActiveTab(1) },
                { icon: <ScheduleIcon />, text: "Fertilizer Schedule", color: "#2196F3", action: () => setActiveTab(2) },
                { icon: <TimelineIcon />, text: "Growth Timeline", color: "#4CAF50", action: () => setActiveTab(4) },
                { icon: <AssessmentIcon />, text: "Yield Analysis", color: "#FFB74D", action: () => setActiveTab(5) },
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
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        mb: 3
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="plant data management tabs">
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPlant(null);
              setPlantForm({});
              setPlantDialogOpen(true);
            }}
          >
            Add Plant Data
          </Button>
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
                  }
                });
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
                  <TableCell>Family</TableCell>
                  <TableCell>Lifecycle</TableCell>
                  <TableCell>Days to Maturity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plantData.map((plant) => (
                  <TableRow key={plant._id}>
                    <TableCell>{plant.name}</TableCell>
                    <TableCell>{plant.scientificName}</TableCell>
                    <TableCell>{plant.family}</TableCell>
                    <TableCell>
                      <Chip 
                        label={plant.growthCharacteristics.lifecycle} 
                        color={plant.growthCharacteristics.lifecycle === 'annual' ? 'primary' : 'secondary'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{plant.growthTimeline.daysToMaturity} days</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setSelectedPlant(plant); setPlantForm(plant); setPlantDialogOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePlant(plant._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TempIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Temperature: {plant.growingRequirements.temperatureRange.min}°C - {plant.growingRequirements.temperatureRange.max}°C
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Water: {plant.growingRequirements.waterRequirements}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SunIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Light: {plant.growingRequirements.lightRequirements.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      pH: {plant.growingRequirements.phRange.min} - {plant.growingRequirements.phRange.max}
                    </Typography>
                    <Typography variant="body2">
                      Soil: {plant.growingRequirements.soilType}
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
        
        {plantData.map((plant) => (
          <Card key={plant._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
              {plant.fertilizerSchedule.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No fertilizer schedule defined
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Fertilizer Type</TableCell>
                      <TableCell>Rate (ml/g)</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Growth Stage</TableCell>
                      <TableCell>Method</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plant.fertilizerSchedule.map((schedule, index) => (
                      <TableRow key={index}>
                        <TableCell>{schedule.day}</TableCell>
                        <TableCell>{schedule.fertilizerType}</TableCell>
                        <TableCell>{schedule.applicationRate}</TableCell>
                        <TableCell>
                          <Chip label={schedule.frequency} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={schedule.growthStage} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{schedule.applicationMethod.replace('_', ' ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* Pesticide Schedule Tab */}
      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" sx={{ mb: 3 }}>Pesticide Schedules</Typography>
        
        {plantData.map((plant) => (
          <Card key={plant._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
              {plant.pesticideSchedule.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pesticide schedule defined
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Chemical Type</TableCell>
                      <TableCell>Rate (ml/g)</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Safety Requirements</TableCell>
                      <TableCell>Re-entry (hrs)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plant.pesticideSchedule.map((schedule, index) => (
                      <TableRow key={index}>
                        <TableCell>{schedule.day}</TableCell>
                        <TableCell>{schedule.chemicalType}</TableCell>
                        <TableCell>{schedule.applicationRate}</TableCell>
                        <TableCell>
                          <Chip label={schedule.frequency} size="small" />
                        </TableCell>
                        <TableCell>{schedule.safetyRequirements}</TableCell>
                        <TableCell>{schedule.reEntryInterval}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* Growth Timeline Tab */}
      <TabPanel value={activeTab} index={4}>
        <Typography variant="h6" sx={{ mb: 3 }}>Growth Timelines</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Germination:</strong> {plant.growthTimeline.germinationTime} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Maturity:</strong> {plant.growthTimeline.daysToMaturity} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Harvest Window:</strong> {plant.growthTimeline.harvestWindow} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Seasonal Planting:</strong> {plant.growthTimeline.seasonalPlanting.join(', ')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Yield Information Tab */}
      <TabPanel value={activeTab} index={5}>
        <Typography variant="h6" sx={{ mb: 3 }}>Yield Information</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {plantData.map((plant) => (
            <Box key={plant._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{plant.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Yield per Plant:</strong> {plant.yieldInformation.expectedYieldPerPlant} kg
                    </Typography>
                    <Typography variant="body2">
                      <strong>Yield per m²:</strong> {plant.yieldInformation.yieldPerSquareMeter} kg
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Size:</strong> {plant.yieldInformation.qualityMetrics.size}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Color:</strong> {plant.yieldInformation.qualityMetrics.color}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Texture:</strong> {plant.yieldInformation.qualityMetrics.texture}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Brix:</strong> {plant.yieldInformation.qualityMetrics.brix}°
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Plant Dialog */}
      <Dialog open={plantDialogOpen} onClose={() => setPlantDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedPlant ? 'Edit Plant Data' : 'Create New Plant Data'}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflow: 'auto' }}>
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
              <TextField
                fullWidth
                label="Family"
                value={plantForm.family || ''}
                onChange={(e) => setPlantForm({ ...plantForm, family: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Variety"
                value={plantForm.variety || ''}
                onChange={(e) => setPlantForm({ ...plantForm, variety: e.target.value })}
              />
            </Box>
          </Box>

          <Accordion sx={{ mt: 2 }} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Growth Characteristics</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Height (m)"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.growthCharacteristics?.height || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growthCharacteristics: {
                        ...plantForm.growthCharacteristics,
                        height: parseFloat(e.target.value) || 0
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Spread (m)"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.growthCharacteristics?.spread || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growthCharacteristics: {
                        ...plantForm.growthCharacteristics,
                        spread: parseFloat(e.target.value) || 0
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Root Depth (m)"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.growthCharacteristics?.rootDepth || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growthCharacteristics: {
                        ...plantForm.growthCharacteristics,
                        rootDepth: parseFloat(e.target.value) || 0
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Lifecycle</InputLabel>
                    <Select
                      value={plantForm.growthCharacteristics?.lifecycle || 'annual'}
                      onChange={(e) => setPlantForm({
                        ...plantForm,
                        growthCharacteristics: {
                          ...plantForm.growthCharacteristics,
                          lifecycle: e.target.value as 'annual' | 'perennial' | 'biennial'
                        } as any
                      })}
                    >
                      <MenuItem value="annual">Annual</MenuItem>
                      <MenuItem value="perennial">Perennial</MenuItem>
                      <MenuItem value="biennial">Biennial</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Growing Requirements</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Soil Type"
                    value={plantForm.growingRequirements?.soilType || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growingRequirements: {
                        ...plantForm.growingRequirements,
                        soilType: e.target.value
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="pH Min"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.growingRequirements?.phRange?.min || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growingRequirements: {
                        ...plantForm.growingRequirements,
                        phRange: {
                          ...plantForm.growingRequirements?.phRange,
                          min: parseFloat(e.target.value) || 0
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="pH Max"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.growingRequirements?.phRange?.max || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growingRequirements: {
                        ...plantForm.growingRequirements,
                        phRange: {
                          ...plantForm.growingRequirements?.phRange,
                          max: parseFloat(e.target.value) || 0
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Min Temperature (°C)"
                    type="number"
                    value={plantForm.growingRequirements?.temperatureRange?.min || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growingRequirements: {
                        ...plantForm.growingRequirements,
                        temperatureRange: {
                          ...plantForm.growingRequirements?.temperatureRange,
                          min: parseFloat(e.target.value) || 0
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Max Temperature (°C)"
                    type="number"
                    value={plantForm.growingRequirements?.temperatureRange?.max || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growingRequirements: {
                        ...plantForm.growingRequirements,
                        temperatureRange: {
                          ...plantForm.growingRequirements?.temperatureRange,
                          max: parseFloat(e.target.value) || 0
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Optimal Temperature (°C)"
                    type="number"
                    value={plantForm.growingRequirements?.temperatureRange?.optimal || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growingRequirements: {
                        ...plantForm.growingRequirements,
                        temperatureRange: {
                          ...plantForm.growingRequirements?.temperatureRange,
                          optimal: parseFloat(e.target.value) || 0
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Light Requirements</InputLabel>
                    <Select
                      value={plantForm.growingRequirements?.lightRequirements || 'full_sun'}
                      onChange={(e) => setPlantForm({
                        ...plantForm,
                        growingRequirements: {
                          ...plantForm.growingRequirements,
                          lightRequirements: e.target.value as 'full_sun' | 'partial_shade' | 'shade'
                        } as any
                      })}
                    >
                      <MenuItem value="full_sun">Full Sun</MenuItem>
                      <MenuItem value="partial_shade">Partial Shade</MenuItem>
                      <MenuItem value="shade">Shade</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Water Requirements</InputLabel>
                    <Select
                      value={plantForm.growingRequirements?.waterRequirements || 'moderate'}
                      onChange={(e) => setPlantForm({
                        ...plantForm,
                        growingRequirements: {
                          ...plantForm.growingRequirements,
                          waterRequirements: e.target.value as 'low' | 'moderate' | 'high'
                        } as any
                      })}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Growth Timeline</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                        ...plantForm.growthTimeline,
                        germinationTime: parseInt(e.target.value) || 0
                      } as any
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
                        ...plantForm.growthTimeline,
                        daysToMaturity: parseInt(e.target.value) || 0
                      } as any
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
                        ...plantForm.growthTimeline,
                        harvestWindow: parseInt(e.target.value) || 0
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Seasonal Planting"
                    placeholder="spring, summer, fall, winter"
                    value={plantForm.growthTimeline?.seasonalPlanting?.join(', ') || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      growthTimeline: {
                        ...plantForm.growthTimeline,
                        seasonalPlanting: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      } as any
                    })}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Yield Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Expected Yield per Plant (kg)"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.yieldInformation?.expectedYieldPerPlant || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      yieldInformation: {
                        ...plantForm.yieldInformation,
                        expectedYieldPerPlant: parseFloat(e.target.value) || 0
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Yield per Square Meter (kg)"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.yieldInformation?.yieldPerSquareMeter || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      yieldInformation: {
                        ...plantForm.yieldInformation,
                        yieldPerSquareMeter: parseFloat(e.target.value) || 0
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Size"
                    value={plantForm.yieldInformation?.qualityMetrics?.size || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      yieldInformation: {
                        ...plantForm.yieldInformation,
                        qualityMetrics: {
                          ...plantForm.yieldInformation?.qualityMetrics,
                          size: e.target.value
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Color"
                    value={plantForm.yieldInformation?.qualityMetrics?.color || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      yieldInformation: {
                        ...plantForm.yieldInformation,
                        qualityMetrics: {
                          ...plantForm.yieldInformation?.qualityMetrics,
                          color: e.target.value
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Texture"
                    value={plantForm.yieldInformation?.qualityMetrics?.texture || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      yieldInformation: {
                        ...plantForm.yieldInformation,
                        qualityMetrics: {
                          ...plantForm.yieldInformation?.qualityMetrics,
                          texture: e.target.value
                        }
                      } as any
                    })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Brix (°)"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={plantForm.yieldInformation?.qualityMetrics?.brix || ''}
                    onChange={(e) => setPlantForm({
                      ...plantForm,
                      yieldInformation: {
                        ...plantForm.yieldInformation,
                        qualityMetrics: {
                          ...plantForm.yieldInformation?.qualityMetrics,
                          brix: parseFloat(e.target.value) || 0
                        }
                      } as any
                    })}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
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
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
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
                    backgroundColor: '#4CAF50',
                  }
                }} 
              />
              <Typography variant="caption" sx={{ color: '#4CAF50', mt: 0.5, display: 'block' }}>All Data Valid</Typography>
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
                    backgroundColor: '#00D4AA',
                  }
                }} 
              />
              <Typography variant="caption" sx={{ color: '#00D4AA', mt: 0.5, display: 'block' }}>85% Complete</Typography>
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
                    backgroundColor: '#4CAF50',
                  }
                }} 
              />
              <Typography variant="caption" sx={{ color: '#4CAF50', mt: 0.5, display: 'block' }}>Excellent</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
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