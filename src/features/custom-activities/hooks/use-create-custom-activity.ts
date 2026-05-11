import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { toCustomActivity } from '../mappers/custom-activity.mapper';
import { createCustomActivity } from '../services/custom-activity.service';
import type {
  CreateCustomActivityInput,
  CustomActivity,
} from '../types/custom-activity.model';

export function useCreateCustomActivity() {
  const queryClient = useQueryClient();

  return useMutation<CustomActivity, Error, CreateCustomActivityInput>({
    mutationFn: async ({
      activityName,
      description,
      categoryId,
      measurementType,
      requiresProof,
      requiresNotes,
    }) => {
      const response = await createCustomActivity({
        activity_name: activityName,
        description,
        category_id: categoryId || undefined,
        measurement_type: measurementType,
        requires_proof: requiresProof,
        requires_notes: requiresNotes,
      });
      return toCustomActivity(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customActivities.all });
    },
  });
}
