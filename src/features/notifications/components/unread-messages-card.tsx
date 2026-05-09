import { View } from 'react-native';
import { Card, Chip } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export function UnreadMessagesCard({
  leagueName,
  count,
}: {
  leagueName: string;
  count: number;
}) {
  if (count === 0) return null;

  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-center gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: mflColors.accentLight }}
        >
          <Feather name="message-circle" size={18} color={mflColors.accent} />
        </View>
        <View className="flex-1">
          <AppText className="text-sm font-semibold text-foreground">
            {leagueName}
          </AppText>
          <AppText className="text-sm text-muted">
            {count} unread {count === 1 ? 'message' : 'messages'}
          </AppText>
        </View>
        <Chip
          size="sm"
          variant="soft"
          style={{ backgroundColor: mflColors.accentLight }}
        >
          <Chip.Label style={{ color: mflColors.accent }}>{count}</Chip.Label>
        </Chip>
      </View>
    </Card>
  );
}
