import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { EventItem } from '../types';
import { getEventById, updateEvent } from '../storage/storage';
import { syncEventNotifications } from '../utils/notifications';
import MilestoneSelector from '../components/MilestoneSelector';
import { defaultMilestoneIds } from '../utils/milestoneRules';

type EditEventScreenProps = {
  navigation: any;
  route: {
    params: {
      eventId: string;
    };
  };
};

export default function EditEventScreen({
  navigation,
  route,
}: EditEventScreenProps) {
  const { eventId } = route.params;

  const [originalEvent, setOriginalEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<string[]>(
    defaultMilestoneIds
  );

  useEffect(() => {
    const loadEvent = async () => {
      const storedEvent = await getEventById(eventId);

      if (!storedEvent) {
        setOriginalEvent(null);
        setIsLoading(false);
        return;
      }

      setOriginalEvent(storedEvent);
      setLabel(storedEvent.label);
      setSelectedDate(new Date(storedEvent.date));
      setSelectedMilestoneIds(
        storedEvent.selectedMilestoneIds ?? defaultMilestoneIds
      );
      setIsLoading(false);
    };

    loadEvent();
  }, [eventId]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed' || !date) {
      return;
    }

    setSelectedDate(date);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setSelectedMilestoneIds((current) =>
      current.includes(milestoneId)
        ? current.filter((id) => id !== milestoneId)
        : [...current, milestoneId]
    );
  };

  const handleSave = async () => {
    if (!originalEvent) {
      return;
    }

    const trimmedLabel = label.trim();

    if (!trimmedLabel) {
      Alert.alert('Missing information', 'Please enter an event name.');
      return;
    }

    if (selectedMilestoneIds.length === 0) {
      Alert.alert('Missing milestones', 'Please select at least one milestone type.');
      return;
    }

    let updatedEvent: EventItem = {
      ...originalEvent,
      label: trimmedLabel,
      date: selectedDate.toISOString(),
      selectedMilestoneIds,
    };

    await updateEvent(updatedEvent);
    updatedEvent = await syncEventNotifications(updatedEvent);

    navigation.replace('Event Details', { eventId: updatedEvent.id });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Loading event...</Text>
      </View>
    );
  }

  if (!originalEvent) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ marginBottom: 6 }}>Event Name</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Birthday, Wedding..."
        style={{ borderWidth: 1, marginBottom: 16, padding: 10, borderRadius: 6 }}
      />

      <Text style={{ marginBottom: 6 }}>Date</Text>
      <Button
        title={selectedDate.toLocaleDateString()}
        onPress={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <View style={{ marginTop: 12 }}>
          <Button title="Done" onPress={() => setShowDatePicker(false)} />
        </View>
      )}

      <MilestoneSelector
        selectedMilestoneIds={selectedMilestoneIds}
        onToggleMilestone={handleToggleMilestone}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Save Changes" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}