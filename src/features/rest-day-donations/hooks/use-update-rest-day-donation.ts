import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../core/config';
import { updateRestDayDonationStatus } from '../services/rest-day-donation.service';
import type { UpdateRestDayDonationResponseDTO } from '../types/rest-day-donation.dto';

interface UpdateRestDayDonationVars {
  leagueId: string;
  donationId: string;
  action: 'approve' | 'reject';
}

export function useUpdateRestDayDonation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateRestDayDonationResponseDTO,
    Error,
    UpdateRestDayDonationVars
  >({
    mutationFn: ({ leagueId, donationId, action }) =>
      updateRestDayDonationStatus(leagueId, donationId, action),
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.restDayDonations(leagueId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.restDays(leagueId),
      });
    },
  });
}
