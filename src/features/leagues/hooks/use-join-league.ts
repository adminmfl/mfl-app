import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { joinByCode, joinByTeamInvite } from '../services/league-management.service';
import { toJoinLeagueResult } from '../mappers/league-management.mapper';
import type { JoinLeagueResult } from '../types/league-management.model';

export function useJoinLeague() {
  const queryClient = useQueryClient();

  return useMutation<JoinLeagueResult, Error, string>({
    mutationFn: async (code: string) => {
      // Match web: try league code first, fall back to team invite
      try {
        const dto = await joinByCode(code);
        return toJoinLeagueResult(dto);
      } catch (err) {
        // If league join fails, try team invite join (same as web)
        const teamDto = await joinByTeamInvite(code);
        return toJoinLeagueResult(teamDto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
