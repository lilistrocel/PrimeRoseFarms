import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface MobileDeliveryPageProps {
  user: IUser;
}

const MobileDeliveryPage: React.FC<MobileDeliveryPageProps> = ({ user }) => {
  return (
    <Box sx={{ p: 2, pt: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Delivery Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Delivery management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MobileDeliveryPage;
