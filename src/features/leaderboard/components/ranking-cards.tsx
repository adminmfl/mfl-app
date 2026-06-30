import { Image, View } from 'react-native';
import { Avatar, Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { IndividualRankingDTO, TeamRankingDTO } from '../types/leaderboard.dto';
import {
  capitalizeName,
  formatNumber,
  getInitials,
} from '../utils/leaderboard-format';
import { RankBadge } from './rank-badge';

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash ^= hash >>> 16;
  }
  const h = ((Math.abs(hash) * 2654435761) >>> 0) % 360;
  return `hsl(${h}, 55%, 82%)`;
}

export function TeamRankingCard({
  team,
  showAvgRR,
}: {
  team: TeamRankingDTO;
  showAvgRR: boolean;
}) {
  return (
    <Card
      className="py-2 px-3"
      style={team.rank <= 3 ? { borderWidth: 1, borderColor: mflColors.brandLight } : undefined}
    >
      <View className="flex-row items-center justify-between gap-2">
        {/* Left: Rank, Logo, Team Name */}
        <View className="flex-row items-center gap-2 flex-1" style={{ minWidth: 0 }}>
          <RankBadge rank={team.rank} tier={team.rank_tier} band={team.rank_band} />

          <View
            className="h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: stringToColor(team.team_name), overflow: 'hidden' }}
          >
            {team.logo_url ? (
              <Image
                source={{ uri: team.logo_url }}
                className="h-8 w-8"
                resizeMode="cover"
              />
            ) : (
              <AppText className="text-[10px] font-bold" style={{ color: mflColors.ink }}>
                {getInitials(team.team_name)}
              </AppText>
            )}
          </View>

          <View className="flex-1">
            <AppText className="text-sm font-bold text-foreground" numberOfLines={1}>
              {team.team_name}
            </AppText>
            <AppText className="text-[10px] text-muted mt-0.5">
              {team.member_count} members
            </AppText>
          </View>
        </View>

        {/* Right: Points, Logs, RR */}
        <View className="items-end" style={{ flexShrink: 0 }}>
          <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
            {formatNumber(team.total_points)} pts
          </AppText>
          <View className="flex-row items-center gap-1 mt-0.5">
            <AppText className="text-[10px] text-muted" numberOfLines={1}>
              {team.submission_count} logs
            </AppText>
            {showAvgRR && (
              <>
                <AppText className="text-[10px] text-muted">·</AppText>
                <AppText className="text-[9px] font-semibold" style={{ color: mflColors.amber }} numberOfLines={1}>
                  RR {team.avg_rr.toFixed(2)}
                </AppText>
              </>
            )}
          </View>
        </View>
      </View>

      <View className="mt-2 flex-row flex-wrap gap-3">
        <AppText className="text-xs text-muted">
          Activity Points: {formatNumber(team.points)}
        </AppText>
        <AppText className="text-xs text-muted">
          Challenge Points: {formatNumber(team.challenge_bonus + (team.individual_challenge_points ?? 0))}
        </AppText>
      </View>

      {team.normalized_points !== undefined ? (
        <AppText className="mt-1.5 text-[10px] text-muted" style={{ borderTopWidth: 0.5, borderTopColor: mflColors.border, paddingTop: 4 }}>
          Normalized activity points: {formatNumber(team.normalized_points)}
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
    <Card className="py-2 px-2.5">
      <View className="flex-row items-center justify-between gap-2">
        {/* Left: Rank, Avatar, Player Name */}
        <View className="flex-row items-center gap-2 flex-1" style={{ minWidth: 0 }}>
          <RankBadge rank={player.rank} tier={player.rank_tier} band={player.rank_band} />

          <Avatar size="sm" alt={player.username} style={{ width: 32, height: 32 }}>
            {player.profile_picture_url ? (
              <Avatar.Image source={{ uri: player.profile_picture_url }} />
            ) : null}
            <Avatar.Fallback>
              <AppText className="text-[10px] font-semibold text-foreground">
                {getInitials(player.username)}
              </AppText>
            </Avatar.Fallback>
          </Avatar>

          <View className="flex-1">
            <AppText className="text-sm font-bold text-foreground" numberOfLines={1}>
              {capitalizeName(player.username)}
            </AppText>
            {player.team_name ? (
              <AppText className="text-[10px] text-muted mt-0.5" numberOfLines={1}>
                {player.team_name}
              </AppText>
            ) : null}
          </View>
        </View>

        {/* Right: Points, Logs, RR */}
        <View className="items-end" style={{ flexShrink: 0 }}>
          <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
            {formatNumber(player.points)} pts
          </AppText>
          <View className="flex-row items-center gap-1 mt-0.5">
            <AppText className="text-[10px] text-muted" numberOfLines={1}>
              {player.submission_count} logs
            </AppText>
            {showAvgRR && (
              <>
                <AppText className="text-[10px] text-muted">·</AppText>
                <AppText className="text-[9px] font-semibold" style={{ color: mflColors.amber }} numberOfLines={1}>
                  RR {player.avg_rr.toFixed(2)}
                </AppText>
              </>
            )}
          </View>
        </View>
      </View>

      <View className="mt-2 flex-row flex-wrap gap-3">
        <AppText className="text-xs text-muted">
          Activity Points: {formatNumber(player.points)}
        </AppText>
        {(player.challenge_points ?? 0) > 0 && (
          <AppText className="text-xs text-muted">
            Challenge Points: {formatNumber(player.challenge_points ?? 0)}
          </AppText>
        )}
      </View>
    </Card>
  );
}
