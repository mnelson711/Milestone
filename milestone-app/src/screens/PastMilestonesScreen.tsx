import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEvents } from '../storage/storage';
import { EventItem } from '../types';
import { getAllPastMilestones, PastMilestoneItem } from '../utils/milestones';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppText from '../components/AppText';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { useTheme } from '../context/ThemeContext';

type PastMilestonesScreenProps = {
  navigation: any;
};

export default function PastMilestonesScreen({
  navigation,
}: PastMilestonesScreenProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const { theme } = useTheme();

  const loadEvents = async () => {
    const storedEvents = await getEvents();
    setEvents(storedEvents);
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, []),
  );

  const pastMilestones = getAllPastMilestones(events, 25);

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
    headerSpacing: {
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      marginBottom: theme.spacing.xs,
    },
    cardSubtitle: {
      marginBottom: theme.spacing.md,
    },
    metaBlock: {
      gap: theme.spacing.xs,
    },
  });

  return (
    <ScreenContainer>
      {pastMilestones.length === 0 ? (
        <View>
          <AppText variant="title" style={styles.pageTitle}>
            Past Milestones
          </AppText>

          <AppText variant="muted" style={styles.pageSubtitle}>
            Look back at milestones you’ve already reached.
          </AppText>

          <EmptyState
            iconName="time-outline"
            title="No past milestones yet"
            message="Once your events begin reaching milestones, they’ll show up here."
          />
        </View>
      ) : (
        <FlatList
          data={pastMilestones}
          keyExtractor={(item) => `${item.eventId}-${item.milestoneId}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerSpacing}>
              <AppText variant="title" style={styles.pageTitle}>
                Past Milestones
              </AppText>

              <AppText variant="muted" style={styles.pageSubtitle}>
                Look back at milestones you’ve already reached.
              </AppText>

              <SectionHeader
                title={`Recently Reached (${pastMilestones.length})`}
                iconName="checkmark-circle-outline"
                subtitle="Your most recent milestone moments."
              />
            </View>
          }
          renderItem={({ item }: { item: PastMilestoneItem }) => (
            <SectionCard>
              <AppText variant="subtitle" style={styles.cardTitle}>
                {item.eventLabel}
              </AppText>

              <AppText variant="body" style={styles.cardSubtitle}>
                {item.milestoneLabel}
              </AppText>

              <View style={styles.metaBlock}>
                <AppText variant="muted">Reached {item.timeSinceText}</AppText>
                <AppText variant="muted">
                  {item.targetDate.toLocaleDateString()}
                </AppText>
              </View>
            </SectionCard>
          )}
        />
      )}
    </ScreenContainer>
  );
}
