import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { PendingWorkout } from '../types/wearable.model';

interface PendingConfirmationCardProps {
  workout: PendingWorkout;
  isConfirming: boolean;
  isRejecting: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function PendingConfirmationCard({
  workout,
  isConfirming,
  isRejecting,
  onConfirm,
  onReject,
}: PendingConfirmationCardProps) {
  const disabled = isConfirming || isRejecting;

  return (
    <View className="rounded-2xl bg-content1 p-4">
      <View className="flex-row items-start gap-3 mb-3">
        <View
          className="w-9 h-9 rounded-lg items-center justify-center mt-0.5"
          style={{ backgroundColor: `${mflColors.brand}15` }}
        >
          <Feather name="activity" size={18} color={mflColors.brand} />
        </View>
        <View className="flex-1">
          <AppText className="text-sm font-semibold text-foreground">
            {workout.activityType}
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">
            {formatDate(workout.startedAt)}
          </AppText>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mb-3">
        <StatPill icon="clock" label={formatDuration(workout.durationSeconds)} />
        {workout.distanceMeters != null && (
          <StatPill icon="map-pin" label={formatDistance(workout.distanceMeters)} />
        )}
        {workout.steps != null && (
          <StatPill icon="trending-up" label={`${workout.steps.toLocaleString()} steps`} />
        )}
        {workout.calories != null && (
          <StatPill icon="zap" label={`${Math.round(workout.calories)} cal`} />
        )}
      </View>

      {workout.sourceApp && (
        <AppText className="text-[11px] text-muted mb-3">
          Source: {workout.sourceApp}
          {workout.sourceDevice ? ` / ${workout.sourceDevice}` : ''}
        </AppText>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={onConfirm}
          disabled={disabled}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5"
          style={{
            backgroundColor: disabled ? mflColors.border : mflColors.brand,
          }}
        >
          <Feather name="check" size={16} color="#fff" />
          <AppText className="text-sm font-semibold" style={{ color: '#fff' }}>
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </AppText>
        </Pressable>

        <Pressable
          onPress={onReject}
          disabled={disabled}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5"
          style={{
            backgroundColor: disabled ? mflColors.border : `${mflColors.danger}15`,
          }}
        >
          <Feather name="x" size={16} color={disabled ? mflColors.textMuted : mflColors.danger} />
          <AppText
            className="text-sm font-semibold"
            style={{ color: disabled ? mflColors.textMuted : mflColors.danger }}
          >
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function StatPill({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Feather name={icon} size={12} color={mflColors.textMuted} />
      <AppText className="text-xs text-default-600">{label}</AppText>
    </View>
  );
}
