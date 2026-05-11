import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { toCustomActivity } from '../mappers/custom-activity.mapper';
import { updateCustomActivity } from '../services/custom-activity.service';
import type {
  CustomActivity,
  UpdateCustomActivityInput,
} from '../types/custom-activity.model';
import type { UpdateCustomActivityPayloadDTO } from '../types/custom-activity.dto';

export function useUpdateCustomActivity() {
  const queryClient = useQueryClient();

  return useMutation<CustomActivity, Error, UpdateCustomActivityInput>({
    mutationFn: async ({
      customActivityId,
      activityName,
      description,
      categoryId,
      measurementType,
      requiresProof,
      requiresNotes,
    }) => {
      const payload: UpdateCustomActivityPayloadDTO = {
        custom_activity_id: customActivityId,
        activity_name: activityName,
        description,
        measurement_type: measurementType,
        requires_proof: requiresProof,
        requires_notes: requiresNotes,
      };

      if (categoryId !== undefined) {
        payload.category_id = categoryId || null;
      }

      const response = await updateCustomActivity(payload);
      return toCustomActivity(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customActivities.all });
    },
  });
}
