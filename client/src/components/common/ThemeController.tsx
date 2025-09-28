import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  TextFields as TypographyIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomTheme } from '../../types/theme';

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
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ThemeController: React.FC = () => {
  const {
    currentTheme,
    themes,
    setTheme,
    updateTheme,
    createCustomTheme,
    deleteCustomTheme,
    resetTheme,
    exportTheme,
    importTheme,
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [customTheme, setCustomTheme] = useState<Partial<CustomTheme>>({});
  const [importData, setImportData] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setSnackbar({ open: true, message: 'Theme changed successfully', severity: 'success' });
  };

  const handleColorChange = (path: string, value: string) => {
    const keys = path.split('.');
    const newColors = { ...currentTheme.colors };
    let current: any = newColors;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    updateTheme({ colors: newColors });
  };

  const handleTypographyChange = (path: string, value: string | number) => {
    const keys = path.split('.');
    const newTypography = { ...currentTheme.typography };
    let current: any = newTypography;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    updateTheme({ typography: newTypography });
  };

  const handleCreateCustomTheme = () => {
    if (customTheme.name) {
      const themeId = createCustomTheme({
        ...customTheme,
        name: customTheme.name || 'Custom Theme',
        description: customTheme.description || 'A custom theme',
        colors: customTheme.colors || currentTheme.colors,
        typography: customTheme.typography || currentTheme.typography,
        spacing: customTheme.spacing || currentTheme.spacing,
        shadows: customTheme.shadows || currentTheme.shadows,
        borderRadius: customTheme.borderRadius || currentTheme.borderRadius,
        animation: customTheme.animation || currentTheme.animation,
        layout: customTheme.layout || currentTheme.layout,
        assets: customTheme.assets || currentTheme.assets,
        isDark: customTheme.isDark || false,
        isCustom: true,
      } as CustomTheme);
      
      setCustomTheme({});
      setSnackbar({ open: true, message: 'Custom theme created successfully', severity: 'success' });
    }
  };

  const handleImportTheme = () => {
    try {
      const themeId = importTheme(importData);
      setImportData('');
      setSnackbar({ open: true, message: 'Theme imported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to import theme', severity: 'error' });
    }
  };

  const handleExportTheme = (themeId: string) => {
    const themeData = exportTheme(themeId);
    navigator.clipboard.writeText(themeData);
    setSnackbar({ open: true, message: 'Theme copied to clipboard', severity: 'success' });
  };

  const handleDeleteTheme = (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      deleteCustomTheme(themeId);
      setSnackbar({ open: true, message: 'Theme deleted successfully', severity: 'success' });
    }
  };

  const ColorInput: React.FC<{ label: string; path: string; value: string }> = ({ label, path, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          backgroundColor: value,
          border: '1px solid #ccc',
          borderRadius: 1,
        }}
      />
      <TextField
        size="small"
        label={label}
        value={value}
        onChange={(e) => handleColorChange(path, e.target.value)}
        fullWidth
      />
    </Box>
  );

  return (
    <>
      <Tooltip title="Theme Settings">
        <IconButton onClick={() => setOpen(true)} color="primary">
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon />
            Theme Controller
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab icon={<PaletteIcon />} label="Colors" />
              <Tab icon={<TypographyIcon />} label="Typography" />
              <Tab icon={<ImageIcon />} label="Assets" />
              <Tab icon={<SettingsIcon />} label="Settings" />
            </Tabs>
          </Box>

          {/* Theme Selection */}
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Theme: {currentTheme.name}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Theme</InputLabel>
              <Select
                value={currentTheme.id}
                onChange={(e) => handleThemeChange(e.target.value)}
                label="Select Theme"
              >
                {themes.map((theme) => (
                  <MenuItem key={theme.id} value={theme.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: theme.colors.primary,
                          borderRadius: 1,
                        }}
                      />
                      {theme.name}
                      {theme.isCustom && <Chip label="Custom" size="small" />}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Colors Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              Color Palette
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <ColorInput label="Primary" path="primary" value={currentTheme.colors.primary} />
              <ColorInput label="Secondary" path="secondary" value={currentTheme.colors.secondary} />
              <ColorInput label="Background" path="background" value={currentTheme.colors.background} />
              <ColorInput label="Surface" path="surface" value={currentTheme.colors.surface} />
              <ColorInput label="Success" path="success" value={currentTheme.colors.success} />
              <ColorInput label="Warning" path="warning" value={currentTheme.colors.warning} />
              <ColorInput label="Error" path="error" value={currentTheme.colors.error} />
              <ColorInput label="Info" path="info" value={currentTheme.colors.info} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Text Colors
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <ColorInput label="Primary Text" path="text.primary" value={currentTheme.colors.text.primary} />
              <ColorInput label="Secondary Text" path="text.secondary" value={currentTheme.colors.text.secondary} />
              <ColorInput label="Disabled Text" path="text.disabled" value={currentTheme.colors.text.disabled} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Block Status Colors
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <ColorInput label="Empty" path="blockStatus.empty" value={currentTheme.colors.blockStatus.empty} />
              <ColorInput label="Assigned" path="blockStatus.assigned" value={currentTheme.colors.blockStatus.assigned} />
              <ColorInput label="Planted" path="blockStatus.planted" value={currentTheme.colors.blockStatus.planted} />
              <ColorInput label="Harvesting" path="blockStatus.harvesting" value={currentTheme.colors.blockStatus.harvesting} />
              <ColorInput label="Alert" path="blockStatus.alert" value={currentTheme.colors.blockStatus.alert} />
            </Box>
          </TabPanel>

          {/* Typography Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Typography Settings
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="Primary Font Family"
                value={currentTheme.typography.fontFamily.primary}
                onChange={(e) => handleTypographyChange('fontFamily.primary', e.target.value)}
              />
              <TextField
                fullWidth
                label="Secondary Font Family"
                value={currentTheme.typography.fontFamily.secondary}
                onChange={(e) => handleTypographyChange('fontFamily.secondary', e.target.value)}
              />
              <TextField
                fullWidth
                label="Mono Font Family"
                value={currentTheme.typography.fontFamily.mono}
                onChange={(e) => handleTypographyChange('fontFamily.mono', e.target.value)}
              />
            </Box>
          </TabPanel>

          {/* Assets Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Assets & Branding
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="Primary Logo"
                value={currentTheme.assets.logo.primary}
                onChange={(e) => updateTheme({
                  assets: {
                    ...currentTheme.assets,
                    logo: {
                      ...currentTheme.assets.logo,
                      primary: e.target.value
                    }
                  }
                })}
              />
              <TextField
                fullWidth
                label="Secondary Logo"
                value={currentTheme.assets.logo.secondary}
                onChange={(e) => updateTheme({
                  assets: {
                    ...currentTheme.assets,
                    logo: {
                      ...currentTheme.assets.logo,
                      secondary: e.target.value
                    }
                  }
                })}
              />
              <TextField
                fullWidth
                label="Icon Logo"
                value={currentTheme.assets.logo.icon}
                onChange={(e) => updateTheme({
                  assets: {
                    ...currentTheme.assets,
                    logo: {
                      ...currentTheme.assets.logo,
                      icon: e.target.value
                    }
                  }
                })}
              />
              <TextField
                fullWidth
                label="Favicon"
                value={currentTheme.assets.logo.favicon}
                onChange={(e) => updateTheme({
                  assets: {
                    ...currentTheme.assets,
                    logo: {
                      ...currentTheme.assets.logo,
                      favicon: e.target.value
                    }
                  }
                })}
              />
            </Box>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Theme Management
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Create Custom Theme</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Theme Name"
                    value={customTheme.name || ''}
                    onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={customTheme.description || ''}
                    onChange={(e) => setCustomTheme({ ...customTheme, description: e.target.value })}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customTheme.isDark || false}
                        onChange={(e) => setCustomTheme({ ...customTheme, isDark: e.target.checked })}
                      />
                    }
                    label="Dark Theme"
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCustomTheme}
                    disabled={!customTheme.name}
                  >
                    Create Theme
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Import/Export Themes</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Import Theme Data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste theme JSON data here..."
                  />
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleImportTheme}
                    disabled={!importData}
                    fullWidth
                  >
                    Import Theme
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportTheme(currentTheme.id)}
                    fullWidth
                  >
                    Export Current Theme
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Theme Actions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={resetTheme}
                    fullWidth
                  >
                    Reset to Default
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={() => handleExportTheme(currentTheme.id)}
                    fullWidth
                  >
                    Copy Theme Data
                  </Button>
                  {currentTheme.isCustom && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTheme(currentTheme.id)}
                      fullWidth
                    >
                      Delete Theme
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default ThemeController;
