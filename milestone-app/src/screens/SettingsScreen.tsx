import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Switch,
  ScrollView,
  Alert,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AppSettings } from '../types';
import { getSettings, saveSettings } from '../storage/settings';
import MilestoneSelector from '../components/MilestoneSelector';
import {
  getAllScheduledNotifications,
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  scheduleTestNotificationInFiveSeconds,
  syncAllEventNotifications,
} from '../utils/notifications';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import SectionHeader from '../components/SectionHeader';
import { useOnboarding } from '../context/OnboardingContext';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SettingsScreenProps = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [scheduledNotificationCount, setScheduledNotificationCount] =
    useState(0);
  const [isResyncing, setIsResyncing] = useState(false);
  const [showMilestoneDefaults, setShowMilestoneDefaults] = useState(false);

  const { theme } = useTheme();
  const { mode, toggleTheme } = useTheme();
  const { restartOnboarding } = useOnboarding();

  const loadSettingsData = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);

    const permissions = await getNotificationPermissionStatus();
    setPermissionGranted(permissions.granted);

    const scheduledNotifications = await getAllScheduledNotifications();
    setScheduledNotificationCount(scheduledNotifications.length);
  };

  useFocusEffect(
    useCallback(() => {
      loadSettingsData();
    }, []),
  );

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleToggleDefaultNotifications = async (value: boolean) => {
    if (!settings) {
      return;
    }

    const updatedSettings: AppSettings = {
      ...settings,
      defaultNotificationsEnabled: value,
    };

    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!settings) {
      return;
    }

    const currentMilestones = settings.defaultMilestoneIds;

    const updatedMilestoneIds = currentMilestones.includes(milestoneId)
      ? currentMilestones.filter((id) => id !== milestoneId)
      : [...currentMilestones, milestoneId];

    const updatedSettings: AppSettings = {
      ...settings,
      defaultMilestoneIds: updatedMilestoneIds,
    };

    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const handleToggleMilestoneDefaultsSection = () => {
    animateLayout();
    setShowMilestoneDefaults((current) => !current);
  };

  const handleRequestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);

    Alert.alert(
      granted ? 'Permissions Enabled' : 'Permissions Not Enabled',
      granted
        ? 'Notification permissions were granted.'
        : 'Notification permissions are still disabled.',
    );
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermissions();

    if (!granted) {
      setPermissionGranted(false);
      Alert.alert(
        'Notifications Off',
        'Notification permission is not enabled for this app.',
      );
      return;
    }

    await scheduleTestNotificationInFiveSeconds();
    setPermissionGranted(true);
    Alert.alert(
      'Scheduled',
      'Test notification scheduled for 5 seconds from now.',
    );
  };

  const handleResyncNotifications = async () => {
    if (isResyncing) {
      return;
    }

    setIsResyncing(true);

    try {
      await syncAllEventNotifications();
      const scheduledNotifications = await getAllScheduledNotifications();
      setScheduledNotificationCount(scheduledNotifications.length);

      Alert.alert(
        'Notifications Resynced',
        `Scheduled notifications: ${scheduledNotifications.length}`,
      );
    } catch (error) {
      console.error('Error resyncing notifications:', error);
      Alert.alert(
        'Error',
        'Something went wrong while resyncing notifications.',
      );
    } finally {
      setIsResyncing(false);
    }
  };

  const handleRestartOnboarding = () => {
    Alert.alert(
      'Restart onboarding?',
      'This will take you back to the onboarding flow.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restart',
          onPress: () => {
            restartOnboarding();
          },
        },
      ],
    );
  };

  if (!settings) {
    return (
      <ScreenContainer>
        <AppText variant="body">Loading settings...</AppText>
      </ScreenContainer>
    );
  }

  const styles = StyleSheet.create({
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    pageTitle: {
      marginBottom: theme.spacing.xs,
    },
    pageSubtitle: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    rowText: {
      flex: 1,
    },
    selectorContainer: {
      marginTop: theme.spacing.lg,
    },
    collapsibleHeader: {
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    collapsibleHeaderText: {
      flex: 1,
    },
    collapsibleContent: {
      marginTop: theme.spacing.sm,
    },
    selectorTitle: {
      marginBottom: theme.spacing.xs,
    },
    selectorSubtitle: {
      marginBottom: theme.spacing.sm,
    },
    chevron: {
      fontSize: 22,
      fontWeight: '700',
      marginLeft: theme.spacing.sm,
    },
    statusBlock: {
      marginBottom: theme.spacing.md,
    },
    statusText: {
      marginTop: theme.spacing.xs,
    },
    buttonGroup: {
      marginTop: theme.spacing.sm,
    },
    librarySummary: {
      marginBottom: theme.spacing.md,
    },
  });

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText variant="title" style={styles.pageTitle}>
          Settings
        </AppText>
        <AppText variant="muted" style={styles.pageSubtitle}>
          Customize defaults and manage notifications.
        </AppText>

        <SectionCard>
          <SectionHeader
            title="Defaults"
            iconName="options-outline"
            subtitle="Choose default behavior for new events."
          />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="body">Default notifications</AppText>
              <AppText variant="muted">
                Enable notifications automatically for new events
              </AppText>
            </View>

            <Switch
              value={settings.defaultNotificationsEnabled}
              onValueChange={handleToggleDefaultNotifications}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryDark,
              }}
              thumbColor={
                settings.defaultNotificationsEnabled
                  ? theme.colors.primary
                  : theme.colors.textMuted
              }
            />
          </View>

          <View style={styles.selectorContainer}>
            <Pressable
              onPress={handleToggleMilestoneDefaultsSection}
              style={styles.collapsibleHeader}
            >
              <View style={styles.collapsibleHeaderText}>
                <AppText variant="body" style={styles.selectorTitle}>
                  Default milestone types
                </AppText>
                <AppText variant="muted">
                  {settings.defaultMilestoneIds.length} selected
                </AppText>
              </View>

              <AppText variant="body" style={styles.chevron}>
                {showMilestoneDefaults ? '−' : '+'}
              </AppText>
            </Pressable>

            {showMilestoneDefaults ? (
              <View style={styles.collapsibleContent}>
                <AppText variant="muted" style={styles.selectorSubtitle}>
                  These will be preselected when creating a new event.
                </AppText>

                <MilestoneSelector
                  selectedMilestoneIds={settings.defaultMilestoneIds}
                  onToggleMilestone={handleToggleMilestone}
                  availableMilestoneIds={settings.enabledMilestoneIds}
                />
              </View>
            ) : null}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionHeader
            title="Milestone Library"
            iconName="library-outline"
            subtitle="Manage which milestone types are available throughout the app."
          />

          <AppText variant="muted" style={styles.librarySummary}>
            {settings.enabledMilestoneIds.length} milestone
            {settings.enabledMilestoneIds.length === 1 ? '' : 's'} enabled
          </AppText>

          <AppButton
            title="Open Milestone Library"
            onPress={() =>
              navigation.navigate('Home', {
                screen: 'Milestone Library',
              })
            }
            variant="secondary"
          />
        </SectionCard>

        <SectionCard>
          <SectionHeader
            title="Notifications"
            iconName="notifications-outline"
            subtitle="Manage permissions and scheduled notification tools."
          />

          <View style={styles.statusBlock}>
            <AppText variant="body">
              Device permission:{' '}
              {permissionGranted === null
                ? 'Checking...'
                : permissionGranted
                  ? 'Granted'
                  : 'Not granted'}
            </AppText>

            <AppText variant="muted" style={styles.statusText}>
              Scheduled notifications: {scheduledNotificationCount}
            </AppText>
          </View>

          <View style={styles.buttonGroup}>
            <AppButton
              title="Request Notification Permission"
              onPress={handleRequestPermissions}
              variant="secondary"
            />
          </View>

          <View style={styles.buttonGroup}>
            <AppButton
              title="Test Notification in 5 Seconds"
              onPress={handleTestNotification}
            />
          </View>

          <View style={styles.buttonGroup}>
            <AppButton
              title={
                isResyncing
                  ? 'Resyncing Notifications...'
                  : 'Resync Notifications'
              }
              onPress={handleResyncNotifications}
              variant="secondary"
              disabled={isResyncing}
            />
          </View>
        </SectionCard>

        <SectionCard>
          <SectionHeader
            title="Appearance"
            iconName="moon-outline"
            subtitle="Customize how the app looks."
          />

          <AppButton
            title={
              mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            }
            onPress={toggleTheme}
          />
        </SectionCard>

        <SectionCard>
          <SectionHeader
            title="Developer"
            iconName="construct-outline"
            subtitle="Temporary testing tools."
          />

          <AppButton
            title="Show Onboarding Again"
            onPress={handleRestartOnboarding}
            variant="secondary"
          />
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
