import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { theme } from '../theme/theme';

export default function DrawerContentHeader() {
  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.title}>
        Milestone
      </AppText>
      <AppText variant="muted">
        Unusual life milestones
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: 4,
  },
});