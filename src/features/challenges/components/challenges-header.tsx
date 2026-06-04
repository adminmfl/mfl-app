import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface ChallengesHeaderProps {
  approvedCount: number;
  totalCount: number;
  isLoading: boolean;
}

export function ChallengesHeader({ approvedCount, totalCount, isLoading }: ChallengesHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View className="flex-row justify-between items-start">
        <AppText className="text-2xl font-bold text-foreground">
          Challenges
        </AppText>
        <View className="items-end">
          <AppText
            className="text-2xl font-semibold text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {isLoading ? '\u2014/\u2014' : `${approvedCount}/${totalCount}`}
          </AppText>
          <AppText className="text-xs" style={{ color: mflColors.textMuted }}>
            Challenges you participated in
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}
