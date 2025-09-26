import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Science as ScienceIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface PesticideScheduleItem {
  day: number;
  chemicalType: string;
  applicationRate: number;
  frequency: 'preventive' | 'curative' | 'as_needed';
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  applicationMethod: 'foliar_spray' | 'dust' | 'injection' | 'soil_drench';
  safetyRequirements: string;
  reEntryInterval: number;
  harvestRestriction: number;
  notes?: string;
}

interface PesticideScheduleManagerProps {
  schedule: PesticideScheduleItem[];
  onScheduleChange: (schedule: PesticideScheduleItem[]) => void;
  plantName: string;
}

const PesticideScheduleManager: React.FC<PesticideScheduleManagerProps> = ({
  schedule,
  onScheduleChange,
  plantName
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PesticideScheduleItem>({
    day: 0,
    chemicalType: '',
    applicationRate: 0,
    frequency: 'preventive',
    growthStage: 'seedling',
    applicationMethod: 'foliar_spray',
    safetyRequirements: '',
    reEntryInterval: 0,
    harvestRestriction: 0,
    notes: ''
  });

  const handleAddSchedule = () => {
    setEditingIndex(null);
    setFormData({
      day: 0,
      chemicalType: '',
      applicationRate: 0,
      frequency: 'preventive',
      growthStage: 'seedling',
      applicationMethod: 'foliar_spray',
      safetyRequirements: '',
      reEntryInterval: 0,
      harvestRestriction: 0,
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleEditSchedule = (index: number) => {
    setEditingIndex(index);
    setFormData(schedule[index]);
    setDialogOpen(true);
  };

  const handleDeleteSchedule = (index: number) => {
    if (window.confirm('Are you sure you want to delete this pesticide schedule item?')) {
      const newSchedule = schedule.filter((_, i) => i !== index);
      onScheduleChange(newSchedule);
    }
  };

  const handleSaveSchedule = () => {
    if (!formData.chemicalType || formData.applicationRate <= 0 || !formData.safetyRequirements) {
      return;
    }

    const newSchedule = [...schedule];
    if (editingIndex !== null) {
      newSchedule[editingIndex] = formData;
    } else {
      newSchedule.push(formData);
    }

    // Sort by day
    newSchedule.sort((a, b) => a.day - b.day);
    onScheduleChange(newSchedule);
    setDialogOpen(false);
  };

  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case 'seedling': return 'primary';
      case 'vegetative': return 'success';
      case 'flowering': return 'warning';
      case 'fruiting': return 'error';
      case 'harvest': return 'info';
      default: return 'default';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'preventive': return 'success';
      case 'curative': return 'error';
      case 'as_needed': return 'warning';
      default: return 'default';
    }
  };

  const getApplicationMethodIcon = (method: string) => {
    switch (method) {
      case 'foliar_spray': return '🌿';
      case 'dust': return '💨';
      case 'injection': return '💉';
      case 'soil_drench': return '💧';
      default: return '🌱';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="error" />
          Pesticide/Chemical Schedule for {plantName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSchedule}
          color="error"
        >
          Add Schedule Item
        </Button>
      </Box>

      {schedule.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center', border: '2px dashed #ccc' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No Pesticide Schedule Defined
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a detailed chemical application plan with safety protocols and restrictions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSchedule}
            color="error"
          >
            Create First Schedule Item
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {schedule.map((item, index) => (
            <Accordion key={index} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ minWidth: '80px' }}>
                    Day {item.day}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    {item.chemicalType}
                  </Typography>
                  <Chip 
                    label={item.growthStage} 
                    color={getGrowthStageColor(item.growthStage) as any}
                    size="small"
                  />
                  <Chip 
                    label={item.frequency} 
                    color={getFrequencyColor(item.frequency) as any}
                    size="small"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditSchedule(index); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(index); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="text.secondary">Application Rate</Typography>
                      <Typography variant="h6">{item.applicationRate}ml/g per plant</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="text.secondary">Application Method</Typography>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getApplicationMethodIcon(item.applicationMethod)} {item.applicationMethod.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="text.secondary">Growth Stage</Typography>
                      <Typography variant="h6">{item.growthStage}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <Typography variant="body2" color="text.secondary">Safety Requirements</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {item.safetyRequirements}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="body2" color="text.secondary">Re-entry Interval</Typography>
                      <Typography variant="h6" sx={{ color: 'warning.main' }}>
                        {item.reEntryInterval} hours
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="body2" color="text.secondary">Harvest Restriction</Typography>
                      <Typography variant="h6" sx={{ color: 'error.main' }}>
                        {item.harvestRestriction} days
                      </Typography>
                    </Box>
                  </Box>
                  
                  {item.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Notes</Typography>
                        <Typography variant="body1">{item.notes}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Pesticide Schedule Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Pesticide Schedule Item' : 'Add Pesticide Schedule Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Day (Days after planting)"
                type="number"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Chemical Type (e.g., Neem Oil, Copper Fungicide)"
                value={formData.chemicalType}
                onChange={(e) => setFormData({ ...formData, chemicalType: e.target.value })}
                placeholder="Neem Oil, Copper Fungicide, Pyrethrin..."
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Application Rate (ml/g per plant)"
                type="number"
                value={formData.applicationRate}
                onChange={(e) => setFormData({ ...formData, applicationRate: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                >
                  <MenuItem value="preventive">Preventive</MenuItem>
                  <MenuItem value="curative">Curative</MenuItem>
                  <MenuItem value="as_needed">As Needed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Growth Stage</InputLabel>
                <Select
                  value={formData.growthStage}
                  onChange={(e) => setFormData({ ...formData, growthStage: e.target.value as any })}
                >
                  <MenuItem value="seedling">Seedling</MenuItem>
                  <MenuItem value="vegetative">Vegetative</MenuItem>
                  <MenuItem value="flowering">Flowering</MenuItem>
                  <MenuItem value="fruiting">Fruiting</MenuItem>
                  <MenuItem value="harvest">Harvest</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Application Method</InputLabel>
                <Select
                  value={formData.applicationMethod}
                  onChange={(e) => setFormData({ ...formData, applicationMethod: e.target.value as any })}
                >
                  <MenuItem value="foliar_spray">Foliar Spray</MenuItem>
                  <MenuItem value="dust">Dust</MenuItem>
                  <MenuItem value="injection">Injection</MenuItem>
                  <MenuItem value="soil_drench">Soil Drench</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Safety Requirements (PPE needed)"
                value={formData.safetyRequirements}
                onChange={(e) => setFormData({ ...formData, safetyRequirements: e.target.value })}
                placeholder="Gloves, mask, long sleeves, eye protection..."
                required
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Re-entry Interval (hours)"
                type="number"
                value={formData.reEntryInterval}
                onChange={(e) => setFormData({ ...formData, reEntryInterval: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Harvest Restriction (days)"
                type="number"
                value={formData.harvestRestriction}
                onChange={(e) => setFormData({ ...formData, harvestRestriction: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this chemical application..."
              />
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Safety Warning:</strong> Always follow manufacturer instructions and safety protocols. 
              Ensure proper PPE is used and re-entry/harvest restrictions are strictly followed.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveSchedule} 
            variant="contained"
            color="error"
            disabled={!formData.chemicalType || formData.applicationRate <= 0 || !formData.safetyRequirements}
          >
            {editingIndex !== null ? 'Update' : 'Add'} Schedule Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PesticideScheduleManager;
