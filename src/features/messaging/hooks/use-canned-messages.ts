import { useQuery } from '@tanstack/react-query';
import { toCannedMessage } from '../mappers/messaging.mapper';
import { fetchCannedMessages } from '../services/messaging.service';
import type { CannedMessage } from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

export function useCannedMessages(leagueId: string, enabled = true) {
  return useQuery<CannedMessage[]>({
    queryKey: messagingQueryKeys.cannedMessages(leagueId),
    queryFn: async () => {
      const dto = await fetchCannedMessages(leagueId);
      return dto.data.map(toCannedMessage);
    },
    enabled: enabled && !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
