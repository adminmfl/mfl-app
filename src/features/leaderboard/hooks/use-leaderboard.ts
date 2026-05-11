import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchLeaderboard } from '../services/leaderboard.service';
import { toLeaderboard } from '../mappers/leaderboard.mapper';
import type { Leaderboard } from '../types/leaderboard.model';

export function useLeaderboard(
  leagueId: string,
  params?: { startDate?: string; endDate?: string; ianaTimezone?: string }
) {
  return useQuery<Leaderboard>({
    queryKey: queryKeys.leagues.leaderboard(leagueId, params as Record<string, string>),
    queryFn: async () => {
      const dto = await fetchLeaderboard(leagueId, params);
      return toLeaderboard(dto);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000, // 1 minute
  });
}
