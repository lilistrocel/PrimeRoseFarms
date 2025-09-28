import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { store, useAppDispatch, useAppSelector } from './store';
import { verifyToken } from './store/slices/authSlice';
import { setOnlineStatus } from './store/slices/interfaceSlice';

// Main components
import LoginScreen from './components/auth/LoginScreen';
import InterfaceRouter from './components/InterfaceRouter';
import LoadingScreen from './components/common/LoadingScreen';

// Theme system
import { ThemeProvider } from './contexts/ThemeContext';
import { MaterialThemeProvider } from './contexts/MaterialThemeProvider';

// Fix for ResizeObserver error
import './utils/resizeObserverFix';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

  // Debug logging
  console.log('AppContent rendered:', { isAuthenticated, loading, user });

  // Check for existing token on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    dispatch(setOnlineStatus(navigator.onLine));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (loading && !user) {
    return <LoadingScreen message="Authenticating..." />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  // Show appropriate interface based on user role and device
  return <InterfaceRouter />;
};

const App: React.FC = () => {
  console.log('App component rendering...');
  
  return (
    <Provider store={store}>
      <ThemeProvider>
        <MaterialThemeProvider>
          <CssBaseline />
          <AppContent />
        </MaterialThemeProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
