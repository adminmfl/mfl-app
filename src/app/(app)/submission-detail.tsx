import Feather from '@expo/vector-icons/Feather';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View, Pressable, Image, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Separator } from 'heroui-native';

import { AppText } from '../../components/app-text';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useMySubmissions } from '../../features/submissions/hooks/use-my-submissions';
import { isReuploadWindowOpen } from '../../features/submissions/utils/reupload-window';
import type { SubmissionEntry } from '../../features/submissions/types/submission.model';
import { mflColors } from '../../constants/colors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatWorkoutType(
  workoutType: string | null,
  customActivityName?: string,
): string {
  if (customActivityName) return customActivityName;
  if (!workoutType) return 'General Workout';
  return workoutType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusLabel(status: SubmissionEntry['status']): string {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'rejected_resubmit': return 'Rejected (Retry)';
    case 'rejected_permanent': return 'Rejected (Final)';
    default: return status;
  }
}

function getStatusColor(status: SubmissionEntry['status']): string {
  switch (status) {
    case 'pending': return mflColors.amber;
    case 'approved': return '#16a34a';
    case 'rejected':
    case 'rejected_resubmit':
    case 'rejected_permanent':
      return mflColors.danger;
    default: return mflColors.textMuted;
  }
}

function isExemptionRequest(entry: SubmissionEntry): boolean {
  return entry.type === 'rest' && (entry.notes?.includes('[EXEMPTION_REQUEST]') ?? false);
}

// ---------------------------------------------------------------------------
// Metric Row
// ---------------------------------------------------------------------------

function MetricRow({ icon, label, value, unit }: {
  icon: string;
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <View
      className="flex-row items-center gap-3 p-3 rounded-lg"
      style={{ backgroundColor: mflColors.surface }}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{ backgroundColor: mflColors.brandLight }}
      >
        <Feather name={icon as any} size={20} color={mflColors.brand} />
      </View>
      <View className="flex-1">
        <AppText className="text-xs text-muted">{label}</AppText>
        <AppText className="text-base font-semibold text-foreground">
          {value}{unit ? ` ${unit}` : ''}
        </AppText>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SubmissionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: submissionsData } = useMySubmissions(leagueId);
  const submission = useMemo(
    () => submissionsData?.submissions.find((s) => s.id === submissionId) ?? null,
    [submissionsData, submissionId],
  );

  const tzOffsetMinutes = useMemo(() => new Date().getTimezoneOffset(), []);

  // Track if this original already has a reupload child
  const hasReuploadChild = useMemo(() => {
    if (!submission || !submissionsData) return false;
    return submissionsData.submissions.some((s) => s.reuploadOf === submission.id);
  }, [submission, submissionsData]);

  const canReuploadNow = useMemo(() => {
    if (!submission) return false;
    if (submission.reuploadOf !== null) return false; // only originals
    if (submission.status !== 'rejected' && submission.status !== 'rejected_resubmit') return false;
    if (hasReuploadChild) return false;
    const rejectionTime = submission.modifiedDate || submission.createdDate;
    return isReuploadWindowOpen(rejectionTime, tzOffsetMinutes);
  }, [submission, tzOffsetMinutes, hasReuploadChild]);

  if (!submission) {
    return <ScreenState screen="submission-detail" state="loading" />;
  }

  const isWorkout = submission.type === 'workout';
  const isExemption = isExemptionRequest(submission);
  const isRejected = ['rejected', 'rejected_resubmit', 'rejected_permanent'].includes(submission.status);
  const isSoftRejected = ['rejected', 'rejected_resubmit'].includes(submission.status);
  const isPermanentRejected = submission.status === 'rejected_permanent';
  const isReupload = Boolean(submission.reuploadOf);
  const windowExpired = isSoftRejected && !canReuploadNow;
  const points = submission.effectivePoints ?? submission.rrValue;

  const exemptionReason =
    isExemption && submission.notes
      ? submission.notes.replace('[EXEMPTION_REQUEST]', '').trim()
      : null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      contentContainerClassName="px-5 gap-4 pb-12"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row items-center pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="w-10 h-10 justify-center items-center rounded-full"
        >
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <AppText className="flex-1 text-xl font-bold text-foreground text-center">
          {isWorkout ? 'Workout Submission' : 'Rest Day'}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Status + reupload indicator */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather
            name={isWorkout ? 'activity' : 'moon'}
            size={20}
            color={isWorkout ? mflColors.brand : '#2563eb'}
          />
          <AppText className="text-base font-semibold text-foreground">
            {formatFullDate(submission.date)}
          </AppText>
        </View>
        <View className="flex-row items-center gap-2">
          {isReupload && (
            <View className="flex-row items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#dbeafe' }}>
              <Feather name="refresh-cw" size={10} color="#3b82f6" />
              <AppText className="text-[10px] font-medium" style={{ color: '#3b82f6' }}>
                Re-submitted
              </AppText>
            </View>
          )}
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: getStatusColor(submission.status) + '20' }}>
            <AppText className="text-xs font-semibold" style={{ color: getStatusColor(submission.status) }}>
              {getStatusLabel(submission.status)}
            </AppText>
          </View>
        </View>
      </View>

      {/* Rejection Alert */}
      {isRejected && (
        <View className="rounded-lg p-3" style={{ backgroundColor: mflColors.dangerLight }}>
          <AppText className="text-xs font-semibold" style={{ color: mflColors.danger }}>
            {isPermanentRejected ? 'Permanently Rejected' : 'Submission Rejected'}
          </AppText>
          {isPermanentRejected ? (
            <View>
              <AppText className="text-xs mt-1" style={{ color: mflColors.danger }}>
                This submission has been permanently rejected. You cannot resubmit.
              </AppText>
              {submission.rejectionReason && (
                <AppText className="text-xs mt-2 font-medium" style={{ color: mflColors.danger }}>
                  Reason: {submission.rejectionReason}
                </AppText>
              )}
            </View>
          ) : (
            <View>
              {canReuploadNow && (
                <View className="mt-1">
                  <AppText className="text-xs" style={{ color: mflColors.danger }}>
                    You can resubmit this workout with updated proof or corrections.
                  </AppText>
                  {submission.rejectionReason && (
                    <AppText className="text-xs mt-1 italic font-medium" style={{ color: mflColors.danger }}>
                      Reason: "{submission.rejectionReason}"
                    </AppText>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/reupload-submission' as any,
                        params: { submissionId: submission.id },
                      })
                    }
                  >
                    <Button.Label>Resubmit</Button.Label>
                  </Button>
                </View>
              )}
              {windowExpired && (
                <View className="mt-1">
                  <AppText className="text-xs" style={{ color: mflColors.danger }}>
                    Reupload window closed (allowed until next-day 11:59pm local time after rejection).
                  </AppText>
                  {submission.rejectionReason && (
                    <AppText className="text-xs mt-1 italic font-medium" style={{ color: mflColors.danger }}>
                      Reason: "{submission.rejectionReason}"
                    </AppText>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Exemption Alert */}
      {isExemption && (
        <View className="rounded-lg p-3" style={{ backgroundColor: mflColors.amberLight }}>
          <View className="flex-row items-center gap-1.5">
            <Feather name="shield" size={14} color={mflColors.amber} />
            <AppText className="text-xs font-semibold" style={{ color: mflColors.amber }}>
              Rest Day Exemption Request
            </AppText>
          </View>
          <AppText className="text-xs mt-1" style={{ color: mflColors.amber }}>
            This is an exemption request beyond the rest day limit.
          </AppText>
          {exemptionReason && (
            <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: mflColors.amber + '30' }}>
              <AppText className="text-xs italic" style={{ color: mflColors.amber }}>
                "{exemptionReason}"
              </AppText>
            </View>
          )}
        </View>
      )}

      {/* Workout Type */}
      {isWorkout && submission.workoutType && (
        <Card variant="secondary" className="p-3">
          <AppText className="text-xs text-muted">Activity Type</AppText>
          <AppText className="text-lg font-semibold text-foreground">
            {formatWorkoutType(submission.workoutType, submission.customActivityName)}
          </AppText>
        </Card>
      )}

      {/* Metrics Grid */}
      {isWorkout && (
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <MetricRow icon="clock" label="Duration" value={submission.duration} unit="min" />
            </View>
            <View className="flex-1">
              <MetricRow icon="map-pin" label="Distance" value={submission.distance?.toFixed(2)} unit="km" />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <MetricRow icon="trending-up" label="Steps" value={submission.steps?.toLocaleString()} />
            </View>
            <View className="flex-1">
              <MetricRow icon="target" label="Holes" value={submission.holes} />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <MetricRow icon="heart" label="Avg HR" value={submission.hrAvg} unit="bpm" />
            </View>
            <View className="flex-1">
              <MetricRow icon="zap" label="Calories" value={submission.caloriesBurned} unit="kcal" />
            </View>
          </View>
        </View>
      )}

      {/* Custom Fields */}
      {(submission.customFieldValue || submission.customFieldValue2) && (
        <View className="gap-2">
          <AppText className="text-sm font-medium text-foreground">Custom Fields</AppText>
          <View className="flex-row gap-3">
            {submission.customFieldValue && (
              <View className="flex-1 p-3 rounded-lg border" style={{ borderColor: mflColors.border, backgroundColor: mflColors.surface }}>
                <AppText className="text-[10px] text-muted">
                  {submission.customFieldLabel || 'Field 1'}
                </AppText>
                <AppText className="text-sm font-medium text-foreground mt-0.5">
                  {submission.customFieldValue}
                </AppText>
              </View>
            )}
            {submission.customFieldValue2 && (
              <View className="flex-1 p-3 rounded-lg border" style={{ borderColor: mflColors.border, backgroundColor: mflColors.surface }}>
                <AppText className="text-[10px] text-muted">
                  {submission.customFieldLabel2 || 'Field 2'}
                </AppText>
                <AppText className="text-sm font-medium text-foreground mt-0.5">
                  {submission.customFieldValue2}
                </AppText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Points Earned */}
      {points != null && (
        <View
          className="p-4 rounded-lg"
          style={{ backgroundColor: mflColors.brandLight }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <AppText className="text-xs text-muted">Points Earned</AppText>
              <AppText className="text-2xl font-bold" style={{ color: mflColors.brand }}>
                {points} pts
              </AppText>
            </View>
            <Feather name="target" size={28} color={mflColors.brand + '50'} />
          </View>
        </View>
      )}

      <Separator />

      {/* Proof Image */}
      <View className="gap-2">
        <AppText className="text-sm font-medium text-foreground">Proof</AppText>
        {submission.proofUrl ? (
          <View>
            <Pressable
              onPress={() => submission.proofUrl && Linking.openURL(submission.proofUrl)}
              className="rounded-lg overflow-hidden"
              style={{ maxHeight: 300 }}
            >
              <Image
                source={{ uri: submission.proofUrl }}
                style={{ width: '100%', height: 300 }}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable
              onPress={() => submission.proofUrl && Linking.openURL(submission.proofUrl)}
              className="mt-2"
            >
              <AppText className="text-xs" style={{ color: mflColors.brand }}>
                Open Full Image
              </AppText>
            </Pressable>
          </View>
        ) : (
          <View
            className="items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed"
            style={{ borderColor: mflColors.border }}
          >
            <Feather name="image" size={24} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted">No proof attached</AppText>
          </View>
        )}
      </View>

      {/* Plausibility Details */}
      {submission.plausibilityScore != null && (
        <View className="gap-2">
          <AppText className="text-sm font-medium text-foreground">Plausibility Details</AppText>
          <View
            className="p-3 rounded-lg"
            style={{
              backgroundColor: submission.plausibilityScore < 50 ? mflColors.dangerLight : mflColors.surface,
              borderWidth: 1,
              borderColor: submission.plausibilityScore < 50 ? mflColors.danger + '30' : mflColors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <AppText className="text-sm font-semibold text-foreground">Plausibility Score</AppText>
              <View
                className="px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: submission.plausibilityScore < 50 ? mflColors.danger : mflColors.brand,
                }}
              >
                <AppText className="text-[10px] font-bold" style={{ color: '#fff' }}>
                  {submission.plausibilityScore}/100
                </AppText>
              </View>
            </View>
            {submission.plausibilityReason ? (
              <AppText className="text-xs text-muted">{submission.plausibilityReason}</AppText>
            ) : null}
            {(submission.reviewTier === 'captain' || submission.reviewTier === 'governor') ? (
              <AppText className="text-xs font-semibold mt-2" style={{ color: mflColors.danger }}>
                Flagged for {submission.reviewTier} review
              </AppText>
            ) : null}
          </View>
        </View>
      )}

      {/* Notes */}
      {submission.notes && !isExemption && (
        <View className="gap-2">
          <AppText className="text-sm font-medium text-foreground">Notes</AppText>
          <View className="p-3 rounded-lg" style={{ backgroundColor: mflColors.surface }}>
            <AppText className="text-sm text-foreground">
              {submission.notes}
            </AppText>
          </View>
        </View>
      )}

      <Separator />

      {/* Submission Metadata */}
      <View className="gap-1">
        <AppText className="text-xs text-muted">
          Submitted: {formatTimestamp(submission.createdDate)}
        </AppText>
        {submission.modifiedDate !== submission.createdDate && (
          <AppText className="text-xs text-muted">
            Last updated: {formatTimestamp(submission.modifiedDate)}
          </AppText>
        )}
      </View>
    </ScrollView>
  );
}
