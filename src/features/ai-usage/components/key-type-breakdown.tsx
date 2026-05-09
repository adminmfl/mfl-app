import { View } from 'react-native';
import { Card, Chip } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import type { AiUsageBreakdownDTO } from '../types/ai-usage.dto';
import { formatTokens, KEY_TYPE_COLORS } from '../utils/format';

interface KeyTypeBreakdownProps {
  byKeyType: Record<string, AiUsageBreakdownDTO>;
}

export function KeyTypeBreakdown({ byKeyType }: KeyTypeBreakdownProps) {
  const entries = Object.entries(byKeyType);
  if (entries.length === 0) return null;

  return (
    <>
      <SectionLabel label="Key Type Breakdown" style={{ marginTop: 12 }} />
      <Card className="p-4 mb-4">
        <View className="flex-row flex-wrap gap-3">
          {entries.map(([kt, stats]) => (
            <View key={kt} className="flex-row items-center gap-2 p-2 rounded-lg border border-default-200">
              <Chip size="sm" variant="soft" style={{ backgroundColor: KEY_TYPE_COLORS[kt]?.bg }}>
                <Chip.Label style={{ color: KEY_TYPE_COLORS[kt]?.text }}>
                  {kt === 'byok' ? 'BYOK' : kt}
                </Chip.Label>
              </Chip>
              <AppText className="text-xs text-muted">
                {stats.calls} calls | {formatTokens(stats.tokens)} tokens
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </>
  );
}
