import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../core/config';
import {
  createRestDayDonation,
  uploadDonationProof,
} from '../services/rest-day-donation.service';
import type {
  CreateRestDayDonationInput,
} from '../types/rest-day-donation.model';
import type { CreateRestDayDonationResponseDTO } from '../types/rest-day-donation.dto';

interface SubmitRestDayDonationVars {
  leagueId: string;
  input: CreateRestDayDonationInput;
}

export function useSubmitRestDayDonation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateRestDayDonationResponseDTO,
    Error,
    SubmitRestDayDonationVars
  >({
    mutationFn: async ({ leagueId, input }) => {
      const uploadResult = await uploadDonationProof(leagueId, input.proofFile);

      return createRestDayDonation(leagueId, {
        receiver_member_id: input.receiverMemberId,
        days_transferred: input.daysTransferred,
        notes: input.notes,
        proof_url: uploadResult.data.url,
      });
    },
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
