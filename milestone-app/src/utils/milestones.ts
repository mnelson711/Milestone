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

function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Today';
  }

  const diffDays = Math.ceil(diffMs / DAY_IN_MS);

  if (diffDays === 1) {
    return 'in 1 day';
  }

  if (diffDays < 30) {
    return `in ${diffDays} days`;
  }

  const diffMonths = Math.ceil(diffDays / 30);

  if (diffMonths === 1) {
    return 'in 1 month';
  }

  if (diffMonths < 12) {
    return `in ${diffMonths} months`;
  }

  const diffYears = Math.ceil(diffDays / 365);

  if (diffYears === 1) {
    return 'in 1 year';
  }

  return `in ${diffYears} years`;
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
  count: number
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

export function getUpcomingMilestones(
  event: EventItem,
  countPerRule: number = 2
): UpcomingMilestone[] {
  const baseDate = new Date(event.date);

  if (Number.isNaN(baseDate.getTime())) {
    return [];
  }

  const selectedRules = getSelectedRules(event);

  const allMilestones = selectedRules.flatMap((rule) =>
    buildUpcomingMilestonesForRule(baseDate, rule, countPerRule)
  );

  allMilestones.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  return allMilestones;
}

export function getNextUpcomingMilestone(event: EventItem): UpcomingMilestone | null {
  const milestones = getUpcomingMilestones(event, 1);
  return milestones[0] ?? null;
}