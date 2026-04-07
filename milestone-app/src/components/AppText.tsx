import { ReactNode } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type AppTextProps = {
  children: ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'muted';
  style?: TextStyle;
};

export default function AppText({
  children,
  variant = 'body',
  style,
}: AppTextProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    base: {
      color: theme.colors.text,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    muted: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
  });
  return (
    <Text
      style={[
        styles.base,
        variant === 'title' && styles.title,
        variant === 'subtitle' && styles.subtitle,
        variant === 'body' && styles.body,
        variant === 'muted' && styles.muted,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
