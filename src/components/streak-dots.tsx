import { View } from 'react-native';
import { AppText } from './app-text';
import { mflColors } from '../constants/colors';

interface StreakDotsProps {
  days: boolean[];
}

export function StreakDots({ days }: StreakDotsProps) {
  return (
    <View className="flex-row items-center justify-between gap-1">
      {days.map((active, i) => (
        <View
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: active ? mflColors.brand : mflColors.inkLight }}
        />
      ))}
      <AppText className="text-[9px] text-muted ml-1">NOW</AppText>
    </View>
  );
}
