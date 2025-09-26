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
  Science as ScienceIcon
} from '@mui/icons-material';

interface FertilizerScheduleItem {
  day: number;
  fertilizerType: string;
  applicationRate: number;
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  applicationMethod: 'foliar_spray' | 'soil_drench' | 'injection' | 'broadcast';
  notes?: string;
}

interface FertilizerScheduleManagerProps {
  schedule: FertilizerScheduleItem[];
  onScheduleChange: (schedule: FertilizerScheduleItem[]) => void;
  plantName: string;
}

const FertilizerScheduleManager: React.FC<FertilizerScheduleManagerProps> = ({
  schedule,
  onScheduleChange,
  plantName
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FertilizerScheduleItem>({
    day: 0,
    fertilizerType: '',
    applicationRate: 0,
    frequency: 'weekly',
    growthStage: 'seedling',
    applicationMethod: 'soil_drench',
    notes: ''
  });

  const handleAddSchedule = () => {
    setEditingIndex(null);
    setFormData({
      day: 0,
      fertilizerType: '',
      applicationRate: 0,
      frequency: 'weekly',
      growthStage: 'seedling',
      applicationMethod: 'soil_drench',
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
    if (window.confirm('Are you sure you want to delete this fertilizer schedule item?')) {
      const newSchedule = schedule.filter((_, i) => i !== index);
      onScheduleChange(newSchedule);
    }
  };

  const handleSaveSchedule = () => {
    if (!formData.fertilizerType || formData.applicationRate <= 0) {
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

  const getApplicationMethodIcon = (method: string) => {
    switch (method) {
      case 'foliar_spray': return '🌿';
      case 'soil_drench': return '💧';
      case 'injection': return '💉';
      case 'broadcast': return '🌱';
      default: return '🌱';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Fertilizer Schedule for {plantName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSchedule}
          sx={{ backgroundColor: '#00D4AA', '&:hover': { backgroundColor: '#00B894' } }}
        >
          Add Schedule Item
        </Button>
      </Box>

      {schedule.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center', border: '2px dashed #ccc' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No Fertilizer Schedule Defined
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a detailed day-by-day fertilizer application plan for optimal plant growth
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSchedule}
            sx={{ backgroundColor: '#00D4AA', '&:hover': { backgroundColor: '#00B894' } }}
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
                    {item.fertilizerType}
                  </Typography>
                  <Chip 
                    label={item.growthStage} 
                    color={getGrowthStageColor(item.growthStage) as any}
                    size="small"
                  />
                  <Chip 
                    label={item.frequency} 
                    color="default"
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

      {/* Fertilizer Schedule Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Fertilizer Schedule Item' : 'Add Fertilizer Schedule Item'}
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
                label="Fertilizer Type (e.g., NPK 15-15-15)"
                value={formData.fertilizerType}
                onChange={(e) => setFormData({ ...formData, fertilizerType: e.target.value })}
                placeholder="NPK 15-15-15, Compost, Fish Emulsion..."
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
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="bi_weekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
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
                  <MenuItem value="soil_drench">Soil Drench</MenuItem>
                  <MenuItem value="injection">Injection</MenuItem>
                  <MenuItem value="broadcast">Broadcast</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this fertilizer application..."
              />
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> Create a comprehensive fertilizer schedule by adding multiple items for different growth stages. 
              Consider the plant's nutritional needs throughout its lifecycle.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveSchedule} 
            variant="contained"
            disabled={!formData.fertilizerType || formData.applicationRate <= 0}
          >
            {editingIndex !== null ? 'Update' : 'Add'} Schedule Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FertilizerScheduleManager;
