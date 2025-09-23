import React, { useEffect } from 'react';
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import { useAppDispatch, useAppSelector } from '../store';
import { setDeviceType, autoSetInterface } from '../store/slices/interfaceSlice';
import { InterfaceType } from '../types';

// Import interface components
import DesktopInterface from './desktop/DesktopInterface';
import MobileInterface from './mobile/MobileInterface';
import LoadingScreen from './common/LoadingScreen';

const InterfaceRouter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentInterface, deviceType } = useAppSelector((state) => state.interface);

  // Determine device type and set interface on component mount
  useEffect(() => {
    let detectedDeviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    
    if (isMobile) {
      detectedDeviceType = 'mobile';
    } else if (isTablet) {
      detectedDeviceType = 'tablet';
    } else if (isDesktop) {
      detectedDeviceType = 'desktop';
    }

    dispatch(setDeviceType(detectedDeviceType));
  }, [dispatch]);

  // Auto-set interface when user role changes or device type is determined
  useEffect(() => {
    if (user?.role && deviceType) {
      dispatch(autoSetInterface(user.role));
    }
  }, [user?.role, deviceType, dispatch]);

  // Show loading if user is not available yet
  if (!user) {
    return <LoadingScreen message="Loading user interface..." />;
  }

  // Render appropriate interface based on current interface type
  switch (currentInterface) {
    case InterfaceType.MOBILE:
      return <MobileInterface user={user} />;
    case InterfaceType.DESKTOP:
      return <DesktopInterface user={user} />;
    default:
      return <LoadingScreen message="Determining interface..." />;
  }
};

export default InterfaceRouter;
