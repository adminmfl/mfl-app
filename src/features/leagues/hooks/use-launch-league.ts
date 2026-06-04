import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { launchLeague } from '../services/league-management.service';

export function useLaunchLeague() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (leagueId: string) => launchLeague(leagueId),
    onSuccess: (_data, leagueId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(leagueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
