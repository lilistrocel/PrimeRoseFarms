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
        background: '#0F0F23',
        padding: isMobileDevice ? 2 : 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: isMobileDevice ? 350 : 400,
          background: '#1E1E2E',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ padding: isMobileDevice ? 3 : 4 }}>
          {/* Logo and Title */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                height: '60px',
                width: '60px',
                background: '#E91E63',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  background: '#C2185B',
                }
              }}
            >
              🌱
            </Box>
            <Typography
              variant={isMobileDevice ? "h5" : "h4"}
              component="h1"
              fontWeight="bold"
              color="#E91E63"
              gutterBottom
            >
              PrimeRose Farms
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
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
                    <Email sx={{ color: '#B0B0B0' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-input': {
                    color: '#FFFFFF',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E91E63',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E91E63',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#B0B0B0',
                  '&.Mui-focused': {
                    color: '#E91E63',
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
                    <Lock sx={{ color: '#B0B0B0' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                      sx={{ color: '#B0B0B0' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-input': {
                    color: '#FFFFFF',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E91E63',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E91E63',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#B0B0B0',
                  '&.Mui-focused': {
                    color: '#E91E63',
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
                backgroundColor: '#E91E63',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#C2185B',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Account Info */}
          <Box mt={3} p={2} sx={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: 1,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <Typography variant="caption" sx={{ color: '#B0B0B0', fontWeight: 600, mb: 1, display: 'block' }}>
              Demo Accounts Available:
            </Typography>
            <Typography variant="caption" sx={{ color: '#B0B0B0', display: 'block' }}>
              • Manager: manager@primerose.com
            </Typography>
            <Typography variant="caption" sx={{ color: '#B0B0B0', display: 'block' }}>
              • Worker: worker@primerose.com
            </Typography>
            <Typography variant="caption" sx={{ color: '#B0B0B0', display: 'block' }}>
              Password: demo123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginScreen;
