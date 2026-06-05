import { View } from 'react-native';
import { Card } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { AppNotification } from '../types/notification.types';
import { formatTimeAgo } from '../utils/format-time';

export function NotificationCard({
  notification,
}: {
  notification: AppNotification;
}) {
  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-start gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mt-0.5"
          style={{ backgroundColor: notification.iconBg }}
        >
          <Feather
            name={notification.icon}
            size={18}
            color={notification.iconColor}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <AppText
              className={`text-sm font-semibold ${
                notification.isRead ? 'text-muted' : 'text-foreground'
              }`}
            >
              {notification.title}
            </AppText>
            {!notification.isRead && (
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: mflColors.brand }}
              />
            )}
          </View>
          <AppText
            className={`text-sm ${
              notification.isRead ? 'text-muted' : 'text-foreground'
            }`}
          >
            {notification.message}
          </AppText>
          <AppText className="text-[10px] text-muted mt-1.5">
            {formatTimeAgo(notification.timestamp)}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
