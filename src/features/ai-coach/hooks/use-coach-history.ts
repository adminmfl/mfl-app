import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchChatHistory } from '../services/ai-coach.service';
import { toAiCoachMessage } from '../mappers/ai-coach.mapper';
import type { AiCoachMessage } from '../types/ai-coach.model';

export function useCoachHistory(leagueId: string) {
  return useQuery<AiCoachMessage[]>({
    queryKey: queryKeys.leagues.aiCoachHistory(leagueId),
    queryFn: async () => {
      const dto = await fetchChatHistory(leagueId);
      // Reverse: API returns ascending (oldest first), but inverted FlatList
      // needs descending (newest first) so newest appears at screen bottom.
      return dto.messages.map(toAiCoachMessage).reverse();
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000, // 1 minute
  });
}
