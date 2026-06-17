import Feather from '@expo/vector-icons/Feather';
import { Pressable, Switch, TextInput, View } from 'react-native';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import {
  ALL_ACTIVITIES,
  type ScoringFormula,
  type ProofRequirement,
  type WizardData,
} from './quick-start.types';

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputStyle = {
  backgroundColor: mflColors.white,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;

export function StepActivitiesRules({ data, onUpdate, onNext, onBack }: Props) {
  const toggleActivity = (activity: string) => {
    const current = data.activities;
    if (current.includes(activity)) {
      if (current.length <= 1) return;
      onUpdate({ activities: current.filter((a) => a !== activity) });
    } else {
      onUpdate({ activities: [...current, activity] });
    }
  };

  const scoringOptions: { id: ScoringFormula; label: string; desc: string }[] = [
    { id: 'standard', label: 'Standard', desc: 'Duration + distance + type bonuses' },
    { id: 'simple', label: 'Simple', desc: 'Points per completed activity' },
    { id: 'points_only', label: 'Points Only', desc: 'Fixed points, no duration bonus' },
  ];

  const proofOptions: { id: ProofRequirement; label: string }[] = [
    { id: 'mandatory', label: 'Required' },
    { id: 'optional', label: 'Optional' },
  ];

  return (
    <View className="gap-5">
      <View>
        <AppText className="text-lg font-bold text-foreground">Activities & Rules</AppText>
        <AppText className="text-sm text-muted">
          Select activities and configure scoring rules.
        </AppText>
      </View>

      {/* Activities */}
      <View className="gap-2">
        <AppText className="text-sm font-medium text-muted">
          Activities ({data.activities.length} selected)
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {ALL_ACTIVITIES.map((activity) => {
            const selected = data.activities.includes(activity);
            return (
              <Pressable
                key={activity}
                onPress={() => toggleActivity(activity)}
                className="flex-row items-center gap-2 p-2.5 rounded-lg"
                style={{
                  borderWidth: 1,
                  borderColor: selected ? mflColors.brand : mflColors.border,
                  backgroundColor: selected ? mflColors.brandLight : mflColors.white,
                  minWidth: '45%',
                  flexGrow: 1,
                }}
              >
                <View
                  className="w-5 h-5 rounded items-center justify-center"
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? mflColors.brand : mflColors.textMuted,
                    backgroundColor: selected ? mflColors.brand : 'transparent',
                  }}
                >
                  {selected && (
                    <Feather name="check" size={12} color={mflColors.white} />
                  )}
                </View>
                <AppText
                  className="text-sm"
                  style={{
                    color: selected ? mflColors.brand : mflColors.text,
                    fontWeight: selected ? '600' : '400',
                  }}
                >
                  {activity}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Rest days */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Total Rest Days</AppText>
        <TextInput
          style={inputStyle}
          value={String(data.restDays)}
          onChangeText={(v) => {
            const n = parseInt(v) || 0;
            onUpdate({ restDays: Math.max(0, Math.min(7, n)) });
          }}
          keyboardType="number-pad"
          maxLength={1}
        />
      </View>

      {/* Scoring formula */}
      <View className="gap-2">
        <AppText className="text-sm font-medium text-muted">Scoring Formula</AppText>
        {scoringOptions.map((opt) => {
          const selected = data.scoringFormula === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onUpdate({ scoringFormula: opt.id })}
              className="flex-row items-start gap-3 p-3 rounded-xl"
              style={{
                borderWidth: 1,
                borderColor: selected ? mflColors.brand : mflColors.border,
                backgroundColor: selected ? mflColors.brandLight : mflColors.white,
              }}
            >
              <View
                className="w-4 h-4 rounded-full mt-0.5 items-center justify-center"
                style={{
                  borderWidth: 1,
                  borderColor: selected ? mflColors.brand : mflColors.textMuted,
                  backgroundColor: selected ? mflColors.brand : 'transparent',
                }}
              >
                {selected && (
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: mflColors.white }}
                  />
                )}
              </View>
              <View className="flex-1">
                <AppText className="text-sm font-medium text-foreground">{opt.label}</AppText>
                <AppText className="text-xs text-muted">{opt.desc}</AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Photo proof */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Photo Proof</AppText>
        <View className="flex-row gap-2">
          {proofOptions.map((opt) => {
            const selected = data.proofRequirement === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => onUpdate({ proofRequirement: opt.id })}
                className="flex-1 items-center py-2.5 rounded-xl"
                style={{
                  backgroundColor: selected ? mflColors.brand : mflColors.white,
                  borderWidth: 1,
                  borderColor: selected ? mflColors.brand : mflColors.border,
                }}
              >
                <AppText
                  className="text-sm font-medium"
                  style={{ color: selected ? mflColors.white : mflColors.text }}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Challenge-only mode */}
      <View
        className="flex-row items-center justify-between p-3 rounded-xl"
        style={{
          borderWidth: 1,
          borderColor: mflColors.border,
          backgroundColor: mflColors.white,
        }}
      >
        <View className="flex-1 mr-3">
          <AppText className="text-sm font-medium text-foreground">
            Challenge-Only Mode
          </AppText>
          <AppText className="text-xs text-muted">
            Skip daily activity tracking, only run challenges.
          </AppText>
        </View>
        <Switch
          value={data.leagueMode === 'challenges_only'}
          onValueChange={(checked) =>
            onUpdate({ leagueMode: checked ? 'challenges_only' : 'standard' })
          }
          trackColor={{ false: mflColors.border, true: mflColors.brand }}
          thumbColor={mflColors.white}
        />
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={onNext} className="flex-1">
          <Button.Label>Review</Button.Label>
        </Button>
      </View>
    </View>
  );
}
