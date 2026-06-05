import { useMemo } from 'react';
import { View, Pressable, Linking } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Button, Card, Chip } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { ChallengeStatusBadge } from './challenge-status-badge';
import { SubmissionStatusBadge } from './submission-status-badge';
import {
  getChallengeTypeLabel,
  formatDateLabel,
  formatSubmissionDate,
  canSubmitChallenge,
  getSubmitButtonLabel,
} from '../utils/challenge-helpers';
import { isReuploadWindowOpen } from '../../submissions/utils/reupload-window';
import type { Challenge } from '../types/challenge.model';
import { mflColors } from '../../../constants/colors';

interface ChallengeListCardProps {
  challenge: Challenge;
  onPress: () => void;
  onSubmitProof: () => void;
}

export function ChallengeListCard({ challenge, onPress, onSubmitProof }: ChallengeListCardProps) {
  const mySubmission = challenge.mySubmission as {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    proof_url: string;
    reviewed_at: string | null;
    created_at: string;
  } | null;

  const tzOffsetMinutes = useMemo(() => new Date().getTimezoneOffset(), []);

  const isReuploadOpen = useMemo(() => {
    if (!mySubmission || mySubmission.status !== 'rejected') return false;
    const rejectionTime = mySubmission.reviewed_at || mySubmission.created_at;
    return isReuploadWindowOpen(rejectionTime, tzOffsetMinutes);
  }, [mySubmission, tzOffsetMinutes]);

  const showSubmitButton = canSubmitChallenge(
    challenge.status,
    challenge.challengeType,
    challenge.isUniqueWorkout,
    mySubmission,
    isReuploadOpen,
  );

  const submitLabel = getSubmitButtonLabel(challenge.isUniqueWorkout, mySubmission);

  const isMuted =
    challenge.status === 'published' ||
    challenge.status === 'closed' ||
    challenge.status === 'submission_closed';

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card
        className="shadow-none border border-separator mb-3"
        style={isMuted ? { opacity: 0.7 } : undefined}
      >
        {/* Title + status badge */}
        <View className="flex-row justify-between items-start gap-2">
          <AppText
            className="text-lg font-bold flex-1 text-foreground"
            numberOfLines={1}
          >
            {challenge.name}
          </AppText>
          <ChallengeStatusBadge status={challenge.status} />
        </View>

        {/* Description */}
        {challenge.description ? (
          <AppText className="text-sm text-default-500 mt-1" numberOfLines={3}>
            {challenge.description}
          </AppText>
        ) : null}

        {/* Type badge + points */}
        <View className="flex-row items-center justify-between mt-3">
          <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.surface }}>
            <Chip.Label style={{ color: mflColors.textSub }}>
              {getChallengeTypeLabel(challenge.challengeType)}
            </Chip.Label>
          </Chip>
          <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.brandLight }}>
            <Chip.Label style={{ color: mflColors.brand }}>
              {challenge.totalPoints} pts
            </Chip.Label>
          </Chip>
        </View>

        {/* Tournament link */}
        {challenge.challengeType === 'tournament' && (
          <Pressable
            onPress={onPress}
            className="flex-row items-center gap-1 mt-3 py-2 px-3 rounded-lg border border-separator justify-center"
          >
            <Feather name="award" size={14} color={mflColors.brand} />
            <AppText className="text-sm font-medium" style={{ color: mflColors.brand }}>
              View Fixtures & Standings
            </AppText>
          </Pressable>
        )}

        {/* Date range */}
        {(challenge.startDate || challenge.endDate) && (
          <View className="flex-row items-center gap-1 mt-3">
            <Feather name="calendar" size={12} color={mflColors.textMuted} />
            <AppText className="text-xs text-muted">
              {challenge.startDate ? `Start: ${formatDateLabel(challenge.startDate)}` : ''}
              {challenge.startDate && challenge.endDate ? ' \u2022 ' : ''}
              {challenge.endDate ? `End: ${formatDateLabel(challenge.endDate)}` : ''}
            </AppText>
          </View>
        )}

        {/* Doc URL */}
        {challenge.docUrl ? (
          <Pressable
            onPress={() => Linking.openURL(challenge.docUrl!)}
            className="flex-row items-center gap-1 mt-2"
          >
            <Feather name="file-text" size={12} color={mflColors.brand} />
            <AppText className="text-xs" style={{ color: mflColors.brand }}>
              View Challenge Rules
            </AppText>
          </Pressable>
        ) : null}

        {/* Submission status section */}
        {mySubmission && (
          <View
            className="mt-3 p-3 rounded-lg"
            style={{ backgroundColor: mflColors.surface }}
          >
            <View className="flex-row items-center justify-between gap-2">
              <AppText className="text-xs font-medium text-foreground">
                Your Submission
              </AppText>
              <SubmissionStatusBadge status={mySubmission.status} />
            </View>
            <View className="flex-row items-center gap-2 mt-2">
              <AppText className="text-xs text-muted">
                Submitted: {formatSubmissionDate(mySubmission.created_at)}
              </AppText>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="mt-3">
          {showSubmitButton && (
            <Button
              variant="primary"
              size="sm"
              onPress={onSubmitProof}
              className="w-full"
            >
              <Button.Label>{submitLabel}</Button.Label>
            </Button>
          )}

          {mySubmission?.status === 'rejected' && !isReuploadOpen && (
            <AppText className="text-xs text-muted mt-2">
              Resubmission window closed.
            </AppText>
          )}

          {challenge.status === 'submission_closed' && !mySubmission && (
            <AppText className="text-xs text-muted">
              Submissions are closed.
            </AppText>
          )}

          {(challenge.status === 'published' || challenge.status === 'closed') && (
            <AppText className="text-xs text-muted">
              Challenge completed.
            </AppText>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
