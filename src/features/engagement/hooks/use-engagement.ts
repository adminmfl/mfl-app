import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchEngagement } from '../services/engagement.service';
import { toEngagementData } from '../mappers/engagement.mapper';
import type { EngagementData } from '../types/engagement.model';

export function useEngagement(leagueId: string) {
  return useQuery<EngagementData>({
    queryKey: queryKeys.leagues.engagement(leagueId),
    queryFn: async () => {
      const res = await fetchEngagement(leagueId);
      return toEngagementData(res.data);
    },
    enabled: !!leagueId,
  });
}
