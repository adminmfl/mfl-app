import Feather from '@expo/vector-icons/Feather';
import { Image, Linking, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { SubmissionForValidation } from '../types/validation.model';
import { pointsInputStyle } from './validation-input-styles';
import {
  formatActivityName,
  formatPoints,
  formatStatusLabel,
  formatSubmissionDate,
  getStatusColors,
  getSubmissionMetrics,
} from '../utils/validation-utils';


interface SubmissionDetailPanelProps {
  submission: SubmissionForValidation;
  pointsUnit: string;
  awardedPointsText: string;
  canOverride: boolean;
  isValidating: boolean;
  onAwardedPointsChange: (submission: SubmissionForValidation, value: string) => void;
  onApprove: (submission: SubmissionForValidation) => void;
  onReject: (submission: SubmissionForValidation) => void;
  onClose: () => void;
}

export function SubmissionDetailPanel({
  submission,
  pointsUnit,
  awardedPointsText,
  canOverride,
  isValidating,
  onAwardedPointsChange,
  onApprove,
  onReject,
  onClose,
}: SubmissionDetailPanelProps) {
  const statusColors = getStatusColors(submission.status);
  const metrics = getSubmissionMetrics(submission);
  const isPending = submission.status === 'pending';
  const canApprove = isPending || (canOverride && submission.status !== 'approved');
  const canReject =
    isPending ||
    (canOverride && !['rejected_resubmit', 'rejected_permanent'].includes(submission.status));

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-lg font-bold text-foreground">Submission Details</AppText>
          <AppText className="text-sm text-muted mt-1">
            {submission.member.username} · {submission.member.teamName || 'Unassigned'}
          </AppText>
        </View>
        <Button variant="secondary" size="sm" onPress={onClose}>
          <Button.Label>Close</Button.Label>
        </Button>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <View
          className="px-3 py-1.5 rounded-full"
          style={{ backgroundColor: statusColors.bgColor }}
        >
          <AppText className="text-xs font-bold" style={{ color: statusColors.color }}>
            {formatStatusLabel(submission.status)}
          </AppText>
        </View>
        <AppText className="text-lg font-bold" style={{ color: mflColors.brand }}>
          {formatPoints(submission, pointsUnit)}
        </AppText>
      </View>

      <View className="rounded-xl p-3 bg-default-100 gap-3">
        <DetailRow icon="user" label="Member" value={submission.member.username} />
        <DetailRow icon="calendar" label="Date" value={formatSubmissionDate(submission.date)} />
        <DetailRow icon="activity" label="Activity" value={formatActivityName(submission)} />
        <DetailRow icon="award" label="Run Rate" value={`${Number(submission.rrValue).toFixed(1)} ${pointsUnit}`} />
        <DetailRow icon="clock" label="Submitted" value={formatSubmissionDate(submission.createdDate)} />
        {submission.modifiedDate ? (
          <DetailRow icon="refresh-cw" label="Modified" value={formatSubmissionDate(submission.modifiedDate)} />
        ) : null}
        {submission.reuploadOf ? (
          <DetailRow icon="upload-cloud" label="Reupload Of" value={`#${submission.reuploadOf}`} />
        ) : null}
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
        <View className="gap-2">
          <Image
            source={{ uri: submission.proofUrl }}
            style={{ width: '100%', height: 220, borderRadius: 12 }}
            resizeMode="cover"
          />
          <Button variant="secondary" size="sm" onPress={() => Linking.openURL(submission.proofUrl!)}>
            <Button.Label>Open Proof</Button.Label>
          </Button>
        </View>
      ) : (
        <View className="rounded-xl border border-dashed border-default-200 p-4 items-center">
          <AppText className="text-sm text-muted">No proof image attached.</AppText>
        </View>
      )}

      {submission.notes ? (
        <View className="rounded-xl p-3 bg-default-100">
          <AppText className="text-xs font-semibold text-muted uppercase">Notes</AppText>
          <AppText className="text-sm text-foreground mt-1">{submission.notes}</AppText>
        </View>
      ) : null}

      {submission.plausibilityScore != null ? (
        <View
          className="rounded-xl p-3 gap-2"
          style={{
            backgroundColor: submission.plausibilityScore < 50 ? mflColors.dangerLight : mflColors.surface,
            borderWidth: 1,
            borderColor: submission.plausibilityScore < 50 ? mflColors.danger + '30' : mflColors.border,
          }}
        >
          <View className="flex-row items-center justify-between">
            <AppText className="text-xs font-semibold text-foreground">Plausibility Score</AppText>
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
            <AppText className="text-xs font-semibold" style={{ color: mflColors.danger }}>
              Flagged for {submission.reviewTier} review
            </AppText>
          ) : null}
        </View>
      ) : null}

      {submission.reviewerNotes ? (
        <View
          className="rounded-xl p-3"
          style={{ backgroundColor: mflColors.amberLight, borderWidth: 1, borderColor: mflColors.amber + '30' }}
        >
          <View className="flex-row items-center gap-1.5 mb-1">
            <Feather name="shield" size={14} color={mflColors.amber} />
            <AppText className="text-[10px] font-bold uppercase" style={{ color: mflColors.amber }}>
              Reviewer Notes (Internal)
            </AppText>
          </View>
          <AppText className="text-xs" style={{ color: mflColors.amber }}>
            {submission.reviewerNotes}
          </AppText>
        </View>
      ) : null}

      {submission.rejectionReason ? (
        <View className="rounded-xl p-3" style={{ backgroundColor: mflColors.dangerLight }}>
          <AppText className="text-xs font-semibold" style={{ color: mflColors.danger }}>
            Rejection Reason
          </AppText>
          <AppText className="text-sm mt-1" style={{ color: mflColors.danger }}>
            {submission.rejectionReason}
          </AppText>
        </View>
      ) : null}

      {canApprove ? (
        <View className="gap-2">
          <AppText className="text-xs font-semibold text-muted uppercase">
            Awarded points override
          </AppText>
          <View className="flex-row gap-2">
            <TextInput
              style={{ ...pointsInputStyle, flex: 1 }}
              value={awardedPointsText}
              onChangeText={(value) => onAwardedPointsChange(submission, value)}
              placeholder="Pts"
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
        </View>
      ) : null}

      {canReject ? (
        <Button
          variant="secondary"
          size="lg"
          onPress={() => onReject(submission)}
          isDisabled={isValidating}
        >
          <Button.Label style={{ color: mflColors.danger }}>
            {isPending ? 'Reject Submission' : 'Override to Rejected'}
          </Button.Label>
        </Button>
      ) : null}
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Feather name={icon} size={16} color={mflColors.textMuted} />
      <View className="flex-1">
        <AppText className="text-[10px] text-muted uppercase">{label}</AppText>
        <AppText className="text-sm font-semibold text-foreground mt-0.5">{value}</AppText>
      </View>
    </View>
  );
}
