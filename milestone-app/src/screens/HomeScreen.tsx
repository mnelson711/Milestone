import { useCallback, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getEvents, deleteEvent } from '../storage/storage';
import { EventItem } from '../types';
import { getNextUpcomingMilestone } from '../utils/milestones';
import { cancelScheduledNotifications } from '../utils/notifications';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import ConfirmModal from '../components/ConfirmModal';
import { theme } from '../theme/theme';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleAskDelete = (event: EventItem) => {
    setEventToDelete(event);
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await cancelScheduledNotifications(eventToDelete.scheduledNotificationIds);
      await deleteEvent(eventToDelete.id);
      await loadEvents();
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer>
      <AppText variant="title" style={styles.pageTitle}>
        Milestone
      </AppText>
      <AppText variant="muted" style={styles.pageSubtitle}>
        Track life through unusual milestones.
      </AppText>

    {events.length > 0
      && <AppButton
        title="Add Event"
        onPress={() => navigation.navigate('Add Event')}
      />
    }
      <View style={styles.sectionHeader}>
        <SectionHeader
          title={`Your Events (${events.length})`}
          iconName="bookmark-outline"
          subtitle="Tap a card to view details."
        />
      </View>

        {events.length === 0 ? (
          <EmptyState
            iconName="calendar-clear-outline"
            title="No events yet"
            message="Add your first event to start tracking fun milestones and notifications."
            buttonText="Create Your First Event"
            onPressButton={() => navigation.navigate('Add Event')}
          />
        ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const nextMilestone = getNextUpcomingMilestone(item);

            return (
              <SectionCard>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Event Details', { eventId: item.id })
                  }
                  style={styles.cardBody}
                >
                  {/* Top row */}
                  <View style={styles.topRow}>
                    <AppText variant="subtitle" style={styles.title}>
                      {item.label}
                    </AppText>

                    <Pressable
                      onPress={() => handleAskDelete(item)}
                      style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && styles.deleteButtonPressed,
                      ]}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.colors.danger}
                      />
                    </Pressable>
                  </View>

                  {/* Meta row */}
                  <View style={styles.metaRow}>
                    <AppText variant="muted">
                      {new Date(item.date).toLocaleDateString()}
                    </AppText>

                    <View style={styles.metaRight}>
                      <Ionicons
                        name="notifications-outline"
                        size={14}
                        color={theme.colors.textMuted}
                      />
                      <AppText variant="muted" style={styles.metaText}>
                        {item.scheduledNotificationIds?.length ?? 0}
                      </AppText>
                    </View>
                  </View>

                  {/* Next milestone */}
                  {nextMilestone ? (
                    <View style={styles.milestoneRow}>
                      <Ionicons
                        name="trophy-outline"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <View style={styles.milestoneText}>
                        <AppText variant="body" style={styles.milestoneLabel}>
                          {nextMilestone.label}
                        </AppText>
                        <AppText variant="muted">
                          {nextMilestone.timeRemainingText}
                        </AppText>
                      </View>
                    </View>
                  ) : (
                    <AppText variant="muted" style={styles.noMilestone}>
                      No upcoming milestones
                    </AppText>
                  )}
                </Pressable>
              </SectionCard>
            );
          }}
        />
      )}

      <ConfirmModal
        visible={!!eventToDelete}
        title="Delete event?"
        message={
          eventToDelete
            ? `Are you sure you want to delete "${eventToDelete.label}"? This will also remove its scheduled notifications.`
            : ''
        }
        confirmText="Delete Event"
        cancelText="Keep Event"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive
        isLoading={isDeleting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    marginBottom: theme.spacing.xs,
  },
  pageSubtitle: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  cardBody: {
    marginBottom: theme.spacing.md,
  },
  dateText: {
    marginTop: theme.spacing.xs,
  },
  milestoneBlock: {
    marginTop: theme.spacing.md,
  },
  blockLabel: {
    marginBottom: theme.spacing.xs,
  },
  notificationsText: {
    marginTop: theme.spacing.md,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlineLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  inlineLabelText: {
    marginLeft: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    flex: 1,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    marginLeft: 4,
  },

  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },

  milestoneText: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },

  milestoneLabel: {
    marginBottom: 2,
  },

  noMilestone: {
    marginTop: theme.spacing.xs,
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});