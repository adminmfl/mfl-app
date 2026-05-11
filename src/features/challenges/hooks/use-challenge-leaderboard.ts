import { useQuery } from '@tanstack/react-query';
import { fetchChallengeLeaderboard } from '../services/challenge.service';
import { toChallengeLeaderboardEntry } from '../mappers/challenge.mapper';
import type { ChallengeLeaderboardEntry } from '../types/challenge.model';

export function useChallengeLeaderboard(leagueId: string, challengeId: string) {
  return useQuery<ChallengeLeaderboardEntry[]>({
    queryKey: ['challenges', leagueId, challengeId, 'leaderboard'],
    queryFn: async () => {
      const dto = await fetchChallengeLeaderboard(leagueId, challengeId);
      return dto.data.map(toChallengeLeaderboardEntry);
    },
    enabled: !!leagueId && !!challengeId,
    staleTime: 1 * 60 * 1000,
  });
}
