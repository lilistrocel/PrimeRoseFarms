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
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  Work as LaborIcon,
  Build as InfrastructureIcon,
  Inventory as MaterialIcon,
  LocalShipping as LogisticsIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../store';
import { ICostsData } from '../../../types';
import { costManagementApi } from '../../../services/costManagementApi';

const CostManagementPage: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState(0);
  const [costsData, setCostsData] = useState<ICostsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure all required properties are provided
  const ensureCompleteCostForm = (partialForm: Partial<ICostsData>): ICostsData => {
    return {
      _id: partialForm._id || '',
      farmId: partialForm.farmId || '',
      managerId: partialForm.managerId || '',
      laborRates: {
        base: {
          plantingPerPlant: partialForm.laborRates?.base?.plantingPerPlant || 0,
          harvestPerKg: partialForm.laborRates?.base?.harvestPerKg || 0,
          maintenancePerHour: partialForm.laborRates?.base?.maintenancePerHour || 0,
          irrigationPerHour: partialForm.laborRates?.base?.irrigationPerHour || 0,
          fertilizingPerHour: partialForm.laborRates?.base?.fertilizingPerHour || 0
        },
        overtime: {
          multiplier: partialForm.laborRates?.overtime?.multiplier || 1.5,
          threshold: partialForm.laborRates?.overtime?.threshold || 8
        },
        seasonal: {
          peakSeasonMultiplier: partialForm.laborRates?.seasonal?.peakSeasonMultiplier || 1.2,
          peakMonths: partialForm.laborRates?.seasonal?.peakMonths || []
        },
        skillPremiums: partialForm.laborRates?.skillPremiums || {}
      },
      infrastructure: {
        land: {
          rentPerHectare: partialForm.infrastructure?.land?.rentPerHectare || 0,
          propertyTaxes: partialForm.infrastructure?.land?.propertyTaxes || 0,
          insurance: partialForm.infrastructure?.land?.insurance || 0
        },
        utilities: {
          waterPerCubicMeter: partialForm.infrastructure?.utilities?.waterPerCubicMeter || 0,
          electricityPerKwh: partialForm.infrastructure?.utilities?.electricityPerKwh || 0,
          fuelPerLiter: partialForm.infrastructure?.utilities?.fuelPerLiter || 0,
          internetMonthly: partialForm.infrastructure?.utilities?.internetMonthly || 0
        },
        equipment: {
          depreciationRate: partialForm.infrastructure?.equipment?.depreciationRate || 0.15,
          maintenanceRate: partialForm.infrastructure?.equipment?.maintenanceRate || 0.05,
          insuranceRate: partialForm.infrastructure?.equipment?.insuranceRate || 0.02
        }
      },
      materials: {
        fertilizer: {
          basePricePerKg: partialForm.materials?.fertilizer?.basePricePerKg || 0,
          bulkDiscounts: partialForm.materials?.fertilizer?.bulkDiscounts || []
        },
        pesticides: {
          basePricePerLiter: partialForm.materials?.pesticides?.basePricePerLiter || 0,
          applicationCostPerLiter: partialForm.materials?.pesticides?.applicationCostPerLiter || 0
        },
        seeds: {
          basePricePerKg: partialForm.materials?.seeds?.basePricePerKg || 0,
          qualityPremium: partialForm.materials?.seeds?.qualityPremium || 0
        },
        packaging: {
          containerCost: partialForm.materials?.packaging?.containerCost || 0,
          labelingCost: partialForm.materials?.packaging?.labelingCost || 0
        }
      },
      logistics: {
        fleet: {
          vehicleCostPerKm: partialForm.logistics?.fleet?.vehicleCostPerKm || 0,
          fuelCostPerLiter: partialForm.logistics?.fleet?.fuelCostPerLiter || 0,
          maintenanceCostPerKm: partialForm.logistics?.fleet?.maintenanceCostPerKm || 0,
          insuranceMonthly: partialForm.logistics?.fleet?.insuranceMonthly || 0
        },
        delivery: {
          baseRate: partialForm.logistics?.delivery?.baseRate || 0,
          perKmRate: partialForm.logistics?.delivery?.perKmRate || 0,
          perKgRate: partialForm.logistics?.delivery?.perKgRate || 0
        }
      },
      createdAt: partialForm.createdAt || new Date().toISOString(),
      updatedAt: partialForm.updatedAt || new Date().toISOString(),
      isActive: partialForm.isActive !== undefined ? partialForm.isActive : true
    };
  };

  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [selectedCost, setSelectedCost] = useState<ICostsData | null>(null);
  const [costForm, setCostForm] = useState<Partial<ICostsData>>({
    laborRates: {
      base: {
        plantingPerPlant: 0,
        harvestPerKg: 0,
        maintenancePerHour: 0,
        irrigationPerHour: 0,
        fertilizingPerHour: 0
      },
      overtime: {
        multiplier: 1.5,
        threshold: 8
      },
      seasonal: {
        peakSeasonMultiplier: 1.2,
        peakMonths: []
      },
      skillPremiums: {}
    },
    infrastructure: {
      land: {
        rentPerHectare: 0,
        propertyTaxes: 0,
        insurance: 0
      },
      utilities: {
        waterPerCubicMeter: 0,
        electricityPerKwh: 0,
        fuelPerLiter: 0,
        internetMonthly: 0
      },
      equipment: {
        depreciationRate: 0.15,
        maintenanceRate: 0.05,
        insuranceRate: 0.02
      }
    },
    materials: {
      fertilizer: {
        basePricePerKg: 0,
        bulkDiscounts: []
      },
      pesticides: {
        basePricePerLiter: 0,
        applicationCostPerLiter: 0
      },
      seeds: {
        basePricePerKg: 0,
        qualityPremium: 0
      },
      packaging: {
        containerCost: 0,
        labelingCost: 0
      }
    },
    logistics: {
      fleet: {
        vehicleCostPerKm: 0,
        fuelCostPerLiter: 0,
        maintenanceCostPerKm: 0,
        insuranceMonthly: 0
      },
      delivery: {
        baseRate: 0,
        perKmRate: 0,
        perKgRate: 0
      }
    }
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCosts = await costManagementApi.getCostsData();
      setCostsData(fetchedCosts);
    } catch (err) {
      setError('Failed to load cost data.');
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

  const handleCreateCost = async () => {
    if (!costForm.farmId || !costForm.managerId) {
      setError('Farm ID and Manager ID are required.');
      return;
    }
    try {
      const completeForm = ensureCompleteCostForm(costForm);
      await costManagementApi.createCostsData(completeForm);
      setCostDialogOpen(false);
      setCostForm({});
      loadData();
    } catch (err) {
      setError('Failed to create cost data.');
      console.error('Error creating cost data:', err);
    }
  };

  const handleUpdateCost = async () => {
    if (!selectedCost) return;
    try {
      const completeForm = ensureCompleteCostForm(costForm);
      await costManagementApi.updateCostsData(selectedCost._id, completeForm);
      setCostDialogOpen(false);
      setSelectedCost(null);
      setCostForm({});
      loadData();
    } catch (err) {
      setError('Failed to update cost data.');
      console.error('Error updating cost data:', err);
    }
  };

  const handleDeleteCost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this cost data?')) {
      try {
        await costManagementApi.deleteCostsData(id);
        loadData();
      } catch (err) {
        setError('Failed to delete cost data.');
        console.error('Error deleting cost data:', err);
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>Cost Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define and maintain operational costs for accurate budgeting and profitability analysis per Process Flow #12.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="cost management tabs">
          <Tab 
            icon={<LaborIcon />} 
            label="Labor Costs" 
            iconPosition="start"
          />
          <Tab 
            icon={<InfrastructureIcon />} 
            label="Infrastructure" 
            iconPosition="start"
          />
          <Tab 
            icon={<MaterialIcon />} 
            label="Materials" 
            iconPosition="start"
          />
          <Tab 
            icon={<LogisticsIcon />} 
            label="Logistics" 
            iconPosition="start"
          />
          <Tab 
            icon={<MoneyIcon />} 
            label="Cost Overview" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Labor Costs Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Labor Cost Configuration</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCost(null);
              setCostForm({});
              setCostDialogOpen(true);
            }}
          >
            Add Cost Data
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Labor Rate Structure</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure labor costs for different tasks and skill levels
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label="Planting: Cost per plant" color="primary" />
              <Chip label="Harvest: Cost per kg" color="primary" />
              <Chip label="Maintenance: Hourly rates" color="primary" />
              <Chip label="Overtime: Multipliers & thresholds" color="primary" />
              <Chip label="Seasonal: Peak season adjustments" color="primary" />
              <Chip label="Skills: Premium rates" color="primary" />
            </Box>
          </CardContent>
        </Card>

        {costsData.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Cost Data Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by creating cost data for your farm operations
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCost(null);
                setCostForm({
                  laborRates: {
                    base: {
                      plantingPerPlant: 0.15,
                      harvestPerKg: 0.25,
                      maintenancePerHour: 18.50,
                      irrigationPerHour: 16.00,
                      fertilizingPerHour: 20.00
                    },
                    overtime: {
                      multiplier: 1.5,
                      threshold: 8
                    },
                    seasonal: {
                      peakSeasonMultiplier: 1.2,
                      peakMonths: [4, 5, 6, 7, 8, 9]
                    },
                    skillPremiums: {
                      'chemical_application': 3.00,
                      'equipment_operation': 2.50,
                      'supervisor': 5.00
                    }
                  },
                  infrastructure: {
                    land: {
                      rentPerHectare: 500,
                      propertyTaxes: 1200,
                      insurance: 800
                    },
                    utilities: {
                      waterPerCubicMeter: 2.50,
                      electricityPerKwh: 0.12,
                      fuelPerLiter: 1.45,
                      internetMonthly: 150
                    },
                    equipment: {
                      depreciationRate: 0.15,
                      maintenanceRate: 0.05,
                      insuranceRate: 0.02
                    }
                  },
                  materials: {
                    fertilizer: {
                      basePricePerKg: 3.50,
                      bulkDiscounts: [
                        { minQuantity: 100, discountPercent: 5 },
                        { minQuantity: 500, discountPercent: 10 },
                        { minQuantity: 1000, discountPercent: 15 }
                      ]
                    },
                    pesticides: {
                      basePricePerLiter: 25.00,
                      applicationCostPerLiter: 2.00
                    },
                    seeds: {
                      basePricePerKg: 15.00,
                      qualityPremium: 0.20
                    },
                    packaging: {
                      containerCost: 0.50,
                      labelingCost: 0.10
                    }
                  },
                  logistics: {
                    fleet: {
                      vehicleCostPerKm: 0.45,
                      fuelCostPerLiter: 1.45,
                      maintenanceCostPerKm: 0.15,
                      insuranceMonthly: 200
                    },
                    delivery: {
                      baseRate: 25.00,
                      perKmRate: 1.20,
                      perKgRate: 0.15
                    }
                  }
                });
                setCostDialogOpen(true);
              }}
            >
              Create First Cost Data
            </Button>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Farm</TableCell>
                  <TableCell>Planting/Plant</TableCell>
                  <TableCell>Harvest/kg</TableCell>
                  <TableCell>Maintenance/hr</TableCell>
                  <TableCell>Overtime Rate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costsData.map((cost) => (
                  <TableRow key={cost._id}>
                    <TableCell>{cost.farmId}</TableCell>
                    <TableCell>${cost.laborRates?.base?.plantingPerPlant || 0}</TableCell>
                    <TableCell>${cost.laborRates?.base?.harvestPerKg || 0}</TableCell>
                    <TableCell>${cost.laborRates?.base?.maintenancePerHour || 0}</TableCell>
                    <TableCell>{cost.laborRates?.overtime?.multiplier || 1.5}x</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setSelectedCost(cost); setCostForm(cost); setCostDialogOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteCost(cost._id)}>
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

      {/* Infrastructure Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" sx={{ mb: 3 }}>Infrastructure Cost Management</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Land & Facility Costs</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Rent per hectare: $500
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Property taxes: $1,200/year
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Insurance: $800/year
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Utilities</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Water: $2.50/m³
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Electricity: $0.12/kWh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Fuel: $1.45/L
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Internet: $150/month
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Equipment</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Depreciation: 15%/year
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Maintenance: 5%/year
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Insurance: 2%/year
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Materials Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>Material Cost Tracking</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Fertilizer Pricing</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Base price: $3.50/kg
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Bulk discounts: 5-15%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Seasonal variations
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Pesticides</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Base price: $25.00/L
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Application cost: $2.00/L
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Safety equipment costs
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Seeds & Packaging</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Seeds: $15.00/kg
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Quality premium: 20%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Packaging: $0.50/container
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Logistics Tab */}
      <TabPanel value={activeTab} index={3}>
        <Typography variant="h6" sx={{ mb: 3 }}>Logistics and Distribution</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Fleet Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Vehicle cost: $0.45/km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Fuel cost: $1.45/L
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Maintenance: $0.15/km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Insurance: $200/month
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Delivery Calculations</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Base rate: $25.00
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Per km: $1.20
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Per kg: $0.15
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Route optimization
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Cost Overview Tab */}
      <TabPanel value={activeTab} index={4}>
        <Typography variant="h6" sx={{ mb: 3 }}>Cost Overview & Analysis</Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Dynamic Cost Calculation Integration</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Real-time budget generation when Manager assigns plants to blocks:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">• Material costs from PlantData fertilizer/pesticide schedules × CostsData unit prices</Typography>
              <Typography variant="body2">• Labor costs from TaskTemplate time estimates × CostsData labor rates</Typography>
              <Typography variant="body2">• Infrastructure costs from block utilization × CostsData facility rates</Typography>
              <Typography variant="body2">• Logistics costs for delivery based on CostsData distance calculations</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Performance-Based Cost Adjustment</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label="Efficiency Tracking" color="primary" />
              <Chip label="Material Usage Optimization" color="primary" />
              <Chip label="Quality Impact Analysis" color="primary" />
              <Chip label="Seasonal Performance" color="primary" />
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Cost Dialog */}
      <Dialog open={costDialogOpen} onClose={() => setCostDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedCost ? 'Edit Cost Data' : 'Create New Cost Data'}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Farm ID"
                placeholder="e.g., farm-1"
                value={costForm.farmId || ''}
                onChange={(e) => setCostForm({ ...costForm, farmId: e.target.value })}
                helperText="Enter the farm identifier"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Manager ID"
                placeholder="e.g., manager-1"
                value={costForm.managerId || ''}
                onChange={(e) => setCostForm({ ...costForm, managerId: e.target.value })}
                helperText="Enter the manager identifier"
              />
            </Box>
          </Box>
          
          <Accordion sx={{ mt: 2 }} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Labor Rates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Base Labor Rates</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <TextField
                  label="Planting per Plant ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.laborRates?.base?.plantingPerPlant || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      base: {
                        ...costForm.laborRates?.base,
                        plantingPerPlant: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Harvest per kg ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.laborRates?.base?.harvestPerKg || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      base: {
                        ...costForm.laborRates?.base,
                        harvestPerKg: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Maintenance per Hour ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.laborRates?.base?.maintenancePerHour || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      base: {
                        ...costForm.laborRates?.base,
                        maintenancePerHour: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Irrigation per Hour ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.laborRates?.base?.irrigationPerHour || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      base: {
                        ...costForm.laborRates?.base,
                        irrigationPerHour: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Fertilizing per Hour ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.laborRates?.base?.fertilizingPerHour || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      base: {
                        ...costForm.laborRates?.base,
                        fertilizingPerHour: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Overtime & Seasonal Rates</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                  label="Overtime Multiplier"
                  type="number"
                  inputProps={{ step: "0.1" }}
                  value={costForm.laborRates?.overtime?.multiplier || 1.5}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      overtime: {
                        ...costForm.laborRates?.overtime,
                        multiplier: parseFloat(e.target.value) || 1.5
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Overtime Threshold (hours)"
                  type="number"
                  value={costForm.laborRates?.overtime?.threshold || 8}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      overtime: {
                        ...costForm.laborRates?.overtime,
                        threshold: parseInt(e.target.value) || 8
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Peak Season Multiplier"
                  type="number"
                  inputProps={{ step: "0.1" }}
                  value={costForm.laborRates?.seasonal?.peakSeasonMultiplier || 1.2}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    laborRates: {
                      ...costForm.laborRates,
                      seasonal: {
                        ...costForm.laborRates?.seasonal,
                        peakSeasonMultiplier: parseFloat(e.target.value) || 1.2
                      }
                    } as any
                  })}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Infrastructure Costs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Land & Facility Costs</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <TextField
                  label="Rent per Hectare ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.land?.rentPerHectare || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      land: {
                        ...costForm.infrastructure?.land,
                        rentPerHectare: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Property Taxes ($/year)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.land?.propertyTaxes || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      land: {
                        ...costForm.infrastructure?.land,
                        propertyTaxes: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Insurance ($/year)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.land?.insurance || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      land: {
                        ...costForm.infrastructure?.land,
                        insurance: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Utilities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                  label="Water per m³ ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.utilities?.waterPerCubicMeter || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      utilities: {
                        ...costForm.infrastructure?.utilities,
                        waterPerCubicMeter: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Electricity per kWh ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.utilities?.electricityPerKwh || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      utilities: {
                        ...costForm.infrastructure?.utilities,
                        electricityPerKwh: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Fuel per Liter ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.utilities?.fuelPerLiter || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      utilities: {
                        ...costForm.infrastructure?.utilities,
                        fuelPerLiter: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
                <TextField
                  label="Internet Monthly ($)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={costForm.infrastructure?.utilities?.internetMonthly || ''}
                  onChange={(e) => setCostForm({
                    ...costForm,
                    infrastructure: {
                      ...costForm.infrastructure,
                      utilities: {
                        ...costForm.infrastructure?.utilities,
                        internetMonthly: parseFloat(e.target.value) || 0
                      }
                    } as any
                  })}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCostDialogOpen(false)}>Cancel</Button>
          <Button onClick={selectedCost ? handleUpdateCost : handleCreateCost} variant="contained">
            {selectedCost ? 'Update' : 'Create'}
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

export default CostManagementPage;
