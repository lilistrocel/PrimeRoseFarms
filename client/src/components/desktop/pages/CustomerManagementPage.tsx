import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface CustomerManagementPageProps {
  user: IUser;
}

const CustomerManagementPage: React.FC<CustomerManagementPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Customer Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Customer Management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerManagementPage;
