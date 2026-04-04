import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { getSettings } from '../storage/settings';
import { addEvent } from '../storage/storage';
import { EventItem } from '../types';
import { syncEventNotifications } from '../utils/notifications';
import MilestoneSelector from '../components/MilestoneSelector';
import { defaultMilestoneIds } from '../utils/milestoneRules';

type AddEventScreenProps = {
  navigation: any;
};

export default function AddEventScreen({ navigation }: AddEventScreenProps) {
  const [label, setLabel] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMilestoneIds, setSelectedMilestoneIds] =
    useState<string[]>(defaultMilestoneIds);
    const [defaultNotificationsEnabled, setDefaultNotificationsEnabled] =
    useState(true);

    useEffect(() => {
        const loadDefaults = async () => {
            const settings = await getSettings();
            setSelectedMilestoneIds(settings.defaultMilestoneIds);
            setDefaultNotificationsEnabled(settings.defaultNotificationsEnabled);
        };

        loadDefaults();
    }, []);

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
    const trimmedLabel = label.trim();

    if (!trimmedLabel) {
      Alert.alert('Missing information', 'Please enter an event name.');
      return;
    }

    if (selectedMilestoneIds.length === 0) {
      Alert.alert('Missing milestones', 'Please select at least one milestone type.');
      return;
    }

    const newEvent: EventItem = {
        id: Date.now().toString(),
        label: trimmedLabel,
        date: selectedDate.toISOString(),
        notificationsEnabled: defaultNotificationsEnabled,
        scheduledNotificationIds: [],
        selectedMilestoneIds,
    };

    await addEvent(newEvent);
    await syncEventNotifications(newEvent);

    navigation.navigate('Home');
  };

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
        <Button title="Save Event" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}