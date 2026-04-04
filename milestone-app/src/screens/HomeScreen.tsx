import { useCallback, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEvents, deleteEvent } from '../storage/storage';
import { EventItem } from '../types';
import { getNextUpcomingMilestone } from '../utils/milestones';
import { cancelScheduledNotifications } from '../utils/notifications';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import { theme } from '../theme/theme';

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [events, setEvents] = useState<EventItem[]>([]);

  const loadEvents = async () => {
    const storedEvents = await getEvents();

    const sortedEvents = [...storedEvents].sort((a, b) => {
      const milestoneA = getNextUpcomingMilestone(a);
      const milestoneB = getNextUpcomingMilestone(b);

      if (!milestoneA && !milestoneB) {
        return 0;
      }

      if (!milestoneA) {
        return 1;
      }

      if (!milestoneB) {
        return -1;
      }

      return milestoneA.targetDate.getTime() - milestoneB.targetDate.getTime();
    });

    setEvents(sortedEvents);
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const handleDelete = async (event: EventItem) => {
    await cancelScheduledNotifications(event.scheduledNotificationIds);
    await deleteEvent(event.id);
    await loadEvents();
  };

  return (
    <ScreenContainer>
      <AppText variant="title" style={{ marginBottom: 6 }}>
        Milestone
      </AppText>
      <AppText variant="muted" style={{ marginBottom: 16 }}>
        Track life through unusual milestones.
      </AppText>

      <AppButton title="Add Event" onPress={() => navigation.navigate('Add Event')} />

      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <AppText variant="subtitle">Your Events</AppText>
      </View>

      {events.length === 0 ? (
        <SectionCard>
          <AppText variant="body">No events saved yet.</AppText>
        </SectionCard>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const nextMilestone = getNextUpcomingMilestone(item);

            return (
              <SectionCard>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Event Details', { eventId: item.id })
                  }
                >
                  <AppText variant="subtitle">{item.label}</AppText>
                  <AppText variant="muted" style={{ marginTop: 4 }}>
                    {new Date(item.date).toLocaleDateString()}
                  </AppText>

                  {nextMilestone ? (
                    <View style={{ marginTop: 12 }}>
                      <AppText variant="body">Next milestone</AppText>
                      <AppText variant="muted">{nextMilestone.label}</AppText>
                      <AppText variant="muted">
                        {nextMilestone.timeRemainingText}
                      </AppText>
                    </View>
                  ) : (
                    <AppText variant="muted" style={{ marginTop: 12 }}>
                      No upcoming milestones found.
                    </AppText>
                  )}

                  <AppText variant="muted" style={{ marginTop: 10 }}>
                    Scheduled notifications: {item.scheduledNotificationIds?.length ?? 0}
                  </AppText>
                </Pressable>

                <View style={styles.actionsRow}>
                  <View style={styles.actionButton}>
                    <AppButton
                      title="View Details"
                      variant="secondary"
                      onPress={() =>
                        navigation.navigate('Event Details', { eventId: item.id })
                      }
                    />
                  </View>
                  <View style={styles.actionButton}>
                    <AppButton
                      title="Delete"
                      variant="danger"
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                </View>
              </SectionCard>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});