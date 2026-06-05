import { useMemo } from 'react';
import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { AiUsageDailyTrendDTO } from '../types/ai-usage.dto';
import { formatTokens } from '../utils/format';

const BAR_HEIGHT = 100;

const KEY_COLORS = {
  platform: '#94a3b8',
  league: '#818cf8',
  byok: '#34d399',
};

interface DailyTrendChartProps {
  dailyTrend: AiUsageDailyTrendDTO[];
}

export function DailyTrendChart({ dailyTrend }: DailyTrendChartProps) {
  const chartData = useMemo(() => dailyTrend.slice(-7), [dailyTrend]);
  const maxTokens = useMemo(
    () => Math.max(...chartData.map((d) => d.tokens), 1),
    [chartData],
  );

  if (dailyTrend.length === 0) return null;

  return (
    <>
      <SectionLabel label="Daily Token Usage" style={{ marginTop: 12 }} />
      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-end" style={{ height: BAR_HEIGHT + 40 }}>
          {chartData.map((entry) => {
            const total = entry.tokens;
            const totalPct = (total / maxTokens) * 100;
            const platformPct = total > 0 ? (entry.platform / total) * totalPct : 0;
            const leaguePct = total > 0 ? (entry.league / total) * totalPct : 0;
            const byokPct = total > 0 ? (entry.byok / total) * totalPct : 0;

            return (
              <View key={entry.date} className="flex-1 items-center mx-0.5">
                <AppText className="font-mono text-[9px] text-muted mb-0.5">
                  {formatTokens(total)}
                </AppText>
                <View
                  className="w-[60%] rounded-sm justify-end overflow-hidden"
                  style={{ height: BAR_HEIGHT, backgroundColor: mflColors.inkLight }}
                >
                  {/* Stacked bars: platform → league → byok (bottom to top) */}
                  <View style={{ height: `${Math.max(byokPct, 0)}%`, backgroundColor: KEY_COLORS.byok }} />
                  <View style={{ height: `${Math.max(leaguePct, 0)}%`, backgroundColor: KEY_COLORS.league }} />
                  <View style={{ height: `${Math.max(platformPct, Math.min(totalPct, 4))}%`, backgroundColor: KEY_COLORS.platform }} />
                </View>
                <AppText className="font-medium text-[9px] text-muted mt-1 text-center">
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </AppText>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View className="flex-row justify-center gap-4 mt-3">
          {Object.entries(KEY_COLORS).map(([key, color]) => (
            <View key={key} className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <AppText className="text-[10px] text-muted">
                {key === 'byok' ? 'BYOK' : key === 'platform' ? 'Platform' : 'League'}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </>
  );
}
