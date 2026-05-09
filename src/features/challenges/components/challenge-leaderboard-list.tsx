import { View } from 'react-native';
import { Avatar, Card, Separator } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import type { ChallengeLeaderboardEntry } from '../types/challenge.model';

interface ChallengeLeaderboardListProps {
  leaderboard: ChallengeLeaderboardEntry[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ChallengeLeaderboardList({
  leaderboard,
  isLoading,
  isError,
  onRetry,
}: ChallengeLeaderboardListProps) {
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

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="empty"
        message="No leaderboard data yet"
      />
    );
  }

  return (
    <Card className="shadow-none border border-separator">
      {leaderboard.map((entry, idx) => (
        <View key={entry.teamId}>
          {idx > 0 && <Separator />}
          <LeaderboardRow entry={entry} />
        </View>
      ))}
    </Card>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function LeaderboardRow({ entry }: { entry: ChallengeLeaderboardEntry }) {
  const isTop = entry.rank <= 3;

  return (
    <View className="flex-row items-center py-2 gap-3 px-3">
      <View
        className="w-8 h-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: isTop ? mflColors.brand : mflColors.ink }}
      >
        <AppText
          className="font-bold"
          style={{ fontSize: 12, color: mflColors.white }}
        >
          #{entry.rank}
        </AppText>
      </View>

      <Avatar size="sm" alt={entry.teamName}>
        <Avatar.Fallback>
          <AppText className="text-xs font-bold">{getInitials(entry.teamName)}</AppText>
        </Avatar.Fallback>
      </Avatar>

      <View className="flex-1 gap-0.5">
        <AppText className="text-base font-semibold text-foreground" numberOfLines={1}>
          {entry.teamName}
        </AppText>
      </View>

      <AppText
        className="font-mono"
        style={{ fontSize: 18, lineHeight: 24, color: mflColors.text }}
      >
        {entry.score}
      </AppText>
    </View>
  );
}
