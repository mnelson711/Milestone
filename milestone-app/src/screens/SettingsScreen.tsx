import { useEffect, useState } from 'react';
import { View, Text, Switch, Button, ScrollView, Alert } from 'react-native';
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

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [scheduledNotificationCount, setScheduledNotificationCount] = useState(0);
  const [isResyncing, setIsResyncing] = useState(false);

  const loadSettingsData = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);

    const permissions = await getNotificationPermissionStatus();
    setPermissionGranted(permissions.granted);

    const scheduledNotifications = await getAllScheduledNotifications();
    setScheduledNotificationCount(scheduledNotifications.length);
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

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

  const handleRequestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);

    Alert.alert(
      granted ? 'Permissions Enabled' : 'Permissions Not Enabled',
      granted
        ? 'Notification permissions were granted.'
        : 'Notification permissions are still disabled.'
    );
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermissions();

    if (!granted) {
      setPermissionGranted(false);
      Alert.alert(
        'Notifications Off',
        'Notification permission is not enabled for this app.'
      );
      return;
    }

    await scheduleTestNotificationInFiveSeconds();
    setPermissionGranted(true);
    Alert.alert('Scheduled', 'Test notification scheduled for 5 seconds from now.');
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
        `Scheduled notifications: ${scheduledNotifications.length}`
      );
    } catch (error) {
      console.error('Error resyncing notifications:', error);
      Alert.alert('Error', 'Something went wrong while resyncing notifications.');
    } finally {
      setIsResyncing(false);
    }
  };

  if (!settings) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Settings
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
          Defaults
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>Default notifications for new events</Text>
          <Switch
            value={settings.defaultNotificationsEnabled}
            onValueChange={handleToggleDefaultNotifications}
          />
        </View>

        <MilestoneSelector
          selectedMilestoneIds={settings.defaultMilestoneIds}
          onToggleMilestone={handleToggleMilestone}
        />
      </View>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
          Notifications
        </Text>

        <Text>
          Device permission:{' '}
          {permissionGranted === null
            ? 'Checking...'
            : permissionGranted
            ? 'Granted'
            : 'Not granted'}
        </Text>

        <Text style={{ marginTop: 8 }}>
          Scheduled notifications: {scheduledNotificationCount}
        </Text>

        <View style={{ marginTop: 12 }}>
          <Button
            title="Request Notification Permission"
            onPress={handleRequestPermissions}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button
            title="Test Notification in 5 Seconds"
            onPress={handleTestNotification}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button
            title={isResyncing ? 'Resyncing Notifications...' : 'Resync Notifications'}
            onPress={handleResyncNotifications}
            disabled={isResyncing}
          />
        </View>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
          About
        </Text>

        <Text>
          Milestone is a personal event tracker for fun, unusual milestones and
          milestone notifications.
        </Text>
      </View>
    </ScrollView>
  );
}