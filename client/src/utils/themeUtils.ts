import { useTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

export const useThemeUtils = () => {
  const muiTheme = useTheme();
  const customTheme = useCustomTheme();

  return {
    // Color utilities
    colors: {
      primary: customTheme.currentTheme.colors.primary,
      secondary: customTheme.currentTheme.colors.secondary,
      background: customTheme.currentTheme.colors.background,
      surface: customTheme.currentTheme.colors.surface,
      text: {
        primary: customTheme.currentTheme.colors.text.primary,
        secondary: customTheme.currentTheme.colors.text.secondary,
        disabled: customTheme.currentTheme.colors.text.disabled,
      },
      success: customTheme.currentTheme.colors.success,
      warning: customTheme.currentTheme.colors.warning,
      error: customTheme.currentTheme.colors.error,
      info: customTheme.currentTheme.colors.info,
      border: customTheme.currentTheme.colors.border,
      divider: customTheme.currentTheme.colors.divider,
      // Status colors
      status: {
        active: customTheme.currentTheme.colors.status.active,
        inactive: customTheme.currentTheme.colors.status.inactive,
        pending: customTheme.currentTheme.colors.status.pending,
        completed: customTheme.currentTheme.colors.status.completed,
      },
      // Block status colors
      blockStatus: {
        empty: customTheme.currentTheme.colors.blockStatus.empty,
        assigned: customTheme.currentTheme.colors.blockStatus.assigned,
        planted: customTheme.currentTheme.colors.blockStatus.planted,
        harvesting: customTheme.currentTheme.colors.blockStatus.harvesting,
        alert: customTheme.currentTheme.colors.blockStatus.alert,
      },
    },
    
    // Typography utilities
    typography: {
      fontFamily: {
        primary: customTheme.currentTheme.typography.fontFamily.primary,
        secondary: customTheme.currentTheme.typography.fontFamily.secondary,
        mono: customTheme.currentTheme.typography.fontFamily.mono,
      },
      fontSize: customTheme.currentTheme.typography.fontSize,
      fontWeight: customTheme.currentTheme.typography.fontWeight,
    },

    // Spacing utilities
    spacing: customTheme.currentTheme.spacing,

    // Border radius utilities
    borderRadius: customTheme.currentTheme.borderRadius,

    // Shadow utilities
    shadows: customTheme.currentTheme.shadows,

    // Animation utilities
    animation: customTheme.currentTheme.animation,

    // Layout utilities
    layout: customTheme.currentTheme.layout,

    // Asset utilities
    assets: customTheme.currentTheme.assets,

    // Theme mode
    isDark: customTheme.currentTheme.isDark,

    // Common sx props for consistent styling
    sx: {
      // Background styles
      background: {
        default: { backgroundColor: customTheme.currentTheme.colors.background },
        surface: { backgroundColor: customTheme.currentTheme.colors.surface },
        primary: { backgroundColor: customTheme.currentTheme.colors.primary },
        secondary: { backgroundColor: customTheme.currentTheme.colors.secondary },
      },
      
      // Text styles
      text: {
        primary: { color: customTheme.currentTheme.colors.text.primary },
        secondary: { color: customTheme.currentTheme.colors.text.secondary },
        disabled: { color: customTheme.currentTheme.colors.text.disabled },
        success: { color: customTheme.currentTheme.colors.success },
        warning: { color: customTheme.currentTheme.colors.warning },
        error: { color: customTheme.currentTheme.colors.error },
        info: { color: customTheme.currentTheme.colors.info },
      },

      // Border styles
      border: {
        default: { border: `1px solid ${customTheme.currentTheme.colors.border}` },
        divider: { border: `1px solid ${customTheme.currentTheme.colors.divider}` },
        primary: { border: `1px solid ${customTheme.currentTheme.colors.primary}` },
        secondary: { border: `1px solid ${customTheme.currentTheme.colors.secondary}` },
      },

      // Card styles
      card: {
        default: {
          backgroundColor: customTheme.currentTheme.colors.surface,
          borderRadius: customTheme.currentTheme.borderRadius.lg,
          boxShadow: customTheme.currentTheme.shadows.md,
          color: customTheme.currentTheme.colors.text.primary,
        },
        elevated: {
          backgroundColor: customTheme.currentTheme.colors.surface,
          borderRadius: customTheme.currentTheme.borderRadius.lg,
          boxShadow: customTheme.currentTheme.shadows.lg,
          color: customTheme.currentTheme.colors.text.primary,
        },
      },

      // Button styles
      button: {
        primary: {
          backgroundColor: customTheme.currentTheme.colors.primary,
          color: customTheme.currentTheme.colors.text.primary,
          borderRadius: customTheme.currentTheme.borderRadius.md,
          '&:hover': {
            backgroundColor: customTheme.currentTheme.colors.primary,
            opacity: 0.9,
          },
        },
        secondary: {
          backgroundColor: customTheme.currentTheme.colors.secondary,
          color: customTheme.currentTheme.colors.text.primary,
          borderRadius: customTheme.currentTheme.borderRadius.md,
          '&:hover': {
            backgroundColor: customTheme.currentTheme.colors.secondary,
            opacity: 0.9,
          },
        },
        outlined: {
          border: `1px solid ${customTheme.currentTheme.colors.primary}`,
          color: customTheme.currentTheme.colors.primary,
          backgroundColor: 'transparent',
          borderRadius: customTheme.currentTheme.borderRadius.md,
          '&:hover': {
            backgroundColor: customTheme.currentTheme.colors.primary,
            color: customTheme.currentTheme.colors.text.primary,
          },
        },
      },

      // Chip styles
      chip: {
        default: {
          backgroundColor: customTheme.currentTheme.colors.surface,
          color: customTheme.currentTheme.colors.text.primary,
          border: `1px solid ${customTheme.currentTheme.colors.border}`,
          borderRadius: customTheme.currentTheme.borderRadius.full,
        },
        primary: {
          backgroundColor: customTheme.currentTheme.colors.primary,
          color: customTheme.currentTheme.colors.text.primary,
          borderRadius: customTheme.currentTheme.borderRadius.full,
        },
        success: {
          backgroundColor: customTheme.currentTheme.colors.success,
          color: customTheme.currentTheme.colors.text.primary,
          borderRadius: customTheme.currentTheme.borderRadius.full,
        },
        warning: {
          backgroundColor: customTheme.currentTheme.colors.warning,
          color: customTheme.currentTheme.colors.text.primary,
          borderRadius: customTheme.currentTheme.borderRadius.full,
        },
        error: {
          backgroundColor: customTheme.currentTheme.colors.error,
          color: customTheme.currentTheme.colors.text.primary,
          borderRadius: customTheme.currentTheme.borderRadius.full,
        },
        // Status-specific chips
        status: {
          active: {
            backgroundColor: customTheme.currentTheme.colors.status.active,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          inactive: {
            backgroundColor: customTheme.currentTheme.colors.status.inactive,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          pending: {
            backgroundColor: customTheme.currentTheme.colors.status.pending,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          completed: {
            backgroundColor: customTheme.currentTheme.colors.status.completed,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
        },
        // Block status chips
        blockStatus: {
          empty: {
            backgroundColor: customTheme.currentTheme.colors.blockStatus.empty,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          assigned: {
            backgroundColor: customTheme.currentTheme.colors.blockStatus.assigned,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          planted: {
            backgroundColor: customTheme.currentTheme.colors.blockStatus.planted,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          harvesting: {
            backgroundColor: customTheme.currentTheme.colors.blockStatus.harvesting,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
          alert: {
            backgroundColor: customTheme.currentTheme.colors.blockStatus.alert,
            color: customTheme.currentTheme.colors.text.primary,
            borderRadius: customTheme.currentTheme.borderRadius.full,
          },
        },
      },
    },
  };
};
