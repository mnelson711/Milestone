import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { EventItem } from '../types';
import { getUpcomingMilestones } from './milestones';
import { getEvents, saveEvents, updateEvent } from '../storage/storage';

const NOTIFICATION_CHANNEL_ID = 'milestones';
const NOTIFICATIONS_PER_EVENT = 3;

export async function setupNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Milestones',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function getNotificationPermissionStatus() {
  return Notifications.getPermissionsAsync();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const existingPermissions = await Notifications.getPermissionsAsync();

  if (existingPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.granted;
}

export async function cancelScheduledNotification(
  notificationId?: string
): Promise<void> {
  if (!notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelScheduledNotifications(
  notificationIds?: string[]
): Promise<void> {
  if (!notificationIds || notificationIds.length === 0) {
    return;
  }

  await Promise.all(
    notificationIds.map((notificationId) =>
      Notifications.cancelScheduledNotificationAsync(notificationId)
    )
  );
}

export async function getAllScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function scheduleTestNotificationInFiveSeconds(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification 🎉',
      body: 'Your milestone notifications are working.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: NOTIFICATION_CHANNEL_ID,
    },
  });
}

export async function scheduleEventNotifications(
  event: EventItem
): Promise<string[]> {
  if (event.notificationsEnabled === false) {
    return [];
  }

  const upcomingMilestones = getUpcomingMilestones(event, 2)
    .slice(0, NOTIFICATIONS_PER_EVENT)
    .filter((milestone) => milestone.targetDate.getTime() > Date.now());

  const scheduledIds: string[] = [];

  for (const milestone of upcomingMilestones) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Milestone for ${event.label} 🎉`,
        body: `${milestone.label} is coming ${milestone.timeRemainingText}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: milestone.targetDate,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });

    scheduledIds.push(notificationId);
  }

  return scheduledIds;
}

export async function syncEventNotifications(event: EventItem): Promise<EventItem> {
  await cancelScheduledNotifications(event.scheduledNotificationIds);

  if (event.notificationsEnabled === false) {
    const notificationsDisabledEvent: EventItem = {
      ...event,
      scheduledNotificationIds: [],
    };

    await updateEvent(notificationsDisabledEvent);
    return notificationsDisabledEvent;
  }

  const permissionsGranted = await requestNotificationPermissions();

  if (!permissionsGranted) {
    const noPermissionEvent: EventItem = {
      ...event,
      notificationsEnabled: false,
      scheduledNotificationIds: [],
    };

    await updateEvent(noPermissionEvent);
    return noPermissionEvent;
  }

  const scheduledNotificationIds = await scheduleEventNotifications(event);

  const syncedEvent: EventItem = {
    ...event,
    scheduledNotificationIds,
  };

  await updateEvent(syncedEvent);
  return syncedEvent;
}
export async function syncAllEventNotifications(): Promise<EventItem[]> {
  console.log('Running full notification resync...');
  const events = await getEvents();
  const syncedEvents: EventItem[] = [];

  const permissions = await Notifications.getPermissionsAsync();
  const permissionsGranted = permissions.granted;

  for (const event of events) {
    if (event.scheduledNotificationIds?.length) {
      await cancelScheduledNotifications(event.scheduledNotificationIds);
    }

    if (event.notificationsEnabled === false || !permissionsGranted) {
      syncedEvents.push({
        ...event,
        notificationsEnabled: permissionsGranted ? event.notificationsEnabled : false,
        scheduledNotificationIds: [],
      });

      continue;
    }

    const scheduledNotificationIds = await scheduleEventNotifications(event);

    syncedEvents.push({
      ...event,
      scheduledNotificationIds,
    });
  }

  await saveEvents(syncedEvents);
  return syncedEvents;
}