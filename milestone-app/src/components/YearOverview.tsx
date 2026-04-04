import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { theme } from '../theme/theme';

type Props = {
  year: number;
  onSelectMonth: (month: number) => void;
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function YearOverview({ year, onSelectMonth }: Props) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        {year}
      </AppText>

      <View style={styles.grid}>
        {MONTHS.map((label, index) => (
          <Pressable
            key={label}
            onPress={() => onSelectMonth(index)}
            style={styles.monthCard}
          >
            <AppText variant="body">{label}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '30%',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});