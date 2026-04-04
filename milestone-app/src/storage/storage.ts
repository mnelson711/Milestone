import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../types';

const EVENTS_STORAGE_KEY = 'events';

function normalizeEvent(event: any): EventItem {
  return {
    ...event,
    notificationsEnabled: event.notificationsEnabled ?? true,
    scheduledNotificationIds: Array.isArray(event.scheduledNotificationIds)
      ? event.scheduledNotificationIds
      : [],
    selectedMilestoneIds: Array.isArray(event.selectedMilestoneIds)
      ? event.selectedMilestoneIds
      : event.selectedMilestoneIds,
  };
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const storedValue = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map(normalizeEvent);
  } catch (error) {
    console.error('Error getting events from storage:', error);
    return [];
  }
}

export async function getEventById(eventId: string): Promise<EventItem | null> {
  try {
    console.log('getEventById - looking for event with id:', eventId);
    const events = await getEvents();
    const event = events.find((item) => item.id === eventId);
    console.log('getEventById - found event:', event);
    return event ?? null;
  } catch (error) {
    console.error('Error getting event by id from storage:', error);
    return null;
  }
}

export async function saveEvents(events: EventItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to storage:', error);
  }
}

export async function addEvent(event: EventItem): Promise<void> {
  try {
    const existingEvents = await getEvents();
    const updatedEvents = [...existingEvents, normalizeEvent(event)];
    await saveEvents(updatedEvents);
  } catch (error) {
    console.error('Error adding event to storage:', error);
  }
}

export async function updateEvent(updatedEvent: EventItem): Promise<void> {
  try {
    const existingEvents = await getEvents();
    const updatedEvents = existingEvents.map((event) =>
      event.id === updatedEvent.id ? normalizeEvent(updatedEvent) : event
    );
    await saveEvents(updatedEvents);
  } catch (error) {
    console.error('Error updating event in storage:', error);
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const existingEvents = await getEvents();
    const updatedEvents = existingEvents.filter((event) => event.id !== eventId);
    await saveEvents(updatedEvents);
  } catch (error) {
    console.error('Error deleting event from storage:', error);
  }
}