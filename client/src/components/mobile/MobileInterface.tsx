import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { IUser, UserRole } from '../../types';

// Mobile layout components
import MobileNavigation from './layout/MobileNavigation';
import MobileHeader from './layout/MobileHeader';

// Mobile pages
import MobileTasksPage from './pages/MobileTasksPage';
import MobileHarvestPage from './pages/MobileHarvestPage';
import MobileDeliveryPage from './pages/MobileDeliveryPage';
import MobileProfilePage from './pages/MobileProfilePage';

interface MobileInterfaceProps {
  user: IUser;
}

const MobileInterface: React.FC<MobileInterfaceProps> = ({ user }) => {
  const { theme: themeMode } = useSelector((state: RootState) => state.interface);

  // Create mobile-optimized theme
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#4CAF50',
      },
      secondary: {
        main: '#FF9800',
      },
      background: {
        default: themeMode === 'light' ? '#f8f9fa' : '#121212',
        paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      // Larger text sizes for mobile
      h4: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
      button: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    components: {
      // Mobile-optimized component styles
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 48, // Larger touch targets
            borderRadius: 8,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
          },
          contained: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              minHeight: 48, // Larger input fields
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            minHeight: 64, // Larger list items for better touch interaction
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            width: 64,
            height: 64, // Larger floating action buttons
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Router>
          {/* Mobile Header */}
          <MobileHeader user={user} />

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: theme.palette.background.default,
              paddingBottom: '80px', // Space for bottom navigation
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <Routes>
              {/* Default route based on user role */}
              <Route 
                path="/" 
                element={
                  <Navigate 
                    to={user.role === UserRole.WORKER ? "/tasks" : "/delivery"} 
                    replace 
                  />
                } 
              />

              {/* Worker routes */}
              {user.role === UserRole.WORKER && (
                <>
                  <Route path="/tasks" element={<MobileTasksPage user={user} />} />
                  <Route path="/harvest" element={<MobileHarvestPage user={user} />} />
                </>
              )}

              {/* Driver/Farmer routes */}
              {(user.role === UserRole.FARMER) && (
                <>
                  <Route path="/delivery" element={<MobileDeliveryPage user={user} />} />
                  <Route path="/tasks" element={<MobileTasksPage user={user} />} />
                </>
              )}

              {/* Common routes */}
              <Route path="/profile" element={<MobileProfilePage user={user} />} />

              {/* Catch-all redirect */}
              <Route 
                path="*" 
                element={
                  <Navigate 
                    to={user.role === UserRole.WORKER ? "/tasks" : "/delivery"} 
                    replace 
                  />
                } 
              />
            </Routes>
          </Box>

          {/* Bottom Navigation */}
          <MobileNavigation user={user} />
        </Router>
      </Box>
    </ThemeProvider>
  );
};

export default MobileInterface;
