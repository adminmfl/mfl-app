import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { AtRiskPlayer } from '../types/engagement.model';

interface AtRiskListProps {
  players: AtRiskPlayer[];
}

export function AtRiskList({ players }: AtRiskListProps) {
  if (players.length === 0) {
    return (
      <Card className="p-4" style={{ borderLeftWidth: 3, borderLeftColor: mflColors.brand }}>
        <AppText className="text-sm text-foreground font-medium text-center">
          All players active — no one at risk
        </AppText>
      </Card>
    );
  }

  return (
    <View>
      <View className="flex-row items-center mb-2">
        <View style={{ width: 4, height: 14, backgroundColor: mflColors.danger, borderRadius: 2, marginRight: 8 }} />
        <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          At-Risk Players ({players.length})
        </AppText>
      </View>
      {players.map((player) => (
        <Card key={player.userId} className="p-3 mb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: mflColors.inkLight }}
              >
                <AppText className="text-[10px] font-bold text-foreground">
                  {player.username.slice(0, 2).toUpperCase()}
                </AppText>
              </View>
              <View className="flex-1">
                <AppText className="text-sm font-medium text-foreground">{player.username}</AppText>
                <AppText className="text-[11px] text-muted">
                  Last active: {player.lastActive ?? '30d+ ago'}
                </AppText>
              </View>
            </View>
            <View
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: player.daysGap > 5 ? mflColors.dangerLight : mflColors.amberLight,
              }}
            >
              <AppText
                className="text-[10px] font-semibold"
                style={{ color: player.daysGap > 5 ? mflColors.danger : mflColors.amber }}
              >
                {player.daysGap === 999 ? '30d+' : `${player.daysGap}d`}
              </AppText>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}
