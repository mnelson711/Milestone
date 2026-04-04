import { useCallback, useState } from 'react';
import { View, FlatList, Switch, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUpcomingMilestones, getNextUpcomingMilestone } from '../utils/milestones';
import { EventItem } from '../types';
import { getEventById, updateEvent } from '../storage/storage';
import {
  syncEventNotifications,
  getNotificationPermissionStatus,
} from '../utils/notifications';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import { theme } from '../theme/theme';

import SectionHeader from '../components/SectionHeader';
import { Ionicons } from '@expo/vector-icons';

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
      <ScreenContainer>
        <AppText variant="body">Loading event...</AppText>
      </ScreenContainer>
    );
  }

  if (!event) {
    return (
      <ScreenContainer>
        <AppText variant="body">Event not found.</AppText>
      </ScreenContainer>
    );
  }

  const milestones = getUpcomingMilestones(event, 4);
  const nextMilestone = getNextUpcomingMilestone(event);

  return (
    <ScreenContainer>
      <FlatList
        data={milestones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <AppText variant="title" style={styles.pageTitle}>
              {event.label}
            </AppText>
            <AppText variant="muted" style={styles.pageSubtitle}>
              {new Date(event.date).toLocaleDateString()}
            </AppText>

            <SectionCard>
              <SectionHeader
                title="Event Overview"
                iconName="calendar-outline"
              />

              <View style={styles.infoRow}>
                <AppText variant="body">Date</AppText>
                <AppText variant="muted">
                  {new Date(event.date).toLocaleDateString()}
                </AppText>
              </View>

              <View style={styles.infoRow}>
                <AppText variant="body">Tracked milestone types</AppText>
                <AppText variant="muted">
                  {event.selectedMilestoneIds?.length ?? 0}
                </AppText>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
                  <AppText variant="body" style={styles.infoLabelText}>Date</AppText>
                </View>
                <AppText variant="muted">
                  {new Date(event.date).toLocaleDateString()}
                </AppText>
              </View>

              <View style={styles.editButtonWrapper}>
                <AppButton
                  title="Edit Event"
                  onPress={() => navigation.navigate('Edit Event', { eventId: event.id })}
                  variant="secondary"
                />
              </View>
            </SectionCard>

            <SectionCard>
              <SectionHeader
                title="Notifications"
                iconName="notifications-outline"
              />

              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <AppText variant="body">Notifications</AppText>
                  <AppText variant="muted">
                    {event.notificationsEnabled === false ? 'Off' : 'On'}
                  </AppText>
                </View>

                <Switch
                  value={event.notificationsEnabled !== false}
                  onValueChange={handleToggleNotifications}
                  disabled={isSavingNotificationPreference}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primaryDark,
                  }}
                  thumbColor={
                    event.notificationsEnabled !== false
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                />
              </View>

              <View style={styles.statusBlock}>
                <AppText variant="body">
                  Device permission:{' '}
                  {permissionGranted === null
                    ? 'Checking...'
                    : permissionGranted
                    ? 'Granted'
                    : 'Not granted'}
                </AppText>

                {event.notificationsEnabled !== false && !permissionGranted ? (
                  <AppText variant="muted" style={styles.statusMessage}>
                    Notifications are enabled for this event, but device permission is off.
                  </AppText>
                ) : null}
              </View>

              {nextMilestone ? (
                <View style={styles.nextMilestoneBlock}>
                  <AppText variant="body" style={styles.blockLabel}>
                    Next tracked milestone
                  </AppText>
                  <AppText variant="subtitle" style={styles.nextMilestoneTitle}>
                    {nextMilestone.label}
                  </AppText>
                  <AppText variant="muted">
                    {nextMilestone.targetDate.toLocaleDateString()}
                  </AppText>
                  <AppText variant="muted">
                    {nextMilestone.timeRemainingText}
                  </AppText>
                </View>
              ) : (
                <AppText variant="muted" style={styles.statusMessage}>
                  No upcoming milestone available.
                </AppText>
              )}
            </SectionCard>

            <View style={styles.milestonesHeader}>
              <SectionHeader
                title="Upcoming Milestones"
                iconName="trophy-outline"
              />
              <AppText variant="muted">
                {milestones.length} shown
              </AppText>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <SectionCard>
            <AppText variant="subtitle" style={styles.milestoneTitle}>
              {item.label}
            </AppText>
            <AppText variant="muted" style={styles.milestoneDescription}>
              {item.description}
            </AppText>

            <View style={styles.milestoneMeta}>
              <AppText variant="body">
                {item.targetDate.toLocaleDateString()}
              </AppText>
              <AppText variant="muted">
                {item.timeRemainingText}
              </AppText>
            </View>
          </SectionCard>
        )}
        ListEmptyComponent={
          <SectionCard>
            <AppText variant="body">No milestones available.</AppText>
          </SectionCard>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabelText: {
    marginLeft: theme.spacing.xs,
  },
  editButtonWrapper: {
    marginTop: theme.spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  toggleText: {
    flex: 1,
  },
  statusBlock: {
    marginBottom: theme.spacing.md,
  },
  statusMessage: {
    marginTop: theme.spacing.xs,
  },
  nextMilestoneBlock: {
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  blockLabel: {
    marginBottom: theme.spacing.xs,
  },
  nextMilestoneTitle: {
    marginBottom: theme.spacing.xs,
  },
  milestonesHeader: {
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneTitle: {
    marginBottom: theme.spacing.xs,
  },
  milestoneDescription: {
    marginBottom: theme.spacing.md,
  },
  milestoneMeta: {
    gap: theme.spacing.xs,
  },
});