import ScreenContainer from '../components/ScreenContainer';
import SectionCard from '../components/SectionCard';
import AppText from '../components/AppText';

export default function AboutScreen() {
  return (
    <ScreenContainer>
      <AppText variant="title" style={{ marginBottom: 16 }}>
        About
      </AppText>

      <SectionCard>
        <AppText variant="subtitle" style={{ marginBottom: 8 }}>
          Milestone
        </AppText>
        <AppText variant="body">
          Milestone helps you track life events through unusual and fun milestone
          markers, with local notifications for upcoming moments.
        </AppText>
      </SectionCard>
    </ScreenContainer>
  );
}