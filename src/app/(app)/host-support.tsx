import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { AppText } from '../../components/app-text';
import { mflColors } from '../../constants/colors';
import { HostSupportContent } from '../../features/help';

export default function HostSupportScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Feather name="award" size={20} color={mflColors.brand} />
            <AppText className="text-lg font-bold text-foreground">Host Support</AppText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <AppText className="text-sm text-muted mb-4">League Kickoff Checklist</AppText>

        <HostSupportContent />
      </ScreenScrollView>
    </View>
  );
}
