import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Pressable } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DrawerActions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { Text } from 'react-native';


import HomeScreen from './src/screens/HomeScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import EditEventScreen from './src/screens/EditEventScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';

import {
  setupNotifications,
  syncAllEventNotifications,
} from './src/utils/notifications';
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AppHeaderMenu() {
  return (
    <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>
      ☰
    </Text>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

function DrawerMenuButton({ navigation }: { navigation: any }) {
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      <Pressable>
        {/* simple text icon so you don't need another package yet */}
      </Pressable>
    </Pressable>
  );
}
function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      })}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: '700',
                }}
              >
                ☰
              </Text>
            </Pressable>
          ),
        })}
      />

      <Stack.Screen name="Add Event" component={AddEventScreen} />
      <Stack.Screen name="Event Details" component={EventDetailsScreen} />
      <Stack.Screen name="Edit Event" component={EditEventScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const runNotificationSync = async () => {
      if (isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;

      try {
        await syncAllEventNotifications();
      } catch (error) {
        console.error('Error syncing notifications:', error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    const initializeNotifications = async () => {
      try {
        await setupNotifications();
        await runNotificationSync();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousAppState = appState.current;

      const isReturningToForeground =
        (previousAppState === 'background' || previousAppState === 'inactive') &&
        nextAppState === 'active';

      appState.current = nextAppState;

      if (isReturningToForeground) {
        runNotificationSync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer theme={navTheme}>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          drawerStyle: {
            backgroundColor: theme.colors.surface,
            width: 260,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.textMuted,
          drawerLabelStyle: {
            fontSize: 16,
          },
          sceneStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{ headerShown: false }}
        />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="About" component={AboutScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}