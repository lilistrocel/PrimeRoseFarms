import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface FinancialPageProps {
  user: IUser;
}

const FinancialPage: React.FC<FinancialPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Financial Management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialPage;
