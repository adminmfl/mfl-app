import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { createChallenge } from '../services/challenge.service';
import type { ChallengeMutationInput } from '../services/challenge.service';

interface CreateChallengeVars extends ChallengeMutationInput {
  leagueId: string;
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, CreateChallengeVars>({
    mutationFn: async ({ leagueId, ...data }) => {
      const result = await createChallenge(leagueId, data);
      return { success: result.success };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.challenges(variables.leagueId),
      });
    },
  });
}
