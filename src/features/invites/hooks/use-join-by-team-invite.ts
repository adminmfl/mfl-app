import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { joinByTeamInvite } from '../services/invite.service';
import { toJoinByTeamInviteResult } from '../mappers/invite.mapper';
import type { JoinByTeamInviteResult } from '../types/invite.model';

export function useJoinByTeamInvite() {
  const queryClient = useQueryClient();

  return useMutation<JoinByTeamInviteResult, Error, string>({
    mutationFn: async (code) => {
      const dto = await joinByTeamInvite(code);
      return toJoinByTeamInviteResult(dto);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.leagues() });
      if (result.leagueId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(result.leagueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.leagues.teams(result.leagueId) });
      }
    },
  });
}
