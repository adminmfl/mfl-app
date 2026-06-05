import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchDonationsDetail } from '../services/rest-day.service';
import { toRestDayDonationsData } from '../mappers/rest-day.mapper';
import type { RestDayDonationsData } from '../types/rest-day.model';

export function useRestDayDonations(leagueId: string) {
  return useQuery<RestDayDonationsData>({
    queryKey: queryKeys.leagues.restDayDonations(leagueId),
    queryFn: async () => {
      const dto = await fetchDonationsDetail(leagueId);
      return toRestDayDonationsData(dto);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
