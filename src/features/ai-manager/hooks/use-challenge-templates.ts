import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchAiManagerChallenges,
  fetchChallengeTemplates,
} from '../services/ai-manager.service';
import {
  toAiManagerChallenge,
  toChallengeTemplate,
} from '../mappers/ai-manager.mapper';

export const challengeTemplatesQueryKey = (leagueId: string) =>
  [...queryKeys.leagues.all, leagueId, 'ai-manager', 'challenge-templates'] as const;

export const aiManagerChallengesQueryKey = (leagueId: string) =>
  [...queryKeys.leagues.all, leagueId, 'ai-manager', 'active-challenges'] as const;

export function useChallengeTemplates(leagueId: string) {
  return useQuery({
    queryKey: challengeTemplatesQueryKey(leagueId),
    queryFn: async () => (await fetchChallengeTemplates(leagueId)).map(toChallengeTemplate),
    enabled: !!leagueId,
  });
}

export function useAiManagerChallenges(leagueId: string) {
  return useQuery({
    queryKey: aiManagerChallengesQueryKey(leagueId),
    queryFn: async () => (await fetchAiManagerChallenges(leagueId)).map(toAiManagerChallenge),
    enabled: !!leagueId,
  });
}
