import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface SettingsPageProps {
  user: IUser;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Settings interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
