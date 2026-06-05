import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import type { RestDayDonation } from '../types/rest-day-donation.model';
import { DonationCard } from './donation-card';

interface Props {
  pendingDonations: RestDayDonation[];
  captainApprovedDonations: RestDayDonation[];
  currentUserMemberId: string;
  isGovernorOrHost: boolean;
  isUpdating: boolean;
  onApprove: (donationId: string) => void;
  onReject: (donationId: string) => void;
}

function EmptyQueue() {
  return (
    <Card className="p-4">
      <AppText className="py-5 text-center text-sm text-muted">
        No pending requests
      </AppText>
    </Card>
  );
}

export function ApprovalQueue({
  pendingDonations,
  captainApprovedDonations,
  currentUserMemberId,
  isGovernorOrHost,
  isUpdating,
  onApprove,
  onReject,
}: Props) {
  const hasPending = pendingDonations.length > 0;
  const hasCaptainApproved = captainApprovedDonations.length > 0;

  if (!hasPending && !hasCaptainApproved) {
    return <EmptyQueue />;
  }

  return (
    <View className="gap-5">
      <View className="gap-3">
        <View className="gap-1">
          <SectionLabel label="PENDING APPROVALS" />
          <AppText className="text-xs text-muted">
            Review and approve or reject donation requests.
          </AppText>
        </View>
        {hasPending ? (
          pendingDonations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              currentUserMemberId={currentUserMemberId}
              showActions
              isUpdating={isUpdating}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))
        ) : (
          <EmptyQueue />
        )}
      </View>

      {hasCaptainApproved ? (
        <View className="gap-3">
          <View className="gap-1">
            <SectionLabel
              label={
                isGovernorOrHost ? 'AWAITING FINAL APPROVAL' : 'APPROVED BY YOU'
              }
            />
            <AppText className="text-xs text-muted">
              {isGovernorOrHost
                ? 'These donations were approved by the Captain. Governor/Host final approval required.'
                : 'These donations have been approved and are awaiting final approval from Governor/Host.'}
            </AppText>
          </View>

          {captainApprovedDonations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              currentUserMemberId={currentUserMemberId}
              actionLabel={
                isGovernorOrHost ? 'Captain approved' : 'Awaiting Governor/Host'
              }
              showActions={isGovernorOrHost}
              approveLabel="Final Approve"
              isUpdating={isUpdating}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
