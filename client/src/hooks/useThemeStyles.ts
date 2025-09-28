import { useTheme } from '../contexts/ThemeContext';
import { SxProps, Theme } from '@mui/material';

export const useThemeStyles = () => {
  const { currentTheme } = useTheme();

  const getColor = (path: string): string => {
    const keys = path.split('.');
    let current: any = currentTheme.colors;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '#000000'; // fallback color
      }
    }
    
    return typeof current === 'string' ? current : '#000000';
  };

  const getGradient = (type: 'primary' | 'secondary' | 'background' | 'card'): string => {
    const gradient = currentTheme.colors.gradients[type];
    return `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`;
  };

  const getShadow = (type: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'): string => {
    return currentTheme.shadows[type];
  };

  const getSpacing = (type: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'): string => {
    return currentTheme.spacing[type];
  };

  const getBorderRadius = (type: 'sm' | 'md' | 'lg' | 'xl' | 'full'): string => {
    return currentTheme.borderRadius[type];
  };

  const getFontSize = (type: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'): string => {
    return currentTheme.typography.fontSize[type];
  };

  const getFontWeight = (type: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'): number => {
    return currentTheme.typography.fontWeight[type];
  };

  const getAnimation = (type: 'fast' | 'normal' | 'slow'): string => {
    return currentTheme.animation.duration[type];
  };

  const getEasing = (type: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut'): string => {
    return currentTheme.animation.easing[type];
  };

  // Predefined style combinations
  const cardStyles: SxProps<Theme> = {
    backgroundColor: getColor('surface'),
    borderRadius: getBorderRadius('lg'),
    boxShadow: getShadow('md'),
    border: `1px solid ${getColor('border')}`,
    transition: `all ${getAnimation('normal')} ${getEasing('easeInOut')}`,
    '&:hover': {
      boxShadow: getShadow('lg'),
      transform: 'translateY(-2px)',
    },
  };

  const buttonStyles: SxProps<Theme> = {
    background: getGradient('primary'),
    color: 'white',
    borderRadius: getBorderRadius('md'),
    padding: `${getSpacing('sm')} ${getSpacing('lg')}`,
    fontWeight: getFontWeight('medium'),
    textTransform: 'none',
    transition: `all ${getAnimation('normal')} ${getEasing('easeInOut')}`,
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: getShadow('md'),
    },
  };

  const chipStyles = (status: 'empty' | 'assigned' | 'planted' | 'harvesting' | 'alert'): SxProps<Theme> => ({
    backgroundColor: getColor(`blockStatus.${status}`),
    color: 'white',
    borderRadius: getBorderRadius('full'),
    fontWeight: getFontWeight('medium'),
    fontSize: getFontSize('sm'),
  });

  const inputStyles: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: getColor('surface'),
      borderRadius: getBorderRadius('md'),
      '& fieldset': {
        borderColor: getColor('border'),
      },
      '&:hover fieldset': {
        borderColor: getColor('primary'),
      },
      '&.Mui-focused fieldset': {
        borderColor: getColor('primary'),
      },
    },
    '& .MuiInputLabel-root': {
      color: getColor('text.secondary'),
      '&.Mui-focused': {
        color: getColor('primary'),
      },
    },
  };

  const tabStyles: SxProps<Theme> = {
    '& .MuiTabs-indicator': {
      backgroundColor: getColor('primary'),
      height: '3px',
      borderRadius: getBorderRadius('sm'),
    },
    '& .MuiTab-root': {
      color: getColor('text.secondary'),
      fontWeight: getFontWeight('medium'),
      '&.Mui-selected': {
        color: getColor('primary'),
      },
    },
  };

  const backgroundStyles: SxProps<Theme> = {
    background: getGradient('background'),
    minHeight: '100vh',
    color: getColor('text.primary'),
  };

  const surfaceStyles: SxProps<Theme> = {
    backgroundColor: getColor('surface'),
    borderRadius: getBorderRadius('lg'),
    boxShadow: getShadow('sm'),
    border: `1px solid ${getColor('border')}`,
  };

  const textStyles = {
    primary: {
      color: getColor('text.primary'),
      fontFamily: currentTheme.typography.fontFamily.primary,
    },
    secondary: {
      color: getColor('text.secondary'),
      fontFamily: currentTheme.typography.fontFamily.primary,
    },
    disabled: {
      color: getColor('text.disabled'),
      fontFamily: currentTheme.typography.fontFamily.primary,
    },
  };

  return {
    // Color utilities
    getColor,
    getGradient,
    
    // Style utilities
    getShadow,
    getSpacing,
    getBorderRadius,
    getFontSize,
    getFontWeight,
    getAnimation,
    getEasing,
    
    // Predefined styles
    cardStyles,
    buttonStyles,
    chipStyles,
    inputStyles,
    tabStyles,
    backgroundStyles,
    surfaceStyles,
    textStyles,
    
    // Theme info
    isDark: currentTheme.isDark,
    theme: currentTheme,
  };
};
