import { View, Text, Pressable } from 'react-native';
import { milestoneRules } from '../utils/milestoneRules';

type MilestoneSelectorProps = {
  selectedMilestoneIds: string[];
  onToggleMilestone: (milestoneId: string) => void;
};

export default function MilestoneSelector({
  selectedMilestoneIds,
  onToggleMilestone,
}: MilestoneSelectorProps) {
  const categories = ['classic', 'anniversary', 'space'] as const;

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Choose Milestones
      </Text>

      {categories.map((category) => {
        const rulesForCategory = milestoneRules.filter(
          (rule) => rule.category === category
        );

        return (
          <View key={category} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
                textTransform: 'capitalize',
              }}
            >
              {category}
            </Text>

            {rulesForCategory.map((rule) => {
              const isSelected = selectedMilestoneIds.includes(rule.id);

              return (
                <Pressable
                  key={rule.id}
                  onPress={() => onToggleMilestone(rule.id)}
                  style={{
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                    backgroundColor: isSelected ? '#e6f0ff' : '#fff',
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>
                    {isSelected ? '✓ ' : ''}{rule.title}
                  </Text>
                  <Text style={{ marginTop: 2 }}>{rule.description}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}