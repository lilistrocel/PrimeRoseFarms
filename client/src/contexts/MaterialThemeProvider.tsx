import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from './ThemeContext';

interface MaterialThemeContextType {
  // Add any additional context if needed
}

const MaterialThemeContext = createContext<MaterialThemeContextType | undefined>(undefined);

export const useMaterialTheme = () => {
  const context = useContext(MaterialThemeContext);
  if (context === undefined) {
    throw new Error('useMaterialTheme must be used within a MaterialThemeProvider');
  }
  return context;
};

interface MaterialThemeProviderProps {
  children: React.ReactNode;
}

export const MaterialThemeProvider: React.FC<MaterialThemeProviderProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: currentTheme.isDark ? 'dark' : 'light',
        primary: {
          main: currentTheme.colors.primary,
        },
        secondary: {
          main: currentTheme.colors.secondary,
        },
        background: {
          default: currentTheme.colors.background,
          paper: currentTheme.colors.surface,
        },
        text: {
          primary: currentTheme.colors.text.primary,
          secondary: currentTheme.colors.text.secondary,
          disabled: currentTheme.colors.text.disabled,
        },
        success: {
          main: currentTheme.colors.success,
        },
        warning: {
          main: currentTheme.colors.warning,
        },
        error: {
          main: currentTheme.colors.error,
        },
        info: {
          main: currentTheme.colors.info,
        },
        divider: currentTheme.colors.divider,
      },
      typography: {
        fontFamily: currentTheme.typography.fontFamily.primary,
        h1: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize['4xl'],
          fontWeight: currentTheme.typography.fontWeight.bold,
        },
        h2: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize['3xl'],
          fontWeight: currentTheme.typography.fontWeight.bold,
        },
        h3: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize['2xl'],
          fontWeight: currentTheme.typography.fontWeight.semibold,
        },
        h4: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize.xl,
          fontWeight: currentTheme.typography.fontWeight.semibold,
        },
        h5: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize.lg,
          fontWeight: currentTheme.typography.fontWeight.medium,
        },
        h6: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize.base,
          fontWeight: currentTheme.typography.fontWeight.medium,
        },
        body1: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize.base,
          fontWeight: currentTheme.typography.fontWeight.normal,
        },
        body2: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontSize: currentTheme.typography.fontSize.sm,
          fontWeight: currentTheme.typography.fontWeight.normal,
        },
        button: {
          fontFamily: currentTheme.typography.fontFamily.primary,
          fontWeight: currentTheme.typography.fontWeight.medium,
        },
      },
      shape: {
        borderRadius: parseInt(currentTheme.borderRadius.md.replace('rem', '')) * 16, // Convert rem to px
      },
      shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
        '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
        '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
        '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
        '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
        '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
        '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
        '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
        '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
        '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
        '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
        '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
        '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
        '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
        '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
        '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
        '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
        '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
        '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
        '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
        '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
      ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text.primary,
              fontFamily: currentTheme.typography.fontFamily.primary,
            },
            '*': {
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: currentTheme.colors.surface,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: currentTheme.colors.primary,
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: currentTheme.colors.secondary,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: currentTheme.borderRadius.md,
              textTransform: 'none',
              fontWeight: currentTheme.typography.fontWeight.medium,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: currentTheme.colors.surface,
              borderRadius: currentTheme.borderRadius.lg,
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: currentTheme.borderRadius.full,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: currentTheme.borderRadius.md,
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: currentTheme.colors.surface,
              borderRadius: currentTheme.borderRadius.lg,
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text.primary,
              boxShadow: currentTheme.shadows.sm,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text.primary,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text.primary,
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            root: {
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text.primary,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              '&.Mui-selected': {
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.text.primary,
                '&:hover': {
                  backgroundColor: currentTheme.colors.primary,
                },
              },
              '&:hover': {
                backgroundColor: currentTheme.colors.surface,
              },
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              color: currentTheme.colors.text.secondary,
              '&.Mui-selected': {
                color: currentTheme.colors.primary,
              },
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              backgroundColor: currentTheme.colors.primary,
            },
          },
        },
      },
    });
  }, [currentTheme]);

  const contextValue: MaterialThemeContextType = {
    // Add any context values if needed
  };

  return (
    <MaterialThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </MaterialThemeContext.Provider>
  );
};
