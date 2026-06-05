import { View } from 'react-native';
import { Card, Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { CaptainAtRiskPlayer } from '../types/captain-engagement.model';

interface CaptainAtRiskFeedProps {
  players: CaptainAtRiskPlayer[];
  isLoading: boolean;
  error: string | null;
}

export function CaptainAtRiskFeed({ players, isLoading, error }: CaptainAtRiskFeedProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center gap-2 py-6">
        <Spinner size="sm" />
        <AppText className="text-xs text-muted">Loading at-risk players...</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <View className="flex-row items-center gap-2">
          <Feather name="alert-triangle" size={14} color={mflColors.danger} />
          <AppText className="text-xs" style={{ color: mflColors.danger }}>{error}</AppText>
        </View>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="p-4">
        <View className="flex-row items-center gap-2">
          <Feather name="trending-down" size={14} color={mflColors.textMuted} />
          <AppText className="text-xs text-muted">No at-risk players right now.</AppText>
        </View>
      </Card>
    );
  }

  return (
    <View>
      {players.map((player) => (
        <Card key={player.userId} className="p-3 mb-2">
          <View className="flex-row items-start justify-between mb-1">
            <AppText className="text-sm font-semibold text-foreground">{player.username}</AppText>
            <View
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: player.reason === 'inactive_48h' ? mflColors.dangerLight : mflColors.inkLight,
              }}
            >
              <AppText
                className="text-[10px] font-bold"
                style={{
                  color: player.reason === 'inactive_48h' ? mflColors.danger : mflColors.textSub,
                }}
              >
                {player.reason === 'inactive_48h' ? 'Inactive 48h' : 'Below Avg'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Feather name="alert-circle" size={12} color={mflColors.amber} />
            <AppText className="text-xs text-foreground">
              Last active: {player.lastSubmissionAt || 'Never'}
            </AppText>
          </View>
          <AppText className="text-[11px] text-muted mt-0.5">
            Player activity: {Math.round(player.playerActivity)} · Team average: {Math.round(player.teamAverage)}
          </AppText>
        </Card>
      ))}
    </View>
  );
}
