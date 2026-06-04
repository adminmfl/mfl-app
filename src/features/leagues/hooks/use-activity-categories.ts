import { useQuery } from '@tanstack/react-query';
import { fetchActivityCategories } from '../services/activity-config.service';
import type { ActivityCategory } from '../types/activity-config.model';

export function useActivityCategories() {
  return useQuery<ActivityCategory[]>({
    queryKey: ['activity-categories'],
    queryFn: fetchActivityCategories,
    staleTime: 10 * 60 * 1000,
  });
}
