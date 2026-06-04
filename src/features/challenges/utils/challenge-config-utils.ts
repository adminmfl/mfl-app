import { mflColors } from '../../../constants/colors';
import type { ChallengeStatus, ChallengeType } from '../types/challenge.model';

export const CHALLENGE_TYPES: Array<{ value: ChallengeType; label: string; description: string }> = [
  {
    value: 'individual',
    label: 'Individual',
    description: 'All members participate. Score each submission.',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Selected members participate. Assign one score to the team.',
  },
  {
    value: 'sub_team',
    label: 'Sub-Team',
    description: 'Sub-groups participate. Assign one score per sub-team.',
  },
  {
    value: 'tournament',
    label: 'Tournament',
    description: 'Bracket-style tournament with fixtures and standings.',
  },
];

export function formatChallengeType(type: ChallengeType | string): string {
  const match = CHALLENGE_TYPES.find((item) => item.value === type);
  return match?.label ?? type.replace(/_/g, ' ');
}

export function getChallengeTypeDescription(type: ChallengeType): string {
  return CHALLENGE_TYPES.find((item) => item.value === type)?.description ?? '';
}

export function formatChallengeDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function toDateInput(value: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function getStatusLabel(status: ChallengeStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'active':
      return 'Active';
    case 'submission_closed':
      return 'Submissions Closed';
    case 'published':
      return 'Scores Published';
    case 'closed':
      return 'Challenge Closed';
    default:
      return status;
  }
}

export function getStatusColors(status: ChallengeStatus): { color: string; bgColor: string } {
  switch (status) {
    case 'draft':
    case 'closed':
      return { color: mflColors.textSub, bgColor: mflColors.inkLight };
    case 'scheduled':
      return { color: mflColors.blue, bgColor: mflColors.blueLight };
    case 'active':
    case 'published':
      return { color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'submission_closed':
      return { color: mflColors.amber, bgColor: mflColors.amberLight };
    default:
      return { color: mflColors.textMuted, bgColor: mflColors.surface };
  }
}

export function isReviewEnabled(type: ChallengeType, status: ChallengeStatus): boolean {
  if (type === 'team') return status !== 'draft';
  return status === 'submission_closed' || status === 'published';
}

export function canPublishChallenge(
  type: ChallengeType,
  status: ChallengeStatus,
  pendingCount: number,
): boolean {
  if (type === 'tournament') return false;
  if (type === 'team') return status !== 'draft' && status !== 'published';
  return status === 'submission_closed' && pendingCount === 0;
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}
