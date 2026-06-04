import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { createLeague } from '../services/league-management.service';
import {
  toCreateLeagueRequest,
  toCreatedLeague,
} from '../mappers/league-management.mapper';
import type { CreateLeagueInput, CreatedLeague } from '../types/league-management.model';

export function useCreateLeague() {
  const queryClient = useQueryClient();

  return useMutation<CreatedLeague, Error, CreateLeagueInput>({
    mutationFn: async (input: CreateLeagueInput) => {
      const requestDto = toCreateLeagueRequest(input);
      const responseDto = await createLeague(requestDto);
      return toCreatedLeague(responseDto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
