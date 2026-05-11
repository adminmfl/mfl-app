import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchAiUsage } from '../services/ai-usage.service';
import type { AiUsageDataDTO } from '../types/ai-usage.dto';

export function useAiUsage(leagueId: string, days: number = 30) {
  return useQuery<AiUsageDataDTO>({
    queryKey: queryKeys.leagues.aiUsage(leagueId, days),
    queryFn: async () => {
      const res = await fetchAiUsage(leagueId, days);
      return res.data;
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
