import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchMilestones } from '../services/ai-coach.service';
import { toMilestone } from '../mappers/ai-coach.mapper';
import type { Milestone } from '../types/ai-coach.model';

export function useMilestones(leagueId: string) {
  return useQuery<Milestone[]>({
    queryKey: queryKeys.leagues.aiCoachMilestones(leagueId),
    queryFn: async () => {
      const dto = await fetchMilestones(leagueId);
      return dto.milestones.map(toMilestone);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}
