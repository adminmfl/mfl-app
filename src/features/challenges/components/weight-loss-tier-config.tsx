// Removed React import
import { View, Pressable, TextInput } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { Stepper } from '../../leagues/components/settings-form-fields';
import type { WeightLossTier } from '../types/challenge.model';

interface WeightLossTierConfigProps {
  durationDays?: number;
  onDurationChange: (days: number) => void;
  tiers: WeightLossTier[];
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onUpdateTier: (index: number, field: keyof WeightLossTier, value: number) => void;
  isValid: boolean;
}

export function WeightLossTierConfig({
  durationDays = 30,
  onDurationChange,
  tiers,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
  isValid,
}: WeightLossTierConfigProps) {
  return (
    <View className="gap-6 mt-4">
      <View className="gap-2">
        <AppText className="text-sm font-semibold text-foreground">Challenge Duration</AppText>
        <AppText className="text-xs text-muted mb-2">
          How many days does the challenge run for?
        </AppText>
        <Stepper
          label="Duration"
          value={durationDays}
          onIncrement={() => onDurationChange(durationDays + 1)}
          onDecrement={() => onDurationChange(Math.max(1, durationDays - 1))}
          min={1}
          max={365}
          unit="days"
        />
      </View>

      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <AppText className="text-sm font-semibold text-foreground">Reward Tiers</AppText>
            <AppText className="text-xs text-muted mt-1">
              Set point rewards for achieving % weight loss goals.
            </AppText>
          </View>
          <Pressable
            onPress={onAddTier}
            className="w-8 h-8 rounded-full items-center justify-center bg-card border border-border"
          >
            <Feather name="plus" size={16} color={mflColors.text} />
          </Pressable>
        </View>

        {!isValid && (
          <AppText className="text-xs text-red-500 font-medium">
            Thresholds must be in ascending order.
          </AppText>
        )}

        {tiers.length === 0 ? (
          <AppText className="text-xs text-muted text-center py-4 italic">
            No tiers configured. Players won't earn points.
          </AppText>
        ) : (
          <View className="gap-3">
            {tiers.map((tier, index) => (
              <View
                key={index}
                className="flex-row items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <View className="flex-1 gap-1">
                  <AppText className="text-xs text-muted">Goal % Loss</AppText>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: mflColors.border,
                      borderRadius: 8,
                      padding: 8,
                      color: mflColors.text,
                      fontSize: 14,
                    }}
                    value={tier.thresholdPercent.toString()}
                    onChangeText={(v) => {
                      const num = Number.parseInt(v, 10);
                      if (!Number.isNaN(num)) {
                        onUpdateTier(index, 'thresholdPercent', num);
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1 gap-1">
                  <AppText className="text-xs text-muted">Points</AppText>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: mflColors.border,
                      borderRadius: 8,
                      padding: 8,
                      color: mflColors.text,
                      fontSize: 14,
                    }}
                    value={tier.points.toString()}
                    onChangeText={(v) => {
                      const num = Number.parseInt(v, 10);
                      if (!Number.isNaN(num)) {
                        onUpdateTier(index, 'points', num);
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <Pressable
                  onPress={() => onRemoveTier(index)}
                  className="w-8 h-8 items-center justify-center mt-5"
                >
                  <Feather name="trash-2" size={18} color={mflColors.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
