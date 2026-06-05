import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { NormalizedActivityDTO } from '../types/wearable.dto';

interface SyncedWorkoutRowProps {
  activity: NormalizedActivityDTO;
}

export function SyncedWorkoutRow({ activity }: SyncedWorkoutRowProps) {
  const mins = Math.round(activity.duration_seconds / 60);

  return (
    <View className="flex-row items-center gap-3 py-2 border-b border-default-100">
      <Feather name="check-circle" size={16} color={mflColors.brand} />
      <View className="flex-1">
        <AppText className="text-sm text-foreground">{activity.activity_type}</AppText>
        <AppText className="text-xs text-muted">
          {mins}m{activity.calories != null ? ` · ${Math.round(activity.calories)} cal` : ''}
        </AppText>
      </View>
    </View>
  );
}
