import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchSuggestedQuestions } from '../services/ai-coach.service';
import { toSuggestedQuestion } from '../mappers/ai-coach.mapper';
import type { SuggestedQuestion } from '../types/ai-coach.model';

export function useSuggestedQuestions(leagueId: string) {
  return useQuery<SuggestedQuestion[]>({
    queryKey: queryKeys.leagues.aiCoachSuggestions(leagueId),
    queryFn: async () => {
      const dto = await fetchSuggestedQuestions(leagueId);
      return dto.questions.map(toSuggestedQuestion);
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
