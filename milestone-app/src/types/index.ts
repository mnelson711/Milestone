export type EventItem = {
  id: string;
  label: string;
  date: string;
  notificationsEnabled?: boolean;
  scheduledNotificationIds?: string[];
  selectedMilestoneIds?: string[];
};

export type MilestoneCategory =
  | 'classic'
  | 'anniversary'
  | 'space';

export type MilestoneRule = {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  unit: 'minutes' | 'hours' | 'days' | 'years';
  interval: number;
};

export type AppSettings = {
  defaultNotificationsEnabled: boolean;
  defaultMilestoneIds: string[];
};