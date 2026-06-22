import { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

const BAR_HEIGHT = 120;

interface DailyBarChartProps {
  data: Array<{ date: string; submissions: number; participationRate: number }>;
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.submissions), 1),
    [data],
  );

  const chartData = useMemo(() => data.slice(-7), [data]);

  return (
    <View className="py-2">
      <View
        className="flex-row justify-between items-end"
        style={{ height: BAR_HEIGHT + 40 }}
      >
        {chartData.map((entry) => {
          const heightPct = (entry.submissions / maxCount) * 100;
          return (
            <View key={entry.date} className="flex-1 items-center mx-0.5">
              <AppText className="font-mono text-[10px] text-muted mb-0.5">
                {entry.submissions}
              </AppText>
              <View
                className="w-[60%] rounded-sm justify-end overflow-hidden"
                style={{ height: BAR_HEIGHT, backgroundColor: mflColors.inkLight }}
              >
                <View
                  className="w-full rounded-sm"
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    backgroundColor: '#00C48C',
                  }}
                />
              </View>
              <AppText className="font-medium text-[9px] text-muted mt-1 text-center">
                {new Date(entry.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                })}
              </AppText>
              <AppText className="font-mono text-[8px] text-muted">
                {entry.participationRate}%
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
