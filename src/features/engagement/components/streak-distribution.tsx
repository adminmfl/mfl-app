import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { StreakBucket } from '../types/engagement.model';

const STREAK_COLORS: Record<string, string> = {
  '0': '#94A3B8',
  '1-3': '#166534',
  '4-7': '#16A34A',
  '8-14': '#22C55E',
  '15+': '#4ADE80',
};

interface StreakDistributionProps {
  buckets: StreakBucket[];
}

export function StreakDistribution({ buckets }: StreakDistributionProps) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <Card className="p-4 flex-1">
      <View className="flex-row items-center mb-3">
        <View style={{ width: 4, height: 14, backgroundColor: mflColors.brand, borderRadius: 2, marginRight: 8 }} />
        <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Streak Distribution
        </AppText>
      </View>
      <View className="flex-row items-end justify-around" style={{ height: 80 }}>
        {buckets.map((bucket) => {
          const barHeight = maxCount > 0
            ? Math.max((bucket.count / maxCount) * 60, bucket.count > 0 ? 4 : 0)
            : 0;
          return (
            <View key={bucket.range} className="items-center flex-1">
              <AppText className="text-[10px] text-muted">{bucket.count}</AppText>
              <View
                style={{
                  width: '60%',
                  height: barHeight,
                  backgroundColor: STREAK_COLORS[bucket.range] ?? '#94A3B8',
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  marginVertical: 2,
                }}
              />
              <AppText className="text-[10px] text-muted">{bucket.range}</AppText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
