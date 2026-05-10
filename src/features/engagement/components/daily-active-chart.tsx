import { View, Dimensions } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { DailyActiveUser } from '../types/engagement.model';

interface DailyActiveChartProps {
  data: DailyActiveUser[];
}

export function DailyActiveChart({ data }: DailyActiveChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartWidth = Dimensions.get('window').width - 64;
  const barWidth = Math.max((chartWidth / data.length) - 4, 8);

  return (
    <Card className="p-4">
      <View className="flex-row items-center mb-3">
        <View style={{ width: 4, height: 14, backgroundColor: mflColors.brand, borderRadius: 2, marginRight: 8 }} />
        <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Daily Active Users — Last 14 Days
        </AppText>
      </View>
      <View className="flex-row items-end justify-between" style={{ height: 120 }}>
        {data.map((day) => {
          const barHeight = maxCount > 0 ? Math.max((day.count / maxCount) * 100, day.count > 0 ? 4 : 0) : 0;
          return (
            <View key={day.date} className="items-center" style={{ width: barWidth }}>
              {day.count > 0 && (
                <AppText className="text-[8px] text-muted mb-1">{day.count}</AppText>
              )}
              <View
                style={{
                  width: barWidth - 2,
                  height: barHeight,
                  backgroundColor: mflColors.brand,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              />
              <AppText className="text-[8px] text-muted mt-1">
                {day.date.slice(5)}
              </AppText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
