import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { upsertEntry } from '../services/submission.service';
import { toSubmissionEntry } from '../mappers/submission.mapper';
import type { UpsertEntryRequestDTO } from '../types/submission.dto';
import type { SubmissionEntry } from '../types/submission.model';

export function useUpsertEntry() {
  const queryClient = useQueryClient();

  return useMutation<SubmissionEntry, Error, UpsertEntryRequestDTO>({
    mutationFn: async (data) => {
      const dto = await upsertEntry(data);
      return toSubmissionEntry(dto.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries.all });
      if (variables.league_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.leagues.leaderboard(variables.league_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.leagues.dashboardSummary(variables.league_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.leagues.mySubmissions(variables.league_id),
        });
      }
    },
  });
}
