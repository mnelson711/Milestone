import { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';


type ScreenContainerProps = {
  children: ReactNode;
};

export default function ScreenContainer({ children }: ScreenContainerProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
  });
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}
