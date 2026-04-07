import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import AppText from '../components/AppText';
import Logo from '../../assets/logo.svg';

type Props = {
  onDone: (hasOnboarded: boolean) => void;
};

const ONBOARDING_KEY = 'HAS_SEEN_ONBOARDING';

export default function LaunchScreen({ onDone }: Props) {
  const { theme } = useTheme();

  useEffect(() => {
    const init = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        const hasOnboarded = value === 'true';

        // small delay for polish (optional)
        setTimeout(() => {
          onDone(hasOnboarded);
        }, 2000);
      } catch (err) {
        onDone(false);
      }
    };

    init();
  }, [onDone]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      marginBottom: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <Logo width={120} height={120} />

      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}
