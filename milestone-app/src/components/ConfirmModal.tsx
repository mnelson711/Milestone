import { StyleSheet, View } from 'react-native';
import AppButton from './AppButton';
import AppText from './AppText';
import AppModal from './AppModal';
import { useTheme } from '../context/ThemeContext';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    title: {
      marginBottom: theme.spacing.sm,
    },
    message: {
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    buttonColumn: {
      marginTop: theme.spacing.sm,
    },
    cancelButtonWrapper: {
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <AppModal visible={visible} onRequestClose={onCancel}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="muted" style={styles.message}>
        {message}
      </AppText>

      <View style={styles.buttonColumn}>
        <AppButton
          title={isLoading ? 'Working...' : confirmText}
          onPress={onConfirm}
          variant={isDestructive ? 'danger' : 'primary'}
          disabled={isLoading}
        />

        <View style={styles.cancelButtonWrapper}>
          <AppButton
            title={cancelText}
            onPress={onCancel}
            variant="secondary"
            disabled={isLoading}
          />
        </View>
      </View>
    </AppModal>
  );
}