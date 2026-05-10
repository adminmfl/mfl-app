import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchLeagueSponsors,
  updateSponsorSlots,
} from '../services/sponsor.service';
import { toLeagueSponsorSlot } from '../utils/sponsor-mapper';
import type { LeagueSponsorSlot } from '../types/sponsor.model';
import type { SponsorSlotUpdateDTO } from '../types/sponsor.dto';

export function useLeagueSponsors(leagueId: string) {
  return useQuery<LeagueSponsorSlot[]>({
    queryKey: queryKeys.leagues.sponsors(leagueId),
    queryFn: async () => {
      const dto = await fetchLeagueSponsors(leagueId);
      return (dto.data ?? []).map(toLeagueSponsorSlot);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateSponsorSlots(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: SponsorSlotUpdateDTO[]) =>
      updateSponsorSlots(leagueId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.sponsors(leagueId),
      });
    },
  });
}
