import { useQuery } from '@tanstack/react-query';
import { toRecentWorkout } from '../mappers/messaging.mapper';
import { fetchRecentWorkouts } from '../services/messaging.service';
import type { RecentWorkout } from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

export function useRecentWorkouts(leagueId: string, enabled = true) {
  return useQuery<RecentWorkout[]>({
    queryKey: messagingQueryKeys.recentWorkouts(leagueId),
    queryFn: async () => {
      const dto = await fetchRecentWorkouts(leagueId);
      return dto.data.submissions
        .map(toRecentWorkout)
        .filter((entry) => entry.type === 'workout')
        .slice(0, 12);
    },
    enabled: enabled && !!leagueId,
    staleTime: 60 * 1000,
  });
}
