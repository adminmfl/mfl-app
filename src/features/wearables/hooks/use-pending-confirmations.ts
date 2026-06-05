import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchPendingConfirmations,
  confirmWorkout,
  rejectWorkout,
} from '../services/wearable.service';
import { toPendingWorkout } from '../mappers/wearable.mapper';
import type { PendingWorkout, ConfirmResult } from '../types/wearable.model';

export function usePendingConfirmations(leagueId: string) {
  return useQuery<PendingWorkout[]>({
    queryKey: queryKeys.leagues.pendingConfirmations(leagueId),
    queryFn: async () => {
      const dto = await fetchPendingConfirmations(leagueId);
      return dto.data.pending_workouts.map(toPendingWorkout);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}

export function useConfirmWorkout() {
  const queryClient = useQueryClient();

  return useMutation<ConfirmResult, Error, { leagueId: string; workoutId: string }>({
    mutationFn: async ({ leagueId, workoutId }) => {
      const res = await confirmWorkout(leagueId, workoutId);
      return { pointsAwarded: res.data.points_awarded };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.pendingConfirmations(variables.leagueId),
      });
    },
  });
}

export function useRejectWorkout() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { leagueId: string; workoutId: string }>({
    mutationFn: async ({ leagueId, workoutId }) => {
      const res = await rejectWorkout(leagueId, workoutId);
      return { success: res.success };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.pendingConfirmations(variables.leagueId),
      });
    },
  });
}
