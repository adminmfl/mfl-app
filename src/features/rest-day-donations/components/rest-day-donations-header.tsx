import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface Props {
  leagueName: string;
  onBack: () => void;
}

export function RestDayDonationsHeader({ leagueName, onBack }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
      </View>

      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Feather name="gift" size={20} color={mflColors.brand} />
          <AppText className="flex-1 text-xl font-bold text-foreground">
            Rest Day Donations
          </AppText>
        </View>
        <AppText className="text-sm text-muted">
          Transfer rest days to help your teammates
        </AppText>
        <AppText className="text-xs text-muted">{leagueName}</AppText>
      </View>
    </View>
  );
}
