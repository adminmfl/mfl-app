import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { useRestDayDonations } from '../hooks/use-rest-day-donations';
import { useSubmitRestDayDonation } from '../hooks/use-submit-rest-day-donation';
import { useUpdateRestDayDonation } from '../hooks/use-update-rest-day-donation';
import type { CreateRestDayDonationInput } from '../types/rest-day-donation.model';
import {
  getApiErrorMessage,
  getCaptainApprovedDonations,
  getMyDonations,
  getPendingDonationsForRole,
} from '../utils/rest-day-donation-utils';
import { ApprovalQueue } from './approval-queue';
import { DonationStatsRow } from './donation-stats-row';
import { DonationTabs, type DonationTab } from './donation-tabs';
import { DonationRequestForm } from './donation-request-form';
import { MyDonationsList } from './my-donations-list';
import { RestDayDonationsHeader } from './rest-day-donations-header';

export function RestDayDonationsScreen() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor, isCaptain, isViceCaptain } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const showRestDays = (activeLeague?.restDays ?? 1) > 0;
  const isGovernorOrHost = isHost || isGovernor;
  const canApprove = isGovernorOrHost || isCaptain || isViceCaptain;
  const isCaptainOnly = (isCaptain || isViceCaptain) && !isGovernorOrHost;

  const donationsQuery = useRestDayDonations(leagueId);
  const submitMutation = useSubmitRestDayDonation();
  const updateMutation = useUpdateRestDayDonation();

  const [activeTab, setActiveTab] = useState<DonationTab>('request');
  const [successMessage, setSuccessMessage] = useState('');
  const [formResetToken, setFormResetToken] = useState(0);

  useEffect(() => {
    if (canApprove) {
      setActiveTab('approval');
    }
  }, [canApprove]);

  const data = donationsQuery.data;
  const donations = data?.donations ?? [];
  const members = data?.members ?? [];
  const userMemberId = data?.userMemberId ?? '';
  const userTeamId = data?.userTeamId ?? null;

  const pendingDonations = useMemo(
    () =>
      getPendingDonationsForRole({
        donations,
        isCaptainOnly,
        userTeamId,
      }),
    [donations, isCaptainOnly, userTeamId],
  );
  const captainApprovedDonations = useMemo(
    () => getCaptainApprovedDonations(donations),
    [donations],
  );
  const myDonations = useMemo(
    () => getMyDonations(donations, userMemberId),
    [donations, userMemberId],
  );
  const approvedCount = useMemo(
    () => donations.filter((donation) => donation.status === 'approved').length,
    [donations],
  );

  const approvalCount = isCaptainOnly
    ? pendingDonations.length
    : pendingDonations.length + captainApprovedDonations.length;

  const refresh = async () => {
    await donationsQuery.refetch();
  };

  const submitDonation = (input: CreateRestDayDonationInput) => {
    if (!leagueId) return;

    setSuccessMessage('');
    submitMutation.mutate(
      { leagueId, input },
      {
        onSuccess: () => {
          setSuccessMessage('Donation request submitted.');
          setFormResetToken((current) => current + 1);
          setActiveTab('my-donations');
        },
        onError: (error) => {
          Alert.alert(
            'Submission Failed',
            getApiErrorMessage(error, 'Failed to submit donation request.'),
          );
        },
      },
    );
  };

  const updateDonation = (donationId: string, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve';
    Alert.alert(
      isApprove ? 'Approve Donation' : 'Reject Donation',
      isApprove
        ? 'Approve this rest day donation?'
        : 'Reject this rest day donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isApprove ? 'Approve' : 'Reject',
          style: isApprove ? 'default' : 'destructive',
          onPress: () => {
            setSuccessMessage('');
            updateMutation.mutate(
              { leagueId, donationId, action },
              {
                onSuccess: (response) => {
                  setSuccessMessage(
                    response.message ||
                      (isApprove ? 'Donation approved.' : 'Donation rejected.'),
                  );
                },
                onError: (error) => {
                  Alert.alert(
                    'Update Failed',
                    getApiErrorMessage(error, 'Failed to update donation.'),
                  );
                },
              },
            );
          },
        },
      ],
    );
  };

  if (!activeLeague) {
    return (
      <ScreenState
        screen="rest-day-donations"
        state="empty"
        message="Select a league to manage rest day donations."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!showRestDays) {
    return (
      <ScreenState
        screen="rest-day-donations"
        state="empty"
        message="Rest days are not enabled for this league."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (donationsQuery.isLoading) {
    return (
      <ScreenState
        screen="rest-day-donations"
        state="loading"
        message="Loading donation requests..."
      />
    );
  }

  if (donationsQuery.isError) {
    return (
      <ScreenState
        screen="rest-day-donations"
        state="error"
        message={getApiErrorMessage(
          donationsQuery.error,
          'Failed to load donation requests.',
        )}
        actionLabel="Retry"
        onAction={() => {
          void donationsQuery.refetch();
        }}
      />
    );
  }

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerClassName="gap-5 pb-10"
      onRefresh={refresh}
    >
      <RestDayDonationsHeader
        leagueName={activeLeague.name}
        onBack={() => router.back()}
      />

      <DonationStatsRow
        pendingCount={pendingDonations.length}
        captainApprovedCount={captainApprovedDonations.length}
        myDonationCount={myDonations.length}
        approvedCount={approvedCount}
      />

      <DonationTabs
        activeTab={activeTab}
        canApprove={canApprove}
        approvalCount={approvalCount}
        onChange={setActiveTab}
      />

      {successMessage ? (
        <View
          className="rounded-lg p-3"
          style={{ backgroundColor: mflColors.brandLight }}
        >
          <AppText
            className="text-sm font-medium"
            style={{ color: mflColors.brand }}
          >
            {successMessage}
          </AppText>
        </View>
      ) : null}

      {activeTab === 'request' ? (
        <DonationRequestForm
          members={members}
          userMemberId={userMemberId}
          isSubmitting={submitMutation.isPending}
          resetToken={formResetToken}
          onSubmit={submitDonation}
        />
      ) : null}

      {activeTab === 'my-donations' ? (
        <MyDonationsList
          donations={myDonations}
          currentUserMemberId={userMemberId}
        />
      ) : null}

      {activeTab === 'approval' && canApprove ? (
        <ApprovalQueue
          pendingDonations={pendingDonations}
          captainApprovedDonations={captainApprovedDonations}
          currentUserMemberId={userMemberId}
          isGovernorOrHost={isGovernorOrHost}
          isUpdating={updateMutation.isPending}
          onApprove={(donationId) => updateDonation(donationId, 'approve')}
          onReject={(donationId) => updateDonation(donationId, 'reject')}
        />
      ) : null}
    </ScreenScrollView>
  );
}
