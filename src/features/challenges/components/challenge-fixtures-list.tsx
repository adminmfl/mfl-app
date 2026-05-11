import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Chip } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import type { TournamentMatch, TournamentMatchStatus } from '../types/challenge.model';
import { formatChallengeDate } from '../utils/challenge-config-utils';

interface ChallengeFixturesListProps {
  matches: TournamentMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ChallengeFixturesList({
  matches,
  isLoading,
  isError,
  onRetry,
}: ChallengeFixturesListProps) {
  if (isLoading) {
    return <ScreenState screen="challenge-detail" state="loading" />;
  }

  if (isError) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="error"
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="empty"
        message="No matches scheduled yet"
      />
    );
  }

  const grouped = groupMatches(matches);

  return (
    <View className="gap-4">
      {grouped.map(([roundName, roundMatches]) => (
        <View key={roundName} className="gap-2">
          <AppText className="text-sm font-bold text-foreground">{roundName}</AppText>
          {roundMatches.map((match) => (
            <MatchCard key={match.matchId} match={match} />
          ))}
        </View>
      ))}
    </View>
  );
}

function getMatchStatusTag(status: TournamentMatchStatus) {
  switch (status) {
    case 'live':
      return { label: 'LIVE', color: mflColors.danger, bgColor: mflColors.dangerLight };
    case 'completed':
      return { label: 'Finished', color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'cancelled':
      return { label: 'Cancelled', color: mflColors.textMuted, bgColor: mflColors.inkLight };
    case 'scheduled':
    default:
      return { label: 'Scheduled', color: mflColors.blue, bgColor: mflColors.blueLight };
  }
}

function MatchCard({ match }: { match: TournamentMatch }) {
  const tag = getMatchStatusTag(match.status);

  return (
    <View className="rounded-xl border border-default-200 overflow-hidden">
      <View className="flex-row items-center justify-between bg-default-100 px-3 py-2">
        <AppText className="text-xs text-muted">
          {formatChallengeDate(match.startTime)}
        </AppText>
        <Chip size="sm" variant="soft" style={{ backgroundColor: tag.bgColor }}>
          <Chip.Label style={{ color: tag.color }}>{tag.label}</Chip.Label>
        </Chip>
      </View>
      <View className="flex-row items-center p-4 gap-3">
        <TeamMatchSide name={match.team1Name || 'TBD'} />
        <View className="items-center px-2">
          <AppText className="text-xl font-bold text-foreground">
            {match.status === 'scheduled' ? 'vs' : `${match.score1} - ${match.score2}`}
          </AppText>
        </View>
        <TeamMatchSide name={match.team2Name || 'TBD'} />
      </View>
    </View>
  );
}

function TeamMatchSide({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center gap-2">
      <View className="w-10 h-10 rounded-full bg-default-100 items-center justify-center">
        <Feather name="shield" size={18} color={mflColors.brand} />
      </View>
      <AppText className="text-sm font-semibold text-foreground text-center" numberOfLines={2}>
        {name}
      </AppText>
    </View>
  );
}

function groupMatches(matches: TournamentMatch[]): [string, TournamentMatch[]][] {
  const grouped = new Map<string, TournamentMatch[]>();
  matches.forEach((match) => {
    const roundName = match.roundName || `Round ${match.roundNumber}`;
    grouped.set(roundName, [...(grouped.get(roundName) ?? []), match]);
  });
  return Array.from(grouped.entries());
}
