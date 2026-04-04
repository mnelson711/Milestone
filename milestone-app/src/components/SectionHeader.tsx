import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { theme } from '../theme/theme';

type SectionHeaderProps = {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
};

export default function SectionHeader({
  title,
  iconName,
  subtitle,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={18} color={theme.colors.primary} />
        </View>
        <AppText variant="subtitle">{title}</AppText>
      </View>

      {subtitle ? (
        <AppText variant="muted" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
});