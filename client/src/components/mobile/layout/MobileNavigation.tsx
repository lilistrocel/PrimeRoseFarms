import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
} from '@mui/material';
import {
  Assignment,
  Agriculture,
  LocalShipping,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { IUser, UserRole } from '../../../types';

interface MobileNavigationProps {
  user: IUser;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavigationItems = (role: UserRole) => {
    switch (role) {
      case UserRole.WORKER:
        return [
          { label: 'Tasks', value: '/tasks', icon: <Assignment /> },
          { label: 'Harvest', value: '/harvest', icon: <Agriculture /> },
          { label: 'Profile', value: '/profile', icon: <Person /> },
        ];
      case UserRole.FARMER:
        return [
          { label: 'Tasks', value: '/tasks', icon: <Assignment /> },
          { label: 'Delivery', value: '/delivery', icon: <LocalShipping /> },
          { label: 'Profile', value: '/profile', icon: <Person /> },
        ];
      default:
        return [
          { label: 'Tasks', value: '/tasks', icon: <Assignment /> },
          { label: 'Profile', value: '/profile', icon: <Person /> },
        ];
    }
  };

  const navigationItems = getNavigationItems(user.role);
  const currentValue = navigationItems.find(item => 
    location.pathname.startsWith(item.value)
  )?.value || navigationItems[0]?.value;

  const handleNavigation = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1200,
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
      }} 
      elevation={8}
    >
      <BottomNavigation
        value={currentValue}
        onChange={handleNavigation}
        sx={{
          height: 80,
          '& .MuiBottomNavigationAction-root': {
            fontSize: '0.75rem',
            minWidth: 0,
            padding: '8px 12px',
            '&.Mui-selected': {
              fontSize: '0.75rem',
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 600,
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={
              item.label === 'Tasks' ? (
                <Badge badgeContent={3} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavigation;
