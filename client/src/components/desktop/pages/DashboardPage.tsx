import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
} from '@mui/material';
// Icons removed as they were not being used
import { IUser } from '../../../types';
import { useThemeUtils } from '../../../utils/themeUtils';

interface DashboardPageProps {
  user: IUser;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const themeUtils = useThemeUtils();
  
  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            color: themeUtils.colors.text.primary,
            mb: 1
          }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: themeUtils.colors.text.secondary }}>
            Welcome back, {user.firstName}! Here's your farm overview.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: themeUtils.colors.primary,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: themeUtils.colors.text.primary
          }}>
            {user.firstName[0]}{user.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: themeUtils.colors.text.primary }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Key Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Card sx={{ 
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: 2,
          p: 2,
          textAlign: 'center'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.primary, mb: 1 }}>3</Typography>
            <Typography variant="body2" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Active Farms
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: 2,
          p: 2,
          textAlign: 'center'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.primary, mb: 1 }}>24</Typography>
            <Typography variant="body2" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Total Blocks
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: 2,
          p: 2,
          textAlign: 'center'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.primary, mb: 1 }}>156</Typography>
            <Typography variant="body2" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Workers
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: 2,
          p: 2,
          textAlign: 'center'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: themeUtils.colors.primary, mb: 1 }}>94.2%</Typography>
            <Typography variant="body2" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Efficiency
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Farm Overview */}
        <Card sx={{ 
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: 2,
          p: 3
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: themeUtils.colors.text.primary }}>
              Farm Overview
            </Typography>
            <Button variant="outlined" size="small" sx={{ 
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: themeUtils.colors.text.primary,
              '&:hover': {
                borderColor: themeUtils.colors.primary,
                backgroundColor: 'rgba(233, 30, 99, 0.1)'
              }
            }}>
              View Details
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: themeUtils.colors.success, mb: 0.5 }}>3</Typography>
              <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Farms
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: themeUtils.colors.success, mb: 0.5 }}>24</Typography>
              <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Blocks
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: themeUtils.colors.success, mb: 0.5 }}>156</Typography>
              <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Workers
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Performance Metrics */}
        <Card sx={{ 
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: 2,
          p: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: themeUtils.colors.text.primary, mb: 2 }}>
            Performance
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: themeUtils.colors.primary, mb: 1 }}>
            94.2%
          </Typography>
          <Typography variant="body2" sx={{ color: themeUtils.colors.text.secondary, mb: 2 }}>
            Efficiency Rating
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={94.2} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: themeUtils.colors.primary,
                borderRadius: 3
              }
            }} 
          />
        </Card>
      </Box>

      {/* Recent Activity */}
      <Card sx={{ 
        background: themeUtils.colors.surface,
        border: `1px solid ${themeUtils.colors.border}`,
        borderRadius: 2,
        p: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: themeUtils.colors.text.primary }}>
            Recent Activity
          </Typography>
          <Button variant="outlined" size="small" sx={{ 
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: themeUtils.colors.text.primary,
            '&:hover': {
              borderColor: themeUtils.colors.primary,
              backgroundColor: 'rgba(233, 30, 99, 0.1)'
            }
          }}>
            View All
          </Button>
        </Box>
        <Box sx={{ spaceY: 2 }}>
          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: 1, 
            border: `1px solid ${themeUtils.colors.border}`,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: themeUtils.colors.success,
                  mr: 1
                }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Harvest Completed
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: themeUtils.colors.success, fontWeight: 600 }}>
                +2.3 tons
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary }}>
              North Valley Farm - Block A1
            </Typography>
          </Box>

          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: 1, 
            border: `1px solid ${themeUtils.colors.border}`,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: themeUtils.colors.info,
                  mr: 1
                }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  New Worker Added
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: themeUtils.colors.info, fontWeight: 600 }}>
                Today
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary }}>
              Maria Garcia - Field Operations
            </Typography>
          </Box>

          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: 1, 
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: themeUtils.colors.warning,
                  mr: 1
                }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Maintenance Due
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: themeUtils.colors.warning, fontWeight: 600 }}>
                3 days
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary }}>
              Greenhouse A - Irrigation System
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default DashboardPage;