import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import SectionCard from './SectionCard';
import { useTheme } from '../context/ThemeContext';


type EmptyStateProps = {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  buttonText?: string;
  onPressButton?: () => void;
};

export default function EmptyState({
  iconName = 'sparkles-outline',
  title,
  message,
  buttonText,
  onPressButton,
}: EmptyStateProps) {

    const { theme } = useTheme();


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  buttonWrapper: {
    marginTop: theme.spacing.lg,
    width: '100%',
  },
});

  return (
    <SectionCard>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={28} color={theme.colors.primary} />
        </View>

        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>

        <AppText variant="muted" style={styles.message}>
          {message}
        </AppText>

        {buttonText && onPressButton ? (
          <View style={styles.buttonWrapper}>
            <AppButton title={buttonText} onPress={onPressButton} />
          </View>
        ) : null}
      </View>
    </SectionCard>
  );
}
