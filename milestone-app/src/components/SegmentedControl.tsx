import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { theme } from '../theme/theme';

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  selected: string;
  onChange: (value: string) => void;
};

export default function SegmentedControl({
  options,
  selected,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = opt.value === selected;

        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.option,
              isActive && styles.optionActive,
            ]}
          >
            <AppText
              variant="body"
              style={[
                styles.text,
                isActive && styles.textActive,
              ]}
            >
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  option: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.textMuted,
  },
  textActive: {
    color: theme.colors.white,
  },
});