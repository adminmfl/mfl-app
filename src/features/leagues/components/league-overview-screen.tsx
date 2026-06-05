import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Linking, Pressable, Share, View } from 'react-native';
import { Card, Chip, Button } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { StatCard } from '../../../components/stat-card';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { useLeagueDetail } from '../hooks/use-league-detail';
import { useLeaguePhase } from '../hooks/use-league-phase';
import { isLeagueEnded } from '../utils/league-status';
import { PHASE_LABELS, type LeaguePhase } from '../types/league-phase.model';
import { mflColors } from '../../../constants/colors';
import {
  useLeagueSponsors,
  getTitleSponsor,
  TitleSponsorHeader,
} from '../../sponsors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTIVE_PHASES: LeaguePhase[] = [
  'league_active',
  'challenges_live',
  'league_closure',
  'grand_finale',
];

function getLeagueProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0) return { pct: 0, daysElapsed: 0, daysRemaining: 0, daysTotal: 0 };
  const elapsed = Math.max(0, now - start);
  const daysTotal = Math.ceil(total / 86_400_000);
  const daysElapsed = Math.min(Math.floor(elapsed / 86_400_000), daysTotal);
  const daysRemaining = Math.max(daysTotal - daysElapsed, 0);
  const pct = Math.min(Math.round((elapsed / total) * 100), 100);
  return { pct, daysElapsed, daysRemaining, daysTotal };
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function LeagueOverviewScreen() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor, canManageLeague } = useRole();

  const leagueId = activeLeague?.leagueId ?? '';
  const detailQuery = useLeagueDetail(leagueId);
  const phaseQuery = useLeaguePhase(leagueId);
  const { data: sponsorSlots } = useLeagueSponsors(leagueId);

  const league = detailQuery.data;
  const phaseInfo = phaseQuery.data;

  const ended = useMemo(
    () =>
      (league?.phase === 'post_league_archive') ||
      isLeagueEnded(league?.endDate),
    [league?.phase, league?.endDate],
  );

  const progress = useMemo(() => {
    if (!league?.startDate || !league?.endDate) return null;
    return getLeagueProgress(league.startDate, league.endDate);
  }, [league?.startDate, league?.endDate]);

  const isChallengesOnly = league?.leagueMode === 'challenges_only';
  const titleSponsor = useMemo(
    () => getTitleSponsor(sponsorSlots ?? []),
    [sponsorSlots],
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([detailQuery.refetch(), phaseQuery.refetch()]);
  }, [detailQuery, phaseQuery]);

  const handleShare = useCallback(async () => {
    if (!league?.inviteCode) return;
    try {
      await Share.share({
        message: `Join my league "${league.name}" on MyFitnessLeague! Use invite code: ${league.inviteCode}`,
      });
    } catch {
      // user cancelled
    }
  }, [league?.inviteCode, league?.name]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (detailQuery.isLoading) {
    return <ScreenState state="loading" message="Loading league details..." />;
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (detailQuery.isError || !league) {
    return (
      <ScreenState
        state="error"
        message="Unable to load league details."
        actionLabel="Retry"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  // ── Loaded ───────────────────────────────────────────────────────────────
  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-4">
        {/* ── League Header ──────────────────────────────────────── */}
        <Card className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <AppText className="text-lg font-bold text-foreground" numberOfLines={2}>
                {league.name}
              </AppText>
              {league.description ? (
                <AppText className="text-sm text-muted mt-1" numberOfLines={3}>
                  {league.description}
                </AppText>
              ) : null}
            </View>
            <Chip
              size="sm"
              variant="soft"
              style={{
                backgroundColor: ended
                  ? mflColors.inkLight
                  : league.status === 'active'
                    ? mflColors.brandLight
                    : mflColors.amberLight,
              }}
            >
              <Chip.Label
                style={{
                  color: ended
                    ? mflColors.textMuted
                    : league.status === 'active'
                      ? mflColors.brand
                      : mflColors.amber,
                }}
              >
                {ended ? 'Ended' : league.status}
              </Chip.Label>
            </Chip>
          </View>

          {/* Invite / Share */}
          {league.inviteCode && !ended && (
            <Pressable
              onPress={handleShare}
              className="flex-row items-center gap-2 mt-3 self-start"
            >
              <Feather name="share-2" size={14} color={mflColors.brand} />
              <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
                Share Invite
              </AppText>
            </Pressable>
          )}
        </Card>

        {/* ── Title Sponsor ─────────────────────────────────────── */}
        {titleSponsor && <TitleSponsorHeader slot={titleSponsor} />}

        {/* ── League Ended Banner ────────────────────────────────── */}
        {ended && (
          <Card className="p-4" style={{ backgroundColor: mflColors.brandLight }}>
            <View className="flex-row items-center gap-3">
              <Feather name="heart" size={18} color={mflColors.brand} />
              <View className="flex-1">
                <AppText className="text-sm font-semibold text-foreground">
                  This league has ended
                </AppText>
                <AppText className="text-xs text-muted mt-0.5">
                  We'd love your feedback!
                </AppText>
              </View>
              <Button
                size="sm"
                variant="primary"
                onPress={() =>
                  Linking.openURL(
                    'https://docs.google.com/forms/d/e/1FAIpQLSdooeQxEuY95nK0Ft4mnhZvT6TdxL9_Gbb6L_3T-NEmbLxQJQ/viewform?usp=publish-editor',
                  )
                }
              >
                <Button.Label>Feedback</Button.Label>
              </Button>
            </View>
          </Card>
        )}

        {/* ── Quick Actions (visible without scrolling) ─────────── */}
        {!ended && (
          <View className="flex-row gap-2">
            {league.startDate && league.endDate && (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push('/(app)/analytics' as any)}
                className="flex-1"
              >
                <Feather name="clipboard" size={14} color={mflColors.brand} />
                <Button.Label>My Summary</Button.Label>
              </Button>
            )}
            {!isChallengesOnly && (
              <Button
                variant="primary"
                size="sm"
                onPress={() => router.push('/(app)/(tabs)/my-activity' as any)}
                className="flex-1"
              >
                <Feather name="plus-circle" size={14} color="#fff" />
                <Button.Label>Log Activity</Button.Label>
              </Button>
            )}
          </View>
        )}

        {/* ── Progress Bar (active phases only) ──────────────────── */}
        {progress && !ended && ACTIVE_PHASES.includes(league.phase as LeaguePhase) && (
          <Card variant="secondary" className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Feather name="trending-up" size={14} color={mflColors.brand} />
                <AppText className="text-sm font-semibold text-foreground">
                  League Progress
                </AppText>
              </View>
              <AppText className="text-sm font-bold" style={{ color: mflColors.brand }}>
                {progress.pct}%
              </AppText>
            </View>
            <View className="h-2 rounded-full bg-default-200 overflow-hidden">
              <View
                className="h-2 rounded-full"
                style={{ width: `${progress.pct}%`, backgroundColor: mflColors.brand }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <AppText className="text-xs text-muted">
                {progress.daysElapsed} days elapsed
              </AppText>
              <AppText className="text-xs text-muted">
                {progress.daysRemaining} days left
              </AppText>
            </View>
          </Card>
        )}

        {/* ── Phase Indicator (slim) ───────────────────────────────── */}
        {phaseQuery.isLoading ? (
          <Card variant="secondary" className="px-4 py-2.5" style={{ borderStyle: 'dashed' }}>
            <AppText className="text-xs text-muted">Loading phase...</AppText>
          </Card>
        ) : phaseInfo ? (
          <Card variant="secondary" className="px-4 py-2.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                  PHASE
                </AppText>
                <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {PHASE_LABELS[phaseInfo.phase as LeaguePhase] ?? phaseInfo.phase_label}
                </AppText>
              </View>
              {phaseInfo.days_remaining != null && (
                <View className="flex-row items-center gap-1">
                  <Feather name="clock" size={12} color={mflColors.amber} />
                  <AppText className="text-[11px] font-medium" style={{ color: mflColors.amber }}>
                    {phaseInfo.days_remaining}d left
                  </AppText>
                </View>
              )}
            </View>
          </Card>
        ) : null}

        {/* ── League Info Section ────────────────────────────────── */}
        <View>
          <SectionLabel label="LEAGUE DETAILS" />
          <View className="gap-2 mt-1">
            {/* Date row */}
            <View className="flex-row gap-2">
              <StatCard value={formatDate(league.startDate)} label="Start Date" />
              <StatCard value={formatDate(league.endDate)} label="End Date" />
            </View>
            {/* Capacity row */}
            <View className="flex-row gap-2">
              <StatCard value={league.numTeams} label="Teams" color={mflColors.blue} />
              <StatCard
                value={league.maxTeamCapacity ?? '-'}
                label="Max Team Size"
                color={mflColors.blue}
              />
              {league.restDays > 0 && (
                <StatCard value={league.restDays} label="Rest Days" color={mflColors.amber} />
              )}
            </View>
            {/* Visibility & Join Type */}
            <Card variant="secondary" className="p-3">
              <View className="flex-row gap-4">
                <View className="flex-1 items-center">
                  <AppText className="text-[10px] text-muted mb-1">Visibility</AppText>
                  <Chip size="sm" variant="soft">
                    <Chip.Label>
                      {league.isPublic ? 'Public' : 'Private'}
                    </Chip.Label>
                  </Chip>
                </View>
                <View className="flex-1 items-center">
                  <AppText className="text-[10px] text-muted mb-1">Join Type</AppText>
                  <Chip size="sm" variant="soft">
                    <Chip.Label>
                      {league.isExclusive ? 'Invite Only' : 'Open'}
                    </Chip.Label>
                  </Chip>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* ── Challenges Link (challenges-only) ──────────────────── */}
        {isChallengesOnly && !ended && (
          <Pressable onPress={() => router.push('/(app)/challenges' as any)}>
            <Card className="p-4">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: mflColors.brand }}
                >
                  <Feather name="award" size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <AppText className="text-sm font-semibold text-foreground">
                    View Challenges
                  </AppText>
                  <AppText className="text-xs text-muted">
                    See active challenges and submit entries
                  </AppText>
                </View>
                <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
              </View>
            </Card>
          </Pressable>
        )}

        {/* ── Rest Day Donation ─────────────────────────────────── */}
        {!ended && league.restDays > 0 && (
          <View>
            <SectionLabel label="ACTIONS" />
            <Card variant="secondary" className="mt-1">
              <ActionRow
                icon="gift"
                label="Donate Rest Days"
                subtitle="Gift rest days to a teammate"
                onPress={() => router.push('/(app)/rest-day-donations' as any)}
              />
            </Card>
          </View>
        )}

        {/* ── Host / Governor Actions ────────────────────────────── */}
        {(isHost || isGovernor) && (
          <View>
            <SectionLabel label={isHost ? 'HOST ACTIONS' : 'GOVERNOR ACTIONS'} />
            <Card variant="secondary" className="mt-1">
              {canManageLeague && (
                <ActionRow
                  icon="settings"
                  label="League Settings"
                  onPress={() => router.push('/(app)/league-settings' as any)}
                />
              )}
              <ActionRow
                icon="file-text"
                label="Manage Rules"
                onPress={() => router.push('/(app)/league-rules' as any)}
              />
              <ActionRow
                icon="briefcase"
                label="Governor Dashboard"
                onPress={() => router.push('/(app)/governor' as any)}
              />
              <ActionRow
                icon="user-plus"
                label="Team Management"
                onPress={() => router.push('/(app)/team-management' as any)}
              />
              <ActionRow
                icon="speaker"
                label="Manage Sponsors"
                onPress={() => router.push('/(app)/sponsors' as any)}
              />
            </Card>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}

// ---------------------------------------------------------------------------
// Action Row
// ---------------------------------------------------------------------------

function ActionRow({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-3 px-1 border-b border-default-200"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Feather name={icon} size={20} color={mflColors.blue} />
        <View className="flex-1">
          <AppText className="text-sm text-foreground">{label}</AppText>
          {subtitle ? (
            <AppText className="text-xs text-muted">{subtitle}</AppText>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
    </Pressable>
  );
}
