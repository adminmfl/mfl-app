import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { LeaderboardStatsDTO } from '../types/leaderboard.dto';
import { formatNumber } from '../utils/leaderboard-format';

export function LeaderboardStatsBar({ stats }: { stats: LeaderboardStatsDTO }) {
  const approvalRate =
    stats.total_submissions > 0
      ? Math.round((stats.approved / stats.total_submissions) * 100)
      : 0;
  const rejected = stats.total_submissions - stats.approved - stats.pending;

  return (
    <View className="gap-3">
      <AppText className="text-xs font-semibold uppercase tracking-wider text-muted text-center">
        Your Activity Submissions
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        <Stat label="Submissions" value={formatNumber(stats.total_submissions)} />
        <Stat
          label="Approved"
          value={`${formatNumber(stats.approved)} (${approvalRate}%)`}
          color={mflColors.brand}
        />
        <Stat label="Pending" value={formatNumber(stats.pending)} color={mflColors.amber} />
        <Stat label="Rejected" value={formatNumber(rejected)} color={mflColors.danger} />
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  color = mflColors.text,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="flex-1 min-w-[145px] p-3">
      <AppText className="text-[11px] font-semibold uppercase text-muted">
        {label}
      </AppText>
      <AppText className="mt-1 text-base font-bold" style={{ color }}>
        {value}
      </AppText>
    </Card>
  );
}
