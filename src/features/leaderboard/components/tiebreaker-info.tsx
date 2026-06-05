import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export function TiebreakerInfo() {
  return (
    <View className="mt-4 flex-row items-start gap-2 px-1">
      <View
        className="h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.inkLight }}
      >
        <Feather name="info" size={10} color={mflColors.textMuted} />
      </View>
      <View className="flex-1">
        <AppText className="text-xs text-muted">
          <AppText className="text-xs font-bold text-foreground">
            Tiebreaker:
          </AppText>
          {' '}Teams with higher Avg Run Rate (RR) rank higher.
        </AppText>
        <AppText className="mt-1 text-[10px] text-muted">
          When points are equal, higher RR rewards consistency and effort intensity.
        </AppText>
      </View>
    </View>
  );
}
