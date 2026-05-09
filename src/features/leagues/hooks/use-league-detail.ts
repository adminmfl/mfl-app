import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchLeagueDetail } from '../services/league.service';
import { toLeagueDetail } from '../mappers/league.mapper';
import type { LeagueDetail } from '../types/league.model';

export function useLeagueDetail(leagueId: string) {
  return useQuery<LeagueDetail>({
    queryKey: queryKeys.leagues.detail(leagueId),
    queryFn: async () => {
      const dto = await fetchLeagueDetail(leagueId);
      return toLeagueDetail(dto);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
