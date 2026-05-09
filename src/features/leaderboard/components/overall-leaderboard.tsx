import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import type { LeaderboardDataDTO } from '../types/leaderboard.dto';
import { TeamRankingCard, IndividualRankingCard } from './ranking-cards';
import { LeaderboardStatsBar } from './leaderboard-stats-bar';

export function OverallLeaderboard({
  data,
  showAvgRR,
}: {
  data: LeaderboardDataDTO;
  showAvgRR: boolean;
}) {
  const top20Count = Math.max(1, Math.ceil(data.individuals.length * 0.2));
  const topIndividuals = data.individuals.slice(0, top20Count);

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
        <View>
          <SectionLabel label="League Standings" />
          <AppText className="mt-1 text-xs text-muted">
            Combined activity and challenge points
          </AppText>
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
              />
            ))}
          </View>
        )}
      </View>

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
              />
            ))}
          </View>
        )}
      </View>

      <LeaderboardStatsBar stats={data.stats} />
    </View>
  );
}
