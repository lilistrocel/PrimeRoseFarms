import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { IUser } from '../../../types';

interface MobileProfilePageProps {
  user: IUser;
}

const MobileProfilePage: React.FC<MobileProfilePageProps> = ({ user }) => {
  return (
    <Box sx={{ p: 2, pt: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Profile
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Profile interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MobileProfilePage;
