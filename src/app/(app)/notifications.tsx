import { View } from 'react-native';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';

export default function NotificationsScreen() {
  return (
    <ScreenScrollView>
      <View className="flex-1 items-center justify-center py-20">
        <AppText className="text-lg font-semibold text-foreground">Notifications</AppText>
        <AppText className="text-sm text-muted mt-2">No notifications yet</AppText>
      </View>
    </ScreenScrollView>
  );
}
