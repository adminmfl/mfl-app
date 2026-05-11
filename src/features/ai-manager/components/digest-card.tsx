import { View, Pressable } from 'react-native';
import { Card } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { priorityColor, categoryLabel } from '../utils/colors';
import type { DigestItem } from '../types/ai-manager.model';

interface DigestCardProps {
  item: DigestItem;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function DigestCard({ item, onMarkRead, onDismiss }: DigestCardProps) {
  const pColor = priorityColor(item.priority);
  const isUnread = item.status === 'unread';
  const isGap = item.category === 'competition_gap';

  return (
    <Card
      className="p-4 mb-3"
      style={isUnread ? { borderLeftWidth: 3, borderLeftColor: mflColors.brand } : { opacity: 0.75 }}
    >
      {/* Header row */}
      <View className="flex-row items-center flex-wrap mb-2" style={{ gap: 6 }}>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: pColor.bg }}>
          <AppText className="text-[10px] font-bold" style={{ color: pColor.text }}>
            P{item.priority}
          </AppText>
        </View>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
          <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
            {categoryLabel(item.category)}
          </AppText>
        </View>

        {/* Actions */}
        <View className="flex-row ml-auto" style={{ gap: 4 }}>
          {isUnread && (
            <Pressable onPress={() => onMarkRead(item.id)} className="p-1">
              <Feather name="eye" size={16} color={mflColors.textMuted} />
            </Pressable>
          )}
          <Pressable onPress={() => onDismiss(item.id)} className="p-1">
            <Feather name="eye-off" size={16} color={mflColors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Title & Body */}
      <AppText className="text-sm font-semibold text-foreground mb-1">{item.title}</AppText>
      <AppText className="text-xs text-muted">{item.body}</AppText>

      {/* Competition gap metadata */}
      {isGap && item.metadata && (
        <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
            <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
              Gap: {item.metadata.gapPct}%
            </AppText>
          </View>
          {item.metadata.topTeamName && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
              <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
                Leader: {item.metadata.topTeamName}
              </AppText>
            </View>
          )}
          {item.metadata.bottomTeamName && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
              <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
                Trailing: {item.metadata.bottomTeamName}
              </AppText>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
