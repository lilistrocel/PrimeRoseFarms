import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface FarmManagementPageProps {
  user: IUser;
}

const FarmManagementPage: React.FC<FarmManagementPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Farm Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Farm Management dashboard coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FarmManagementPage;
