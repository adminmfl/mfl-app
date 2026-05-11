import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTeamBalance } from '../services/team.service';
import type { BalanceBreakdownDTO } from '../types/team.dto';

export function useTeamBalance(leagueId: string) {
  return useQuery<BalanceBreakdownDTO>({
    queryKey: queryKeys.leagues.teamBalance(leagueId),
    queryFn: async () => {
      const res = await fetchTeamBalance(leagueId);
      if (!res.success) throw new Error(res.error || 'Failed to fetch balance');
      return res.score;
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000, // 5 minutes — balance changes infrequently
  });
}
