export type MilestoneCategory =
  | 'classic'
  | 'anniversary'
  | 'time'
  | 'space';

export type MilestoneUnit =
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years';

export type MilestoneRule = {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  unit: MilestoneUnit;
  amount: number;
  isRecommended?: boolean;
};

export type AppSettings = {
  defaultNotificationsEnabled: boolean;
  enabledMilestoneIds: string[];
  defaultMilestoneIds: string[];
};

type EventCategory =
  | 'Birthday'
  | 'Anniversary'
  | 'Goal'
  | 'Life'
  | 'Other';

export type EventItem = {
  id: string;
  label: string;
  date: string;
  category: EventCategory;
  notificationsEnabled?: boolean;
  scheduledNotificationIds: string[];
  selectedMilestoneIds: string[];
};