import { View } from 'react-native';
import { Card, Chip } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import type { AiUsagePlayerStatDTO } from '../types/ai-usage.dto';
import { formatTokens, formatCost, KEY_TYPE_COLORS } from '../utils/format';

interface PlayerUsageListProps {
  players: AiUsagePlayerStatDTO[];
}

export function PlayerUsageList({ players }: PlayerUsageListProps) {
  return (
    <>
      <SectionLabel label="Player Usage" style={{ marginTop: 12 }} />
      <Card className="p-4 mb-4">
        {/* Header row */}
        <View className="flex-row items-center pb-2 mb-2 border-b border-default-200">
          <AppText className="text-xs font-semibold text-muted flex-1">Player</AppText>
          <AppText className="text-xs font-semibold text-muted w-14 text-right">Calls</AppText>
          <AppText className="text-xs font-semibold text-muted w-16 text-right">Tokens</AppText>
          <AppText className="text-xs font-semibold text-muted w-16 text-right">Cost</AppText>
        </View>

        {players.length === 0 ? (
          <AppText className="text-sm text-muted text-center py-5">
            No AI usage data yet
          </AppText>
        ) : (
          players.map((p) => (
            <View key={p.user_id} className="flex-row items-center py-2">
              <View className="flex-1 flex-row items-center gap-2">
                <AppText className="text-sm font-medium text-foreground" numberOfLines={1}>
                  {p.username}
                </AppText>
                <Chip size="sm" variant="soft" style={{ backgroundColor: KEY_TYPE_COLORS[p.keyType]?.bg }}>
                  <Chip.Label style={{ color: KEY_TYPE_COLORS[p.keyType]?.text, fontSize: 9 }}>
                    {p.keyType === 'byok' ? 'BYOK' : p.keyType}
                  </Chip.Label>
                </Chip>
              </View>
              <AppText className="font-mono text-xs text-muted w-14 text-right">{p.calls}</AppText>
              <AppText className="font-mono text-xs text-muted w-16 text-right">{formatTokens(p.tokens)}</AppText>
              <AppText className="font-mono text-xs text-muted w-16 text-right">{formatCost(p.cost)}</AppText>
            </View>
          ))
        )}
      </Card>
    </>
  );
}
