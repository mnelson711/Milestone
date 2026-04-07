import { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getEvents } from '../storage/storage';
import { EventItem } from '../types';
import { getNextUpcomingMilestone } from '../utils/milestones';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const { theme } = useTheme();

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
    }, []),
  );

  const nextEvent = useMemo(() => {
    return events.find((event) => getNextUpcomingMilestone(event)) ?? null;
  }, [events]);

  const nextMilestone = useMemo(() => {
    return nextEvent ? getNextUpcomingMilestone(nextEvent) : null;
  }, [nextEvent]);

  const styles = StyleSheet.create({
    pageTitle: {
      marginBottom: theme.spacing.xs,
    },
    pageSubtitle: {
      marginBottom: theme.spacing.lg,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    headerSpacing: {
      marginBottom: theme.spacing.lg,
    },
    sectionSpacing: {
      marginBottom: theme.spacing.lg,
    },
    cardBody: {
      marginBottom: theme.spacing.md,
    },
    title: {
      flex: 1,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
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
      marginTop: theme.spacing.md,
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
    upNextCard: {
      marginTop: theme.spacing.sm,
    },

    upNextMilestoneRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: theme.spacing.md,
    },
    upNextMilestoneText: {
      marginLeft: theme.spacing.sm,
      flex: 1,
    },

    upNextFeaturedCard: {
      marginTop: theme.spacing.xs,
      backgroundColor: 'rgba(167, 139, 250, 0.12)',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },

    upNextBadgeRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },

    upNextBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: 'rgba(167, 139, 250, 0.16)',
      borderWidth: 1,
      borderColor: 'rgba(167, 139, 250, 0.35)',
    },

    upNextBadgeText: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.primary,
    },

    upNextEventTitle: {
      marginBottom: theme.spacing.xs,
    },

    upNextMilestoneLabel: {
      marginBottom: theme.spacing.md,
    },

    upNextTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    upNextTimeText: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.text,
      fontWeight: '600',
    },

    upNextDateText: {
      marginTop: theme.spacing.xs,
    },
  });

  const renderListHeader = () => (
    <View>
      <AppButton
        title="View Past Milestones"
        onPress={() => navigation.navigate('Past Milestones')}
        variant="secondary"
      />

      {nextEvent && nextMilestone ? (
        <Pressable
          style={styles.upNextFeaturedCard}
          onPress={() =>
            navigation.navigate('Event Details', { eventId: nextEvent.id })
          }
        >
          <View style={styles.upNextBadgeRow}>
            <View style={styles.upNextBadge}>
              <Ionicons
                name="sparkles-outline"
                size={14}
                color={theme.colors.primary}
              />
              <AppText variant="muted" style={styles.upNextBadgeText}>
                Up Next
              </AppText>
            </View>
          </View>

          <AppText variant="subtitle" style={styles.upNextEventTitle}>
            {nextEvent.label}
          </AppText>

          <AppText variant="body" style={styles.upNextMilestoneLabel}>
            {nextMilestone.label}
          </AppText>

          <View style={styles.upNextTimeRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.primary}
            />
            <AppText variant="body" style={styles.upNextTimeText}>
              {nextMilestone.timeRemainingText}
            </AppText>
          </View>

          <AppText variant="muted" style={styles.upNextDateText}>
            {nextMilestone.targetDate.toLocaleDateString()}
          </AppText>
        </Pressable>
      ) : null}

      <View style={styles.sectionSpacing}>
        <SectionHeader
          title={`Events (${events.length})`}
          iconName="bookmark-outline"
          subtitle="Tap a card to view details."
        />
      </View>

      <View style={styles.sectionSpacing}>
        <AppButton
          title={events.length === 0 ? 'Create Your First Event' : 'Add Event'}
          onPress={() => navigation.navigate('Add Event')}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {events.length === 0 ? (
        <View>
          <EmptyState
            iconName="calendar-clear-outline"
            title="No events yet"
            message="Add your first event to start tracking fun milestones and notifications."
            buttonText="Create Your First Event"
            onPressButton={() => navigation.navigate('Add Event')}
          />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          renderItem={({ item }) => {
            const itemNextMilestone = getNextUpcomingMilestone(item);

            return (
              <SectionCard>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Event Details', { eventId: item.id })
                  }
                  style={styles.cardBody}
                >
                  <AppText variant="subtitle" style={styles.title}>
                    {item.label}
                  </AppText>

                  <View style={styles.metaRow}>
                    <AppText variant="muted">
                      {new Date(item.date).toLocaleDateString()}
                    </AppText>
                  </View>

                  {itemNextMilestone ? (
                    <View style={styles.milestoneRow}>
                      <Ionicons
                        name="trophy-outline"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <View style={styles.milestoneText}>
                        <AppText variant="body" style={styles.milestoneLabel}>
                          {itemNextMilestone.label}
                        </AppText>
                        <AppText variant="muted">
                          {itemNextMilestone.timeRemainingText}
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
    </ScreenContainer>
  );
}
