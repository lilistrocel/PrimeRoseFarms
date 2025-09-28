import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { IUser } from '../../types';

// Desktop layout components
import DesktopNavbar from './layout/DesktopNavbar';
import DesktopSidebar from './layout/DesktopSidebar';

// Theme system
import ThemeController from '../common/ThemeController';
import { useThemeUtils } from '../../utils/themeUtils';

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
  const themeUtils = useThemeUtils();

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex' }}>
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
            backgroundColor: themeUtils.colors.background,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'auto',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: themeUtils.isDark 
                ? 'radial-gradient(circle at 20% 80%, rgba(255, 138, 101, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(92, 107, 192, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 138, 101, 0.05) 0%, transparent 70%)'
                : 'radial-gradient(circle at 20% 80%, rgba(255, 138, 101, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(92, 107, 192, 0.03) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 138, 101, 0.02) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            },
            '& > *': {
              position: 'relative',
              zIndex: 1,
            },
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/farm-management" element={<FarmManagementPage />} />
            <Route path="/cost-management" element={<CostManagementPage />} />
            <Route path="/plant-data" element={<PlantDataPage />} />
            <Route path="/farms" element={<FarmManagementPage />} />
            <Route path="/workers" element={<WorkerManagementPage user={user} />} />
            <Route path="/inventory" element={<InventoryPage user={user} />} />
            <Route path="/financial" element={<FinancialPage user={user} />} />
            <Route path="/analytics" element={<AnalyticsPage user={user} />} />
            <Route path="/customers" element={<CustomerManagementPage user={user} />} />
            <Route path="/research" element={<AnalyticsPage user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} />} />
          </Routes>
        </Box>
      </Router>
    </Box>
  );
};

export default DesktopInterface;