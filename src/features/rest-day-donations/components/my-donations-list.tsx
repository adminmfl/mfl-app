import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import type { RestDayDonation } from '../types/rest-day-donation.model';
import { DonationCard } from './donation-card';

interface Props {
  donations: RestDayDonation[];
  currentUserMemberId: string;
}

export function MyDonationsList({ donations, currentUserMemberId }: Props) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <SectionLabel label="MY DONATION HISTORY" />
        <AppText className="text-xs text-muted">
          Donations you have sent or received.
        </AppText>
      </View>

      {donations.length === 0 ? (
        <Card className="p-4">
          <AppText className="py-5 text-center text-sm text-muted">
            No donations yet
          </AppText>
        </Card>
      ) : (
        donations.map((donation) => (
          <DonationCard
            key={donation.id}
            donation={donation}
            currentUserMemberId={currentUserMemberId}
          />
        ))
      )}
    </View>
  );
}
