import { useQuery } from '@tanstack/react-query';
import { fetchUnreadCount } from '../services/messaging.service';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

export function useUnreadChatCount(leagueId: string) {
  return useQuery<number>({
    queryKey: messagingQueryKeys.unread(leagueId),
    queryFn: async () => {
      const dto = await fetchUnreadCount(leagueId);
      return dto.data.unread ?? dto.data.count;
    },
    enabled: !!leagueId,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
}
