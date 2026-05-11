import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchRestDaySummary } from '../services/rest-day.service';
import { toRestDaySummary } from '../mappers/rest-day.mapper';
import type { RestDaySummary } from '../types/rest-day.model';

export function useRestDays(leagueId: string) {
  return useQuery<RestDaySummary>({
    queryKey: queryKeys.leagues.restDays(leagueId),
    queryFn: async () => {
      const dto = await fetchRestDaySummary(leagueId);
      return toRestDaySummary(dto);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
