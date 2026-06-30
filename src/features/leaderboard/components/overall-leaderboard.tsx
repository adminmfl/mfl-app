import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { LeaderboardDataDTO } from '../types/leaderboard.dto';
import type { PointsTypeFilter } from '../hooks/use-mobile-leaderboard';
import { TeamRankingCard, IndividualRankingCard } from './ranking-cards';
import { LeaderboardStatsBar } from './leaderboard-stats-bar';
import { TiebreakerInfo } from './tiebreaker-info';

export function OverallLeaderboard({
  data,
  showAvgRR,
  pointsType,
}: {
  data: LeaderboardDataDTO;
  showAvgRR: boolean;
  pointsType: PointsTypeFilter;
}) {
  const top20Count = Math.max(1, Math.ceil(data.individuals.length * 0.2));
  const topIndividuals = data.individuals.slice(0, top20Count);

  const nudges = data.teams
    .filter((t) => t.motivational_nudge)
    .map((t) => ({ teamName: t.team_name, nudge: t.motivational_nudge! }));

  return (
    <View className="gap-6">
      {data.normalization?.active ? (
        <View className="rounded-lg bg-default-100 p-3">
          <AppText className="text-xs text-muted">
            Team points are normalized by team size for fair comparison.
          </AppText>
        </View>
      ) : null}

      <View className="gap-3">
        <View className="flex-row flex-wrap gap-3">
          <AppText className="text-xs font-medium text-muted">Activity Points</AppText>
          <AppText className="text-xs text-muted">·</AppText>
          <AppText className="text-xs font-medium text-muted">Challenge Points</AppText>
        </View>
        {data.teams.length === 0 ? (
          <ScreenState
            screen="league-leaderboard"
            state="empty"
            message="No teams found"
          />
        ) : (
          <View className="gap-3">
            {data.teams.map((team) => (
              <TeamRankingCard
                key={team.team_id}
                team={team}
                showAvgRR={showAvgRR}
                pointsType={pointsType}
              />
            ))}
          </View>
        )}
        {showAvgRR ? <TiebreakerInfo /> : null}
      </View>

      {nudges.length > 0 ? (
        <View className="gap-2">
          {nudges.map((item) => (
            <View
              key={item.teamName}
              className="rounded-lg p-3"
              style={{ backgroundColor: mflColors.surface }}
            >
              <AppText className="text-[10px] font-semibold uppercase text-muted mb-1">
                {item.teamName}
              </AppText>
              <AppText className="text-xs text-muted">
                {item.nudge}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      <View className="gap-3">
        <SectionLabel label="Top Performers in League" />
        {topIndividuals.length === 0 ? (
          <View className="rounded-lg bg-default-100 p-4">
            <AppText className="text-sm text-muted text-center">
              No players found
            </AppText>
          </View>
        ) : (
          <View className="gap-3">
            {topIndividuals.map((player) => (
              <IndividualRankingCard
                key={player.user_id}
                player={player}
                showAvgRR={showAvgRR}
                pointsType={pointsType}
              />
            ))}
          </View>
        )}
      </View>

      <LeaderboardStatsBar stats={data.stats} />
    </View>
  );
}
