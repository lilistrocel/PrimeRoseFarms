import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { ILoginCredentials } from '../../types';

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [credentials, setCredentials] = useState<ILoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof ILoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      return;
    }

    dispatch(loginUser(credentials));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: isMobileDevice ? 2 : 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: isMobileDevice ? 350 : 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <CardContent sx={{ padding: isMobileDevice ? 3 : 4 }}>
          {/* Logo and Title */}
          <Box textAlign="center" mb={4}>
            <Typography
              variant={isMobileDevice ? "h5" : "h4"}
              component="h1"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              🌱 PrimeRose Farms
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Agricultural Farm Management System
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={credentials.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !credentials.email || !credentials.password}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Account Info */}
          <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="caption" color="textSecondary" display="block">
              Demo Accounts Available:
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              • Manager: manager@primerose.com
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              • Worker: worker@primerose.com
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              Password: demo123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginScreen;
