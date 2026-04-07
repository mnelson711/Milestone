import { EventItem, MilestoneRule } from '../types';
import { milestoneRules, defaultMilestoneIds } from './milestoneRules';

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

export type UpcomingMilestone = {
  id: string;
  label: string;
  description: string;
  targetDate: Date;
  timeRemainingText: string;
};

function getUnitMs(unit: MilestoneRule['unit']): number {
  switch (unit) {
    case 'minutes':
      return MINUTE_IN_MS;
    case 'hours':
      return HOUR_IN_MS;
    case 'days':
      return DAY_IN_MS;
    case 'years':
      return YEAR_IN_MS;
    default:
      return DAY_IN_MS;
  }
}

function getSelectedRules(event: EventItem): MilestoneRule[] {
  const selectedIds =
    event.selectedMilestoneIds && event.selectedMilestoneIds.length > 0
      ? event.selectedMilestoneIds
      : defaultMilestoneIds;

  return milestoneRules.filter((rule) => selectedIds.includes(rule.id));
}

function buildUpcomingMilestonesForRule(
  baseDate: Date,
  rule: MilestoneRule,
  count: number,
): UpcomingMilestone[] {
  const unitMs = getUnitMs(rule.unit);
  const now = new Date();
  const elapsedMs = now.getTime() - baseDate.getTime();
  const unitsElapsed = Math.max(0, elapsedMs / unitMs);

  const firstMilestoneAmount =
    (Math.floor(unitsElapsed / rule.interval) + 1) * rule.interval;

  return Array.from({ length: count }, (_, index) => {
    const milestoneAmount = firstMilestoneAmount + index * rule.interval;
    const targetDate = new Date(baseDate.getTime() + milestoneAmount * unitMs);

    return {
      id: `${rule.id}_${milestoneAmount}`,
      label: `${rule.title}`,
      description: `${milestoneAmount.toLocaleString()} ${rule.unit} since this event`,
      targetDate,
      timeRemainingText: formatTimeRemaining(targetDate),
    };
  });
}

export type CalculatedMilestone = {
  id: string;
  label: string;
  description: string;
  targetDate: Date;
  timeRemainingText: string;
};

export type PastMilestoneItem = {
  eventId: string;
  eventLabel: string;
  milestoneId: string;
  milestoneLabel: string;
  milestoneDescription: string;
  targetDate: Date;
  timeSinceText: string;
};

function addTimeToDate(date: Date, rule: MilestoneRule): Date {
  const nextDate = new Date(date);

  switch (rule.unit) {
    case 'minutes':
      nextDate.setMinutes(nextDate.getMinutes() + rule.amount);
      break;
    case 'hours':
      nextDate.setHours(nextDate.getHours() + rule.amount);
      break;
    case 'days':
      nextDate.setDate(nextDate.getDate() + rule.amount);
      break;
    case 'weeks':
      nextDate.setDate(nextDate.getDate() + rule.amount * 7);
      break;
    case 'months':
      nextDate.setMonth(nextDate.getMonth() + rule.amount);
      break;
    case 'years':
      nextDate.setFullYear(nextDate.getFullYear() + rule.amount);
      break;
    default:
      break;
  }

  return nextDate;
}

function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Reached';
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return days === 1 ? 'In 1 day' : `In ${days} days`;
  }

  if (hours > 0) {
    return hours === 1 ? 'In 1 hour' : `In ${hours} hours`;
  }

  return minutes <= 1 ? 'In 1 minute' : `In ${minutes} minutes`;
}

function formatTimeSince(targetDate: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  return minutes <= 1 ? '1 minute ago' : `${minutes} minutes ago`;
}

export function getUpcomingMilestones(
  event: EventItem,
  limit?: number,
): CalculatedMilestone[] {
  const eventDate = new Date(event.date);
  const selectedRules = milestoneRules.filter((rule) =>
    event.selectedMilestoneIds.includes(rule.id),
  );

  const upcoming = selectedRules
    .map((rule) => {
      const targetDate = addTimeToDate(eventDate, rule);

      return {
        id: rule.id,
        label: rule.title,
        description: rule.description,
        targetDate,
        timeRemainingText: formatTimeRemaining(targetDate),
      };
    })
    .filter((milestone) => milestone.targetDate.getTime() > Date.now())
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

export function getNextUpcomingMilestone(
  event: EventItem,
): CalculatedMilestone | null {
  return getUpcomingMilestones(event, 1)[0] ?? null;
}

export function getPastMilestones(
  event: EventItem,
  limit?: number,
): PastMilestoneItem[] {
  const eventDate = new Date(event.date);
  const selectedRules = milestoneRules.filter((rule) =>
    event.selectedMilestoneIds.includes(rule.id),
  );

  const pastMilestones = selectedRules
    .map((rule) => {
      const targetDate = addTimeToDate(eventDate, rule);

      return {
        eventId: event.id,
        eventLabel: event.label,
        milestoneId: rule.id,
        milestoneLabel: rule.title,
        milestoneDescription: rule.description,
        targetDate,
        timeSinceText: formatTimeSince(targetDate),
      };
    })
    .filter((milestone) => milestone.targetDate.getTime() <= Date.now())
    .sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime());

  return typeof limit === 'number'
    ? pastMilestones.slice(0, limit)
    : pastMilestones;
}

export function getAllPastMilestones(
  events: EventItem[],
  limit?: number,
): PastMilestoneItem[] {
  const allPastMilestones = events
    .flatMap((event) => getPastMilestones(event))
    .sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime());

  return typeof limit === 'number'
    ? allPastMilestones.slice(0, limit)
    : allPastMilestones;
}
