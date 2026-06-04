import { useQuery } from '@tanstack/react-query';
import { toChatMember } from '../mappers/messaging.mapper';
import { fetchChatMembers } from '../services/messaging.service';
import type { ChatMember } from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

export function useChatMembers(leagueId: string, enabled = true) {
  return useQuery<ChatMember[]>({
    queryKey: messagingQueryKeys.members(leagueId),
    queryFn: async () => {
      const dto = await fetchChatMembers(leagueId);
      return dto.data.map(toChatMember);
    },
    enabled: enabled && !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
