import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { createDonation } from '../services/rest-day.service';
import type { CreateDonationRequestDTO } from '../types/rest-day.dto';

interface CreateDonationVars {
  leagueId: string;
  data: CreateDonationRequestDTO;
}

export function useDonateRestDay() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, CreateDonationVars>({
    mutationFn: async ({ leagueId, data }) => {
      return createDonation(leagueId, data);
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.restDays(leagueId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.restDayDonations(leagueId),
      });
    },
  });
}
