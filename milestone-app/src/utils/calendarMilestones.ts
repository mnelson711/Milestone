import { EventItem } from '../types';
import { getUpcomingMilestones } from './milestones';

export type CalendarMilestoneItem = {
  dateKey: string;
  eventId: string;
  eventLabel: string;
  milestoneId: string;
  milestoneLabel: string;
  description: string;
  targetDate: Date;
  timeRemainingText: string;
};

export type CalendarMilestonesByDate = Record<string, CalendarMilestoneItem[]>;

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addMonths(date: Date, monthsToAdd: number): Date {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  return nextDate;
}

export function buildCalendarMilestonesByDate(
  events: EventItem[],
  monthsAhead: number = 12
): CalendarMilestonesByDate {
  const now = new Date();
  const endDate = addMonths(now, monthsAhead);

  const milestonesByDate: CalendarMilestonesByDate = {};

  for (const event of events) {
    const upcomingMilestones = getUpcomingMilestones(event, 6);

    for (const milestone of upcomingMilestones) {
      if (milestone.targetDate < now || milestone.targetDate > endDate) {
        continue;
      }

      const dateKey = formatDateKey(milestone.targetDate);

      if (!milestonesByDate[dateKey]) {
        milestonesByDate[dateKey] = [];
      }

      milestonesByDate[dateKey].push({
        dateKey,
        eventId: event.id,
        eventLabel: event.label,
        milestoneId: milestone.id,
        milestoneLabel: milestone.label,
        description: milestone.description,
        targetDate: milestone.targetDate,
        timeRemainingText: milestone.timeRemainingText,
      });
    }
  }

  for (const dateKey of Object.keys(milestonesByDate)) {
    milestonesByDate[dateKey].sort(
      (a, b) => a.targetDate.getTime() - b.targetDate.getTime()
    );
  }

  return milestonesByDate;
}

export function buildMarkedDates(
  milestonesByDate: CalendarMilestonesByDate,
  selectedDate: string
) {
  const markedDates: Record<
    string,
    {
      marked?: boolean;
      selected?: boolean;
      selectedColor?: string;
      dotColor?: string;
      selectedDotColor?: string;
    }
  > = {};

  for (const dateKey of Object.keys(milestonesByDate)) {
    markedDates[dateKey] = {
      marked: true,
      dotColor: '#A78BFA',
    };
  }

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      marked: !!milestonesByDate[selectedDate],
      selected: true,
      selectedColor: '#8B5CF6',
      selectedDotColor: '#FFFFFF',
      dotColor: milestonesByDate[selectedDate] ? '#FFFFFF' : '#A78BFA',
    };
  }

  return markedDates;
}

export function getInitialSelectedDate(
  milestonesByDate: CalendarMilestonesByDate
): string {
  const todayKey = formatDateKey(new Date());

  if (milestonesByDate[todayKey]) {
    return todayKey;
  }

  const sortedKeys = Object.keys(milestonesByDate).sort();

  return sortedKeys[0] ?? todayKey;
}