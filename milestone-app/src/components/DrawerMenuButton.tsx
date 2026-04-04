import { Pressable, Text, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { theme } from '../theme/theme';

type DrawerMenuButtonProps = {
  navigation: any;
};

export default function DrawerMenuButton({
  navigation,
}: DrawerMenuButtonProps) {
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.button}
    >
      <Text style={styles.icon}>☰</Text>
    </Pressable>
  );
}

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