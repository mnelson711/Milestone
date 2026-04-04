import { useCallback, useState } from 'react';
import { View, Text, FlatList, Switch, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUpcomingMilestones, getNextUpcomingMilestone } from '../utils/milestones';
import { EventItem } from '../types';
import { getEventById, updateEvent } from '../storage/storage';
import {
  syncEventNotifications,
  getNotificationPermissionStatus,
} from '../utils/notifications';

type EventDetailsScreenProps = {
  navigation: any;
  route: {
    params: {
      eventId: string;
    };
  };
};

export default function EventDetailsScreen({
  navigation,
  route,
}: EventDetailsScreenProps) {
  const { eventId } = route.params;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotificationPreference, setIsSavingNotificationPreference] =
    useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const loadEvent = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading event with ID:', eventId);
    const storedEvent = await getEventById(eventId);
    setEvent(storedEvent);

    const permissions = await getNotificationPermissionStatus();
    setPermissionGranted(permissions.granted);

    setIsLoading(false);
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      loadEvent();
    }, [loadEvent])
  );

  const handleToggleNotifications = async (value: boolean) => {
    if (!event || isSavingNotificationPreference) {
      return;
    }

    setIsSavingNotificationPreference(true);

    try {
      let updatedEvent: EventItem = {
        ...event,
        notificationsEnabled: value,
      };

      await updateEvent(updatedEvent);
      updatedEvent = await syncEventNotifications(updatedEvent);
      setEvent(updatedEvent);

      const permissions = await getNotificationPermissionStatus();
      setPermissionGranted(permissions.granted);
    } catch (error) {
      console.error('Error updating notification preference:', error);
    } finally {
      setIsSavingNotificationPreference(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  const milestones = getUpcomingMilestones(event, 4);
  const nextMilestone = getNextUpcomingMilestone(event);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
        {event.label}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 12 }}>
        Original date: {new Date(event.date).toLocaleDateString()}
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Button
          title="Edit Event"
          onPress={() => navigation.navigate('Edit Event', { eventId: event.id })}
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

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>
            {event.notificationsEnabled === false ? 'Off' : 'On'}
          </Text>
          <Switch
            value={event.notificationsEnabled !== false}
            onValueChange={handleToggleNotifications}
            disabled={isSavingNotificationPreference}
          />
        </View>

        <Text>
          Device permission:{' '}
          {permissionGranted === null
            ? 'Checking...'
            : permissionGranted
            ? 'Granted'
            : 'Not granted'}
        </Text>

        <Text style={{ marginTop: 6 }}>
          Scheduled notifications: {event.scheduledNotificationIds?.length ?? 0}
        </Text>

        {event.notificationsEnabled !== false && !permissionGranted ? (
          <Text style={{ marginTop: 10 }}>
            Notifications are enabled for this event, but device permission is off.
          </Text>
        ) : null}

        {nextMilestone ? (
          <>
            <Text style={{ fontWeight: '600', marginTop: 10 }}>
              Next tracked milestone:
            </Text>
            <Text>{nextMilestone.label}</Text>
            <Text>{nextMilestone.targetDate.toLocaleDateString()}</Text>
            <Text>{nextMilestone.timeRemainingText}</Text>
          </>
        ) : (
          <Text style={{ marginTop: 10 }}>No upcoming milestone available.</Text>
        )}
      </View>

      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>
        Upcoming Milestones
      </Text>

      {milestones.length === 0 ? (
        <Text>No milestones available.</Text>
      ) : (
        <FlatList
          data={milestones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.label}</Text>
              <Text style={{ marginTop: 4 }}>{item.description}</Text>
              <Text style={{ marginTop: 4 }}>
                {item.targetDate.toLocaleDateString()}
              </Text>
              <Text style={{ marginTop: 4 }}>{item.timeRemainingText}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}