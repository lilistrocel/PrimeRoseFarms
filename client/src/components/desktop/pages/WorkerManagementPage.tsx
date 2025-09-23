import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface WorkerManagementPageProps {
  user: IUser;
}

const WorkerManagementPage: React.FC<WorkerManagementPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Worker Management
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Worker Management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkerManagementPage;
