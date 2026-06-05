import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { assignMemberToTeam } from '../services/team.service';

export function useAssignMember(leagueId: string, teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leagueMemberId: string) =>
      assignMemberToTeam(leagueId, teamId, leagueMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.teamMembers(leagueId, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.teams(leagueId),
      });
    },
  });
}
