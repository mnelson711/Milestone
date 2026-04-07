import 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import OnboardingContext from './src/context/OnboardingContext';

import HomeScreen from './src/screens/HomeScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import EditEventScreen from './src/screens/EditEventScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LaunchScreen from './src/screens/LaunchScreen';
import MilestoneLibraryScreen from './src/screens/MilestoneLibraryScreen';
import PastMilestonesScreen from './src/screens/PastMilestonesScreen';

import {
  setupNotifications,
  syncAllEventNotifications,
} from './src/utils/notifications';
import DrawerMenuButton from './src/components/DrawerMenuButton';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const ONBOARDING_KEY = 'HAS_SEEN_ONBOARDING';

type RootFlowState = 'loading' | 'onboarding' | 'app';

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
      <Stack.Screen
        name="Milestone Library"
        component={MilestoneLibraryScreen}
        options={{
          title: 'Milestone Library',
        }}
      />
      <Stack.Screen
        name="Past Milestones"
        component={PastMilestonesScreen}
        options={{
          title: 'Past Milestones',
        }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const lifecycleStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isSyncingRef = useRef(false);
  const { theme } = useTheme();

  const [rootFlowState, setRootFlowState] = useState<RootFlowState>('loading');

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
    if (rootFlowState !== 'app') {
      return;
    }

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
      const previousAppState = lifecycleStateRef.current;

      const isReturningToForeground =
        (previousAppState === 'background' || previousAppState === 'inactive') &&
        nextAppState === 'active';

      lifecycleStateRef.current = nextAppState;

      if (isReturningToForeground) {
        runNotificationSync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [rootFlowState]);

  const handleLaunchComplete = (hasOnboarded: boolean) => {
    setRootFlowState(hasOnboarded ? 'app' : 'onboarding');
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    } finally {
      setRootFlowState('app');
    }
  };

  const restartOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error('Error resetting onboarding state:', error);
    } finally {
      setRootFlowState('onboarding');
    }
  };

  return (
    <OnboardingContext.Provider value={{ restartOnboarding }}>
      {rootFlowState === 'loading' ? (
        <LaunchScreen onDone={handleLaunchComplete} />
      ) : rootFlowState === 'onboarding' ? (
        <OnboardingScreen onFinish={handleFinishOnboarding} />
      ) : (
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
      )}
    </OnboardingContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}