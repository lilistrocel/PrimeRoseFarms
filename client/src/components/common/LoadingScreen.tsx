import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        backgroundColor: '#f5f5f5',
        padding: 3,
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        PrimeRose Farms
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
