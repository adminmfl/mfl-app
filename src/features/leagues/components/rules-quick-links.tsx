import Feather from '@expo/vector-icons/Feather';
import { View, Pressable } from 'react-native';
import { Card } from 'heroui-native';
import { useRouter } from 'expo-router';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface Props {
  showActivities?: boolean;
}

export function RulesQuickLinks({ showActivities = true }: Props) {
  const router = useRouter();

  return (
    <View className="gap-3">
      {showActivities ? (
        <Pressable onPress={() => router.push('/(app)/custom-activities' as any)}>
          <Card className="p-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center"
                style={{ backgroundColor: '#d1fae5' }}
              >
                <Feather name="activity" size={20} color="#059669" />
              </View>
              <View className="flex-1">
                <AppText className="text-sm font-semibold text-foreground">
                  View Allowed Activities
                </AppText>
                <AppText className="text-xs text-muted">
                  See which activities count
                </AppText>
              </View>
              <Feather name="arrow-right" size={16} color={mflColors.textMuted} />
            </View>
          </Card>
        </Pressable>
      ) : null}

      <Pressable onPress={() => router.push('/(app)/mfl-rules' as any)}>
        <Card className="p-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-lg items-center justify-center"
              style={{ backgroundColor: mflColors.brandLight }}
            >
              <Feather name="info" size={20} color={mflColors.brand} />
            </View>
            <View className="flex-1">
              <AppText className="text-sm font-semibold text-foreground">MFL Rules</AppText>
              <AppText className="text-xs text-muted">Platform-wide rules and guidelines</AppText>
            </View>
            <Feather name="arrow-right" size={16} color={mflColors.textMuted} />
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
