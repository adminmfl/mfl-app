import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { reuploadSubmission } from '../services/submission.service';
import { toSubmissionEntry } from '../mappers/submission.mapper';
import type { ReuploadSubmissionRequestDTO } from '../types/submission.dto';
import type { SubmissionEntry } from '../types/submission.model';

interface ReuploadVars {
  submissionId: string;
  data: ReuploadSubmissionRequestDTO;
}

export function useReuploadSubmission() {
  const queryClient = useQueryClient();

  return useMutation<SubmissionEntry, Error, ReuploadVars>({
    mutationFn: async ({ submissionId, data }) => {
      const dto = await reuploadSubmission(submissionId, data);
      return toSubmissionEntry(dto.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries.all });
    },
  });
}
