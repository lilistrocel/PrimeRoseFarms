import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface InventoryPageProps {
  user: IUser;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Inventory Management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryPage;
