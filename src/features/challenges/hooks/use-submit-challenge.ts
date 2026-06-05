import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { submitChallengeProof } from '../services/challenge.service';
import { toChallengeSubmission } from '../mappers/challenge.mapper';
import type { ChallengeSubmission } from '../types/challenge.model';

interface SubmitChallengeVars {
  leagueId: string;
  challengeId: string;
  proofUrl?: string;
  workoutEntryId?: string;
}

export function useSubmitChallenge() {
  const queryClient = useQueryClient();

  return useMutation<ChallengeSubmission, Error, SubmitChallengeVars>({
    mutationFn: async ({ leagueId, challengeId, proofUrl, workoutEntryId }) => {
      const dto = await submitChallengeProof(leagueId, challengeId, {
        proofUrl,
        workoutEntryId,
      });
      return toChallengeSubmission(dto.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.challenges(variables.leagueId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.challengeDetail(
          variables.leagueId,
          variables.challengeId,
        ),
      });
    },
  });
}
