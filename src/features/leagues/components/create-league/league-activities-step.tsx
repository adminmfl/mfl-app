import { Pressable, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../../components/app-text';
import { SectionLabel } from '../../../../components/section-label';
import { mflColors } from '../../../../constants/colors';

interface LeagueActivitiesStepProps {
  rrFormula: string;
  isPublic: boolean;
  isExclusive: boolean;
  onChangeRrFormula: (value: string) => void;
  onTogglePublic: () => void;
  onToggleExclusive: () => void;
  onNext: () => void;
  onBack: () => void;
}

const RR_FORMULAS = [
  { value: 'standard', label: 'Standard (Run Rate)', description: 'Full RR calculation with all factors' },
  { value: 'simple', label: 'Simple', description: '1 point per activity' },
  { value: 'points_only', label: 'Points Only', description: 'Raw points without RR modifiers' },
] as const;

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable className="flex-row items-center justify-between py-3" onPress={onToggle}>
      <View className="flex-1 mr-4">
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
        <AppText className="text-xs text-muted mt-0.5">{description}</AppText>
      </View>
      <View className="w-12 h-7 rounded-full justify-center px-0.5" style={{ backgroundColor: value ? mflColors.brand : mflColors.border }}>
        <View
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: mflColors.white, alignSelf: value ? 'flex-end' : 'flex-start' }}
        />
      </View>
    </Pressable>
  );
}

export function LeagueActivitiesStep({
  rrFormula,
  isPublic,
  isExclusive,
  onChangeRrFormula,
  onTogglePublic,
  onToggleExclusive,
  onNext,
  onBack,
}: LeagueActivitiesStepProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <AppText className="text-lg font-bold text-foreground">Scoring & Visibility</AppText>
        <AppText className="text-sm text-muted">Set how the league scores and who can find it.</AppText>
      </View>

      <View className="gap-2">
        <SectionLabel label="SCORING FORMULA" />
        <View className="gap-2">
          {RR_FORMULAS.map((formula) => {
            const selected = rrFormula === formula.value;
            return (
              <Pressable
                key={formula.value}
                onPress={() => onChangeRrFormula(formula.value)}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: selected ? mflColors.brandLight : mflColors.white,
                  borderWidth: 1,
                  borderColor: selected ? mflColors.brand : mflColors.border,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: selected ? mflColors.brand : mflColors.textMuted,
                    }}
                  >
                    {selected && <View className="w-3 h-3 rounded-full" style={{ backgroundColor: mflColors.brand }} />}
                  </View>
                  <View className="flex-1">
                    <AppText className="text-sm font-semibold text-foreground">{formula.label}</AppText>
                    <AppText className="text-xs text-muted mt-0.5">{formula.description}</AppText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card className="p-4">
        <ToggleRow
          label="Public League"
          description="Anyone can find and request to join."
          value={isPublic}
          onToggle={onTogglePublic}
        />
        <View style={{ height: 1, backgroundColor: mflColors.border }} />
        <ToggleRow
          label="Exclusive League"
          description="Only invited members can join."
          value={isExclusive}
          onToggle={onToggleExclusive}
        />
      </Card>

      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={onNext} className="flex-1">
          <Button.Label>Teams</Button.Label>
        </Button>
      </View>
    </View>
  );
}
