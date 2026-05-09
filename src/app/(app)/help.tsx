import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { AppText } from '../../components/app-text';
import { mflColors } from '../../constants/colors';
import { FaqSection, QuickLinks, ContactSupport } from '../../features/help';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView avoidKeyboard>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Feather name="help-circle" size={20} color={mflColors.brand} />
            <AppText className="text-lg font-bold text-foreground">Help & Support</AppText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Quick Links */}
        <QuickLinks />

        {/* FAQ */}
        <FaqSection />

        {/* Contact */}
        <ContactSupport />

        {/* Version */}
        <View className="items-center mt-8">
          <AppText className="text-sm text-muted">My Fit League v3.0.0</AppText>
        </View>
      </ScreenScrollView>
    </View>
  );
}
