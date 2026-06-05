import { useQuery } from '@tanstack/react-query';
import { fetchChallengeSubmissions } from '../services/challenge.service';
import { toChallengeSubmission } from '../mappers/challenge.mapper';
import type { ChallengeSubmission } from '../types/challenge.model';

export function useChallengeSubmissions(leagueId: string, challengeId: string) {
  return useQuery<ChallengeSubmission[]>({
    queryKey: ['challenges', leagueId, challengeId, 'submissions'],
    queryFn: async () => {
      const dto = await fetchChallengeSubmissions(leagueId, challengeId);
      return dto.data.map(toChallengeSubmission);
    },
    enabled: !!leagueId && !!challengeId,
    staleTime: 1 * 60 * 1000,
  });
}
