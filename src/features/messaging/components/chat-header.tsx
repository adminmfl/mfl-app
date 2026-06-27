import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface ChatHeaderProps {
  channelName: string;
  unreadCount: number;
}

export function ChatHeader({ channelName, unreadCount }: ChatHeaderProps) {
  return (
    <View
      className="border-b bg-card px-5 py-3"
      style={{ borderBottomColor: mflColors.border }}
    >
      <View className="flex-row items-center gap-2">
        <Feather name="message-circle" size={20} color={mflColors.brand} />
        <View className="flex-1">
          <AppText className="text-lg font-semibold text-foreground">Team Chat</AppText>
          <AppText className="text-xs text-muted" numberOfLines={1}>
            {channelName}
          </AppText>
        </View>
        {unreadCount > 0 ? (
          <View
            className="min-w-6 items-center justify-center rounded-full px-2 py-1"
            style={{ backgroundColor: mflColors.danger }}
          >
            <AppText className="text-xs font-bold" style={{ color: mflColors.white }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}
