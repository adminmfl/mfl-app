import Feather from '@expo/vector-icons/Feather';
import { Pressable, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { SubmissionForValidation } from '../types/validation.model';

export type RejectionType = 'rejected_resubmit' | 'rejected_permanent';

const reasonInputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  minHeight: 96,
  fontSize: 15,
  color: mflColors.text,
  textAlignVertical: 'top' as const,
};

interface RejectSubmissionPanelProps {
  submission: SubmissionForValidation;
  rejectionType: RejectionType;
  rejectionReason: string;
  suspiciousProof: boolean;
  reviewerNotes?: string;
  isPrivileged?: boolean;
  isValidating: boolean;
  onTypeChange: (value: RejectionType) => void;
  onReasonChange: (value: string) => void;
  onSuspiciousProofChange: (value: boolean) => void;
  onReviewerNotesChange?: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RejectSubmissionPanel({
  submission,
  rejectionType,
  rejectionReason,
  suspiciousProof,
  reviewerNotes = '',
  isPrivileged = false,
  isValidating,
  onTypeChange,
  onReasonChange,
  onSuspiciousProofChange,
  onReviewerNotesChange,
  onCancel,
  onConfirm,
}: RejectSubmissionPanelProps) {
  const isPermanent = rejectionType === 'rejected_permanent';

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-lg font-bold text-foreground">Reject Submission</AppText>
          <AppText className="text-sm text-muted mt-1">
            {submission.member.username} · choose the rejection type and reason.
          </AppText>
        </View>
        <Pressable onPress={onCancel} hitSlop={12} className="w-9 h-9 items-center justify-center">
          <Feather name="x" size={22} color={mflColors.text} />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <RejectTypeChip
          title="Allow Resubmit"
          description="Player can upload proof again."
          active={rejectionType === 'rejected_resubmit'}
          onPress={() => onTypeChange('rejected_resubmit')}
        />
        <RejectTypeChip
          title="Permanent"
          description="Final rejection for this entry."
          active={isPermanent}
          danger
          onPress={() => onTypeChange('rejected_permanent')}
        />
      </View>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Reason</AppText>
        <TextInput
          style={reasonInputStyle}
          value={rejectionReason}
          onChangeText={onReasonChange}
          placeholder="Explain what the player needs to fix..."
          placeholderTextColor={mflColors.textMuted}
          multiline
        />
      </View>

      <Pressable
        onPress={() => onSuspiciousProofChange(!suspiciousProof)}
        className="flex-row items-start gap-3 rounded-xl border p-3"
        style={{
          borderColor: suspiciousProof ? mflColors.amber : mflColors.border,
          backgroundColor: suspiciousProof ? mflColors.amberLight : mflColors.card,
        }}
      >
        <Feather
          name={suspiciousProof ? 'check-square' : 'square'}
          size={20}
          color={suspiciousProof ? mflColors.amber : mflColors.textMuted}
        />
        <View className="flex-1">
          <AppText className="text-sm font-semibold text-foreground">
            Flag as suspicious proof
          </AppText>
          <AppText className="text-xs text-muted mt-1">
            Adds a strike to the player record and can trigger a final rejection when the threshold is reached.
          </AppText>
        </View>
      </Pressable>

      {isPrivileged && onReviewerNotesChange ? (
        <View className="gap-2">
          <AppText className="text-xs font-semibold text-muted uppercase">
            Reviewer Notes (Internal Only)
          </AppText>
          <TextInput
            style={{ ...reasonInputStyle, minHeight: 64 }}
            value={reviewerNotes}
            onChangeText={onReviewerNotesChange}
            placeholder="Internal notes visible only to host/governor..."
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
        </View>
      ) : null}

      {isPermanent ? (
        <View className="rounded-xl p-3" style={{ backgroundColor: mflColors.dangerLight }}>
          <AppText className="text-xs font-semibold" style={{ color: mflColors.danger }}>
            Permanent rejection prevents the player from resubmitting this proof.
          </AppText>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Button variant="secondary" size="lg" onPress={onCancel} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="lg"
          onPress={onConfirm}
          isDisabled={isValidating || !rejectionReason.trim()}
          className="flex-1"
        >
          {isValidating ? <Spinner size="sm" /> : <Button.Label>Reject</Button.Label>}
        </Button>
      </View>
    </Card>
  );
}

function RejectTypeChip({
  title,
  description,
  active,
  danger = false,
  onPress,
}: {
  title: string;
  description: string;
  active: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  const activeColor = danger ? mflColors.danger : mflColors.brand;

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-xl border p-3"
      style={{
        borderColor: active ? activeColor : mflColors.border,
        backgroundColor: active ? (danger ? mflColors.dangerLight : mflColors.brandLight) : mflColors.card,
      }}
    >
      <AppText className="text-sm font-bold" style={{ color: active ? activeColor : mflColors.text }}>
        {title}
      </AppText>
      <AppText className="text-[11px] text-muted mt-1">{description}</AppText>
    </Pressable>
  );
}
