import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { useTeamSubmissions } from '../../features/team/hooks/use-team-submissions';
import { RejectSubmissionPanel, type RejectionType } from '../../features/validation/components/reject-submission-panel';
import { SubmissionDetailPanel } from '../../features/validation/components/submission-detail-panel';
import { SubmissionValidationCard } from '../../features/validation/components/submission-validation-card';
import { ValidationSummaryCards } from '../../features/validation/components/validation-summary-cards';
import { useValidateSubmission } from '../../features/validation/hooks/use-validate-submission';
import type { ValidateSubmissionRequestDTO } from '../../features/validation/types/validation.dto';
import type {
  SubmissionForValidation,
  SubmissionId,
} from '../../features/validation/types/validation.model';
import {
  filterSubmissions,
  type StatusFilter,
} from '../../features/validation/utils/validation-utils';
import { TeamSubmissionsFilterPanel } from '../../features/team/components/team-submissions-filter-panel';

export default function TeamActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isCaptain, isViceCaptain, isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const canUsePage = isCaptain || isViceCaptain || isHost || isGovernor;
  const queryLeagueId = canUsePage ? leagueId : '';
  const showRR = (activeLeague?.rrConfig?.formula || 'standard') === 'standard';
  const pointsUnit = showRR ? 'RR' : 'pts';

  const submissionsQuery = useTeamSubmissions(queryLeagueId);
  const validateMutation = useValidateSubmission();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [awardedPointsById, setAwardedPointsById] = useState<Record<string, string>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionForValidation | null>(null);
  const [rejectSubmission, setRejectSubmission] = useState<SubmissionForValidation | null>(null);
  const [rejectionType, setRejectionType] = useState<RejectionType>('rejected_resubmit');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspiciousProof, setSuspiciousProof] = useState(false);
  const [validatingId, setValidatingId] = useState<SubmissionId | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);

  const data = submissionsQuery.data;
  const submissions = data?.submissions ?? [];
  const filteredSubmissions = useMemo(
    () =>
      filterSubmissions(submissions, {
        status: statusFilter,
        teamId: 'all',
        dateText: dateFilter,
        searchText,
      }),
    [dateFilter, searchText, statusFilter, submissions],
  );

  const handleRefresh = useCallback(async () => {
    await submissionsQuery.refetch();
  }, [submissionsQuery]);

  const handleAwardedPointsChange = useCallback(
    (submission: SubmissionForValidation, value: string) => {
      setAwardedPointsById((current) => ({
        ...current,
        [String(submission.id)]: value,
      }));
    },
    [],
  );

  const getAwardedPoints = useCallback(
    (submission: SubmissionForValidation): number | undefined | null => {
      const rawValue = awardedPointsById[String(submission.id)]?.trim();
      if (!rawValue) return undefined;
      const value = Number(rawValue);
      if (!Number.isFinite(value) || value < 0) {
        Alert.alert('Invalid Points', 'Awarded points must be a non-negative number.');
        return null;
      }
      return value;
    },
    [awardedPointsById],
  );

  const submitValidation = useCallback(
    (
      submission: SubmissionForValidation,
      status: ValidateSubmissionRequestDTO['status'],
      options?: { rejectionReason?: string; suspiciousProof?: boolean },
    ) => {
      if (!leagueId) return;

      const dataToSend: ValidateSubmissionRequestDTO = { status };

      if (status === 'approved') {
        const awardedPoints = getAwardedPoints(submission);
        if (awardedPoints === null) return;
        if (awardedPoints !== undefined) dataToSend.awarded_points = awardedPoints;
      } else {
        const reason = options?.rejectionReason?.trim();
        if (!reason) {
          Alert.alert('Reason Required', 'Add a rejection reason before rejecting this submission.');
          return;
        }
        dataToSend.rejection_reason = reason;
        dataToSend.suspicious_proof = options?.suspiciousProof ?? false;
      }

      setValidatingId(submission.id);
      validateMutation.mutate(
        {
          submissionId: submission.id,
          leagueId,
          data: dataToSend,
        },
        {
          onSuccess: () => {
            setSelectedSubmission(null);
            setRejectSubmission(null);
            setRejectionReason('');
            setSuspiciousProof(false);
            Alert.alert(
              status === 'approved' ? 'Submission Approved' : 'Submission Rejected',
              status === 'approved'
                ? 'The submission has been approved.'
                : 'The rejection has been saved.',
            );
          },
          onError: (error) => {
            Alert.alert('Validation Failed', error.message || 'Could not validate this submission.');
          },
          onSettled: () => {
            setValidatingId(null);
          },
        },
      );
    },
    [getAwardedPoints, leagueId, validateMutation],
  );

  const handleApprove = useCallback(
    (submission: SubmissionForValidation) => {
      submitValidation(submission, 'approved');
    },
    [submitValidation],
  );

  const openRejectPanel = useCallback((submission: SubmissionForValidation) => {
    setSelectedSubmission(null);
    setRejectSubmission(submission);
    setRejectionType('rejected_resubmit');
    setRejectionReason('');
    setSuspiciousProof(false);
  }, []);

  const confirmReject = useCallback(() => {
    if (!rejectSubmission) return;
    submitValidation(rejectSubmission, rejectionType, {
      rejectionReason,
      suspiciousProof,
    });
  }, [rejectSubmission, rejectionReason, rejectionType, submitValidation, suspiciousProof]);

  const roleLabel = isCaptain
    ? 'Captain'
    : isViceCaptain
      ? 'Vice Captain'
      : isHost
        ? 'Host'
        : isGovernor
          ? 'Governor'
          : '';

  if (!activeLeague) {
    return (
      <ScreenState
        screen="validation"
        state="empty"
        message="Select a league to view team submissions."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!canUsePage) {
    return (
      <ScreenState
        screen="validation"
        state="error"
        message="Only team captains and vice captains can validate team submissions."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (submissionsQuery.isLoading) {
    return <ScreenState screen="validation" state="loading" />;
  }

  if (submissionsQuery.isError) {
    return (
      <ScreenState
        screen="validation"
        state="error"
        message="Failed to load team submissions."
        actionLabel="Retry"
        onAction={() => submissionsQuery.refetch()}
      />
    );
  }

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
      onRefresh={handleRefresh}
    >
      <View className="gap-4 pb-12">
        {/* Header */}
        <View className="flex-row items-center py-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <AppText className="flex-1 text-xl font-bold text-foreground text-center">
            Team Submissions
          </AppText>
          <Button variant="secondary" size="sm" onPress={handleRefresh}>
            <Feather name="refresh-cw" size={16} color={mflColors.text} />
          </Button>
        </View>

        {/* Title section */}
        <View className="flex-row items-start gap-4">
          <View
            className="w-14 h-14 rounded-xl items-center justify-center"
            style={{ backgroundColor: mflColors.amber }}
          >
            <Feather name="clipboard" size={26} color="#fff" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View
                className="px-2.5 py-1 rounded-full"
                style={{ backgroundColor: mflColors.amberLight }}
              >
                <AppText
                  className="text-[10px] font-bold"
                  style={{ color: mflColors.amber }}
                >
                  {roleLabel}
                </AppText>
              </View>
              <AppText className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
                {activeLeague.teamName ?? activeLeague.name}
              </AppText>
            </View>
            <AppText className="text-sm text-muted mt-1">
              Validate submissions from your team members.
            </AppText>
          </View>
        </View>

        {/* Stats */}
        {data?.stats ? <ValidationSummaryCards stats={data.stats} /> : null}

        {/* Filters */}
        <TeamSubmissionsFilterPanel
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          searchText={searchText}
          onStatusChange={setStatusFilter}
          onDateChange={setDateFilter}
          onSearchChange={setSearchText}
        />

        {/* Reject Panel */}
        {rejectSubmission ? (
          <RejectSubmissionPanel
            submission={rejectSubmission}
            rejectionType={rejectionType}
            rejectionReason={rejectionReason}
            suspiciousProof={suspiciousProof}
            isValidating={String(validatingId) === String(rejectSubmission.id)}
            onTypeChange={setRejectionType}
            onReasonChange={setRejectionReason}
            onSuspiciousProofChange={setSuspiciousProof}
            onCancel={() => setRejectSubmission(null)}
            onConfirm={confirmReject}
          />
        ) : null}

        {/* Detail Panel */}
        {selectedSubmission ? (
          <SubmissionDetailPanel
            submission={selectedSubmission}
            pointsUnit={pointsUnit}
            awardedPointsText={awardedPointsById[String(selectedSubmission.id)] ?? ''}
            canOverride={false}
            isValidating={String(validatingId) === String(selectedSubmission.id)}
            onAwardedPointsChange={handleAwardedPointsChange}
            onApprove={handleApprove}
            onReject={openRejectPanel}
            onClose={() => setSelectedSubmission(null)}
          />
        ) : null}

        {/* Submissions Count + Toggle */}
        <View className="flex-row items-center justify-between">
          <SectionLabel
            label={`${filteredSubmissions.length} Submission${filteredSubmissions.length === 1 ? '' : 's'}`}
          />
          <Button
            variant={showSubmissions ? 'secondary' : 'primary'}
            size="sm"
            onPress={() => setShowSubmissions((v) => !v)}
          >
            <Feather
              name={showSubmissions ? 'eye-off' : 'eye'}
              size={14}
              color={showSubmissions ? mflColors.text : '#fff'}
            />
            <Button.Label>
              {showSubmissions ? 'Hide' : 'Show'} Submissions
            </Button.Label>
          </Button>
        </View>

        {/* Submissions List */}
        {showSubmissions ? (
          filteredSubmissions.length === 0 ? (
            <Card className="p-5">
              <AppText className="text-sm text-muted text-center py-6">
                {submissions.length === 0
                  ? 'No submissions from your team yet.'
                  : 'No submissions match your filters.'}
              </AppText>
            </Card>
          ) : (
            <View className="gap-3">
              {filteredSubmissions.map((submission) => (
                <SubmissionValidationCard
                  key={String(submission.id)}
                  submission={submission}
                  pointsUnit={pointsUnit}
                  awardedPointsText={awardedPointsById[String(submission.id)] ?? ''}
                  canOverride={false}
                  isValidating={String(validatingId) === String(submission.id)}
                  onAwardedPointsChange={handleAwardedPointsChange}
                  onView={setSelectedSubmission}
                  onApprove={handleApprove}
                  onReject={openRejectPanel}
                />
              ))}
            </View>
          )
        ) : null}
      </View>
    </ScreenScrollView>
  );
}
