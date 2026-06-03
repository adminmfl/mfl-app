import Feather from '@expo/vector-icons/Feather';
import { TextInput, View } from 'react-native';
import { Avatar, Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { SubmissionForValidation } from '../types/validation.model';
import {
  formatActivityName,
  formatPoints,
  formatStatusLabel,
  formatSubmissionDate,
  getInitials,
  getStatusColors,
  getSubmissionMetrics,
} from '../utils/validation-utils';

const pointsInputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 9,
  fontSize: 14,
  color: mflColors.text,
};

interface SubmissionValidationCardProps {
  submission: SubmissionForValidation;
  pointsUnit: string;
  awardedPointsText: string;
  canOverride: boolean;
  isValidating: boolean;
  onAwardedPointsChange: (submission: SubmissionForValidation, value: string) => void;
  onView: (submission: SubmissionForValidation) => void;
  onApprove: (submission: SubmissionForValidation) => void;
  onReject: (submission: SubmissionForValidation) => void;
}

export function SubmissionValidationCard({
  submission,
  pointsUnit,
  awardedPointsText,
  canOverride,
  isValidating,
  onAwardedPointsChange,
  onView,
  onApprove,
  onReject,
}: SubmissionValidationCardProps) {
  const statusColors = getStatusColors(submission.status);
  const metrics = getSubmissionMetrics(submission);
  const isPending = submission.status === 'pending';
  const canApprove = isPending || (canOverride && submission.status !== 'approved');
  const canReject =
    isPending ||
    (canOverride && !['rejected_resubmit', 'rejected_permanent'].includes(submission.status));

  return (
    <Card className="p-4 gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-row items-center flex-1">
          <Avatar size="md" alt={submission.member.username}>
            <Avatar.Fallback>
              {getInitials(submission.member.username, submission.member.email)}
            </Avatar.Fallback>
          </Avatar>
          <View className="flex-1 ml-3">
            <AppText className="text-sm font-bold text-foreground" numberOfLines={1}>
              {submission.member.username}
            </AppText>
            <AppText className="text-xs text-muted mt-0.5" numberOfLines={1}>
              {submission.member.teamName || 'Unassigned'}
            </AppText>
            {submission.member.suspiciousProofStrikes > 0 ? (
              <View className="self-start mt-1 px-2 py-0.5 rounded-full bg-default-100 border border-default-200">
                <AppText className="text-[10px] text-muted">
                  {submission.member.suspiciousProofStrikes} strike
                  {submission.member.suspiciousProofStrikes === 1 ? '' : 's'}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <View className="items-end">
          <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
            {formatPoints(submission, pointsUnit)}
          </AppText>
          <AppText className="text-[10px] text-muted mt-0.5">
            {formatSubmissionDate(submission.date)}
          </AppText>
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center flex-1">
          <Feather
            name={submission.type === 'workout' ? 'activity' : 'moon'}
            size={15}
            color={mflColors.textMuted}
          />
          <AppText className="text-sm text-foreground ml-2 flex-1" numberOfLines={1}>
            {formatActivityName(submission)}
          </AppText>
        </View>
        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: statusColors.bgColor }}
        >
          <AppText className="text-[10px] font-bold" style={{ color: statusColors.color }}>
            {formatStatusLabel(submission.status)}
          </AppText>
        </View>
      </View>

      {metrics.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {metrics.map((metric) => (
            <View key={metric.label} className="px-3 py-2 rounded-xl bg-default-100">
              <AppText className="text-[10px] text-muted">{metric.label}</AppText>
              <AppText className="text-xs font-semibold text-foreground mt-0.5">
                {metric.value}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {submission.proofUrl ? (
        <AppText className="text-xs text-muted">Proof attached — tap View for full details</AppText>
      ) : null}

      {submission.plausibilityScore != null && submission.plausibilityScore < 50 ? (
        <View
          className="flex-row items-center gap-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: mflColors.dangerLight }}
        >
          <Feather name="alert-triangle" size={14} color={mflColors.danger} />
          <AppText className="text-[10px] font-semibold flex-1" style={{ color: mflColors.danger }}>
            Plausibility {submission.plausibilityScore}/100
            {submission.reviewTier && submission.reviewTier !== 'none'
              ? ` · Flagged for ${submission.reviewTier}`
              : ''}
          </AppText>
        </View>
      ) : null}

      {submission.rejectionReason ? (
        <View className="rounded-xl p-3" style={{ backgroundColor: mflColors.dangerLight }}>
          <AppText className="text-[10px] font-semibold" style={{ color: mflColors.danger }}>
            Rejection reason
          </AppText>
          <AppText className="text-xs mt-1" style={{ color: mflColors.danger }} numberOfLines={2}>
            {submission.rejectionReason}
          </AppText>
        </View>
      ) : null}

      <View className="flex-row gap-2 pt-1">
        <Button variant="secondary" size="sm" onPress={() => onView(submission)} className="flex-1">
          <Button.Label>View</Button.Label>
        </Button>

        {canReject ? (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onReject(submission)}
            isDisabled={isValidating}
          >
            <Button.Label style={{ color: mflColors.danger }}>Reject</Button.Label>
          </Button>
        ) : null}
      </View>

      {canApprove ? (
        <View className="flex-row gap-2">
          <TextInput
            style={{ ...pointsInputStyle, flex: 1 }}
            value={awardedPointsText}
            onChangeText={(value) => onAwardedPointsChange(submission, value)}
            placeholder="Pts override"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="numeric"
          />
          <Button
            variant="primary"
            size="md"
            onPress={() => onApprove(submission)}
            isDisabled={isValidating}
          >
            {isValidating ? <Spinner size="sm" /> : <Button.Label>Approve</Button.Label>}
          </Button>
        </View>
      ) : null}
    </Card>
  );
}
