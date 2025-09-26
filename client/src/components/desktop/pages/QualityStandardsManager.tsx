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
  Chip,
  Divider,
  Alert,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Nature as EcoIcon,
  Water as WaterIcon,
  Cloud as CloudIcon,
  Assessment as AssessmentIcon,
  Science as ScienceIcon
} from '@mui/icons-material';

interface QualityStandards {
  size: {
    min: number;
    max: number;
    unit: 'cm' | 'mm' | 'g';
  };
  color: string[];
  texture: string[];
  defects: string[];
}

interface EnvironmentalImpact {
  waterFootprint: number; // Liters per kg
  carbonFootprint: number; // CO2 kg per kg
  sustainabilityScore: number; // 1-10 scale
}

interface QualityStandardsManagerProps {
  qualityStandards: QualityStandards;
  environmentalImpact: EnvironmentalImpact;
  onQualityStandardsChange: (standards: QualityStandards) => void;
  onEnvironmentalImpactChange: (impact: EnvironmentalImpact) => void;
  plantName: string;
}

const QualityStandardsManager: React.FC<QualityStandardsManagerProps> = ({
  qualityStandards,
  environmentalImpact,
  onQualityStandardsChange,
  onEnvironmentalImpactChange,
  plantName
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<'quality' | 'environmental'>('quality');
  const [qualityForm, setQualityForm] = useState<QualityStandards>(qualityStandards);
  const [environmentalForm, setEnvironmentalForm] = useState<EnvironmentalImpact>(environmentalImpact);

  const handleEditQuality = () => {
    setEditingType('quality');
    setQualityForm(qualityStandards);
    setDialogOpen(true);
  };

  const handleEditEnvironmental = () => {
    setEditingType('environmental');
    setEnvironmentalForm(environmentalImpact);
    setDialogOpen(true);
  };

  const handleSaveQuality = () => {
    onQualityStandardsChange(qualityForm);
    setDialogOpen(false);
  };

  const handleSaveEnvironmental = () => {
    onEnvironmentalImpactChange(environmentalForm);
    setDialogOpen(false);
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const getWaterFootprintColor = (footprint: number) => {
    if (footprint <= 100) return 'success';
    if (footprint <= 200) return 'warning';
    return 'error';
  };

  const getCarbonFootprintColor = (footprint: number) => {
    if (footprint <= 1) return 'success';
    if (footprint <= 2) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" />
        Quality Standards & Environmental Impact for {plantName}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Quality Standards Card */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScienceIcon color="primary" />
                  Quality Standards
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditQuality}
                  size="small"
                >
                  Edit
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Size Range
                  </Typography>
                  <Typography variant="h6">
                    {qualityStandards.size.min} - {qualityStandards.size.max} {qualityStandards.size.unit}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Expected Colors
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {qualityStandards.color.length > 0 ? (
                      qualityStandards.color.map((color, index) => (
                        <Chip key={index} label={color} size="small" color="primary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No colors specified</Typography>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Expected Textures
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {qualityStandards.texture.length > 0 ? (
                      qualityStandards.texture.map((texture, index) => (
                        <Chip key={index} label={texture} size="small" color="secondary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No textures specified</Typography>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Common Defects to Watch For
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {qualityStandards.defects.length > 0 ? (
                      qualityStandards.defects.map((defect, index) => (
                        <Chip key={index} label={defect} size="small" color="error" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No defects specified</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Environmental Impact Card */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EcoIcon color="success" />
                  Environmental Impact
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditEnvironmental}
                  size="small"
                >
                  Edit
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Water Footprint */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WaterIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Water Footprint
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: `${getWaterFootprintColor(environmentalImpact.waterFootprint)}.main` }}>
                    {environmentalImpact.waterFootprint} L/kg
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((environmentalImpact.waterFootprint / 300) * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${getWaterFootprintColor(environmentalImpact.waterFootprint)}.main`,
                      }
                    }}
                  />
                </Box>

                {/* Carbon Footprint */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CloudIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Carbon Footprint
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: `${getCarbonFootprintColor(environmentalImpact.carbonFootprint)}.main` }}>
                    {environmentalImpact.carbonFootprint} kg CO₂/kg
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((environmentalImpact.carbonFootprint / 5) * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${getCarbonFootprintColor(environmentalImpact.carbonFootprint)}.main`,
                      }
                    }}
                  />
                </Box>

                {/* Sustainability Score */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EcoIcon color="success" />
                    <Typography variant="body2" color="text.secondary">
                      Sustainability Score
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" sx={{ color: `${getSustainabilityColor(environmentalImpact.sustainabilityScore)}.main` }}>
                      {environmentalImpact.sustainabilityScore}/10
                    </Typography>
                    <Chip
                      label={getSustainabilityLabel(environmentalImpact.sustainabilityScore)}
                      color={getSustainabilityColor(environmentalImpact.sustainabilityScore) as any}
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(environmentalImpact.sustainabilityScore / 10) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${getSustainabilityColor(environmentalImpact.sustainabilityScore)}.main`,
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Quality Standards Dialog */}
      <Dialog open={dialogOpen && editingType === 'quality'} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Quality Standards</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Minimum Size"
                type="number"
                value={qualityForm.size.min}
                onChange={(e) => setQualityForm({
                  ...qualityForm,
                  size: { ...qualityForm.size, min: parseFloat(e.target.value) || 0 }
                })}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label="Maximum Size"
                type="number"
                value={qualityForm.size.max}
                onChange={(e) => setQualityForm({
                  ...qualityForm,
                  size: { ...qualityForm.size, max: parseFloat(e.target.value) || 0 }
                })}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Size Unit</InputLabel>
                <Select
                  value={qualityForm.size.unit}
                  onChange={(e) => setQualityForm({
                    ...qualityForm,
                    size: { ...qualityForm.size, unit: e.target.value as any }
                  })}
                >
                  <MenuItem value="cm">Centimeters (cm)</MenuItem>
                  <MenuItem value="mm">Millimeters (mm)</MenuItem>
                  <MenuItem value="g">Grams (g)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Expected Colors (comma-separated)"
                value={qualityForm.color.join(', ')}
                onChange={(e) => setQualityForm({
                  ...qualityForm,
                  color: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                })}
                placeholder="Red, Green, Yellow, Orange..."
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Expected Textures (comma-separated)"
                value={qualityForm.texture.join(', ')}
                onChange={(e) => setQualityForm({
                  ...qualityForm,
                  texture: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                placeholder="Firm, Smooth, Crisp, Soft..."
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Common Defects (comma-separated)"
                value={qualityForm.defects.join(', ')}
                onChange={(e) => setQualityForm({
                  ...qualityForm,
                  defects: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                })}
                placeholder="Cracks, Bruises, Soft spots, Discoloration..."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuality} variant="contained">
            Save Quality Standards
          </Button>
        </DialogActions>
      </Dialog>

      {/* Environmental Impact Dialog */}
      <Dialog open={dialogOpen && editingType === 'environmental'} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Environmental Impact</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Water Footprint (Liters per kg)"
                type="number"
                value={environmentalForm.waterFootprint}
                onChange={(e) => setEnvironmentalForm({
                  ...environmentalForm,
                  waterFootprint: parseFloat(e.target.value) || 0
                })}
                inputProps={{ min: 0, step: 0.1 }}
                helperText="Water consumption per kg of produce"
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Carbon Footprint (kg CO₂ per kg)"
                type="number"
                value={environmentalForm.carbonFootprint}
                onChange={(e) => setEnvironmentalForm({
                  ...environmentalForm,
                  carbonFootprint: parseFloat(e.target.value) || 0
                })}
                inputProps={{ min: 0, step: 0.1 }}
                helperText="CO₂ emissions per kg of produce"
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Sustainability Score (1-10)"
                type="number"
                value={environmentalForm.sustainabilityScore}
                onChange={(e) => setEnvironmentalForm({
                  ...environmentalForm,
                  sustainabilityScore: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                })}
                inputProps={{ min: 1, max: 10 }}
                helperText="Overall sustainability rating"
              />
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Environmental Impact Guidelines:</strong>
              <br />• Water Footprint: &lt;100 L/kg (Excellent), 100-200 L/kg (Good), &gt;200 L/kg (Needs Improvement)
              <br />• Carbon Footprint: &lt;1 kg CO₂/kg (Excellent), 1-2 kg CO₂/kg (Good), &gt;2 kg CO₂/kg (Needs Improvement)
              <br />• Sustainability Score: 8-10 (Excellent), 6-7 (Good), 4-5 (Fair), 1-3 (Poor)
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEnvironmental} variant="contained">
            Save Environmental Impact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QualityStandardsManager;
