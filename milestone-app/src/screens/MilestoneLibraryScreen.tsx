import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { getSettings, saveSettings } from '../storage/settings';
import { AppSettings } from '../types';
import {
  milestoneRules,
  getRecommendedMilestoneIds,
} from '../utils/milestoneRules';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import SectionHeader from '../components/SectionHeader';
import MilestoneSelector from '../components/MilestoneSelector';
import AlertModal from '../components/AlertModal';
import { useTheme } from '../context/ThemeContext';

type Props = {
  navigation: any;
};

export default function MilestoneLibraryScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [enabledMilestoneIds, setEnabledMilestoneIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      const storedSettings = await getSettings();
      setSettings(storedSettings);
      setEnabledMilestoneIds(storedSettings.enabledMilestoneIds);
    };

    loadData();
  }, []);

  const handleToggleMilestone = (milestoneId: string) => {
    setEnabledMilestoneIds((current) =>
      current.includes(milestoneId)
        ? current.filter((id) => id !== milestoneId)
        : [...current, milestoneId],
    );
  };

  const handleResetRecommended = () => {
    setEnabledMilestoneIds(getRecommendedMilestoneIds());
  };

  const handleSave = async () => {
    if (!settings || isSaving) {
      return;
    }

    if (enabledMilestoneIds.length === 0) {
      setAlertVisible(true);
      return;
    }

    setIsSaving(true);

    try {
      const updatedSettings: AppSettings = {
        ...settings,
        enabledMilestoneIds,
        defaultMilestoneIds: settings.defaultMilestoneIds.filter((id) =>
          enabledMilestoneIds.includes(id),
        ),
      };

      await saveSettings(updatedSettings);
      setSettings(updatedSettings);

      // 👇 Navigate back to Settings screen (drawer)
      navigation.navigate('Settings');
    } catch (error) {
      console.error('Error saving milestone library:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <ScreenContainer>
        <AppText variant="body">Loading milestone library...</AppText>
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
    summaryText: {
      marginTop: theme.spacing.xs,
    },
    bottomBar: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
  });

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="title" style={styles.pageTitle}>
            Milestone Library
          </AppText>

          <AppText variant="muted" style={styles.pageSubtitle}>
            Choose which milestone types are available across the app.
          </AppText>

          <SectionCard>
            <SectionHeader
              title="Available Milestones"
              iconName="library-outline"
              subtitle="These will appear in Settings defaults and when creating or editing events."
            />

            <AppText variant="body">
              {enabledMilestoneIds.length} of {milestoneRules.length} enabled
            </AppText>

            <AppText variant="muted" style={styles.summaryText}>
              Disable milestones here to hide them throughout the app.
            </AppText>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              title="Milestone Categories"
              iconName="options-outline"
              subtitle="Select the milestone types you want available."
            />

            <MilestoneSelector
              selectedMilestoneIds={enabledMilestoneIds}
              onToggleMilestone={handleToggleMilestone}
            />
          </SectionCard>
        </ScrollView>

        <View style={styles.bottomBar}>
          <AppButton
            title={isSaving ? 'Saving Changes...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
          />

          {/* <AppButton
            title="Reset to Recommended"
            onPress={handleResetRecommended}
            variant="secondary"
          /> */}
        </View>
      </View>

      <AlertModal
        visible={alertVisible}
        title="No milestones selected"
        message="Please keep at least one milestone enabled."
        onClose={() => setAlertVisible(false)}
      />
    </ScreenContainer>
  );
}
