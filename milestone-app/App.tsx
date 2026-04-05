import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

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
import DrawerMenuButton from './src/components/DrawerMenuButton';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
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
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => <DrawerMenuButton navigation={navigation} />,
        })}
      />
      <Stack.Screen name="Add Event" component={AddEventScreen} />
      <Stack.Screen name="Event Details" component={EventDetailsScreen} />
      <Stack.Screen name="Edit Event" component={EditEventScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isSyncingRef = useRef(false);
  const { theme } = useTheme();

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
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          drawerStyle: {
            backgroundColor: theme.colors.surface,
            width: 280,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.textMuted,
          drawerActiveBackgroundColor: theme.colors.surfaceSoft,
          drawerLabelStyle: {
            fontSize: 16,
            marginLeft: -8,
          },
          sceneStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="About"
          component={AboutScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons
                name="information-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}