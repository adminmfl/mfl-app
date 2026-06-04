import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { validateSubmission } from '../services/validation.service';
import type { ValidateSubmissionRequestDTO } from '../types/validation.dto';

interface ValidateSubmissionVars {
  submissionId: string | number;
  leagueId: string;
  data: ValidateSubmissionRequestDTO;
}

export function useValidateSubmission() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ValidateSubmissionVars>({
    mutationFn: async ({ submissionId, data }) => {
      const res = await validateSubmission(submissionId, data);
      return { success: res.success };
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.submissions(leagueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.teamSubmissions(leagueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.leaderboard(leagueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.analytics(leagueId) });
    },
  });
}
