import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, WeekCalendar } from 'react-native-calendars';
import { getEvents } from '../storage/storage';
import { EventItem } from '../types';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppText from '../components/AppText';
import SectionHeader from '../components/SectionHeader';
import SegmentedControl from '../components/SegmentedControl';
import YearOverview from '../components/YearOverview';
import { theme } from '../theme/theme';
import {
  buildCalendarMilestonesByDate,
  buildMarkedDates,
  CalendarMilestoneItem,
  CalendarMilestonesByDate,
  getInitialSelectedDate,
} from '../utils/calendarMilestones';

type CalendarViewMode = 'week' | 'month' | 'year';

export default function CalendarScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [milestonesByDate, setMilestonesByDate] =
    useState<CalendarMilestonesByDate>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [focusedDate, setFocusedDate] = useState('');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [isLoading, setIsLoading] = useState(true);

  const loadCalendarData = async () => {
    setIsLoading(true);

    const storedEvents = await getEvents();
    const groupedMilestones = buildCalendarMilestonesByDate(storedEvents, 12);
    const initialSelectedDate = getInitialSelectedDate(groupedMilestones);

    setEvents(storedEvents);
    setMilestonesByDate(groupedMilestones);
    setSelectedDate(initialSelectedDate);
    setFocusedDate(initialSelectedDate);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [])
  );

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setFocusedDate(dateString);
  };

  const selectedDayMilestones: CalendarMilestoneItem[] =
    milestonesByDate[selectedDate] ?? [];

  const markedDates = useMemo(
    () => buildMarkedDates(milestonesByDate, selectedDate),
    [milestonesByDate, selectedDate]
  );

  const calendarTheme = {
    calendarBackground: theme.colors.surface,
    textSectionTitleColor: theme.colors.textMuted,
    selectedDayBackgroundColor: theme.colors.primaryDark,
    selectedDayTextColor: theme.colors.white,
    todayTextColor: theme.colors.secondary,
    dayTextColor: theme.colors.text,
    textDisabledColor: theme.colors.border,
    monthTextColor: theme.colors.text,
    arrowColor: theme.colors.primary,
    indicatorColor: theme.colors.primary,
    dotColor: theme.colors.primary,
    selectedDotColor: theme.colors.white,
    textDayFontWeight: '500' as const,
    textMonthFontWeight: '700' as const,
    textDayHeaderFontWeight: '600' as const,
  };

  return (
    <ScreenContainer>
      <FlatList
        data={selectedDayMilestones}
        keyExtractor={(item) => `${item.eventId}-${item.milestoneId}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <AppText variant="title" style={styles.pageTitle}>
              Calendar
            </AppText>
            <AppText variant="muted" style={styles.pageSubtitle}>
              View upcoming milestones by date.
            </AppText>

            <SegmentedControl
              options={[
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'Year', value: 'year' },
              ]}
              selected={viewMode}
              onChange={(value) => setViewMode(value as CalendarViewMode)}
            />

            <SectionCard>
              {viewMode === 'month' && (
                <Calendar
                  current={focusedDate}
                  markedDates={markedDates}
                  onDayPress={(day) => handleSelectDate(day.dateString)}
                  onMonthChange={(month) => setFocusedDate(month.dateString)}
                  firstDay={0}
                  enableSwipeMonths
                  theme={calendarTheme}
                  style={styles.calendar}
                />
              )}

              {viewMode === 'week' && (
                <WeekCalendar
                  current={focusedDate}
                  markedDates={markedDates}
                  onDayPress={(day) => handleSelectDate(day.dateString)}
                  onDayLongPress={(day) => handleSelectDate(day.dateString)}
                  firstDay={0}
                  allowShadow={false}
                  theme={calendarTheme}
                  style={styles.calendar}
                />
              )}

              {viewMode === 'year' && (
                <YearOverview
                  year={new Date(focusedDate || new Date().toISOString()).getFullYear()}
                  onSelectMonth={(monthIndex) => {
                    const base = new Date(focusedDate || new Date().toISOString());
                    const nextDate = new Date(base.getFullYear(), monthIndex, 1);
                    const nextDateString = nextDate.toISOString().split('T')[0];

                    setFocusedDate(nextDateString);
                    setSelectedDate(nextDateString);
                    setViewMode('month');
                  }}
                />
              )}
            </SectionCard>

            <SectionCard>
              <SectionHeader
                title="Selected Date"
                iconName="calendar-outline"
                subtitle={selectedDate}
              />

              {isLoading ? (
                <AppText variant="body">Loading calendar...</AppText>
              ) : selectedDayMilestones.length > 0 ? (
                <AppText variant="muted">
                  {selectedDayMilestones.length} milestone
                  {selectedDayMilestones.length === 1 ? '' : 's'} on this date
                </AppText>
              ) : (
                <AppText variant="muted">
                  No milestones on this date.
                </AppText>
              )}
            </SectionCard>

            {events.length === 0 ? (
              <SectionCard>
                <AppText variant="body">
                  Add some events to start seeing milestones on the calendar.
                </AppText>
              </SectionCard>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <SectionCard>
            <AppText variant="subtitle" style={styles.milestoneTitle}>
              {item.milestoneLabel}
            </AppText>

            <AppText variant="muted" style={styles.eventLabel}>
              {item.eventLabel}
            </AppText>

            <AppText variant="muted" style={styles.description}>
              {item.description}
            </AppText>

            <View style={styles.metaBlock}>
              <AppText variant="body">
                {item.targetDate.toLocaleDateString()}
              </AppText>
              <AppText variant="muted">{item.timeRemainingText}</AppText>
            </View>
          </SectionCard>
        )}
        ListEmptyComponent={
          !isLoading && events.length > 0 ? (
            <SectionCard>
              <AppText variant="body">
                No milestones to show for the selected date.
              </AppText>
            </SectionCard>
          ) : null
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
  calendar: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  milestoneTitle: {
    marginBottom: theme.spacing.xs,
  },
  eventLabel: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    marginBottom: theme.spacing.md,
  },
  metaBlock: {
    gap: theme.spacing.xs,
  },
});