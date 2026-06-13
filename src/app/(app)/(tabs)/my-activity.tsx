import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Button, Card, Chip, Separator, Tabs } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { useLeagueContext } from '../../../contexts/league-context';
import { useMySubmissions } from '../../../features/submissions/hooks/use-my-submissions';
import type { SubmissionEntry, SubmissionStats } from '../../../features/submissions/types/submission.model';
import { isReuploadWindowOpen } from '../../../features/submissions/utils/reupload-window';
import { mflColors } from '../../../constants/colors';

import { AppRoutes } from '../../../core/config/routes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_FILTER_MAP: Record<StatusTab, string | null> = {
  All: null,
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatWorkoutType(
  workoutType: string | null,
  customActivityName?: string,
): string {
  if (customActivityName) return customActivityName;
  if (!workoutType) return 'General';
  return workoutType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getStatusLabel(status: SubmissionEntry['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'rejected_resubmit':
      return 'Rejected (Retry)';
    case 'rejected_permanent':
      return 'Rejected (Final)';
    default:
      return status;
  }
}

function getStatusChipStyle(status: SubmissionEntry['status']) {
  switch (status) {
    case 'pending':
      return { color: mflColors.amber, bgColor: mflColors.amberLight };
    case 'approved':
      return { color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'rejected':
    case 'rejected_resubmit':
    case 'rejected_permanent':
      return { color: mflColors.danger, bgColor: mflColors.dangerLight };
    default:
      return { color: mflColors.textMuted, bgColor: mflColors.surface };
  }
}

function isExemptionRequest(entry: SubmissionEntry): boolean {
  return entry.type === 'rest' && (entry.notes?.includes('[EXEMPTION_REQUEST]') ?? false);
}

// ---------------------------------------------------------------------------
// Stats Cards
// ---------------------------------------------------------------------------

function StatsCards({ stats, restDaysUsed }: { stats: SubmissionStats; restDaysUsed: number }) {
  const cards = [
    { label: 'Total', value: stats.total, color: mflColors.brand },
    { label: 'Approved', value: stats.approved, color: '#16a34a' },
    { label: 'Pending', value: stats.pending, color: mflColors.amber },
    { label: 'Rejected', value: stats.rejected, color: mflColors.danger },
    { label: 'Rest', value: restDaysUsed, color: '#2563eb' },
  ];

  return (
    <View className="flex-row gap-2">
      {cards.map((c) => (
        <View
          key={c.label}
          className="flex-1 items-center justify-center rounded-lg border py-2"
          style={{ borderColor: mflColors.border, backgroundColor: mflColors.card }}
        >
          <AppText className="text-base font-bold" style={{ color: c.color }}>
            {c.value}
          </AppText>
          <AppText className="text-[9px] uppercase tracking-wider text-muted">
            {c.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Submission Card
// ---------------------------------------------------------------------------

function SubmissionCard({
  entry,
  onPress,
  canResubmit,
  onReupload,
}: {
  entry: SubmissionEntry;
  onPress: () => void;
  canResubmit: boolean;
  onReupload?: () => void;
}) {
  const chipStyle = getStatusChipStyle(entry.status);
  const isWorkout = entry.type === 'workout';
  const isExemption = isExemptionRequest(entry);
  const points = entry.effectivePoints ?? entry.rrValue;

  return (
    <Pressable onPress={onPress}>
      <Card variant="secondary" className="p-4">
        {/* Top row: activity + status */}
        <View className="flex-row justify-between items-center gap-2">
          <View className="flex-row items-center gap-2 flex-1">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={{
                backgroundColor: isWorkout
                  ? mflColors.brandLight
                  : isExemption
                    ? mflColors.amberLight
                    : '#dbeafe',
              }}
            >
              <Feather
                name={isWorkout ? 'activity' : isExemption ? 'shield' : 'moon'}
                size={16}
                color={isWorkout ? mflColors.brand : isExemption ? mflColors.amber : '#2563eb'}
              />
            </View>
            <View className="flex-1">
              <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {isWorkout
                  ? formatWorkoutType(entry.workoutType, entry.customActivityName)
                  : isExemption
                    ? 'Exemption'
                    : 'Rest Day'}
              </AppText>
              {points != null && (
                <AppText className="text-xs text-muted">
                  {points} pts
                </AppText>
              )}
            </View>
          </View>
          <Chip
            size="sm"
            variant="soft"
            color="accent"
            style={{ backgroundColor: chipStyle.bgColor }}
          >
            <Chip.Label style={{ color: chipStyle.color }}>
              {getStatusLabel(entry.status)}
            </Chip.Label>
          </Chip>
        </View>

        {/* Date + duration summary */}
        <AppText className="text-xs text-muted mt-1">
          {formatDate(entry.date)}
          {entry.duration != null ? ` · ${entry.duration} min` : ''}
        </AppText>

        {/* Reupload indicator */}
        {entry.reuploadOf && (
          <View className="flex-row items-center gap-1 mt-1">
            <Feather name="refresh-cw" size={10} color="#3b82f6" />
            <AppText className="text-[10px]" style={{ color: '#3b82f6' }}>
              Re-submitted
            </AppText>
          </View>
        )}

        <Separator className="my-1" />

        {/* Metrics row */}
        <View className="flex-row gap-4 flex-wrap">
          {entry.duration != null && (
            <View className="gap-0.5">
              <AppText className="text-[10px] text-muted">Duration</AppText>
              <AppText className="text-xs font-medium text-foreground">
                {entry.duration} min
              </AppText>
            </View>
          )}

          {entry.distance != null && (
            <View className="gap-0.5">
              <AppText className="text-[10px] text-muted">Distance</AppText>
              <AppText className="text-xs font-medium text-foreground">
                {entry.distance} km
              </AppText>
            </View>
          )}

          {entry.steps != null && (
            <View className="gap-0.5">
              <AppText className="text-[10px] text-muted">Steps</AppText>
              <AppText className="text-xs font-medium text-foreground">
                {entry.steps.toLocaleString()}
              </AppText>
            </View>
          )}

          {entry.holes != null && (
            <View className="gap-0.5">
              <AppText className="text-[10px] text-muted">Holes</AppText>
              <AppText className="text-xs font-medium text-foreground">
                {entry.holes}
              </AppText>
            </View>
          )}
        </View>

        {entry.proofUrl && (
          <View className="flex-row items-center gap-1 mt-2">
            <Feather name="image" size={12} color={mflColors.textMuted} />
            <AppText className="text-[10px] text-muted">Proof attached — tap for details</AppText>
          </View>
        )}

        {/* Rejection reason */}
        {(entry.status === 'rejected' ||
          entry.status === 'rejected_resubmit' ||
          entry.status === 'rejected_permanent') &&
          entry.rejectionReason && (
            <View
              className="mt-2 rounded-lg p-2"
              style={{ backgroundColor: mflColors.dangerLight }}
            >
              <AppText className="text-[10px] font-medium" style={{ color: mflColors.danger }}>
                Rejection reason:
              </AppText>
              <AppText className="text-xs mt-0.5" style={{ color: mflColors.danger }}>
                {entry.rejectionReason}
              </AppText>
            </View>
          )}

        {/* Reupload button */}
        {canResubmit && onReupload && (
          <View className="mt-3">
            <Button variant="secondary" size="sm" onPress={onReupload} className="w-full">
              <Button.Label>Reupload</Button.Label>
            </Button>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function MyActivityScreen() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';
  const isChallengesOnly = activeLeague?.leagueMode === 'challenges_only';

  const { data: submissionsData, isLoading, isError, refetch } = useMySubmissions(leagueId);

  const submissions = submissionsData?.submissions ?? [];
  const stats = submissionsData?.stats ?? { total: 0, pending: 0, approved: 0, rejected: 0 };

  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const tzOffsetMinutes = useMemo(() => new Date().getTimezoneOffset(), []);

  const filteredSubmissions = useMemo(() => {
    const filterStatus = STATUS_FILTER_MAP[activeTab];
    if (!filterStatus) return submissions;
    if (filterStatus === 'rejected') {
      return submissions.filter((s) =>
        s.status === 'rejected' ||
        s.status === 'rejected_resubmit' ||
        s.status === 'rejected_permanent',
      );
    }
    return submissions.filter((s) => s.status === filterStatus);
  }, [submissions, activeTab]);

  // Track originals that already have a reupload child
  const originalsWithReupload = useMemo(() => {
    const parents = new Set<string>();
    submissions.forEach((sub) => {
      if (sub.reuploadOf) parents.add(sub.reuploadOf);
    });
    return parents;
  }, [submissions]);

  // Determine which submissions can be resubmitted (matches web logic)
  const resubmittableIds = useMemo(() => {
    const canResubmit = new Set<string>();
    submissions.forEach((sub) => {
      const rejectionTime = sub.modifiedDate || sub.createdDate;
      const windowOpen = isReuploadWindowOpen(rejectionTime, tzOffsetMinutes);
      if (
        sub.reuploadOf === null &&
        (sub.status === 'rejected' || sub.status === 'rejected_resubmit') &&
        !originalsWithReupload.has(sub.id) &&
        windowOpen
      ) {
        canResubmit.add(sub.id);
      }
    });
    return canResubmit;
  }, [submissions, originalsWithReupload, tzOffsetMinutes]);

  const restDaysUsed = useMemo(
    () => submissions.filter((s) => s.type === 'rest' && s.status === 'approved').length,
    [submissions],
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Loading
  if (isLoading) {
    return <ScreenState screen="my-activity" state="loading" />;
  }

  // Error
  if (isError) {
    return (
      <ScreenState
        screen="my-activity"
        state="error"
        message="Failed to load your submissions."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-4 pb-12">
        {/* Header */}
        <AppText className="text-[22px] font-bold text-foreground">My Activity</AppText>

        {/* Stats Cards */}
        <StatsCards stats={stats} restDaysUsed={restDaysUsed} />

        {/* Sub-tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusTab)}>
          <Tabs.List>
            {STATUS_TABS.map((tab) => (
              <Tabs.Trigger key={tab} value={tab}>
                <Tabs.Label>{tab}</Tabs.Label>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>

        {/* Submission list */}
        {filteredSubmissions.length === 0 ? (
          <ScreenState
            screen="my-activity"
            state="empty"
            message={
              activeTab === 'All'
                ? 'No submissions yet. Log your first activity!'
                : `No ${activeTab.toLowerCase()} submissions.`
            }
            actionLabel={activeTab === 'All' && !isChallengesOnly ? 'Log Activity' : undefined}
            onAction={
              activeTab === 'All' && !isChallengesOnly
                ? () => router.push(AppRoutes.logActivity)
                : undefined
            }
          />
        ) : (
          <View className="gap-3">
            {filteredSubmissions.map((entry) => (
              <SubmissionCard
                key={entry.id}
                entry={entry}
                onPress={() =>
                  router.push({
                    pathname: AppRoutes.submissionDetail,
                    params: { submissionId: entry.id },
                  })
                }
                canResubmit={resubmittableIds.has(entry.id)}
                onReupload={
                  resubmittableIds.has(entry.id)
                    ? () =>
                        router.push({
                          pathname: AppRoutes.reuploadSubmission,
                          params: { submissionId: entry.id },
                        })
                    : undefined
                }
              />
            ))}
          </View>
        )}
      </View>

      {/* FAB */}
      {!isChallengesOnly && (
        <Pressable
          className="absolute right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{
            bottom: 32,
            backgroundColor: mflColors.brand,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => router.push(AppRoutes.logActivity)}
        >
          {({ pressed }) => (
            <View style={pressed ? { opacity: 0.85, transform: [{ scale: 0.95 }] } : undefined}>
              <Feather name="plus" size={28} color={mflColors.white} />
            </View>
          )}
        </Pressable>
      )}
    </ScreenScrollView>
  );
}
