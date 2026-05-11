import { View } from 'react-native';

import { StatCard } from '../../../components/stat-card';
import { mflColors } from '../../../constants/colors';
import type { SubmissionStats } from '../types/validation.model';

interface ValidationSummaryCardsProps {
  stats: SubmissionStats;
}

export function ValidationSummaryCards({ stats }: ValidationSummaryCardsProps) {
  return (
    <View className="flex-row gap-2">
      <StatCard value={stats.total} label="Total" color={mflColors.accent} />
      <StatCard value={stats.pending} label="Pending" color={mflColors.amber} />
      <StatCard value={stats.approved} label="Approved" color={mflColors.brand} />
      <StatCard value={stats.rejected} label="Rejected" color={mflColors.danger} />
    </View>
  );
}
