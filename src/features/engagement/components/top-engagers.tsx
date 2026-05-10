import { View, ScrollView } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { TopEngager } from '../types/engagement.model';

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#92400E'];

interface TopEngagersProps {
  engagers: TopEngager[];
}

export function TopEngagers({ engagers }: TopEngagersProps) {
  if (engagers.length === 0) return null;

  return (
    <View>
      <View className="flex-row items-center mb-2">
        <View style={{ width: 4, height: 14, backgroundColor: '#A855F7', borderRadius: 2, marginRight: 8 }} />
        <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Top Engagers — 30 Days
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {engagers.map((engager, index) => (
          <Card
            key={engager.userId}
            className="p-3 mr-3 items-center"
            style={[
              { minWidth: 100 },
              index < 3 && { borderTopWidth: 2, borderTopColor: RANK_COLORS[index] },
            ]}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: mflColors.inkLight }}
            >
              <AppText className="text-xs font-bold text-foreground">
                {engager.username.slice(0, 2).toUpperCase()}
              </AppText>
            </View>
            <AppText className="text-xs font-medium text-foreground text-center" numberOfLines={1}>
              {engager.username}
            </AppText>
            <View className="rounded-full px-2 py-0.5 mt-1" style={{ backgroundColor: mflColors.brandLight }}>
              <AppText className="text-[10px] font-medium" style={{ color: mflColors.brand }}>
                {engager.eventCount} events
              </AppText>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
