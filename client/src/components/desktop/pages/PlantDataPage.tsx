import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface PlantDataPageProps {
  user: IUser;
}

const PlantDataPage: React.FC<PlantDataPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Plant Data Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Plant Data management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlantDataPage;
