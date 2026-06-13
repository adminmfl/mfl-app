import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Card, Chip } from 'heroui-native';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ProgressBar } from '../../components/progress-bar';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { StatCard } from '../../components/stat-card';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useAnalytics } from '../../features/analytics/hooks/use-analytics';
import { useLeagueActivities } from '../../features/leagues/hooks/use-league-activities';

// ─── Bar Chart (View-based) ──────────────────────────────────────────────────

const BAR_HEIGHT = 120;

interface BarChartProps {
  data: Array<{ date: string; submissions: number; participationRate: number }>;
}

function DailyBarChart({ data }: BarChartProps) {
  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.submissions), 1),
    [data],
  );

  const chartData = useMemo(() => data.slice(-7), [data]);

  return (
    <View className="py-2">
      <View
        className="flex-row justify-between items-end"
        style={{ height: BAR_HEIGHT + 40 }}
      >
        {chartData.map((entry) => {
          const heightPct = (entry.submissions / maxCount) * 100;
          return (
            <View key={entry.date} className="flex-1 items-center mx-0.5">
              <AppText className="font-mono text-[10px] text-muted mb-0.5">
                {entry.submissions}
              </AppText>
              <View
                className="w-[60%] rounded-sm justify-end overflow-hidden"
                style={{ height: BAR_HEIGHT, backgroundColor: mflColors.inkLight }}
              >
                <View
                  className="w-full rounded-sm"
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    backgroundColor: '#00C48C',
                  }}
                />
              </View>
              <AppText className="font-medium text-[9px] text-muted mt-1 text-center">
                {new Date(entry.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                })}
              </AppText>
              <AppText className="font-mono text-[8px] text-muted">
                {entry.participationRate}%
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useAnalytics(leagueId);

  const { data: activities } = useLeagueActivities(leagueId);

  const isMonthlyLeague = useMemo(() => {
    return (
      activities &&
      activities.length > 0 &&
      activities.every((a) => a.frequency_type != null && a.frequency_type === 'monthly')
    );
  }, [activities]);

  if (!activeLeague) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="analytics"
          state="empty"
          message="Select a league to view analytics"
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState screen="analytics" state="loading" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="analytics"
          state="error"
          message="Failed to load analytics"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  if (!analytics) return null;

  const { leagueHealth, participation, topPerformers, bottomPerformers, teamPerformance, restDayAnalytics, alerts } = analytics;

  const topTeamPoints = Math.max(...teamPerformance.map((t) => t.rawPoints), 1);

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <DarkHeaderCard
        title="League Analytics"
        subtitle={activeLeague.name}
        style={{ marginTop: 12, marginBottom: 16 }}
      />

      {/* League Health stats */}
      <View className="flex-row gap-2 mb-2">
        <StatCard
          value={leagueHealth.totalMembers}
          label="Members"
          color={mflColors.accent}
        />
        <StatCard
          value={`${leagueHealth.activeMembersPercent}%`}
          label="Active"
          color={mflColors.brand}
        />
        <StatCard
          value={`${leagueHealth.inactiveMembersPercent}%`}
          label="Inactive"
          color={mflColors.danger}
        />
        <StatCard
          value={leagueHealth.totalTeams}
          label="Teams"
          color={mflColors.amber}
        />
      </View>

      {/* League Progress Bar */}
      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <AppText className="text-sm font-semibold text-foreground">League Progress</AppText>
          <AppText className="font-mono text-lg font-bold text-foreground">
            {leagueHealth.leagueProgress}%
          </AppText>
        </View>
        <ProgressBar
          progress={leagueHealth.leagueProgress / 100}
          color={mflColors.brand}
          height={8}
        />
        <AppText className="text-xs text-muted mt-2">
          {leagueHealth.daysCompleted} of {leagueHealth.totalDays} days
        </AppText>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <>
          <SectionLabel label="Alerts" style={{ marginTop: 8 }} />
          <Card className="p-4 mb-4">
            {alerts.map((alert, idx) => (
              <View key={idx} className="mb-3">
                <View className="flex-row items-start gap-2">
                  <Chip size="sm" variant="soft" style={{ backgroundColor: alert.type === 'warning' ? mflColors.amberLight : mflColors.dangerLight }}>
                    <Chip.Label style={{ color: alert.type === 'warning' ? mflColors.amber : mflColors.danger }}>{alert.type}</Chip.Label>
                  </Chip>
                  <AppText className="text-sm text-foreground flex-1">{alert.message}</AppText>
                </View>
                {alert.teams && alert.teams.length > 0 && (
                  <View className="flex-row flex-wrap gap-1 mt-1 ml-9">
                    {alert.teams.slice(0, 3).map((team) => (
                      <Chip key={team} size="sm" variant="soft">
                        <Chip.Label className="text-xs">{team}</Chip.Label>
                      </Chip>
                    ))}
                  </View>
                )}
                {alert.users && alert.users.length > 0 && (
                  <AppText className="text-xs text-muted mt-1 ml-9">
                    {alert.users.join(', ')}
                  </AppText>
                )}
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Top Performers */}
      <SectionLabel label="Top Performers" style={{ marginTop: 8 }} />
      <Card className="p-4 mb-4">
        {topPerformers.length > 0 ? (
          topPerformers.map((performer, idx) => (
            <View
              key={performer.memberId}
              className="flex-row items-center py-2 gap-3"
            >
              <View
                className="w-7 h-7 rounded-lg items-center justify-center"
                style={{ backgroundColor: idx < 3 ? mflColors.brand : mflColors.ink }}
              >
                <AppText className="text-xs font-bold" style={{ color: mflColors.white }}>
                  #{idx + 1}
                </AppText>
              </View>
              <Avatar size="sm" alt={performer.username}>
                <Avatar.Fallback>
                  <AppText className="text-xs font-bold">
                    {performer.username.substring(0, 2).toUpperCase()}
                  </AppText>
                </Avatar.Fallback>
              </Avatar>
              <AppText className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
                {performer.username}
              </AppText>
              <AppText className="font-mono text-sm text-muted">
                {performer.submissions} subs
              </AppText>
            </View>
          ))
        ) : (
          <AppText className="text-sm text-muted text-center py-5">
            No performer data available
          </AppText>
        )}
      </Card>

      {/* Bottom Performers */}
      <SectionLabel label="Bottom Performers" style={{ marginTop: 8 }} />
      <Card className="p-4 mb-4">
        {bottomPerformers.length > 0 ? (
          bottomPerformers.slice(0, 10).map((performer, idx) => (
            <View
              key={performer.memberId}
              className="flex-row items-center py-2 gap-3"
            >
              <View
                className="w-7 h-7 rounded-lg items-center justify-center"
                style={{ backgroundColor: mflColors.dangerLight }}
              >
                <AppText className="text-xs font-bold" style={{ color: mflColors.danger }}>
                  #{topPerformers.length - idx}
                </AppText>
              </View>
              <Avatar size="sm" alt={performer.username}>
                <Avatar.Fallback>
                  <AppText className="text-xs font-bold">
                    {performer.username.substring(0, 2).toUpperCase()}
                  </AppText>
                </Avatar.Fallback>
              </Avatar>
              <AppText className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
                {performer.username}
              </AppText>
              <AppText className="font-mono text-sm" style={{ color: mflColors.danger }}>
                {performer.submissions} subs
              </AppText>
            </View>
          ))
        ) : (
          <AppText className="text-sm text-muted text-center py-5">
            No performer data available
          </AppText>
        )}
      </Card>

      {/* Team Performance */}
      <SectionLabel label="Team Performance" style={{ marginTop: 8 }} />
      <Card className="p-4 mb-4">
        {teamPerformance.length > 0 ? (
          teamPerformance.map((team) => (
            <View key={team.teamId} className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <AppText className="text-sm font-semibold text-foreground">
                  {team.teamName}
                </AppText>
                <AppText className="font-mono text-sm text-muted">
                  {team.rawPoints} pts
                </AppText>
              </View>
              <ProgressBar
                progress={team.rawPoints / topTeamPoints}
                color={mflColors.brand}
                height={6}
              />
              <View className="flex-row justify-between mt-1">
                <AppText className="text-xs text-muted">
                  {team.size} members
                </AppText>
                <AppText className="text-xs text-muted">
                  {team.avgPointsPerPlayer.toFixed(1)} avg/player
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <AppText className="text-sm text-muted text-center py-5">
            No team data available
          </AppText>
        )}
      </Card>

      {/* Daily Submissions */}
      {!isMonthlyLeague && (
        <>
          <SectionLabel label="Daily Submissions" style={{ marginTop: 8 }} />
          <Card className="p-4 mb-4">
            {participation.dailyData.length > 0 ? (
              <>
                <DailyBarChart data={participation.dailyData} />
                <AppText className="text-xs text-muted text-center mt-2">
                  Avg {participation.avgDailySubmissions.toFixed(1)} submissions/day
                </AppText>
              </>
            ) : (
              <AppText className="text-sm text-muted text-center py-5">
                No submission data available
              </AppText>
            )}
          </Card>
        </>
      )}

      {/* Rest Day Analytics — hidden when rest_days = 0 */}
      {restDayAnalytics.totalUsed > 0 && (
        <>
          <SectionLabel label="Rest Days" style={{ marginTop: 8 }} />
          <Card className="p-4 mb-4">
            <View className="flex-row gap-4">
              <View className="flex-1 items-center">
                <AppText className="font-mono text-xl font-bold" style={{ color: mflColors.accent }}>
                  {restDayAnalytics.totalUsed}
                </AppText>
                <AppText className="text-xs text-muted mt-1">Total Used</AppText>
              </View>
              <View className="flex-1 items-center">
                <AppText className="font-mono text-xl font-bold" style={{ color: mflColors.brand }}>
                  {restDayAnalytics.avgPerMember.toFixed(1)}
                </AppText>
                <AppText className="text-xs text-muted mt-1">Avg/Member</AppText>
              </View>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
}
