import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type AppModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  dismissOnBackdropPress?: boolean;
};

export default function AppModal({
  visible,
  onRequestClose,
  children,
  maxWidth = 420,
  dismissOnBackdropPress = true,
}: AppModalProps) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(visible);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.92)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    overlayContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
    },
    backdropPressable: {
      ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
      width: '100%',
      maxWidth,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
    },
  });

  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.96,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
      });
    }
  }, [visible, isMounted, overlayOpacity, modalOpacity, modalScale]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlayContainer}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        />

        <Pressable
          style={styles.backdropPressable}
          onPress={dismissOnBackdropPress ? onRequestClose : undefined}
        />

        <Animated.View
          style={[
            styles.modalCard,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
