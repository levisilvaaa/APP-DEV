import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  background: '#f8fafc',
  surface: '#fefefe',
  card: '#ffffff',
  primary: '#e40f11',
  secondary: '#B91C1C',
  text: '#1e293b',
  textSecondary: '#64748b',
  success: '#059669',
  warning: '#F59E0B',
  error: '#e40f11',
  border: '#e2e8f0',
};

export const darkTheme = {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  card: '#262626',
  primary: '#e40f11',
  secondary: '#B91C1C',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  success: '#059669',
  warning: '#F59E0B',
  error: '#e40f11',
  border: '#333333',
};

type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
