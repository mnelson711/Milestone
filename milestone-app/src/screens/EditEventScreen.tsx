import { useEffect, useMemo, useState } from 'react';
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
import { EventCategory, EventItem } from '../types';
import { getEventById, updateEvent } from '../storage/storage';
import { syncEventNotifications } from '../utils/notifications';
import MilestoneSelector from '../components/MilestoneSelector';
import { defaultMilestoneIds } from '../utils/milestoneRules';
import { eventCategoryOptions } from '../utils/eventCategories';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import SectionHeader from '../components/SectionHeader';
import AppModal from '../components/AppModal';
import AlertModal from '../components/AlertModal';
import { useTheme } from '../context/ThemeContext';
import { getSettings } from '../storage/settings';

type EditEventScreenProps = {
  navigation: any;
  route: {
    params: {
      eventId: string;
    };
  };
};

type ModalAlertState = {
  visible: boolean;
  title: string;
  message: string;
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
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory>('custom');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<string[]>(
    defaultMilestoneIds
  );
  const [enabledMilestoneIds, setEnabledMilestoneIds] = useState<string[]>(
    defaultMilestoneIds
  );
  const [isSaving, setIsSaving] = useState(false);
  const [alertState, setAlertState] = useState<ModalAlertState>({
    visible: false,
    title: '',
    message: '',
  });

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
      setSelectedCategory(storedEvent.category ?? 'custom');
      setSelectedMilestoneIds(
        storedEvent.selectedMilestoneIds ?? defaultMilestoneIds
      );

      const settings = await getSettings();
      setEnabledMilestoneIds(settings.enabledMilestoneIds);

      setIsLoading(false);
    };

    loadEvent();
  }, [eventId]);

  const selectedCategoryOption = useMemo(() => {
    return (
      eventCategoryOptions.find((option) => option.id === selectedCategory) ??
      eventCategoryOptions[0]
    );
  }, [selectedCategory]);

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

  const handleSelectCategory = (category: EventCategory) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  const handleSave = async () => {
    if (!originalEvent || isSaving) {
      return;
    }

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

    setIsSaving(true);

    try {
      let updatedEvent: EventItem = {
        ...originalEvent,
        label: trimmedLabel,
        date: selectedDate.toISOString(),
        category: selectedCategory,
        selectedMilestoneIds,
      };

      await updateEvent(updatedEvent);
      updatedEvent = await syncEventNotifications(updatedEvent);

      navigation.replace('Event Details', { eventId: updatedEvent.id });
    } catch (error) {
      console.error('Error updating event:', error);
      showAlert('Error', 'Something went wrong while saving the event.');
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
    fieldButton: {
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
    fieldButtonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    fieldButtonText: {
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
    categoryOption: {
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    categoryOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(167, 139, 250, 0.14)',
    },
    categoryOptionLast: {
      marginBottom: 0,
    },
    categoryOptionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    categoryOptionText: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    categoryOptionTitle: {
      marginBottom: 2,
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
            Edit Event
          </AppText>

          <AppText variant="muted" style={styles.pageSubtitle}>
            Update the event details and milestone selection.
          </AppText>

          <SectionCard>
            <SectionHeader
              title="Event Details"
              iconName="calendar-outline"
              subtitle="Update the basics."
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
                style={styles.fieldButton}
              >
                <View style={styles.fieldButtonLeft}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <AppText variant="body" style={styles.fieldButtonText}>
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

            <View style={styles.detailsRowSpacing}>
              <AppText variant="body" style={styles.label}>
                Category
              </AppText>

              <Pressable
                onPress={() => setShowCategoryPicker(true)}
                style={styles.fieldButton}
              >
                <View style={styles.fieldButtonLeft}>
                  <Ionicons
                    name={selectedCategoryOption.iconName as any}
                    size={18}
                    color={theme.colors.primary}
                  />
                  <AppText variant="body" style={styles.fieldButtonText}>
                    {selectedCategoryOption.label}
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
              availableMilestoneIds={enabledMilestoneIds}
            />
          </SectionCard>
        </ScrollView>

        <View style={styles.bottomBar}>
          <AppButton
            title={isSaving ? 'Saving Changes...' : 'Save Changes'}
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
          Choose the updated date for this event.
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

      <AppModal
        visible={showCategoryPicker}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <AppText variant="subtitle" style={styles.modalTitle}>
          Select Category
        </AppText>

        <AppText variant="muted" style={styles.modalSubtitle}>
          Choose the type of event you want to track.
        </AppText>

        {eventCategoryOptions.map((option, index) => {
          const isSelected = option.id === selectedCategory;
          const isLast = index === eventCategoryOptions.length - 1;

          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelectCategory(option.id)}
              style={[
                styles.categoryOption,
                isSelected && styles.categoryOptionSelected,
                isLast && styles.categoryOptionLast,
              ]}
            >
              <View style={styles.categoryOptionRow}>
                <Ionicons
                  name={option.iconName as any}
                  size={18}
                  color={isSelected ? theme.colors.primary : theme.colors.text}
                />

                <View style={styles.categoryOptionText}>
                  <AppText variant="body" style={styles.categoryOptionTitle}>
                    {option.label}
                  </AppText>
                  <AppText variant="muted">{option.description}</AppText>
                </View>
              </View>
            </Pressable>
          );
        })}
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