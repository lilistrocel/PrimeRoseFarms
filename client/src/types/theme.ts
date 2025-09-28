export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  divider: string;
  shadow: string;
  // Status colors
  status: {
    active: string;
    inactive: string;
    pending: string;
    completed: string;
  };
  // Block status colors
  blockStatus: {
    empty: string;
    assigned: string;
    planted: string;
    harvesting: string;
    alert: string;
  };
  // Gradient colors
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
    card: string[];
  };
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeAnimation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ThemeLayout {
  maxWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface ThemeAssets {
  logo: {
    primary: string;
    secondary: string;
    icon: string;
    favicon: string;
  };
  images: {
    background: string;
    placeholder: string;
    avatar: string;
  };
  icons: {
    style: 'filled' | 'outlined' | 'rounded' | 'sharp' | 'two-tone';
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  };
}

export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  animation: ThemeAnimation;
  layout: ThemeLayout;
  assets: ThemeAssets;
  isDark: boolean;
  isCustom: boolean;
}

export interface ThemeContextType {
  currentTheme: CustomTheme;
  themes: CustomTheme[];
  setTheme: (themeId: string) => void;
  updateTheme: (updates: Partial<CustomTheme>) => void;
  createCustomTheme: (theme: Omit<CustomTheme, 'id'>) => string;
  deleteCustomTheme: (themeId: string) => void;
  resetTheme: () => void;
  exportTheme: (themeId: string) => string;
  importTheme: (themeData: string) => void;
}
