import { View, ScrollView, RefreshControl } from 'react-native';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { mflColors } from '../../constants/colors';
import {
  useEngagement,
  MetricCard,
  DailyActiveChart,
  EventBreakdown,
  StreakDistribution,
  AtRiskList,
  TopEngagers,
} from '../../features/engagement';

export default function EngagementDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';

  // RBAC guard — host/governor only
  if (!isHost && !isGovernor) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState
          screen="governor"
          state="empty"
          message="Engagement Dashboard is only available to hosts and governors."
        />
      </View>
    );
  }

  if (!activeLeague) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState
          screen="governor"
          state="empty"
          message="Select a league to view the Engagement Dashboard"
        />
      </View>
    );
  }

  return <EngagementContent leagueId={leagueId} />;
}

function EngagementContent({ leagueId }: { leagueId: string }) {
  const insets = useSafeAreaInsets();
  const { isHost } = useRole();
  const { data, isLoading, isError, refetch } = useEngagement(leagueId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState state="loading" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState
          state="error"
          message="Failed to load engagement data"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const totalEvents = data.eventBreakdown.reduce((s: number, e: { count: number }) => s + e.count, 0);

  const participationColor =
    data.participationRate >= 70
      ? mflColors.brand
      : data.participationRate >= 40
        ? mflColors.amber
        : mflColors.danger;

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <DarkHeaderCard
        title="Engagement Dashboard"
        subtitle={isHost ? 'Host View' : 'Governor View'}
        style={{ marginTop: 12, marginBottom: 16 }}
      />

      {/* 4 Metric Cards — 2x2 grid */}
      <View className="flex-row gap-3 mb-3">
        <MetricCard
          label="Participation"
          value={`${data.participationRate}%`}
          color={participationColor}
        />
        <MetricCard
          label="Active (7d)"
          value={String(data.activeUsersLast7Days)}
          color="#3B82F6"
          subtitle={`/ ${data.totalMembers}`}
        />
      </View>
      <View className="flex-row gap-3 mb-4">
        <MetricCard
          label="At Risk"
          value={String(data.atRiskPlayers.length)}
          color={data.atRiskPlayers.length > 0 ? mflColors.danger : mflColors.brand}
        />
        <MetricCard
          label="Events (30d)"
          value={String(totalEvents)}
          color="#A855F7"
        />
      </View>

      {/* Daily Active Users Chart */}
      <View className="mb-4">
        <DailyActiveChart data={data.dailyActiveUsers} />
      </View>

      {/* Event Breakdown + Streak Distribution */}
      <View className="mb-4">
        <EventBreakdown items={data.eventBreakdown} />
      </View>
      <View className="mb-4">
        <StreakDistribution buckets={data.streakDistribution} />
      </View>

      {/* At-Risk Players */}
      <View className="mb-4">
        <AtRiskList players={data.atRiskPlayers} />
      </View>

      {/* Top Engagers */}
      <View className="mb-4">
        <TopEngagers engagers={data.topEngagers} />
      </View>

      {/* Footer */}
      <AppText className="text-[10px] text-muted text-center mt-2">
        Last updated: {new Date(data.exportedAt).toLocaleString()}
      </AppText>
    </ScrollView>
  );
}
