import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface CustomActivitiesHeaderProps {
  leagueName: string;
  activityCount: number;
  onBack: () => void;
}

export function CustomActivitiesHeader({
  leagueName,
  activityCount,
  onBack,
}: CustomActivitiesHeaderProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center py-1">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <AppText className="flex-1 text-center text-xl font-bold text-foreground">
          Custom Activities
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <View className="gap-1">
        <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {leagueName}
        </AppText>
        <AppText className="text-xs text-muted">
          {activityCount} {activityCount === 1 ? 'activity' : 'activities'} in your custom
          library
        </AppText>
      </View>
    </View>
  );
}
