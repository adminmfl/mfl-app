import { useQuery } from '@tanstack/react-query';
import { fetchChallenges } from '../services/challenge.service';
import { toChallenge } from '../mappers/challenge.mapper';
import type { Challenge } from '../types/challenge.model';

export function useChallenges(leagueId: string) {
  return useQuery<Challenge[]>({
    queryKey: ['challenges', leagueId],
    queryFn: async () => {
      const dto = await fetchChallenges(leagueId);
      return dto.data.active.map(toChallenge);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
