import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { IUser } from '../../types';
// import { useResponsive } from '../../hooks/useResponsive';

// Desktop layout components
import DesktopNavbar from './layout/DesktopNavbar';
import DesktopSidebar from './layout/DesktopSidebar';

// Desktop pages
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import FarmManagementPage from './pages/FarmManagementPage';
import CostManagementPage from './pages/CostManagementPage';
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
  const { sidebarOpen } = useSelector((state: RootState) => state.interface);

  // Create Material-UI theme - Minimalist Style
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#E91E63', // Pink/magenta
        light: '#F48FB1',
        dark: '#C2185B',
      },
      secondary: {
        main: '#00BCD4', // Cyan
        light: '#4DD0E1',
        dark: '#0097A7',
      },
      background: {
        default: '#0F0F23', // Very dark blue
        paper: '#1E1E2E', // Dark card background
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
      },
      success: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
      },
      warning: {
        main: '#FF9800',
        light: '#FFB74D',
        dark: '#F57C00',
      },
      error: {
        main: '#F44336',
        light: '#EF5350',
        dark: '#D32F2F',
      },
      info: {
        main: '#00BCD4',
        light: '#4DD0E1',
        dark: '#0097A7',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: '#1E1E2E',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              borderColor: 'rgba(233, 30, 99, 0.2)',
            },
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '0.75rem 1.5rem',
            background: '#E91E63',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            '&:hover': {
              background: '#C2185B',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 500,
            fontSize: '0.75rem',
            backgroundColor: '#E91E63',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#C2185B',
              color: '#FFFFFF',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              color: '#FFFFFF',
              '& .MuiOutlinedInput-input': {
                color: '#FFFFFF',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E91E63',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E91E63',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#1E1E2E',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(15, 15, 35, 0.3)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(233, 30, 99, 0.6)',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(233, 30, 99, 0.8)',
              },
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent',
            },
          },
        },
      },
    },
  });

  const drawerWidth = 280;

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
              p: {
                xs: 2,
                sm: 3,
                md: 4
              },
              width: { 
                xs: '100%', 
                sm: sidebarOpen ? `calc(100vw - ${drawerWidth}px)` : '100vw'
              },
              left: { 
                xs: 0, 
                sm: sidebarOpen ? `${drawerWidth}px` : 0
              },
              position: 'absolute',
              marginTop: { 
                xs: '56px', 
                sm: '64px' 
              },
              minHeight: { 
                xs: 'calc(100vh - 56px)', 
                sm: 'calc(100vh - 64px)' 
              },
              backgroundColor: '#0F0F23',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(15, 15, 35, 0.3)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(233, 30, 99, 0.6)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(233, 30, 99, 0.8)',
                },
              },
              '&::-webkit-scrollbar-corner': {
                background: 'transparent',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(255, 138, 101, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(92, 107, 192, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 138, 101, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0,
              },
              '& > *': {
                position: 'relative',
                zIndex: 1,
              }
            }}
          >
            <Routes>
              {/* Default Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage user={user} />} />

              {/* User Management - Admin & Manager only */}
        {(user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'manager') && (
          <Route path="/user-management" element={<UserManagementPage />} />
        )}
        {(user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'manager') && (
          <Route path="/farm-management" element={<FarmManagementPage />} />
        )}
        {(user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'manager') && (
          <Route path="/cost-management" element={<CostManagementPage />} />
        )}
        {(user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'manager' || user.role.toLowerCase() === 'agronomist') && (
          <Route path="/plant-data" element={<PlantDataPage />} />
        )}

              {/* Core Management Pages */}
              <Route path="/farms" element={<FarmManagementPage />} />
              <Route path="/workers" element={<WorkerManagementPage user={user} />} />
              <Route path="/inventory" element={<InventoryPage user={user} />} />
              <Route path="/financial" element={<FinancialPage user={user} />} />
              <Route path="/analytics" element={<AnalyticsPage user={user} />} />

              {/* Role-specific pages */}
              {(user.role.toLowerCase() === 'sales' || user.role.toLowerCase() === 'admin') && (
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
