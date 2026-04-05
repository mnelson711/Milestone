const baseSpacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

const baseRadius = {
  sm: 8,
  md: 14,
  lg: 20,
};

export const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSoft: '#E2E8F0',
    primary: '#8B5CF6',
    primaryDark: '#7C3AED',
    secondary: '#F59E0B',
    text: '#0F172A',
    textMuted: '#475569',
    border: '#CBD5E1',
    success: '#10B981',
    danger: '#EF4444',
    white: '#FFFFFF',
  },
  spacing: baseSpacing,
  radius: baseRadius,
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSoft: '#334155',
    primary: '#A78BFA',
    primaryDark: '#8B5CF6',
    secondary: '#F59E0B',
    text: '#F8FAFC',
    textMuted: '#CBD5E1',
    border: '#475569',
    success: '#34D399',
    danger: '#F87171',
    white: '#FFFFFF',
  },
  spacing: baseSpacing,
  radius: baseRadius,
};

export type AppTheme = typeof darkTheme;