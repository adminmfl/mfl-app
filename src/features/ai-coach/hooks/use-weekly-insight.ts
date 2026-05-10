import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchWeeklyInsights, generateWeeklyInsight } from '../services/ai-coach.service';
import { toWeeklyInsight } from '../mappers/ai-coach.mapper';
import type { WeeklyInsight } from '../types/ai-coach.model';

export function useWeeklyInsight(leagueId: string) {
  return useQuery<WeeklyInsight | null>({
    queryKey: queryKeys.leagues.aiCoachWeeklyInsight(leagueId),
    queryFn: async () => {
      const dto = await fetchWeeklyInsights(leagueId);
      if (dto.insights.length === 0) return null;
      return toWeeklyInsight(dto.insights[0]);
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateWeeklyInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leagueId: string) => generateWeeklyInsight(leagueId),
    onSuccess: (_data, leagueId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.aiCoachWeeklyInsight(leagueId),
      });
    },
  });
}
