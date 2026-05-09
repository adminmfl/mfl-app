import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchAnalytics } from '../services/analytics.service';
import { toLeagueAnalytics } from '../mappers/analytics.mapper';
import type { LeagueAnalytics } from '../types/analytics.model';

export function useAnalytics(leagueId: string) {
  return useQuery<LeagueAnalytics>({
    queryKey: queryKeys.leagues.analytics(leagueId),
    queryFn: async () => {
      const dto = await fetchAnalytics(leagueId);
      return toLeagueAnalytics(dto);
    },
    enabled: !!leagueId,
    staleTime: 10 * 60 * 1000, // 10 minutes — matches server cache
  });
}
