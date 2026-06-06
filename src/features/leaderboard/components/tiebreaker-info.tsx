import Feather from '@expo/vector-icons/Feather';
import { Alert, Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export function TiebreakerInfo() {
  const handlePress = () => {
    Alert.alert(
      'Tiebreaker',
      'Teams with higher Avg Run Rate (RR) rank higher when points are equal.',
    );
  };

  return (
    <View className="mt-4 flex-row items-start gap-2 px-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show tiebreaker rule"
        hitSlop={10}
        onPress={handlePress}
        className="h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.inkLight }}
      >
        <Feather name="info" size={10} color={mflColors.textMuted} />
      </Pressable>
      <View className="flex-1">
        <AppText className="text-xs text-muted">
          <AppText className="text-xs font-bold text-foreground">
            Tiebreaker
          </AppText>
        </AppText>
      </View>
    </View>
  );
}
