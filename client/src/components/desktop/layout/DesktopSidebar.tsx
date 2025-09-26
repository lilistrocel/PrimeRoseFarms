import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Agriculture,
  People,
  Inventory,
  Analytics,
  AttachMoney,
  Groups,
  Settings,
  Science,
  ManageAccounts,
  Business,
  LocalFlorist,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { IUser } from '../../../types';

interface DesktopSidebarProps {
  user: IUser;
  drawerWidth: number;
  open: boolean;
}

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: string[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: ['admin', 'manager', 'agronomist', 'hr', 'sales'],
  },
  {
    text: 'User Management',
    icon: <ManageAccounts />,
    path: '/user-management',
    roles: ['admin', 'manager'],
    badge: 'New',
  },
  {
    text: 'Farm Management',
    icon: <Business />,
    path: '/farm-management',
    roles: ['admin', 'manager'],
    badge: 'New',
  },
  {
    text: 'Cost Management',
    icon: <AttachMoney />,
    path: '/cost-management',
    roles: ['admin', 'manager'],
    badge: 'New',
  },
  {
    text: 'Plant Data Management',
    icon: <LocalFlorist />,
    path: '/plant-data',
    roles: ['admin', 'manager', 'agronomist'],
    badge: 'New',
  },
  {
    text: 'Farm Operations',
    icon: <Agriculture />,
    path: '/farms',
    roles: ['admin', 'manager', 'agronomist'],
  },
  {
    text: 'Worker Management',
    icon: <People />,
    path: '/workers',
    roles: ['admin', 'manager', 'hr'],
  },
  {
    text: 'Inventory',
    icon: <Inventory />,
    path: '/inventory',
    roles: ['admin', 'manager', 'agronomist'],
  },
  {
    text: 'Financial',
    icon: <AttachMoney />,
    path: '/financial',
    roles: ['admin', 'manager'],
  },
  {
    text: 'Analytics',
    icon: <Analytics />,
    path: '/analytics',
    roles: ['admin', 'manager', 'agronomist'],
  },
  {
    text: 'Customer Management',
    icon: <Groups />,
    path: '/customers',
    roles: ['admin', 'sales'],
  },
  {
    text: 'Research Lab',
    icon: <Science />,
    path: '/research',
    roles: ['admin', 'agronomist'],
    badge: 'Beta',
  },
];

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ user, drawerWidth, open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter navigation items based on user role
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user.role.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        mb: { xs: 1, sm: 2 },
        transition: 'all 0.2s ease'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 1
        }}>
          <Box
            component="img"
            src="/logo.png"
            alt="PrimeRose Farms Logo"
            sx={{
              height: { xs: '40px', sm: '50px' },
              width: 'auto',
              filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(120%) contrast(110%)',
              }
            }}
          />
          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 700, 
            color: '#E91E63', 
            fontSize: { xs: '0.9rem', sm: '1.1rem' }, 
            letterSpacing: '-0.01em',
            lineHeight: 1.2
          }}>
            PrimeRose Farms
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ 
          color: '#808080', 
          fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
          fontWeight: 500,
          display: 'block',
          mt: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {user.role.toLowerCase().replace('_', ' ')} Portal
        </Typography>
      </Box>

      <Divider />

      {/* User Info */}
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        background: 'rgba(255, 255, 255, 0.02)', 
        borderRadius: '8px', 
        mx: { xs: 1, sm: 2 }, 
        mb: { xs: 1, sm: 2 },
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease'
      }}>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 600, 
          color: '#FFFFFF', 
          fontSize: { xs: '0.9rem', sm: '1rem' },
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#808080', 
          fontSize: { xs: '0.8rem', sm: '0.875rem' }, 
          mb: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {user.email}
        </Typography>
        <Chip 
          label={user.role} 
          size="small" 
          sx={{ 
            mt: 1, 
            backgroundColor: '#E91E63', 
            color: '#FFFFFF', 
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            height: { xs: '20px', sm: '24px' }
          }}
        />
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {availableItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  mx: { xs: 1, sm: 2 },
                  my: { xs: 0.125, sm: 0.25 },
                  borderRadius: 8,
                  transition: 'all 0.2s ease',
                  minHeight: { xs: '40px', sm: '48px' },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    color: '#E91E63',
                    borderLeft: '2px solid #E91E63',
                    '& .MuiListItemIcon-root': {
                      color: '#E91E63',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(233, 30, 99, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: '#FFFFFF',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: { xs: 36, sm: 40 },
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#E91E63' : '#B0B0B0',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    sx={{ 
                      height: { xs: 18, sm: 20 }, 
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                      backgroundColor: '#FF6B6B',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      borderRadius: '10px',
                      minWidth: { xs: 'auto', sm: 'auto' }
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Settings at bottom */}
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigate('/settings')}
            sx={{ mx: 1, borderRadius: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText 
              primary="Settings"
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: { xs: drawerWidth, sm: drawerWidth },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: drawerWidth, sm: drawerWidth },
          boxSizing: 'border-box',
          backgroundColor: '#0F0F23',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s ease',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default DesktopSidebar;
