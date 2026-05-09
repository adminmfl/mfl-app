import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface StatItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  pendingCount: number;
  captainApprovedCount: number;
  myDonationCount: number;
  approvedCount: number;
}

function DonationStat({ label, value, color }: StatItem) {
  return (
    <Card className="flex-1 p-3">
      <AppText className="text-lg font-bold" style={{ color }}>
        {value}
      </AppText>
      <AppText className="text-[11px] text-muted">{label}</AppText>
    </Card>
  );
}

export function DonationStatsRow({
  pendingCount,
  captainApprovedCount,
  myDonationCount,
  approvedCount,
}: Props) {
  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <DonationStat
          label="Pending"
          value={pendingCount}
          color={mflColors.amber}
        />
        <DonationStat
          label="Final Review"
          value={captainApprovedCount}
          color={mflColors.blue}
        />
      </View>
      <View className="flex-row gap-2">
        <DonationStat
          label="Mine"
          value={myDonationCount}
          color={mflColors.textSub}
        />
        <DonationStat
          label="Approved"
          value={approvedCount}
          color={mflColors.brand}
        />
      </View>
    </View>
  );
}
