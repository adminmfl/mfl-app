import { Image, View } from 'react-native';
import { Avatar, Card, Chip } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { IndividualRankingDTO, TeamRankingDTO } from '../types/leaderboard.dto';
import {
  capitalizeName,
  formatNumber,
  getInitials,
} from '../utils/leaderboard-format';
import { RankBadge } from './rank-badge';

export function TeamRankingCard({
  team,
  showAvgRR,
}: {
  team: TeamRankingDTO;
  showAvgRR: boolean;
}) {
  return (
    <Card
      className="p-4"
      style={team.rank <= 3 ? { borderWidth: 1, borderColor: mflColors.brandLight } : undefined}
    >
      <View className="flex-row items-center gap-3">
        <RankBadge rank={team.rank} tier={team.rank_tier} band={team.rank_band} />

        <View
          className="h-11 w-11 items-center justify-center rounded-lg"
          style={{ backgroundColor: mflColors.inkLight, overflow: 'hidden' }}
        >
          {team.logo_url ? (
            <Image
              source={{ uri: team.logo_url }}
              className="h-11 w-11"
              resizeMode="cover"
            />
          ) : (
            <AppText className="text-xs font-bold text-muted">
              {getInitials(team.team_name)}
            </AppText>
          )}
        </View>

        <View className="flex-1">
          <AppText className="text-sm font-bold text-foreground" numberOfLines={1}>
            {team.team_name}
          </AppText>
          <View className="mt-1 flex-row flex-wrap gap-2">
            <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.surface }}>
              <Chip.Label style={{ color: mflColors.textSub }}>
                {team.member_count} members
              </Chip.Label>
            </Chip>
            {showAvgRR ? (
              <Chip size="sm" variant="soft" style={{ backgroundColor: '#FEF9C3' }}>
                <Chip.Label style={{ color: '#A16207' }}>
                  RR {team.avg_rr.toFixed(2)}
                </Chip.Label>
              </Chip>
            ) : null}
          </View>
        </View>

        <View className="items-end">
          <AppText className="text-lg font-bold" style={{ color: mflColors.brand }}>
            {formatNumber(team.total_points)}
          </AppText>
          <AppText className="text-[10px] text-muted">points</AppText>
        </View>
      </View>

      {team.normalized_points !== undefined ? (
        <AppText className="mt-2 text-xs text-muted">
          Activity points normalized by team size: {formatNumber(team.normalized_points)}
        </AppText>
      ) : null}
    </Card>
  );
}

export function IndividualRankingCard({
  player,
  showAvgRR,
}: {
  player: IndividualRankingDTO;
  showAvgRR: boolean;
}) {
  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-3">
        <RankBadge rank={player.rank} tier={player.rank_tier} band={player.rank_band} />

        <Avatar size="sm" alt={player.username}>
          {player.profile_picture_url ? (
            <Avatar.Image source={{ uri: player.profile_picture_url }} />
          ) : null}
          <Avatar.Fallback>
            <AppText className="text-xs font-semibold text-foreground">
              {getInitials(player.username)}
            </AppText>
          </Avatar.Fallback>
        </Avatar>

        <View className="flex-1">
          <AppText className="text-sm font-bold text-foreground" numberOfLines={1}>
            {capitalizeName(player.username)}
          </AppText>
          {player.team_name ? (
            <AppText className="text-xs text-muted mt-0.5" numberOfLines={1}>
              {player.team_name}
            </AppText>
          ) : null}
          <View className="mt-1 flex-row flex-wrap gap-2">
            <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.surface }}>
              <Chip.Label style={{ color: mflColors.textSub }}>
                {player.submission_count} submissions
              </Chip.Label>
            </Chip>
            {showAvgRR ? (
              <Chip size="sm" variant="soft" style={{ backgroundColor: '#FEF9C3' }}>
                <Chip.Label style={{ color: '#A16207' }}>
                  RR {player.avg_rr.toFixed(2)}
                </Chip.Label>
              </Chip>
            ) : null}
          </View>
        </View>

        <View className="items-end">
          <AppText className="text-lg font-bold" style={{ color: mflColors.brand }}>
            {formatNumber(player.points)}
          </AppText>
          <AppText className="text-[10px] text-muted">points</AppText>
        </View>
      </View>
    </Card>
  );
}
