import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import DrawerContentHeader from './DrawerContentHeader';
import { useTheme } from '../context/ThemeContext';

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    items: {
      paddingTop: theme.spacing.sm,
    },
  });

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <DrawerContentHeader />
      <View style={styles.items}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}
