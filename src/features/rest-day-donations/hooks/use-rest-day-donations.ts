import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../core/config';
import { fetchRestDayDonations } from '../services/rest-day-donation.service';
import type { RestDayDonationsData } from '../types/rest-day-donation.model';
import { toRestDayDonationsData } from '../utils/rest-day-donation-mappers';

export function useRestDayDonations(leagueId: string) {
  return useQuery<RestDayDonationsData>({
    queryKey: queryKeys.leagues.restDayDonations(leagueId),
    queryFn: async () => {
      const dto = await fetchRestDayDonations(leagueId);
      return toRestDayDonationsData(dto);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
