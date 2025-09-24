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
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../store';
import { 
  farmManagementApi, 
  IFarm, 
  IBlock, 
  IPlant, 
  IPerformanceDashboard, 
  IBlockOptimization 
} from '../../../services/farmManagementApi';

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
  const user = useAppSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState(0);
  const [farms, setFarms] = useState<IFarm[]>([]);
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const [plants, setPlants] = useState<IPlant[]>([]);
  const [performanceData, setPerformanceData] = useState<IPerformanceDashboard | null>(null);
  const [optimizationData, setOptimizationData] = useState<IBlockOptimization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<IFarm | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<IBlock | null>(null);
  
  // Form states
  const [farmForm, setFarmForm] = useState<Partial<IFarm>>({
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
      establishedDate: '',
      farmType: 'organic',
      certification: [],
      climate: 'temperate',
      soilType: 'loamy'
    },
    blocks: {
      total: 0,
      active: 0,
      available: 0,
      inUse: 0,
      maintenance: 0
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
      
      setFarms(farmsData);
      setBlocks(blocksData);
      setPlants(plantsData);
      setPerformanceData(performanceData);
      setOptimizationData(optimizationData);
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
      await farmManagementApi.createFarm(farmForm as Omit<IFarm, '_id' | 'createdAt' | 'updatedAt'>);
      setFarmDialogOpen(false);
      setFarmForm({});
      loadData();
    } catch (err) {
      setError('Failed to create farm');
      console.error('Error creating farm:', err);
    }
  };

  const handleUpdateFarm = async () => {
    if (!selectedFarm) return;
    
    try {
      await farmManagementApi.updateFarm(selectedFarm._id, farmForm);
      setFarmDialogOpen(false);
      setSelectedFarm(null);
      setFarmForm({});
      loadData();
    } catch (err) {
      setError('Failed to update farm');
      console.error('Error updating farm:', err);
    }
  };

  // Block management handlers
  const handleCreateBlock = async () => {
    try {
      await farmManagementApi.createBlock(blockForm as Omit<IBlock, '_id' | 'createdAt' | 'updatedAt'>);
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
    
    try {
      await farmManagementApi.updateBlock(selectedBlock._id, blockForm);
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
      await farmManagementApi.assignPlantToBlock(
        assignmentForm.blockId,
        assignmentForm.plantDataId,
        assignmentForm.plantCount,
        assignmentForm.plantingDate
      );
      setAssignmentDialogOpen(false);
      setAssignmentForm({ blockId: '', plantDataId: '', plantCount: 0, plantingDate: '' });
      loadData();
    } catch (err) {
      setError('Failed to assign plant to block');
      console.error('Error assigning plant:', err);
    }
  };

  // For now, show all farms and blocks (filtering can be implemented later)
  const filteredFarms = farms;
  const filteredBlocks = blocks;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'growing': return 'success';
      case 'available': return 'info';
      case 'harvesting': return 'warning';
      case 'maintenance': return 'error';
      case 'inactive': return 'default';
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FarmIcon />
          Farm Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome, {user?.firstName} {user?.lastName}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="farm management tabs">
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
              setFarmForm({});
              setFarmDialogOpen(true);
            }}
          >
            Add Farm
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredFarms.map((farm) => (
            <Box key={farm._id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
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
                    {farm.location?.city || 'N/A'}, {farm.location?.state || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {farm.specifications?.totalArea || 0} hectares • {farm.specifications?.farmType || 'N/A'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Blocks
                      </Typography>
                      <Typography variant="h6">
                        {farm.blocks?.total || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Active
                      </Typography>
                      <Typography variant="h6">
                        {farm.blocks?.active || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Available
                      </Typography>
                      <Typography variant="h6">
                        {farm.blocks?.available || 0}
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
                    {block.currentPlant ? (
                      <Box>
                        <Typography variant="body2">{block.currentPlant.plantName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {block.currentPlant.plantCount} plants
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No plant assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedBlock(block);
                        setBlockForm(block);
                        setBlockDialogOpen(true);
                      }}
                    >
                      <EditIcon />
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
                    {performanceData.totalBlocks}
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
                    {performanceData.activeBlocks}
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
                    {performanceData.totalYield.toLocaleString()}
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
                    ${performanceData.totalRevenue.toLocaleString()}
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
          {optimizationData.map((optimization) => (
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
          ))}
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
                    {performanceData.totalBlocks}
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
                    {performanceData.activeBlocks}
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
                    {performanceData.totalYield.toLocaleString()} kg
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
                    ${performanceData.totalRevenue.toLocaleString()}
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
      <Dialog open={farmDialogOpen} onClose={() => setFarmDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFarm ? 'Edit Farm' : 'Create New Farm'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Farm Name"
                value={farmForm.name || ''}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
              />
            </Box>
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
                    establishedDate: farmForm.specifications?.establishedDate || '',
                    farmType: farmForm.specifications?.farmType || 'organic',
                    certification: farmForm.specifications?.certification || [],
                    climate: farmForm.specifications?.climate || 'temperate',
                    soilType: farmForm.specifications?.soilType || 'loamy'
                  }
                })}
              />
            </Box>
          </Box>
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
              <FormControl fullWidth>
                <InputLabel>Farm</InputLabel>
                <Select
                  value={blockForm.farmId || ''}
                  onChange={(e) => setBlockForm({ ...blockForm, farmId: e.target.value })}
                >
                  {farms.map((farm) => (
                    <MenuItem key={farm._id} value={farm._id}>
                      {farm.name}
                    </MenuItem>
                  ))}
                </Select>
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
                onChange={(e) => setBlockForm({
                  ...blockForm,
                  dimensions: { 
                    ...blockForm.dimensions,
                    length: parseFloat(e.target.value) || 0,
                    width: blockForm.dimensions?.width || 0,
                    area: blockForm.dimensions?.area || 0
                  }
                })}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Width (meters)"
                type="number"
                value={blockForm.dimensions?.width || ''}
                onChange={(e) => setBlockForm({
                  ...blockForm,
                  dimensions: { 
                    ...blockForm.dimensions,
                    length: blockForm.dimensions?.length || 0,
                    width: parseFloat(e.target.value) || 0,
                    area: blockForm.dimensions?.area || 0
                  }
                })}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Area (m²)"
                type="number"
                value={blockForm.dimensions?.area || ''}
                onChange={(e) => setBlockForm({
                  ...blockForm,
                  dimensions: { 
                    ...blockForm.dimensions,
                    length: blockForm.dimensions?.length || 0,
                    width: blockForm.dimensions?.width || 0,
                    area: parseFloat(e.target.value) || 0
                  }
                })}
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
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Plant to Block</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>Block</InputLabel>
                <Select
                  value={assignmentForm.blockId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, blockId: e.target.value })}
                >
                  {blocks.filter(b => b.status === 'available').map((block) => (
                    <MenuItem key={block._id} value={block._id}>
                      {block.name} ({farms.find(f => f._id === block.farmId)?.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>Plant</InputLabel>
                <Select
                  value={assignmentForm.plantDataId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, plantDataId: e.target.value })}
                >
                  {plants.map((plant) => (
                    <MenuItem key={plant._id} value={plant._id}>
                      {plant.name} ({plant.variety})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Plant Count"
                type="number"
                value={assignmentForm.plantCount}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, plantCount: parseInt(e.target.value) })}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Planting Date"
                type="date"
                value={assignmentForm.plantingDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, plantingDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignPlant} variant="contained">
            Assign Plant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FarmManagementPage;