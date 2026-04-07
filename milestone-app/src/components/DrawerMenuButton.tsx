import { Pressable, Text, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

type DrawerMenuButtonProps = {
  navigation: any;
};

export default function DrawerMenuButton({
  navigation,
}: DrawerMenuButtonProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    icon: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
  });
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.button}
    >
      <Text style={styles.icon}>☰</Text>
    </Pressable>
  );
}
