import { StyleSheet, View } from 'react-native';
import AppButton from './AppButton';
import AppText from './AppText';
import AppModal from './AppModal';
import { useTheme } from '../context/ThemeContext';

type AlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export default function AlertModal({
  visible,
  title,
  message,
  buttonText = 'Okay',
  onClose,
}: AlertModalProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    title: {
      marginBottom: theme.spacing.sm,
    },
    message: {
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
  });

  return (
    <AppModal visible={visible} onRequestClose={onClose}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="muted" style={styles.message}>
        {message}
      </AppText>

      <View>
        <AppButton title={buttonText} onPress={onClose} />
      </View>
    </AppModal>
  );
}
