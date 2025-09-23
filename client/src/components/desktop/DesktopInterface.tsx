import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { IUser, UserRole } from '../../types';

// Desktop layout components
import DesktopNavbar from './layout/DesktopNavbar';
import DesktopSidebar from './layout/DesktopSidebar';

// Desktop pages
import DashboardPage from './pages/DashboardPage';
import FarmManagementPage from './pages/FarmManagementPage';
import PlantDataPage from './pages/PlantDataPage';
import WorkerManagementPage from './pages/WorkerManagementPage';
import InventoryPage from './pages/InventoryPage';
import FinancialPage from './pages/FinancialPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import SettingsPage from './pages/SettingsPage';

interface DesktopInterfaceProps {
  user: IUser;
}

const DesktopInterface: React.FC<DesktopInterfaceProps> = ({ user }) => {
  const { theme: themeMode, sidebarOpen } = useSelector((state: RootState) => state.interface);

  // Create Material-UI theme
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#4CAF50', // Green for agricultural theme
      },
      secondary: {
        main: '#FF9800', // Orange for accents
      },
      background: {
        default: themeMode === 'light' ? '#f5f5f5' : '#121212',
        paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 8,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 6,
          },
        },
      },
    },
  });

  const drawerWidth = 260;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <Router>
          {/* Top Navigation Bar */}
          <DesktopNavbar user={user} drawerWidth={drawerWidth} />

          {/* Side Navigation */}
          <DesktopSidebar user={user} drawerWidth={drawerWidth} open={sidebarOpen} />

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
              marginLeft: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              marginTop: '64px', // Height of the app bar
              minHeight: 'calc(100vh - 64px)',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Routes>
              {/* Default Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage user={user} />} />

              {/* Core Management Pages */}
              <Route path="/farms" element={<FarmManagementPage user={user} />} />
              <Route path="/plants" element={<PlantDataPage user={user} />} />
              <Route path="/workers" element={<WorkerManagementPage user={user} />} />
              <Route path="/inventory" element={<InventoryPage user={user} />} />
              <Route path="/financial" element={<FinancialPage user={user} />} />
              <Route path="/analytics" element={<AnalyticsPage user={user} />} />

              {/* Role-specific pages */}
              {(user.role === UserRole.SALES || user.role === UserRole.ADMIN) && (
                <Route path="/customers" element={<CustomerManagementPage user={user} />} />
              )}

              {/* Settings */}
              <Route path="/settings" element={<SettingsPage user={user} />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
        </Router>
      </Box>
    </ThemeProvider>
  );
};

export default DesktopInterface;
