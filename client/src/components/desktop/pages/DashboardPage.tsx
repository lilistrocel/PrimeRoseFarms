import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import {
  Agriculture,
  TrendingUp,
  People,
  Inventory,
} from '@mui/icons-material';
import { IUser, UserRole } from '../../../types';

interface DashboardPageProps {
  user: IUser;
}

// Simplified dashboard for testing - removed complex StatCard component

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  return (
    <Box>
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          🌱 Welcome back, {user.firstName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Desktop Interface - PrimeRose Farms Management System
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
          Role: {user.role} | Email: {user.email}
        </Typography>
      </Box>

      {/* Success Message */}
      <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎉 Desktop Interface Successfully Loaded!
          </Typography>
          <Typography variant="body2">
            You are logged in as a <strong>{user.role}</strong> and seeing the complex desktop interface 
            with advanced analytics, comprehensive navigation, and detailed management tools.
          </Typography>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Desktop Interface Features:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Agriculture color="primary" />
              <Typography>Advanced Farm Management Tools</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp color="primary" />
              <Typography>Comprehensive Analytics & Reports</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <People color="primary" />
              <Typography>Detailed User & Worker Management</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Inventory color="primary" />
              <Typography>Complex Data Visualization</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              This interface is designed for management roles who need comprehensive data access 
              and complex operational controls. Check the sidebar for full navigation options.
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" sx={{ mr: 2 }}>
              View Full Dashboard
            </Button>
            <Button variant="contained">
              Explore Features
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
