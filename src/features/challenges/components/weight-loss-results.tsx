import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import type { WeightLossResult } from '../types/challenge.model';

interface WeightLossResultsProps {
  result: WeightLossResult;
}

export function WeightLossResults({ result }: WeightLossResultsProps) {
  return (
    <View className="gap-4">
      <AppText className="text-sm font-semibold text-foreground uppercase">
        Final Results
      </AppText>
      <View
        className="p-4 rounded-xl border flex-row justify-between items-center bg-card border-border"
      >
        <View className="gap-1">
          <AppText className="text-xs text-muted">Final Weight Loss</AppText>
          <AppText className="text-lg font-bold text-foreground">
            {result.finalPercentLost.toFixed(1)}%
          </AppText>
          {result.matchedTier ? (
            <AppText className="text-xs text-brand">
              Tier {result.matchedTier.thresholdPercent}% reached!
            </AppText>
          ) : (
            <AppText className="text-xs text-muted">
              No tier reached.
            </AppText>
          )}
        </View>
        <View className="items-end gap-1">
          <AppText className="text-xs text-muted">Points Earned</AppText>
          <AppText className="text-2xl font-bold text-brand">
            +{result.finalPoints}
          </AppText>
        </View>
      </View>
    </View>
  );
}
