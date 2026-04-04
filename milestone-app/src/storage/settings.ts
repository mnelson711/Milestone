import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';
import { defaultMilestoneIds } from '../utils/milestoneRules';

const SETTINGS_STORAGE_KEY = 'app_settings';

const defaultSettings: AppSettings = {
  defaultNotificationsEnabled: true,
  defaultMilestoneIds,
};

function normalizeSettings(settings: any): AppSettings {
  return {
    defaultNotificationsEnabled:
      typeof settings?.defaultNotificationsEnabled === 'boolean'
        ? settings.defaultNotificationsEnabled
        : true,
    defaultMilestoneIds: Array.isArray(settings?.defaultMilestoneIds)
      ? settings.defaultMilestoneIds
      : defaultMilestoneIds,
  };
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const storedValue = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!storedValue) {
      return defaultSettings;
    }

    const parsedValue = JSON.parse(storedValue);
    return normalizeSettings(parsedValue);
  } catch (error) {
    console.error('Error getting settings from storage:', error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizeSettings(settings))
    );
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
}