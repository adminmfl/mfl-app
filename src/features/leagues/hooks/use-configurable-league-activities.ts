import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  addLeagueActivity,
  fetchConfigurableLeagueActivities,
  removeLeagueActivity,
  updateLeagueActivityConfig,
} from '../services/activity-config.service';
import type {
  LeagueActivitiesConfigData,
  UpdateLeagueActivityConfigInput,
} from '../types/activity-config.model';

interface ActivityMutationVars {
  leagueId: string;
  activityId: string;
  isCustom: boolean;
}

export function useConfigurableLeagueActivities(
  leagueId: string,
  includeAll: boolean,
) {
  const queryClient = useQueryClient();
  const queryKey = [...queryKeys.leagues.activities(leagueId), { includeAll }];

  const query = useQuery<LeagueActivitiesConfigData>({
    queryKey,
    queryFn: async () => {
      const response = await fetchConfigurableLeagueActivities(
        leagueId,
        includeAll,
      );
      return response.data;
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.leagues.activities(leagueId),
    });
  };

  const addMutation = useMutation({
    mutationFn: ({ leagueId: id, activityId, isCustom }: ActivityMutationVars) =>
      addLeagueActivity(id, activityId, isCustom),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: ({ leagueId: id, activityId, isCustom }: ActivityMutationVars) =>
      removeLeagueActivity(id, activityId, isCustom),
    onSuccess: invalidate,
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({
      leagueId: id,
      input,
    }: {
      leagueId: string;
      input: UpdateLeagueActivityConfigInput;
    }) => updateLeagueActivityConfig(id, input),
    onSuccess: invalidate,
  });

  return {
    ...query,
    addMutation,
    removeMutation,
    updateConfigMutation,
  };
}
