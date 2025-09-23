import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface AnalyticsPageProps {
  user: IUser;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics & Reports
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Analytics & Reports interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsPage;
