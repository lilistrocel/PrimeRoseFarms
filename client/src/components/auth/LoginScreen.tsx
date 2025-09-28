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
import { useThemeUtils } from '../../utils/themeUtils';

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const themeUtils = useThemeUtils();
  
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
        background: themeUtils.colors.background,
        padding: isMobileDevice ? 2 : 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: isMobileDevice ? 350 : 400,
          background: themeUtils.colors.surface,
          border: `1px solid ${themeUtils.colors.border}`,
          borderRadius: themeUtils.borderRadius.lg,
          boxShadow: themeUtils.shadows.md,
        }}
      >
        <CardContent sx={{ padding: isMobileDevice ? 3 : 4 }}>
          {/* Logo and Title */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                height: '60px',
                width: '60px',
                background: themeUtils.colors.primary,
                borderRadius: themeUtils.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: themeUtils.colors.text.primary,
                marginBottom: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  background: themeUtils.colors.primary,
                  opacity: 0.9,
                }
              }}
            >
              🌱
            </Box>
            <Typography
              variant={isMobileDevice ? "h5" : "h4"}
              component="h1"
              fontWeight="bold"
              color={themeUtils.colors.primary}
              gutterBottom
            >
              PrimeRose Farms
            </Typography>
            <Typography variant="body2" sx={{ color: themeUtils.colors.text.secondary }}>
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
                    <Email sx={{ color: themeUtils.colors.text.secondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: themeUtils.colors.text.primary,
                  '& .MuiOutlinedInput-input': {
                    color: themeUtils.colors.text.primary,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeUtils.colors.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeUtils.colors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeUtils.colors.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeUtils.colors.text.secondary,
                  '&.Mui-focused': {
                    color: themeUtils.colors.primary,
                  },
                },
              }}
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
                    <Lock sx={{ color: themeUtils.colors.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                      sx={{ color: themeUtils.colors.text.secondary }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: themeUtils.colors.text.primary,
                  '& .MuiOutlinedInput-input': {
                    color: themeUtils.colors.text.primary,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeUtils.colors.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeUtils.colors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeUtils.colors.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeUtils.colors.text.secondary,
                  '&.Mui-focused': {
                    color: themeUtils.colors.primary,
                  },
                },
              }}
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
                backgroundColor: themeUtils.colors.primary,
                color: themeUtils.colors.text.primary,
                '&:hover': {
                  backgroundColor: themeUtils.colors.primary,
                  opacity: 0.9,
                },
                '&:disabled': {
                  backgroundColor: themeUtils.colors.surface,
                  color: themeUtils.colors.text.disabled,
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Account Info */}
          <Box mt={3} p={2} sx={{ 
            background: themeUtils.colors.surface, 
            borderRadius: themeUtils.borderRadius.md,
            border: `1px solid ${themeUtils.colors.border}`
          }}>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, fontWeight: 600, mb: 1, display: 'block' }}>
              Demo Accounts Available:
            </Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, display: 'block' }}>
              • Manager: manager@primerose.com
            </Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, display: 'block' }}>
              • Worker: worker@primerose.com
            </Typography>
            <Typography variant="caption" sx={{ color: themeUtils.colors.text.secondary, display: 'block' }}>
              Password: demo123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginScreen;
