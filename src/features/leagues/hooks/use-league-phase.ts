import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../core/api';
import type { LeaguePhase, LeaguePhaseInfo } from '../types/league-phase.model';

export function useLeaguePhase(leagueId: string) {
  const query = useQuery<LeaguePhaseInfo>({
    queryKey: ['leagues', leagueId, 'phase'],
    queryFn: async () => {
      const res = await api.get<{ data: LeaguePhaseInfo }>(`/api/leagues/${leagueId}/phase`);
      return res.data.data;
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });

  return query;
}

export function useTransitionPhase(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nextPhase: LeaguePhase) => {
      const res = await api.post(`/api/leagues/${leagueId}/phase`, { nextPhase });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'phase'] });
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId] });
    },
  });
}
