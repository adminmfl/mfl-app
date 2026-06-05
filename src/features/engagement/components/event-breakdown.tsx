import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { EventBreakdownItem } from '../types/engagement.model';

const EVENT_COLORS: Record<string, string> = {
  activity_log: '#22C55E',
  chat_message: '#3B82F6',
  login: '#F59E0B',
  challenge_participation: '#A855F7',
  ai_coach_interaction: '#14B8A6',
  rest_day: '#94A3B8',
  leaderboard_view: '#F97316',
  profile_view: '#EC4899',
};

interface EventBreakdownProps {
  items: EventBreakdownItem[];
}

export function EventBreakdown({ items }: EventBreakdownProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <Card className="p-4 flex-1">
      <View className="flex-row items-center mb-3">
        <View style={{ width: 4, height: 14, backgroundColor: '#3B82F6', borderRadius: 2, marginRight: 8 }} />
        <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Events — 30 Days
        </AppText>
      </View>
      {items.length === 0 ? (
        <AppText className="text-xs text-muted">No events recorded yet.</AppText>
      ) : (
        items.map((item) => (
          <View key={item.type} className="mb-2">
            <View className="flex-row items-center justify-between mb-1">
              <AppText className="text-xs text-foreground capitalize">
                {item.type.replace(/_/g, ' ')}
              </AppText>
              <AppText className="text-xs text-muted font-medium">{item.count}</AppText>
            </View>
            <View className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: mflColors.inkLight }}>
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: EVENT_COLORS[item.type] ?? '#94A3B8',
                }}
              />
            </View>
          </View>
        ))
      )}
    </Card>
  );
}
