import { Chip } from 'heroui-native';
import { mflColors } from '../../../constants/colors';

type SubmissionStatus = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending Review', color: mflColors.amber, bgColor: mflColors.amberLight },
  approved: { label: 'Approved', color: mflColors.brand, bgColor: mflColors.brandLight },
  rejected: { label: 'Rejected', color: mflColors.danger, bgColor: mflColors.dangerLight },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Chip size="sm" variant="soft" style={{ backgroundColor: cfg.bgColor }}>
      <Chip.Label style={{ color: cfg.color }}>{cfg.label}</Chip.Label>
    </Chip>
  );
}
