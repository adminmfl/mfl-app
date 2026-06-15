import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import type { ComponentProps } from 'react';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface MetricRowProps {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}

function MetricRow({ icon, label, value, unit }: MetricRowProps) {
  if (value === null || value === undefined) return null;
  return (
    <View
      className="flex-row items-center gap-3 p-3 rounded-lg"
      style={{ backgroundColor: mflColors.surface }}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{ backgroundColor: mflColors.brandLight }}
      >
        <Feather name={icon} size={20} color={mflColors.brand} />
      </View>
      <View className="flex-1">
        <AppText className="text-xs text-muted">{label}</AppText>
        <AppText className="text-base font-semibold text-foreground">
          {value}{unit ? ` ${unit}` : ''}
        </AppText>
      </View>
    </View>
  );
}

interface SubmissionMetricsGridProps {
  duration?: number | null;
  distance?: number | null;
  steps?: number | null;
  holes?: number | null;
  hrAvg?: number | null;
  caloriesBurned?: number | null;
}

export function SubmissionMetricsGrid({
  duration,
  distance,
  steps,
  holes,
  hrAvg,
  caloriesBurned,
}: SubmissionMetricsGridProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <MetricRow icon="clock" label="Duration" value={duration} unit="min" />
        </View>
        <View className="flex-1">
          <MetricRow icon="map-pin" label="Distance" value={distance?.toFixed(2)} unit="km" />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <MetricRow icon="trending-up" label="Steps" value={steps?.toLocaleString()} />
        </View>
        <View className="flex-1">
          <MetricRow icon="target" label="Holes" value={holes} />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <MetricRow icon="heart" label="Avg HR" value={hrAvg} unit="bpm" />
        </View>
        <View className="flex-1">
          <MetricRow icon="zap" label="Calories" value={caloriesBurned} unit="kcal" />
        </View>
      </View>
    </View>
  );
}
