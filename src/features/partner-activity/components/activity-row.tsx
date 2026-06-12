import { View } from 'react-native';
import { Chip } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { PartnerActivity } from '../types/partner-activity.model';
import { formatActivityDate } from '../utils/format-activity-date';

interface ActivityRowProps {
  activity: PartnerActivity;
}

export function ActivityRow({ activity }: ActivityRowProps) {
  const rrColor = activity.rrValue >= 1.5 ? mflColors.brand : mflColors.textMuted;

  return (
    <View className="flex-row items-center py-3 border-b border-default gap-3">
      <View className="w-14">
        <AppText className="text-xs text-muted">{formatActivityDate(activity.date)}</AppText>
      </View>

      <View className="flex-1 min-w-0">
        <AppText className="text-sm font-medium" numberOfLines={1}>
          {activity.playerName}
        </AppText>
        <AppText className="text-xs text-muted capitalize" numberOfLines={1}>
          {activity.workoutType || activity.type || 'Activity'}
        </AppText>
      </View>

      <Chip size="sm" variant="tertiary">
        <Chip.Label>{activity.teamName}</Chip.Label>
      </Chip>

      <View className="w-12 items-end">
        <AppText className="text-sm font-semibold" style={{ color: rrColor }}>
          {activity.rrValue?.toFixed(2) ?? '--'}
        </AppText>
      </View>
    </View>
  );
}
