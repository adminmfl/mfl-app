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
      // API ascending; bulk insert can share created_at — keep user before assistant.
      return dto.messages
        .map(toAiCoachMessage)
        .sort((a, b) => {
          const t =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (t !== 0) return t;
          if (a.role === b.role) return 0;
          return a.role === 'user' ? -1 : 1;
        })
        .reverse();
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}
