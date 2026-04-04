import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { milestoneRules } from '../utils/milestoneRules';
import AppText from './AppText';
import { theme } from '../theme/theme';

type MilestoneSelectorProps = {
  selectedMilestoneIds: string[];
  onToggleMilestone: (milestoneId: string) => void;
};

export default function MilestoneSelector({
  selectedMilestoneIds,
  onToggleMilestone,
}: MilestoneSelectorProps) {
  const categories = ['classic', 'anniversary', 'space'] as const;

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    classic: true,
    anniversary: false,
    space: false,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const rulesForCategory = milestoneRules.filter(
          (rule) => rule.category === category
        );

        const selectedCount = rulesForCategory.filter((rule) =>
          selectedMilestoneIds.includes(rule.id)
        ).length;

        const isExpanded = expandedCategories[category];

        return (
          <View key={category} style={styles.categorySection}>
            <Pressable
              onPress={() => toggleCategory(category)}
              style={styles.categoryHeader}
            >
              <View style={styles.categoryHeaderText}>
                <AppText variant="subtitle">
                  {formatCategoryLabel(category)}
                </AppText>
                <AppText variant="muted">
                  {selectedCount} selected
                </AppText>
              </View>

              <AppText variant="body" style={styles.chevron}>
                {isExpanded ? '−' : '+'}
              </AppText>
            </Pressable>

            {isExpanded ? (
              <View style={styles.optionsContainer}>
                {rulesForCategory.map((rule) => {
                  const isSelected = selectedMilestoneIds.includes(rule.id);

                  return (
                    <Pressable
                      key={rule.id}
                      onPress={() => onToggleMilestone(rule.id)}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                    >
                      <View style={styles.optionHeader}>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected ? (
                            <AppText variant="body" style={styles.checkmark}>
                              ✓
                            </AppText>
                          ) : null}
                        </View>

                        <View style={styles.optionText}>
                          <AppText variant="body" style={styles.optionTitle}>
                            {rule.title}
                          </AppText>
                          <AppText variant="muted">{rule.description}</AppText>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function formatCategoryLabel(category: string): string {
  switch (category) {
    case 'classic':
      return 'Classic';
    case 'anniversary':
      return 'Anniversary';
    case 'space':
      return 'Space';
    default:
      return category;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
  },
  categorySection: {
    marginBottom: theme.spacing.md,
  },
  categoryHeader: {
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryHeaderText: {
    flex: 1,
  },
  chevron: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
  },
  optionsContainer: {
    marginTop: theme.spacing.sm,
  },
  optionCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: 2,
  },
});