import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchMessages } from '../services/message.service';
import { toMessage } from '../mappers/message.mapper';
import type { Message } from '../types/message.model';

export function useMessages(leagueId: string) {
  return useQuery<Message[]>({
    queryKey: queryKeys.leagues.messages(leagueId),
    queryFn: async () => {
      const dto = await fetchMessages(leagueId);
      return dto.data.messages.map(toMessage);
    },
    enabled: !!leagueId,
    staleTime: 30 * 1000,
  });
}
