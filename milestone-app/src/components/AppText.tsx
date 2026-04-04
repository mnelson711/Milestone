import { ReactNode } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../theme/theme';

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