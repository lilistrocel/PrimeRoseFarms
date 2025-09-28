# Theme System Documentation

## Overview

The PrimeRoseFarms application includes a comprehensive theme system that allows users to customize colors, fonts, logos, and other visual elements. The theme system is built with React Context and provides both predefined themes and custom theme creation capabilities.

## Features

### 🎨 **Theme Customization**
- **Colors**: Primary, secondary, background, surface, text, status colors
- **Typography**: Font families, sizes, weights, line heights
- **Assets**: Logos, icons, images, favicons
- **Layout**: Spacing, shadows, border radius, animations
- **Block Status Colors**: Custom colors for different block states

### 🎯 **Predefined Themes**
1. **Dark Default**: Modern dark theme with blue accents
2. **Light Default**: Clean light theme with modern design
3. **Zen Garden**: Peaceful zen-inspired theme with natural colors
4. **Agriculture Green**: Natural green theme for agricultural applications

### 🔧 **Theme Management**
- **Theme Selection**: Easy switching between themes
- **Custom Themes**: Create and save custom themes
- **Import/Export**: Share themes via JSON data
- **Persistence**: Themes are saved to localStorage
- **Reset**: Return to default themes

## Usage

### Basic Usage

```tsx
import { useTheme } from '../contexts/ThemeContext';
import { useThemeStyles } from '../hooks/useThemeStyles';

const MyComponent = () => {
  const { currentTheme, setTheme } = useTheme();
  const { getColor, cardStyles, buttonStyles } = useThemeStyles();
  
  return (
    <Box sx={cardStyles}>
      <Button sx={buttonStyles}>
        Themed Button
      </Button>
    </Box>
  );
};
```

### Theme Controller

The theme controller is automatically added to the desktop navbar. Click the palette icon to open the theme customization dialog.

### Custom Theme Creation

```tsx
const { createCustomTheme } = useTheme();

const newTheme = {
  name: 'My Custom Theme',
  description: 'A custom theme for my farm',
  colors: {
    primary: '#22C55E',
    secondary: '#16A34A',
    // ... other color properties
  },
  // ... other theme properties
};

const themeId = createCustomTheme(newTheme);
```

## Theme Structure

### Colors
```typescript
interface ThemeColors {
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
  status: {
    active: string;
    inactive: string;
    pending: string;
    completed: string;
  };
  blockStatus: {
    empty: string;
    assigned: string;
    planted: string;
    harvesting: string;
    alert: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
    card: string[];
  };
}
```

### Typography
```typescript
interface ThemeTypography {
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
```

## Predefined Styles

The `useThemeStyles` hook provides predefined style combinations:

### Card Styles
```tsx
const { cardStyles } = useThemeStyles();
<Card sx={cardStyles}>Content</Card>
```

### Button Styles
```tsx
const { buttonStyles } = useThemeStyles();
<Button sx={buttonStyles}>Themed Button</Button>
```

### Chip Styles
```tsx
const { chipStyles } = useThemeStyles();
<Chip sx={chipStyles('planted')}>Planted</Chip>
```

### Input Styles
```tsx
const { inputStyles } = useThemeStyles();
<TextField sx={inputStyles} />
```

## Theme Controller UI

The theme controller provides a comprehensive interface for theme customization:

### Tabs
1. **Colors**: Customize all color properties
2. **Typography**: Adjust fonts and text styling
3. **Assets**: Manage logos and images
4. **Settings**: Theme management and import/export

### Features
- **Real-time Preview**: See changes immediately
- **Color Picker**: Visual color selection
- **Theme Presets**: Quick theme switching
- **Custom Themes**: Create and save custom themes
- **Import/Export**: Share themes via JSON
- **Reset**: Return to default themes

## Integration

### App Setup
```tsx
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);
```

### Component Integration
```tsx
import { useThemeStyles } from '../hooks/useThemeStyles';

const MyComponent = () => {
  const { getColor, cardStyles, textStyles } = useThemeStyles();
  
  return (
    <Box sx={cardStyles}>
      <Typography sx={textStyles.primary}>
        Themed text
      </Typography>
    </Box>
  );
};
```

## Best Practices

1. **Use Predefined Styles**: Leverage the predefined style combinations for consistency
2. **Color Accessibility**: Ensure sufficient contrast ratios for text readability
3. **Theme Persistence**: Always use the theme context for state management
4. **Custom Themes**: Create custom themes for specific use cases
5. **Export/Import**: Use the export/import functionality for theme sharing

## File Structure

```
src/
├── types/
│   └── theme.ts                 # Theme type definitions
├── config/
│   └── themePresets.ts         # Predefined themes
├── contexts/
│   └── ThemeContext.tsx        # Theme context and provider
├── hooks/
│   └── useThemeStyles.ts       # Theme styles hook
├── components/
│   └── common/
│       └── ThemeController.tsx # Theme controller UI
└── docs/
    └── THEME_SYSTEM.md         # This documentation
```

## Future Enhancements

- **Theme Templates**: Pre-built theme templates for different industries
- **Advanced Color Tools**: Color palette generators and accessibility tools
- **Theme Sharing**: Online theme sharing and marketplace
- **Animation Customization**: Advanced animation and transition controls
- **Responsive Themes**: Different themes for different screen sizes
