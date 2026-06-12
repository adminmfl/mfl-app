import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchLeaderboard,
  fetchLeaderboardTeamMetadata,
} from '../services/leaderboard.service';
import type { LeaderboardDataDTO } from '../types/leaderboard.dto';
import { getTimezoneParams } from '../utils/leaderboard-format';
import { buildLeaderboardViewData } from '../utils/leaderboard-transform';

export interface LeaderboardDateFilter {
  startDate?: string;
  endDate?: string;
}

export function useMobileLeaderboard(
  leagueId: string,
  dateFilter: LeaderboardDateFilter,
) {
  const timezoneParams = getTimezoneParams();
  const params = {
    ...timezoneParams,
    ...(dateFilter.startDate ? { startDate: dateFilter.startDate } : {}),
    ...(dateFilter.endDate ? { endDate: dateFilter.endDate } : {}),
  };

  return useQuery<LeaderboardDataDTO>({
    queryKey: queryKeys.leagues.leaderboard(
      leagueId,
      params as unknown as Record<string, string>,
    ),
    queryFn: async () => {
      const [leaderboardResponse, teamsResponse] = await Promise.all([
        fetchLeaderboard(leagueId, params),
        fetchLeaderboardTeamMetadata(leagueId).catch(() => undefined),
      ]);

      if (!leaderboardResponse.success) {
        throw new Error(
          leaderboardResponse.error || 'Failed to fetch leaderboard',
        );
      }

      return buildLeaderboardViewData(leaderboardResponse.data, teamsResponse);
    },
    enabled: !!leagueId,
    staleTime: 30_000,
  });
}
