import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store';
import { toggleSidebar } from '../../../store/slices/interfaceSlice';
import { logoutUser } from '../../../store/slices/authSlice';
import { IUser } from '../../../types';
import ThemeController from '../../common/ThemeController';
import { useThemeUtils } from '../../../utils/themeUtils';

interface DesktopNavbarProps {
  user: IUser;
  drawerWidth: number;
}

const DesktopNavbar: React.FC<DesktopNavbarProps> = ({ user, drawerWidth }) => {
  const dispatch = useAppDispatch();
  const { sidebarOpen, notifications } = useAppSelector((state) => state.interface);
  const themeUtils = useThemeUtils();
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleMenuClose();
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const unreadNotifications = notifications.filter(n => n.type === 'error' || n.type === 'warning').length;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
        ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        {/* Menu toggle button */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={handleToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          PrimeRose Farms - {user.role.toLowerCase().replace('_', ' ')} Dashboard
        </Typography>

        {/* Right side icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme Controller */}
          <ThemeController />

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DesktopNavbar;
