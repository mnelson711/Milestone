import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type SectionCardProps = {
  children: ReactNode;
};

export default function SectionCard({ children }: SectionCardProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
  });
  return <View style={styles.card}>{children}</View>;
}
