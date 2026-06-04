import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { deleteLeague } from '../services/league-management.service';

export function useDeleteLeague() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (leagueId: string) => deleteLeague(leagueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
