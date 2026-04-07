import { MilestoneCategory, MilestoneRule } from '../types';

export const milestoneRules: MilestoneRule[] = [
  {
    id: '7-days',
    title: '7 Days',
    description: 'Celebrate 7 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 7,
    isRecommended: true,
  },
  {
    id: '30-days',
    title: '30 Days',
    description: 'Celebrate 30 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 30,
    isRecommended: true,
  },
  {
    id: '100-days',
    title: '100 Days',
    description: 'Celebrate 100 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 100,
    isRecommended: true,
  },
  {
    id: '365-days',
    title: '365 Days',
    description: 'Celebrate 365 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 365,
    isRecommended: true,
  },
  {
    id: '500-days',
    title: '500 Days',
    description: 'Celebrate 500 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 500,
    isRecommended: false,
  },
  {
    id: '1000-days',
    title: '1,000 Days',
    description: 'Celebrate 1,000 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 1000,
    isRecommended: true,
  },
  {
    id: '5000-days',
    title: '5,000 Days',
    description: 'Celebrate 5,000 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 5000,
    isRecommended: false,
  },
  {
    id: '10000-days',
    title: '10,000 Days',
    description: 'Celebrate 10,000 days from the event date.',
    category: 'classic',
    unit: 'days',
    amount: 10000,
    isRecommended: false,
  },

  {
    id: '1-month',
    title: '1 Month',
    description: 'Celebrate 1 month from the event date.',
    category: 'anniversary',
    unit: 'months',
    amount: 1,
    isRecommended: true,
  },
  {
    id: '3-months',
    title: '3 Months',
    description: 'Celebrate 3 months from the event date.',
    category: 'anniversary',
    unit: 'months',
    amount: 3,
    isRecommended: false,
  },
  {
    id: '6-months',
    title: '6 Months',
    description: 'Celebrate 6 months from the event date.',
    category: 'anniversary',
    unit: 'months',
    amount: 6,
    isRecommended: true,
  },
  {
    id: '1-year',
    title: '1 Year',
    description: 'Celebrate the 1 year anniversary.',
    category: 'anniversary',
    unit: 'years',
    amount: 1,
    isRecommended: true,
  },
  {
    id: '2-years',
    title: '2 Years',
    description: 'Celebrate the 2 year anniversary.',
    category: 'anniversary',
    unit: 'years',
    amount: 2,
    isRecommended: false,
  },
  {
    id: '5-years',
    title: '5 Years',
    description: 'Celebrate the 5 year anniversary.',
    category: 'anniversary',
    unit: 'years',
    amount: 5,
    isRecommended: true,
  },
  {
    id: '10-years',
    title: '10 Years',
    description: 'Celebrate the 10 year anniversary.',
    category: 'anniversary',
    unit: 'years',
    amount: 10,
    isRecommended: false,
  },

  {
    id: '1000-minutes',
    title: '1,000 Minutes',
    description: 'Track a fun time-based milestone.',
    category: 'time',
    unit: 'minutes',
    amount: 1000,
    isRecommended: false,
  },
  {
    id: '10000-minutes',
    title: '10,000 Minutes',
    description: 'Track a fun time-based milestone.',
    category: 'time',
    unit: 'minutes',
    amount: 10000,
    isRecommended: true,
  },
  {
    id: '100000-minutes',
    title: '100,000 Minutes',
    description: 'Track a fun time-based milestone.',
    category: 'time',
    unit: 'minutes',
    amount: 100000,
    isRecommended: false,
  },
  {
    id: '1000-hours',
    title: '1,000 Hours',
    description: 'Track a major time-based milestone.',
    category: 'time',
    unit: 'hours',
    amount: 1000,
    isRecommended: true,
  },
  {
    id: '10000-hours',
    title: '10,000 Hours',
    description: 'Track a major time-based milestone.',
    category: 'time',
    unit: 'hours',
    amount: 10000,
    isRecommended: true,
  },

  {
    id: '1-mercury-year',
    title: '1 Mercury Year',
    description: 'Celebrate one Mercury year from the event date.',
    category: 'space',
    unit: 'days',
    amount: 88,
    isRecommended: false,
  },
  {
    id: '1-venus-year',
    title: '1 Venus Year',
    description: 'Celebrate one Venus year from the event date.',
    category: 'space',
    unit: 'days',
    amount: 225,
    isRecommended: false,
  },
  {
    id: '1-mars-year',
    title: '1 Mars Year',
    description: 'Celebrate one Mars year from the event date.',
    category: 'space',
    unit: 'days',
    amount: 687,
    isRecommended: false,
  },
];

export const milestoneCategories: MilestoneCategory[] = [
  'classic',
  'anniversary',
  'time',
  'space',
];

export function getRecommendedMilestoneIds(): string[] {
  return milestoneRules
    .filter((rule) => rule.isRecommended)
    .map((rule) => rule.id);
}

export const defaultMilestoneIds = getRecommendedMilestoneIds();

export function getMilestoneRuleById(id: string): MilestoneRule | null {
  return milestoneRules.find((rule) => rule.id === id) ?? null;
}

export function getMilestonesByCategory(category: MilestoneCategory): MilestoneRule[] {
  return milestoneRules.filter((rule) => rule.category === category);
}

export function getEnabledMilestoneRules(enabledMilestoneIds: string[]): MilestoneRule[] {
  return milestoneRules.filter((rule) => enabledMilestoneIds.includes(rule.id));
}

export function formatCategoryLabel(category: string): string {
  switch (category) {
    case 'classic':
      return 'Classic';
    case 'anniversary':
      return 'Anniversary';
    case 'time':
      return 'Time';
    case 'space':
      return 'Space';
    default:
      return category;
  }
}