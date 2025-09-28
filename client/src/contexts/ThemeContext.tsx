import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomTheme, ThemeContextType } from '../types/theme';
import { defaultThemes } from '../config/themePresets';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themes, setThemes] = useState<CustomTheme[]>(defaultThemes);
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultThemes[0]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('selectedThemeId');
    const savedCustomThemes = localStorage.getItem('customThemes');
    
    if (savedCustomThemes) {
      try {
        const customThemes = JSON.parse(savedCustomThemes);
        setThemes(prev => [...defaultThemes, ...customThemes]);
      } catch (error) {
        console.error('Error loading custom themes:', error);
      }
    }
    
    if (savedThemeId) {
      const savedTheme = themes.find(theme => theme.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  // Save current theme to localStorage
  useEffect(() => {
    localStorage.setItem('selectedThemeId', currentTheme.id);
  }, [currentTheme.id]);

  const setTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [themes]);

  const updateTheme = useCallback((updates: Partial<CustomTheme>) => {
    setCurrentTheme(prev => ({
      ...prev,
      ...updates,
      isCustom: true,
    }));
  }, []);

  const createCustomTheme = useCallback((theme: Omit<CustomTheme, 'id'>) => {
    const newTheme: CustomTheme = {
      ...theme,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    
    setThemes(prev => {
      const updated = [...prev, newTheme];
      // Save custom themes to localStorage
      const customThemes = updated.filter(t => t.isCustom);
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
      return updated;
    });
    
    return newTheme.id;
  }, []);

  const deleteCustomTheme = useCallback((themeId: string) => {
    setThemes(prev => {
      const updated = prev.filter(theme => theme.id !== themeId);
      // Update localStorage
      const customThemes = updated.filter(t => t.isCustom);
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
      return updated;
    });
    
    // If deleted theme was current, switch to default
    if (currentTheme.id === themeId) {
      setCurrentTheme(defaultThemes[0]);
    }
  }, [currentTheme.id]);

  const resetTheme = useCallback(() => {
    setCurrentTheme(defaultThemes[0]);
  }, []);

  const exportTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      return JSON.stringify(theme, null, 2);
    }
    return '';
  }, [themes]);

  const importTheme = useCallback((themeData: string) => {
    try {
      const theme = JSON.parse(themeData) as CustomTheme;
      const newTheme: CustomTheme = {
        ...theme,
        id: `imported-${Date.now()}`,
        isCustom: true,
      };
      
      setThemes(prev => {
        const updated = [...prev, newTheme];
        const customThemes = updated.filter(t => t.isCustom);
        localStorage.setItem('customThemes', JSON.stringify(customThemes));
        return updated;
      });
      
      return newTheme.id;
    } catch (error) {
      console.error('Error importing theme:', error);
      throw new Error('Invalid theme data');
    }
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    themes,
    setTheme,
    updateTheme,
    createCustomTheme,
    deleteCustomTheme,
    resetTheme,
    exportTheme,
    importTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
