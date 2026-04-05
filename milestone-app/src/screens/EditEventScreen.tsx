import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { EventItem } from '../types';
import { getEventById, updateEvent } from '../storage/storage';
import { syncEventNotifications } from '../utils/notifications';
import MilestoneSelector from '../components/MilestoneSelector';
import { defaultMilestoneIds } from '../utils/milestoneRules';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';

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
  const [isSaving, setIsSaving] = useState(false);

  const { theme } = useTheme();


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
    if (!originalEvent || isSaving) {
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

    setIsSaving(true);

    try {
      let updatedEvent: EventItem = {
        ...originalEvent,
        label: trimmedLabel,
        date: selectedDate.toISOString(),
        selectedMilestoneIds,
      };

      await updateEvent(updatedEvent);
      updatedEvent = await syncEventNotifications(updatedEvent);

      navigation.replace('Event Details', { eventId: updatedEvent.id });
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Something went wrong while saving the event.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <AppText variant="body">Loading event...</AppText>
      </ScreenContainer>
    );
  }

  if (!originalEvent) {
    return (
      <ScreenContainer>
        <AppText variant="body">Event not found.</AppText>
      </ScreenContainer>
    );
  }


const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  pageTitle: {
    marginBottom: theme.spacing.xs,
  },
  pageSubtitle: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontSize: 16,
  },
  datePickerWrapper: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  doneButtonWrapper: {
    marginTop: theme.spacing.sm,
  },
  saveButtonWrapper: {
    marginTop: theme.spacing.sm,
  },
});

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText variant="title" style={styles.pageTitle}>
          Edit Event
        </AppText>
        <AppText variant="muted" style={styles.pageSubtitle}>
          Update the event details and milestone selection.
        </AppText>

        <SectionCard>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Basic Info
          </AppText>

          <AppText variant="body" style={styles.label}>
            Event Name
          </AppText>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Birthday, Wedding..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </SectionCard>

        <SectionCard>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Event Date
          </AppText>

          <AppText variant="body" style={styles.label}>
            Selected Date
          </AppText>

          <AppButton
            title={selectedDate.toLocaleDateString()}
            onPress={() => setShowDatePicker(true)}
            variant="secondary"
          />

          {showDatePicker && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            </View>
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.doneButtonWrapper}>
              <AppButton
                title="Done"
                onPress={() => setShowDatePicker(false)}
                variant="secondary"
              />
            </View>
          )}
        </SectionCard>

        <SectionCard>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Milestones
          </AppText>
          <AppText variant="muted" style={styles.sectionDescription}>
            Choose which milestone types should apply to this event.
          </AppText>

          <MilestoneSelector
            selectedMilestoneIds={selectedMilestoneIds}
            onToggleMilestone={handleToggleMilestone}
          />
        </SectionCard>

        <View style={styles.saveButtonWrapper}>
          <AppButton
            title={isSaving ? 'Saving Changes...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
