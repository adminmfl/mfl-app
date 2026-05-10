import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchRecovery } from '../services/ai-coach.service';
import type { RecoveryInfo } from '../types/ai-coach.model';

export function useRecovery(leagueId: string) {
  return useQuery<RecoveryInfo>({
    queryKey: queryKeys.leagues.aiCoachRecovery(leagueId),
    queryFn: async () => {
      const dto = await fetchRecovery(leagueId);
      return {
        needsRecovery: dto.needsRecovery,
        daysSinceLastActivity: dto.daysSinceLastActivity,
        suggestion: dto.suggestion,
      };
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
