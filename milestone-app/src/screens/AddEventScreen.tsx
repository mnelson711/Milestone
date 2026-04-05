import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addEvent } from '../storage/storage';
import { getSettings } from '../storage/settings';
import { EventItem } from '../types';
import { syncEventNotifications } from '../utils/notifications';
import MilestoneSelector from '../components/MilestoneSelector';
import { defaultMilestoneIds } from '../utils/milestoneRules';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import SectionHeader from '../components/SectionHeader';
import AppModal from '../components/AppModal';
import AlertModal from '../components/AlertModal';
import { useTheme } from '../context/ThemeContext';

type AddEventScreenProps = {
  navigation: any;
};

type ModalAlertState = {
  visible: boolean;
  title: string;
  message: string;
};

export default function AddEventScreen({ navigation }: AddEventScreenProps) {
  const [label, setLabel] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMilestoneIds, setSelectedMilestoneIds] =
    useState<string[]>(defaultMilestoneIds);
  const [defaultNotificationsEnabled, setDefaultNotificationsEnabled] =
    useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertState, setAlertState] = useState<ModalAlertState>({
    visible: false,
    title: '',
    message: '',
  });

  const { theme } = useTheme();

  useEffect(() => {
    const loadDefaults = async () => {
      const settings = await getSettings();
      setSelectedMilestoneIds(settings.defaultMilestoneIds);
      setDefaultNotificationsEnabled(settings.defaultNotificationsEnabled);
    };

    loadDefaults();
  }, []);

  const showAlert = (title: string, message: string) => {
    setAlertState({
      visible: true,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlertState({
      visible: false,
      title: '',
      message: '',
    });
  };

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
      showAlert('Missing information', 'Please enter an event name.');
      return;
    }

    if (selectedMilestoneIds.length === 0) {
      showAlert(
        'Missing milestones',
        'Please select at least one milestone type.'
      );
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
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

      navigation.navigate('HomeMain');
    } catch (error) {
      console.error('Error saving event:', error);
      showAlert('Error', 'Something went wrong while saving the event.');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    pageTitle: {
      marginBottom: theme.spacing.xs,
    },
    pageSubtitle: {
      marginBottom: theme.spacing.lg,
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
    detailsRowSpacing: {
      marginTop: theme.spacing.lg,
    },
    dateField: {
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingVertical: 14,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateFieldLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    dateFieldText: {
      marginLeft: theme.spacing.sm,
    },
    bottomBar: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    modalTitle: {
      marginBottom: theme.spacing.xs,
    },
    modalSubtitle: {
      marginBottom: theme.spacing.lg,
    },
    modalActions: {
      marginTop: theme.spacing.md,
    },
  });

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="title" style={styles.pageTitle}>
            Add Event
          </AppText>

          <AppText variant="muted" style={styles.pageSubtitle}>
            Create a new event and choose which milestones to track.
          </AppText>

          <SectionCard>
            <SectionHeader
              title="Event Details"
              iconName="calendar-outline"
              subtitle="Start with the basics."
            />

            <AppText variant="body" style={styles.label}>
              Event Name
            </AppText>

            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Birthday, Wedding, Graduation..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              returnKeyType="done"
            />

            <View style={styles.detailsRowSpacing}>
              <AppText variant="body" style={styles.label}>
                Event Date
              </AppText>

              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.dateField}
              >
                <View style={styles.dateFieldLeft}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <AppText variant="body" style={styles.dateFieldText}>
                    {selectedDate.toLocaleDateString()}
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              title="Milestones"
              iconName="trophy-outline"
              subtitle="Choose which milestone types should apply to this event."
            />

            <MilestoneSelector
              selectedMilestoneIds={selectedMilestoneIds}
              onToggleMilestone={handleToggleMilestone}
            />
          </SectionCard>
        </ScrollView>

        <View style={styles.bottomBar}>
          <AppButton
            title={isSaving ? 'Saving Event...' : 'Save Event'}
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>
      </View>

      <AppModal
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <AppText variant="subtitle" style={styles.modalTitle}>
          Select Date
        </AppText>

        <AppText variant="muted" style={styles.modalSubtitle}>
          Choose the date for this event.
        </AppText>

        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />

        {Platform.OS === 'ios' ? (
          <View style={styles.modalActions}>
            <AppButton
              title="Done"
              onPress={() => setShowDatePicker(false)}
              variant="secondary"
            />
          </View>
        ) : null}
      </AppModal>

      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </ScreenContainer>
  );
}