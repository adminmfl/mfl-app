import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchLeagueRules,
  updateLeagueRules,
  deleteRulesDocument,
} from '../services/league-management.service';
import { toLeagueRules } from '../mappers/league-management.mapper';
import type {
  LeagueRules,
  PickedRulesDocument,
} from '../types/league-management.model';

export function useLeagueRules(leagueId: string) {
  return useQuery<LeagueRules>({
    queryKey: queryKeys.leagues.rules(leagueId),
    queryFn: async () => {
      const dto = await fetchLeagueRules(leagueId);
      return toLeagueRules(dto);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}

interface UpdateRulesVars {
  leagueId: string;
  rulesSummary: string;
  file?: PickedRulesDocument | null;
}

export function useUpdateLeagueRules() {
  const queryClient = useQueryClient();

  return useMutation<LeagueRules, Error, UpdateRulesVars>({
    mutationFn: async ({ leagueId, rulesSummary, file }: UpdateRulesVars) => {
      const dto = await updateLeagueRules(leagueId, rulesSummary, file);
      return toLeagueRules(dto);
    },
    onSuccess: (data, { leagueId }) => {
      queryClient.setQueryData(queryKeys.leagues.rules(leagueId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.rules(leagueId) });
    },
  });
}

export function useDeleteRulesDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (leagueId: string) => {
      await deleteRulesDocument(leagueId);
    },
    onSuccess: (_data, leagueId) => {
      queryClient.setQueryData<LeagueRules>(
        queryKeys.leagues.rules(leagueId),
        (current) =>
          current
            ? { ...current, rulesDocUrl: null, fileType: 'unknown' }
            : current,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.rules(leagueId) });
    },
  });
}
