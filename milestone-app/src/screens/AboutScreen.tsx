import { StyleSheet, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppText from '../components/AppText';
import SectionHeader from '../components/SectionHeader';
import { useTheme } from '../context/ThemeContext';

export default function AboutScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    pageTitle: {
      marginBottom: theme.spacing.xs,
    },
    pageSubtitle: {
      marginBottom: theme.spacing.lg,
    },
    bodyText: {
      lineHeight: 22,
    },
    listItem: {
      marginBottom: theme.spacing.sm,
    },
  });

  return (
    <ScreenContainer>
      <AppText variant="title" style={styles.pageTitle}>
        About
      </AppText>
      <AppText variant="muted" style={styles.pageSubtitle}>
        A fun way to track life through unusual milestones.
      </AppText>

      <SectionCard>
        <SectionHeader title="What is Milestone?" iconName="sparkles-outline" />
        <AppText variant="body" style={styles.bodyText}>
          Milestone is a personal event tracker that helps you follow important
          dates through fun and unexpected milestone markers instead of only
          traditional anniversaries.
        </AppText>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="What can you do?" iconName="list-outline" />

        <View style={styles.listItem}>
          <AppText variant="body">• Add and edit personal events</AppText>
        </View>
        <View style={styles.listItem}>
          <AppText variant="body">• Choose which milestone types apply</AppText>
        </View>
        <View style={styles.listItem}>
          <AppText variant="body">
            • View upcoming milestones for each event
          </AppText>
        </View>
        <View style={styles.listItem}>
          <AppText variant="body">
            • Enable local milestone notifications
          </AppText>
        </View>
        <View style={styles.listItem}>
          <AppText variant="body">
            • Customize default milestone settings
          </AppText>
        </View>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Why it exists" iconName="heart-outline" />
        <AppText variant="body" style={styles.bodyText}>
          The idea behind Milestone is to make meaningful dates feel more
          playful, personal, and memorable by highlighting time in a different
          way.
        </AppText>
      </SectionCard>
    </ScreenContainer>
  );
}
