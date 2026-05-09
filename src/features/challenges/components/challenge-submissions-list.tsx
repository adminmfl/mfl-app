import { View } from 'react-native';
import { Avatar, Card, Chip, Separator } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import type { ChallengeSubmission } from '../types/challenge.model';

interface ChallengeSubmissionsListProps {
  submissions: ChallengeSubmission[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ChallengeSubmissionsList({
  submissions,
  isLoading,
  isError,
  onRetry,
}: ChallengeSubmissionsListProps) {
  if (isLoading) {
    return <ScreenState screen="challenge-detail" state="loading" />;
  }

  if (isError) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="error"
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="empty"
        message="No submissions yet"
      />
    );
  }

  return (
    <Card className="shadow-none border border-separator">
      {submissions.map((sub, idx) => (
        <View key={sub.submissionId}>
          {idx > 0 && <Separator />}
          <SubmissionRow submission={sub} />
        </View>
      ))}
    </Card>
  );
}

function statusTag(status: ChallengeSubmission['status']) {
  switch (status) {
    case 'approved':
      return { label: 'Approved', color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'rejected':
      return { label: 'Rejected', color: mflColors.danger, bgColor: mflColors.dangerLight };
    case 'pending':
    default:
      return { label: 'Pending', color: mflColors.amber, bgColor: mflColors.amberLight };
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function SubmissionRow({ submission }: { submission: ChallengeSubmission }) {
  const st = statusTag(submission.status);

  return (
    <View className="flex-row items-center py-2 gap-3 px-3">
      <Avatar size="sm" alt={submission.username}>
        <Avatar.Fallback>
          <AppText className="text-xs font-bold">{getInitials(submission.username)}</AppText>
        </Avatar.Fallback>
      </Avatar>
      <View className="flex-1 gap-1">
        <AppText className="text-base font-semibold text-foreground" numberOfLines={1}>
          {submission.username}
        </AppText>
        {submission.teamName ? (
          <AppText className="text-xs text-muted" numberOfLines={1}>
            {submission.teamName}
          </AppText>
        ) : null}
        <Chip size="sm" variant="soft" style={{ backgroundColor: st.bgColor }}>
          <Chip.Label style={{ color: st.color }}>{st.label}</Chip.Label>
        </Chip>
      </View>
      <AppText
        className="font-mono"
        style={{ fontSize: 14, lineHeight: 20, color: mflColors.text }}
      >
        {submission.pointsAwarded ?? 0} pts
      </AppText>
    </View>
  );
}
