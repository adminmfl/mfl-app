import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchUnreadCount } from '../services/message.service';

export function useUnreadCount(leagueId: string) {
  return useQuery<number>({
    queryKey: queryKeys.leagues.unreadCount(leagueId),
    queryFn: async () => {
      const dto = await fetchUnreadCount(leagueId);
      return dto.data.count;
    },
    enabled: !!leagueId,
    staleTime: 30 * 1000,
  });
}
