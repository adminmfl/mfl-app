import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWeightLossLogPlayer,
  fetchWeightLossLogHost,
  submitWeightLog,
} from '../services/challenge.service';
import {
  toWeightLogPlayerResponse,
  toWeightLogHostParticipant,
} from '../mappers/challenge.mapper';
import type {
  WeightLogPlayerResponse,
  WeightLogHostParticipant,
} from '../types/challenge.model';

export function useWeightLossLogPlayer(leagueId: string, challengeId: string) {
  return useQuery<WeightLogPlayerResponse, Error>({
    queryKey: ['weight-loss-log-player', leagueId, challengeId],
    queryFn: async () => {
      const res = await fetchWeightLossLogPlayer(leagueId, challengeId);
      return toWeightLogPlayerResponse(res);
    },
    enabled: !!leagueId && !!challengeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useWeightLossLogHost(leagueId: string, challengeId: string, enabled: boolean) {
  return useQuery<WeightLogHostParticipant[], Error>({
    queryKey: ['weight-loss-log-host', leagueId, challengeId],
    queryFn: async () => {
      const res = await fetchWeightLossLogHost(leagueId, challengeId);
      return (res.data || []).map(toWeightLogHostParticipant);
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitWeightLog(leagueId: string, challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { logType: 'start' | 'progress' | 'end'; weight: number }) =>
      submitWeightLog(leagueId, challengeId, data),
    onSuccess: () => {
      // Invalidate both player and host queries to ensure fresh data
      void queryClient.invalidateQueries({
        queryKey: ['weight-loss-log-player', leagueId, challengeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['weight-loss-log-host', leagueId, challengeId],
      });
    },
  });
}
