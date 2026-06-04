import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchCustomActivities } from '../services/custom-activity.service';
import { toCustomActivity } from '../mappers/custom-activity.mapper';
import type { CustomActivity } from '../types/custom-activity.model';

export function useCustomActivities() {
  return useQuery<CustomActivity[]>({
    queryKey: queryKeys.customActivities.all,
    queryFn: async () => {
      const dto = await fetchCustomActivities();
      return dto.data.map(toCustomActivity);
    },
    staleTime: 5 * 60 * 1000,
  });
}
