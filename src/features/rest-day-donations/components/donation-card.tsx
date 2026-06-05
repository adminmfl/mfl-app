import Feather from '@expo/vector-icons/Feather';
import { Alert, Linking, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { RestDayDonation } from '../types/rest-day-donation.model';
import { formatDonationDate } from '../utils/rest-day-donation-utils';
import { DonationStatusBadge } from './donation-status-badge';

interface Props {
  donation: RestDayDonation;
  currentUserMemberId: string;
  actionLabel?: string;
  approveLabel?: string;
  showActions?: boolean;
  showProof?: boolean;
  isUpdating?: boolean;
  onApprove?: (donationId: string) => void;
  onReject?: (donationId: string) => void;
}

async function openProof(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open proof', 'Try again later or view it in a browser.');
  }
}

export function DonationCard({
  donation,
  currentUserMemberId,
  actionLabel,
  approveLabel = 'Approve',
  showActions = false,
  showProof = true,
  isUpdating = false,
  onApprove,
  onReject,
}: Props) {
  const isSent = donation.donor.memberId === currentUserMemberId;
  const counterpart = isSent ? donation.receiver.username : donation.donor.username;

  return (
    <Card className="p-4">
      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {donation.donor.username}
              </AppText>
              <Feather name="arrow-right" size={14} color={mflColors.textMuted} />
              <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {donation.receiver.username}
              </AppText>
            </View>
            <AppText className="text-xs text-muted">
              {donation.daysTransferred}{' '}
              {donation.daysTransferred === 1 ? 'day' : 'days'} -{' '}
              {formatDonationDate(donation.createdAt)}
            </AppText>
            {actionLabel ? (
              <AppText className="text-xs text-muted">{actionLabel}</AppText>
            ) : (
              <AppText className="text-xs text-muted">
                {isSent ? 'Sent to' : 'Received from'} {counterpart}
              </AppText>
            )}
          </View>
          <DonationStatusBadge status={donation.status} />
        </View>

        {donation.captainApprovedAt ? (
          <AppText className="text-xs text-muted">
            Captain approved {formatDonationDate(donation.captainApprovedAt)}
          </AppText>
        ) : null}

        {donation.notes ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.surface }}
          >
            <AppText className="text-xs font-semibold text-foreground">
              Notes
            </AppText>
            <AppText className="mt-1 text-xs leading-5 text-muted">
              {donation.notes}
            </AppText>
          </View>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-2">
          {showProof && donation.proofUrl ? (
            <Button
              variant="secondary"
              size="sm"
              onPress={() => {
                void openProof(donation.proofUrl!);
              }}
            >
              <Button.Label>View Proof</Button.Label>
            </Button>
          ) : null}

          {showActions ? (
            <View className="flex-1 flex-row gap-2">
              <Button
                variant="primary"
                size="sm"
                onPress={() => onApprove?.(donation.id)}
                isDisabled={isUpdating}
                className="flex-1"
                style={{ backgroundColor: mflColors.brand }}
              >
                {isUpdating ? (
                  <Spinner size="sm" />
                ) : (
                  <Button.Label>{approveLabel}</Button.Label>
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => onReject?.(donation.id)}
                isDisabled={isUpdating}
                className="flex-1"
                style={{ borderColor: mflColors.danger }}
              >
                {isUpdating ? (
                  <Spinner size="sm" />
                ) : (
                  <Button.Label style={{ color: mflColors.danger }}>
                    Reject
                  </Button.Label>
                )}
              </Button>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
