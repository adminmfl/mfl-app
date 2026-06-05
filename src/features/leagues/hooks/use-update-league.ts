import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { updateLeague } from '../services/league-management.service';
import { toUpdateLeagueRequest } from '../mappers/league-management.mapper';
import type { UpdateLeagueInput } from '../types/league-management.model';

interface UpdateLeagueVars {
  leagueId: string;
  input: UpdateLeagueInput;
}

export function useUpdateLeague() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateLeagueVars>({
    mutationFn: async ({ leagueId, input }: UpdateLeagueVars) => {
      const requestDto = toUpdateLeagueRequest(input);
      await updateLeague(leagueId, requestDto);
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(leagueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
