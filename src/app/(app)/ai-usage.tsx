import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenState } from '../../components/screen-state';
import { StatCard } from '../../components/stat-card';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import {
  DailyTrendChart,
  formatCost,
  formatTokens,
  KeyTypeBreakdown,
  PlayerUsageList,
  useAiUsage,
} from '../../features/ai-usage';

const PERIOD_OPTIONS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
] as const;

export default function AiUsageScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, refetch } = useAiUsage(leagueId, days);

  // ── Guards ──

  if (!activeLeague) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState state="empty" message="Select a league to view AI usage" />
      </View>
    );
  }

  if (!isHost && !isGovernor) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState state="empty" message="Only hosts and governors can view AI usage" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState state="loading" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState
          state="error"
          message="Failed to load AI usage data"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  if (!data) return null;

  const { summary, quotas, playerStats, dailyTrend, byKeyType } = data;

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <DarkHeaderCard
        title="AI Usage"
        subtitle={activeLeague.name}
        style={{ marginTop: 12, marginBottom: 16 }}
      />

      {/* Period Selector */}
      <View className="flex-row gap-2 mb-4">
        {PERIOD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setDays(opt.value)}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: days === opt.value ? mflColors.brand : mflColors.inkLight,
            }}
          >
            <AppText
              className="text-sm font-semibold"
              style={{ color: days === opt.value ? mflColors.white : mflColors.textSub }}
            >
              {opt.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Summary Cards */}
      <View className="flex-row gap-2 mb-2">
        <StatCard value={summary.totalCalls} label="Total Calls" color={mflColors.brand} />
        <StatCard value={formatTokens(summary.totalTokens)} label="Tokens" color={mflColors.accent} />
        <StatCard value={formatCost(summary.totalCost)} label="Cost" color={mflColors.amber} />
        <StatCard value={`${quotas.dailyQuestionLimit}/d`} label="Quota" color={mflColors.textSub} />
      </View>

      {/* Daily Token Trend */}
      <DailyTrendChart dailyTrend={dailyTrend} />

      {/* Key Type Breakdown */}
      <KeyTypeBreakdown byKeyType={byKeyType} />

      {/* Player Usage Table */}
      <PlayerUsageList players={playerStats} />
    </ScrollView>
  );
}
