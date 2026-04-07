import { useMemo, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import {
  milestoneRules,
  milestoneCategories,
  formatCategoryLabel,
} from '../utils/milestoneRules';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

type MilestoneSelectorProps = {
  selectedMilestoneIds: string[];
  onToggleMilestone: (milestoneId: string) => void;
  availableMilestoneIds?: string[];
};

type CategoryKey = (typeof milestoneCategories)[number];

export default function MilestoneSelector({
  selectedMilestoneIds,
  onToggleMilestone,
  availableMilestoneIds,
}: MilestoneSelectorProps) {
  const { theme } = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>(null);

  const visibleRules = useMemo(() => {
    if (!availableMilestoneIds) {
      return milestoneRules;
    }

    return milestoneRules.filter((rule) =>
      availableMilestoneIds.includes(rule.id)
    );
  }, [availableMilestoneIds]);

  const categories = useMemo(() => {
    return milestoneCategories.filter((category) =>
      visibleRules.some((rule) => rule.category === category)
    );
  }, [visibleRules]);

  const measuredHeights = useRef<Record<string, number>>({});
  const animatedHeights = useRef<Record<string, Animated.Value>>({
    classic: new Animated.Value(0),
    anniversary: new Animated.Value(0),
    time: new Animated.Value(0),
    space: new Animated.Value(0),
  }).current;

  const animatedOpacities = useRef<Record<string, Animated.Value>>({
    classic: new Animated.Value(0),
    anniversary: new Animated.Value(0),
    time: new Animated.Value(0),
    space: new Animated.Value(0),
  }).current;

  const styles = StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },
    categorySection: {
      marginBottom: theme.spacing.md,
    },
    categoryHeader: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryHeaderExpanded: {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(167, 139, 250, 0.08)',
    },
    categoryHeaderText: {
      flex: 1,
    },
    categorySubtitle: {
      marginTop: 2,
    },
    chevron: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '700',
      marginLeft: theme.spacing.sm,
    },
    chevronExpanded: {
      transform: [{ rotate: '45deg' }],
      color: theme.colors.primary,
    },
    animatedOptionsWrapper: {
      overflow: 'hidden',
    },
    optionsInner: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      paddingBottom: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
    },
    hiddenMeasureContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      opacity: 0,
      zIndex: -1,
      pointerEvents: 'none',
    },
    optionCard: {
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: theme.spacing.sm,
    },
    optionCardLast: {
      marginBottom: 0,
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
      width: 22,
      height: 22,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      marginTop: 1,
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
      marginBottom: 1,
    },
  });

  const rulesByCategory = useMemo(() => {
    return {
      classic: visibleRules.filter((rule) => rule.category === 'classic'),
      anniversary: visibleRules.filter((rule) => rule.category === 'anniversary'),
      time: visibleRules.filter((rule) => rule.category === 'time'),
      space: visibleRules.filter((rule) => rule.category === 'space'),
    };
  }, [visibleRules]);

  const animateCategory = (category: CategoryKey, toOpen: boolean) => {
    const targetHeight = toOpen
      ? (measuredHeights.current[category] ?? 0) + 6
      : 0;

    const targetOpacity = toOpen ? 1 : 0;

    Animated.parallel([
      Animated.timing(animatedHeights[category], {
        toValue: targetHeight,
        duration: 260,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacities[category], {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const toggleCategory = (category: CategoryKey) => {
    if (expandedCategory === category) {
      animateCategory(category, false);
      setExpandedCategory(null);
      return;
    }

    if (expandedCategory) {
      animateCategory(expandedCategory, false);
    }

    setExpandedCategory(category);
    animateCategory(category, true);
  };

  const handleMeasureOptions =
    (category: CategoryKey) => (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      const previousHeight = measuredHeights.current[category];

      if (!height || previousHeight === height) {
        return;
      }

      measuredHeights.current[category] = height;

      if (expandedCategory === category) {
        animatedHeights[category].setValue(height + 6);
      }
    };

  const renderOptions = (category: CategoryKey, forMeasurement = false) => {
    const rulesForCategory = rulesByCategory[category];

    return (
      <View
        style={forMeasurement ? undefined : styles.optionsInner}
        onLayout={forMeasurement ? handleMeasureOptions(category) : undefined}
      >
        {rulesForCategory.map((rule, index) => {
          const isSelected = selectedMilestoneIds.includes(rule.id);
          const isLast = index === rulesForCategory.length - 1;

          return (
            <Pressable
              key={rule.id}
              onPress={() => onToggleMilestone(rule.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                isLast && styles.optionCardLast,
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
                  <AppText variant="muted" style={{ lineHeight: 18 }}>
                    {rule.description}
                  </AppText>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const rulesForCategory = rulesByCategory[category];

        const selectedCount = rulesForCategory.filter((rule) =>
          selectedMilestoneIds.includes(rule.id)
        ).length;

        const isExpanded = expandedCategory === category;

        return (
          <View key={category} style={styles.categorySection}>
            <Pressable
              onPress={() => toggleCategory(category)}
              style={[
                styles.categoryHeader,
                isExpanded && styles.categoryHeaderExpanded,
              ]}
            >
              <View style={styles.categoryHeaderText}>
                <AppText variant="subtitle">
                  {formatCategoryLabel(category)}
                </AppText>
                <AppText variant="muted" style={styles.categorySubtitle}>
                  {selectedCount} selected
                </AppText>
              </View>

              <AppText
                variant="body"
                style={[
                  styles.chevron,
                  isExpanded && styles.chevronExpanded,
                ]}
              >
                +
              </AppText>
            </Pressable>

            <Animated.View
              style={[
                styles.animatedOptionsWrapper,
                {
                  height: animatedHeights[category],
                  opacity: animatedOpacities[category],
                },
              ]}
            >
              {renderOptions(category)}
            </Animated.View>

            <View style={styles.hiddenMeasureContainer}>
              {renderOptions(category, true)}
            </View>
          </View>
        );
      })}
    </View>
  );
}