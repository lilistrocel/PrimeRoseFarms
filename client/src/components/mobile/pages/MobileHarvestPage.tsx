import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface MobileHarvestPageProps {
  user: IUser;
}

const MobileHarvestPage: React.FC<MobileHarvestPageProps> = ({ user }) => {
  return (
    <Box sx={{ p: 2, pt: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Harvest Recording
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Harvest recording interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MobileHarvestPage;
