import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme/theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  theme: typeof lightTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'APP_THEME_MODE';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') {
      setMode('dark');
    }
  };

  const toggleTheme = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
