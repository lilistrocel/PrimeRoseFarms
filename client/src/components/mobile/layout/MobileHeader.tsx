import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
} from '@mui/material';
import {
  Notifications,
  Wifi,
  WifiOff,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { IUser } from '../../../types';

interface MobileHeaderProps {
  user: IUser;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user }) => {
  const { isOnline, notifications } = useSelector((state: RootState) => state.interface);
  
  const urgentNotifications = notifications.filter(
    n => n.type === 'error' || n.type === 'warning'
  ).length;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201,
        backgroundColor: 'primary.main',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        {/* User Avatar */}
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36, 
            bgcolor: 'secondary.main',
            mr: 2 
          }}
        >
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </Avatar>

        {/* User Name and Role */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
            {user.role.toLowerCase().replace('_', ' ')}
          </Typography>
        </Box>

        {/* Status Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Connection Status */}
          <IconButton 
            size="small" 
            sx={{ 
              color: isOnline ? 'white' : 'error.light',
              opacity: isOnline ? 0.7 : 1,
            }}
          >
            {isOnline ? <Wifi /> : <WifiOff />}
          </IconButton>

          {/* Notifications */}
          <IconButton size="small" sx={{ color: 'white' }}>
            <Badge 
              badgeContent={urgentNotifications} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  minWidth: 16,
                  height: 16,
                },
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MobileHeader;
