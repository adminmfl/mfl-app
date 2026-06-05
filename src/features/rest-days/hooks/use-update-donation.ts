import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { updateDonationStatus } from '../services/rest-day.service';
import type { UpdateDonationResponseDTO } from '../types/rest-day.dto';

interface UpdateDonationVars {
  leagueId: string;
  donationId: number;
  action: 'approve' | 'reject';
}

export function useUpdateDonation() {
  const queryClient = useQueryClient();

  return useMutation<UpdateDonationResponseDTO, Error, UpdateDonationVars>({
    mutationFn: async ({ leagueId, donationId, action }) => {
      return updateDonationStatus(leagueId, donationId, action);
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.restDays(leagueId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.restDayDonations(leagueId),
      });
    },
  });
}
