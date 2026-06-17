import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { Button, Card, Chip } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { StatCard } from '../../../components/stat-card';
import { SectionLabel } from '../../../components/section-label';
import { ScreenState } from '../../../components/screen-state';
import { StreakDots } from '../../../components/streak-dots';
import { useAuth } from '../../../core/auth';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { useDashboardSummary } from '../../../features/dashboard/hooks/use-dashboard-summary';
import { useUserLeagues } from '../../../features/leagues/hooks/use-user-leagues';
import { useUserProfile } from '../../../features/profile/hooks/use-user-profile';
import { isLeagueEnded } from '../../../features/leagues/utils/league-status';
import { LeagueCard } from '../../../features/dashboard/components/league-card';
import { mflColors } from '../../../constants/colors';

import { AppRoutes } from '../../../core/config/routes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildStreakDays(currentStreak: number): boolean[] {
  const total = 14;
  const filled = Math.min(currentStreak, total);
  return Array.from({ length: total }, (_, i) => i >= total - filled);
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeLeague, setActiveLeague } = useLeagueContext();
  const { isHost, isGovernor, canValidateSubmissions } = useRole();

  const dashboardQuery = useDashboardSummary();
  const leaguesQuery = useUserLeagues();
  const profileQuery = useUserProfile();

  const leagues = leaguesQuery.data ?? [];
  const summary = dashboardQuery.data;
  const profile = profileQuery.data;

  // User's first name — matches web: session.user.name.split(' ')[0]
  const userName = useMemo(() => {
    if (profile?.username) return profile.username.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  }, [profile?.username, user?.email]);

  // Leagues filtered to non-completed (matches web)
  const visibleLeagues = useMemo(
    () => leagues.filter((l) => l.status !== 'completed'),
    [leagues],
  );

  // League involvement stats (matches web exactly)
  const leagueStats = useMemo(() => {
    const activeLeagues = leagues.filter(
      (l) => l.status === 'active' && !isLeagueEnded(l.endDate),
    ).length;
    const hostingCount = leagues.filter((l) => l.isHost).length;
    const governorCount = leagues.filter((l) =>
      (l.roles || []).includes('governor'),
    ).length;
    const captainCount = leagues.filter((l) =>
      (l.roles || []).includes('captain'),
    ).length;
    return {
      totalLeagues: leagues.length,
      activeLeagues,
      hostingCount,
      leadershipRoles: governorCount + captainCount,
    };
  }, [leagues]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([dashboardQuery.refetch(), leaguesQuery.refetch()]);
  }, [dashboardQuery, leaguesQuery]);

  // Streak dots
  const streakDays = useMemo(
    () => buildStreakDays(summary?.currentStreak ?? 0),
    [summary?.currentStreak],
  );

  // Auto-navigate when user has exactly one active league — skip manual selection
  const hasAutoNavigated = useRef(false);
  useEffect(() => {
    if (
      hasAutoNavigated.current ||
      leaguesQuery.isLoading ||
      visibleLeagues.length !== 1
    ) return;
    hasAutoNavigated.current = true;
    const only = visibleLeagues[0]!;
    setActiveLeague(only);
    router.replace(AppRoutes.leagueOverview);
  }, [leaguesQuery.isLoading, visibleLeagues, setActiveLeague, router]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (dashboardQuery.isLoading) {
    return <ScreenState screen="dashboard" state="loading" />;
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (dashboardQuery.isError) {
    return (
      <ScreenState
        screen="dashboard"
        state="error"
        actionLabel="Retry"
        onAction={() => dashboardQuery.refetch()}
      />
    );
  }

  const isChallengesOnly = activeLeague?.leagueMode === 'challenges_only';

  // ── Loaded ─────────────────────────────────────────────────────────────
  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <StatusBar style="dark" />
      <View className="gap-4">
        {/* ── Welcome Header (matches web) ─────────────────────── */}
        <View className="gap-1">
          <AppText className="text-xl font-semibold text-foreground">
            Hi {userName} !
          </AppText>
          <AppText className="text-sm text-muted">
            {leagues.length > 0
              ? `You're part of ${leagues.length} league${leagues.length !== 1 ? 's' : ''}. Here's your overview.`
              : 'Get started by joining or creating a league to track your fitness journey.'}
          </AppText>
        </View>

        {/* ── League Selector (for multi-league users) ─────────── */}
        {leagues.length > 1 && (
          <Pressable
            className="bg-card rounded-xl px-4 py-3 border border-default-200"
            onPress={() => {
              const currentIdx = leagues.findIndex(
                (l) => l.leagueId === activeLeague?.leagueId,
              );
              const nextIdx = (currentIdx + 1) % leagues.length;
              setActiveLeague(leagues[nextIdx]!);
            }}
          >
            <View className="gap-0.5">
              <AppText className="text-[11px] font-medium uppercase tracking-wider text-muted">
                ACTIVE LEAGUE
              </AppText>
              <View className="flex-row items-center justify-between">
                <AppText
                  className="text-base font-semibold text-foreground flex-1 mr-2"
                  numberOfLines={1}
                >
                  {activeLeague?.name ?? leagues[0]?.name}
                </AppText>
                <Feather name="chevron-down" size={18} color={mflColors.textSub} />
              </View>
            </View>
          </Pressable>
        )}

        {activeLeague && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => router.push(AppRoutes.leagueOverview)}
            className="self-start"
          >
            <Feather name="grid" size={14} color={mflColors.brand} />
            <Button.Label>League Overview</Button.Label>
          </Button>
        )}

        {/* ── My Leagues Section (matches web) ─────────────────── */}
        <View>
          <SectionLabel
            label="MY LEAGUES"
            actionLabel={leagues.length > 0 ? 'View All' : undefined}
            onAction={
              leagues.length > 0
                ? () => router.push(AppRoutes.leagues)
                : undefined
            }
          />

          {leaguesQuery.isLoading ? (
            <ScreenState screen="dashboard" state="loading" message="Loading leagues..." />
          ) : visibleLeagues.length === 0 ? (
            <Card variant="secondary" className="p-4 items-center">
              <Feather name="award" size={32} color={mflColors.textMuted} />
              <AppText className="text-sm font-semibold text-foreground mt-2">
                No leagues yet
              </AppText>
              <AppText className="text-xs text-muted text-center mt-1">
                You haven't joined any leagues yet. Join an existing league or
                create your own to start your fitness journey with friends!
              </AppText>
            </Card>
          ) : (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {visibleLeagues.map((league) => (
                <View key={league.leagueId} style={{ width: '48%' }}>
                  <LeagueCard
                    league={league}
                    onPress={() => {
                      setActiveLeague(league);
                      router.push(AppRoutes.leagueOverview);
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Join + Create + Quick Start (matches web) */}
          <View className="flex-row gap-2 mt-3">
            <View className="flex-1">
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push(AppRoutes.joinLeague)}
                className="w-full"
              >
                <Button.Label>Join</Button.Label>
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push(AppRoutes.createLeague)}
                className="w-full"
              >
                <Button.Label>Create</Button.Label>
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="primary"
                size="sm"
                onPress={() => router.push(AppRoutes.quickStartLeague)}
                className="w-full"
              >
                <Button.Label>Quick Start</Button.Label>
              </Button>
            </View>
          </View>
        </View>

        {/* ── Activity Overview (matches web: 4 cards) ─────────── */}
        <View>
          <SectionLabel label="ACTIVITY OVERVIEW" />
          <View className="flex-row flex-wrap gap-2 mt-2">
            <StatCard
              value={summary?.activitiesLogged ?? 0}
              label="Activities Logged"
              color={mflColors.blue}
            />
            <StatCard
              value={summary?.totalPoints ?? 0}
              label="Total Points"
              color={mflColors.brand}
            />
            <StatCard
              value={`${summary?.currentStreak ?? 0} days`}
              label="Current Streak"
              color={mflColors.amber}
            />
            <StatCard
              value={`${summary?.bestStreak ?? 0} days`}
              label="Best Streak"
              color={mflColors.brand}
            />
          </View>
        </View>

        {/* ── Streak Dots (hidden for challenges-only) ─────────── */}
        {!isChallengesOnly && (
          <Card className="p-3">
            <AppText className="text-sm font-medium text-muted mb-1">
              14-Day Activity
            </AppText>
            <StreakDots days={streakDays} />
          </Card>
        )}

        {/* ── League Involvement (matches web: 4 cards) ────────── */}
        <View>
          <SectionLabel label="LEAGUE INVOLVEMENT" />
          <View className="flex-row flex-wrap gap-2 mt-2">
            <StatCard
              value={leagueStats.totalLeagues}
              label="Total Leagues"
              color={mflColors.brand}
            />
            <StatCard
              value={leagueStats.activeLeagues}
              label="Active Leagues"
              color={mflColors.blue}
            />
            <StatCard
              value={leagueStats.hostingCount}
              label="Hosting"
              color={mflColors.amber}
            />
            <StatCard
              value={leagueStats.leadershipRoles}
              label="Leadership Roles"
              color={mflColors.blue}
            />
          </View>
        </View>

        {/* ── League Standings Preview ─────────────────────────── */}
        <View>
          <SectionLabel
            label="LEAGUE STANDINGS"
            actionLabel="View All"
            onAction={() => {
              if (activeLeague) {
                router.push(AppRoutes.leaderboard);
              }
            }}
          />
          {activeLeague ? (
            <Card variant="secondary" className="p-4">
              <View className="flex-row items-center justify-between">
                <AppText className="text-sm font-semibold text-foreground">
                  {activeLeague.teamName ?? 'Your Team'}
                </AppText>
                <Chip
                  size="sm"
                  variant="soft"
                  color="accent"
                  style={{
                    backgroundColor:
                      activeLeague.status === 'active'
                        ? mflColors.brandLight
                        : mflColors.inkLight,
                  }}
                >
                  <Chip.Label
                    style={{
                      color:
                        activeLeague.status === 'active'
                          ? mflColors.brand
                          : mflColors.textMuted,
                    }}
                  >
                    {activeLeague.status}
                  </Chip.Label>
                </Chip>
              </View>
              <AppText className="text-sm text-muted mt-1">
                {activeLeague.numTeams}{' '}
                {activeLeague.numTeams === 1 ? 'team' : 'teams'} competing
              </AppText>
            </Card>
          ) : (
            <Card variant="secondary" className="p-4">
              <AppText className="text-sm text-muted">
                Join a league to see standings
              </AppText>
            </Card>
          )}
        </View>

        {/* ── Quick Actions ────────────────────────────────────── */}
        {isChallengesOnly ? (
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push(AppRoutes.challenges)}
            className="w-full"
          >
            <Button.Label>View Challenges</Button.Label>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push(AppRoutes.myActivity)}
            className="w-full"
          >
            <Button.Label>Log Activity</Button.Label>
          </Button>
        )}

        {/* ── Host / Admin Quick Actions ────────────────────── */}
        {(isHost || isGovernor) && (
          <View>
            <SectionLabel label={isHost ? 'HOST ACTIONS' : 'GOVERNOR ACTIONS'} />
            <Card variant="secondary">
              {canValidateSubmissions && (
                <QuickLink
                  icon="shield"
                  label="Validation Queue"
                  onPress={() => router.push(AppRoutes.submissionValidation)}
                />
              )}
              {isHost && (
                <QuickLink
                  icon="settings"
                  label="League Settings"
                  onPress={() => router.push(AppRoutes.leagueSettings)}
                />
              )}
              {(isHost || isGovernor) && (
                <QuickLink
                  icon="briefcase"
                  label="Governor Dashboard"
                  onPress={() => router.push(AppRoutes.governor)}
                />
              )}
              {(isHost || isGovernor) && (
                <QuickLink
                  icon="user-plus"
                  label="Team Management"
                  onPress={() => router.push(AppRoutes.teamManagement)}
                />
              )}
            </Card>
          </View>
        )}

        {/* ── Quick Links ────────────────────────────────────── */}
        <View>
          <SectionLabel label="QUICK LINKS" />
          <Card variant="secondary">
            <QuickLink
              icon="award"
              label="Challenges"
              onPress={() => router.push(AppRoutes.challenges)}
            />
            <QuickLink
              icon="cpu"
              label="AI Coach"
              onPress={() => router.push(AppRoutes.aiCoach)}
            />
            <QuickLink
              icon="bar-chart-2"
              label="Analytics"
              onPress={() => router.push(AppRoutes.analytics)}
            />
            <QuickLink
              icon="users"
              label="Communities"
              onPress={() => router.push(AppRoutes.communities)}
            />
            <QuickLink
              icon="heart"
              label="Rest Day Donations"
              onPress={() => router.push(AppRoutes.restDayDonations)}
            />
            <QuickLink
              icon="file-text"
              label="Rules"
              onPress={() => router.push(AppRoutes.leagueRules)}
            />
          </Card>
        </View>
      </View>
    </ScreenScrollView>
  );
}

// ---------------------------------------------------------------------------
// Quick Link Row
// ---------------------------------------------------------------------------

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-3 border-b border-default-200"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <Feather name={icon} size={20} color={mflColors.blue} />
        <AppText className="text-sm text-foreground">{label}</AppText>
      </View>
      <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
    </Pressable>
  );
}
