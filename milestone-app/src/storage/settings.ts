import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';
import { getRecommendedMilestoneIds } from '../utils/milestoneRules';

const SETTINGS_KEY = 'APP_SETTINGS';

const recommendedMilestoneIds = getRecommendedMilestoneIds();

const defaultSettings: AppSettings = {
  defaultNotificationsEnabled: true,
  enabledMilestoneIds: recommendedMilestoneIds,
  defaultMilestoneIds: recommendedMilestoneIds,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw);

    const enabledMilestoneIds =
      Array.isArray(parsed.enabledMilestoneIds) &&
      parsed.enabledMilestoneIds.length > 0
        ? parsed.enabledMilestoneIds
        : recommendedMilestoneIds;

    const defaultMilestoneIds = Array.isArray(parsed.defaultMilestoneIds)
      ? parsed.defaultMilestoneIds.filter((id: string) =>
          enabledMilestoneIds.includes(id),
        )
      : enabledMilestoneIds;

    return {
      defaultNotificationsEnabled:
        typeof parsed.defaultNotificationsEnabled === 'boolean'
          ? parsed.defaultNotificationsEnabled
          : true,
      enabledMilestoneIds,
      defaultMilestoneIds:
        defaultMilestoneIds.length > 0
          ? defaultMilestoneIds
          : enabledMilestoneIds,
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const normalizedDefaultMilestoneIds = settings.defaultMilestoneIds.filter(
    (id) => settings.enabledMilestoneIds.includes(id),
  );

  const normalizedSettings: AppSettings = {
    ...settings,
    defaultMilestoneIds: normalizedDefaultMilestoneIds,
  };

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizedSettings));
}
