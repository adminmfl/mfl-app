import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { RestDayDonationStatus } from '../types/rest-day-donation.model';
import { getStatusLabel } from '../utils/rest-day-donation-utils';

function getStatusColors(status: RestDayDonationStatus) {
  switch (status) {
    case 'approved':
      return { color: mflColors.brand, backgroundColor: mflColors.brandLight };
    case 'captain_approved':
      return { color: mflColors.blue, backgroundColor: mflColors.blueLight };
    case 'rejected':
      return { color: mflColors.danger, backgroundColor: mflColors.dangerLight };
    case 'pending':
    default:
      return { color: mflColors.amber, backgroundColor: mflColors.amberLight };
  }
}

export function DonationStatusBadge({
  status,
}: {
  status: RestDayDonationStatus;
}) {
  const colors = getStatusColors(status);
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2 py-1"
      style={{ backgroundColor: colors.backgroundColor }}
    >
      {status === 'pending' || status === 'captain_approved' ? (
        <Feather name="clock" size={11} color={colors.color} />
      ) : null}
      <AppText className="text-[11px] font-semibold" style={{ color: colors.color }}>
        {getStatusLabel(status)}
      </AppText>
    </View>
  );
}
