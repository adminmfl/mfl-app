import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { toActivityCategory } from '../mappers/custom-activity.mapper';
import { fetchActivityCategories } from '../services/activity-category.service';
import type { ActivityCategory } from '../types/custom-activity.model';

export function useActivityCategories() {
  return useQuery<ActivityCategory[]>({
    queryKey: [...queryKeys.customActivities.all, 'activity-categories'],
    queryFn: async () => {
      const dto = await fetchActivityCategories();
      return dto.data.map(toActivityCategory);
    },
    staleTime: 5 * 60 * 1000,
  });
}
