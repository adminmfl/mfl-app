import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { deleteCustomActivity } from '../services/custom-activity.service';
import type { DeleteCustomActivityResponseDTO } from '../types/custom-activity.dto';

export function useDeleteCustomActivity() {
  const queryClient = useQueryClient();

  return useMutation<DeleteCustomActivityResponseDTO, Error, string>({
    mutationFn: async (id) => {
      return deleteCustomActivity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customActivities.all });
    },
  });
}
