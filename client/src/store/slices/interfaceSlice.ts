import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterfaceType, UserRole, DESKTOP_ROLES, MOBILE_ROLES } from '../../types';

interface IInterfaceState {
  currentInterface: InterfaceType;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  isOnline: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean; // For desktop interface
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: string;
  }>;
}

const initialState: IInterfaceState = {
  currentInterface: InterfaceType.DESKTOP,
  deviceType: 'desktop',
  isOnline: navigator.onLine,
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
};

// Utility function to determine interface type based on role and device
export const determineInterface = (role: UserRole, deviceType: string): InterfaceType => {
  // Force mobile interface for Worker role regardless of device
  if (MOBILE_ROLES.includes(role)) {
    return InterfaceType.MOBILE;
  }
  
  // Desktop roles get desktop interface unless on mobile device
  if (DESKTOP_ROLES.includes(role)) {
    return deviceType === 'mobile' ? InterfaceType.MOBILE : InterfaceType.DESKTOP;
  }
  
  // Default to desktop for unknown roles
  return InterfaceType.DESKTOP;
};

const interfaceSlice = createSlice({
  name: 'interface',
  initialState,
  reducers: {
    setInterface: (state, action: PayloadAction<InterfaceType>) => {
      state.currentInterface = action.payload;
    },
    setDeviceType: (state, action: PayloadAction<'desktop' | 'tablet' | 'mobile'>) => {
      state.deviceType = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      message: string;
      type: 'info' | 'warning' | 'error' | 'success';
    }>) => {
      const notification = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date().toISOString(),
      };
      state.notifications.unshift(notification);
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    // Auto-determine interface based on user role and device
    autoSetInterface: (state, action: PayloadAction<UserRole>) => {
      const userRole = action.payload;
      const newInterface = determineInterface(userRole, state.deviceType);
      state.currentInterface = newInterface;
    },
  },
});

export const {
  setInterface,
  setDeviceType,
  setOnlineStatus,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  autoSetInterface,
} = interfaceSlice.actions;

export default interfaceSlice.reducer;
