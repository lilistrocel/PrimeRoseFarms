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
  Grass,
  People,
  Inventory,
  Analytics,
  AttachMoney,
  Groups,
  Settings,
  Science,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { IUser, UserRole } from '../../../types';

interface DesktopSidebarProps {
  user: IUser;
  drawerWidth: number;
  open: boolean;
}

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST, UserRole.HR, UserRole.SALES],
  },
  {
    text: 'Farm Management',
    icon: <Agriculture />,
    path: '/farms',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST],
  },
  {
    text: 'Plant Data',
    icon: <Grass />,
    path: '/plants',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST],
    badge: 'New',
  },
  {
    text: 'Worker Management',
    icon: <People />,
    path: '/workers',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
  },
  {
    text: 'Inventory',
    icon: <Inventory />,
    path: '/inventory',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST],
  },
  {
    text: 'Financial',
    icon: <AttachMoney />,
    path: '/financial',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: 'Analytics',
    icon: <Analytics />,
    path: '/analytics',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGRONOMIST],
  },
  {
    text: 'Customer Management',
    icon: <Groups />,
    path: '/customers',
    roles: [UserRole.ADMIN, UserRole.SALES],
  },
  {
    text: 'Research Lab',
    icon: <Science />,
    path: '/research',
    roles: [UserRole.ADMIN, UserRole.AGRONOMIST],
    badge: 'Beta',
  },
];

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ user, drawerWidth, open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter navigation items based on user role
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🌱 PrimeRose Farms
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {user.role.toLowerCase().replace('_', ' ')} Portal
        </Typography>
      </Box>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user.email}
        </Typography>
        <Chip 
          label={user.role} 
          size="small" 
          color="primary" 
          sx={{ mt: 1 }}
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
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 'medium' : 'regular',
                  }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="secondary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
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
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default DesktopSidebar;
