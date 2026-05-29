import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchChatHistory } from '../services/ai-coach.service';
import { toAiCoachMessage } from '../mappers/ai-coach.mapper';
import { sortCoachMessages } from '../utils/sort-coach-messages';
import type { AiCoachMessage } from '../types/ai-coach.model';

export function useCoachHistory(leagueId: string) {
  return useQuery<AiCoachMessage[]>({
    queryKey: queryKeys.leagues.aiCoachHistory(leagueId),
    queryFn: async () => {
      const dto = await fetchChatHistory(leagueId);
      const messages = dto.messages.map(toAiCoachMessage);
      return sortCoachMessages(messages);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}
