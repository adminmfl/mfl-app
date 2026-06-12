import { View } from 'react-native';
import { StatCard } from '../../../components/stat-card';
import { mflColors } from '../../../constants/colors';
import type { TeamViewStats as TeamViewStatsType } from '../types/team.model';

interface TeamViewStatsProps {
  stats: TeamViewStatsType;
  memberCount: number;
  showRR: boolean;
  showRestDays: boolean;
}

export function TeamViewStats({
  stats,
  memberCount,
  showRR,
  showRestDays,
}: TeamViewStatsProps) {
  return (
    <View className="gap-2">
      {/* Primary stats row */}
      <View className="flex-row gap-2">
        <StatCard value={stats.teamRank} label="Team Rank" color={mflColors.amber} />
        <StatCard value={String(memberCount)} label="Members" color={mflColors.ink} />
        <StatCard value={String(stats.teamPoints)} label="Team Points" color={mflColors.brand} />
      </View>

      {/* Secondary stats row */}
      <View className="flex-row gap-2">
        {showRR && (
          <StatCard
            value={stats.teamAvgRR.toFixed(1)}
            label="RR"
            color={mflColors.blue}
          />
        )}
        <StatCard
          value={
            typeof stats.activityPoints === 'number'
              ? stats.activityPoints.toLocaleString()
              : '\u2014'
          }
          label="Activity Points"
          color={mflColors.brand}
        />
        <StatCard
          value={
            typeof stats.challengePoints === 'number'
              ? stats.challengePoints.toLocaleString()
              : '\u2014'
          }
          label="Challenge Points"
          color={mflColors.blue}
        />
      </View>

      {/* Rest day stats row (conditional) */}
      {showRestDays && (
        <View className="flex-row gap-2">
          <StatCard
            value={
              typeof stats.restUsed === 'number'
                ? stats.restUsed.toLocaleString()
                : '\u2014'
            }
            label="Rest Days Used"
            color={mflColors.textSub}
          />
          <StatCard
            value={
              typeof stats.missedDays === 'number'
                ? stats.missedDays.toLocaleString()
                : '\u2014'
            }
            label="Avg Days Missed"
            color={mflColors.danger}
          />
        </View>
      )}
    </View>
  );
}
