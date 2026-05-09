import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  createHostCustomActivity,
  deleteHostCustomActivity,
  fetchHostCustomActivities,
  updateHostCustomActivity,
} from '../services/activity-config.service';
import type {
  CustomActivityConfig,
  CustomActivityInput,
  UpdateCustomActivityInput,
} from '../types/activity-config.model';

export function useHostCustomActivities(leagueId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<CustomActivityConfig[]>({
    queryKey: queryKeys.customActivities.all,
    queryFn: fetchHostCustomActivities,
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.customActivities.all,
    });
    if (leagueId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.activities(leagueId),
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: (input: CustomActivityInput) => createHostCustomActivity(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateCustomActivityInput) =>
      updateHostCustomActivity(input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHostCustomActivity,
    onSuccess: invalidate,
  });

  return {
    ...query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
