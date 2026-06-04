import { Chip } from 'heroui-native';
import type { ChallengeStatus } from '../types/challenge.model';
import { getChallengeStatusLabel } from '../utils/challenge-helpers';
import { mflColors } from '../../../constants/colors';

function getStatusColors(status: ChallengeStatus): { color: string; bgColor: string } {
  switch (status) {
    case 'draft':
    case 'scheduled':
      return { color: mflColors.accent, bgColor: mflColors.accentLight };
    case 'active':
      return { color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'submission_closed':
      return { color: mflColors.amber, bgColor: mflColors.amberLight };
    case 'published':
    case 'closed':
      return { color: mflColors.textMuted, bgColor: mflColors.surface };
    default:
      return { color: mflColors.text, bgColor: mflColors.surface };
  }
}

export function ChallengeStatusBadge({ status }: { status: ChallengeStatus }) {
  const { color, bgColor } = getStatusColors(status);
  const label = getChallengeStatusLabel(status);

  return (
    <Chip size="sm" variant="soft" style={{ backgroundColor: bgColor }}>
      <Chip.Label style={{ color }}>{label}</Chip.Label>
    </Chip>
  );
}
