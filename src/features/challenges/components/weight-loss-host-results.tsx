import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import type { WeightLogHostParticipant } from '../types/challenge.model';

interface WeightLossHostResultsProps {
  participants: WeightLogHostParticipant[];
}

export function WeightLossHostResults({ participants }: WeightLossHostResultsProps) {
  if (participants.length === 0) {
    return (
      <View className="p-4 items-center justify-center border border-border rounded-xl bg-card">
        <AppText className="text-sm text-muted">No participants have logged weights yet.</AppText>
      </View>
    );
  }

  return (
    <View className="border border-border rounded-xl overflow-hidden bg-card">
      <View className="flex-row p-3 border-b border-border bg-card-secondary">
        <AppText className="flex-1 text-xs font-bold text-muted uppercase">Player</AppText>
        <AppText className="w-16 text-xs font-bold text-muted uppercase text-center">Start</AppText>
        <AppText className="w-16 text-xs font-bold text-muted uppercase text-center">End</AppText>
        <AppText className="w-16 text-xs font-bold text-muted uppercase text-center">% Loss</AppText>
        <AppText className="w-12 text-xs font-bold text-muted uppercase text-right">Pts</AppText>
      </View>
      {participants.map((p, i) => (
        <View
          key={p.leagueMemberId}
          className={`flex-row p-3 items-center ${
            i < participants.length - 1 ? 'border-b border-border' : ''
          }`}
        >
          <AppText className="flex-1 text-sm font-semibold text-foreground" numberOfLines={1}>
            {p.username}
          </AppText>
          <AppText className="w-16 text-sm text-muted text-center">
            {p.startWeight ? p.startWeight.toFixed(1) : '-'}
          </AppText>
          <AppText className="w-16 text-sm text-muted text-center">
            {p.endWeight ? p.endWeight.toFixed(1) : '-'}
          </AppText>
          <AppText className="w-16 text-sm text-foreground text-center font-medium">
            {p.percentLost !== null ? `${p.percentLost.toFixed(1)}%` : '-'}
          </AppText>
          <AppText className="w-12 text-sm font-bold text-brand text-right">
            {p.points !== null ? p.points : '-'}
          </AppText>
        </View>
      ))}
    </View>
  );
}
