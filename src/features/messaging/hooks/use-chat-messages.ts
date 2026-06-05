import { useQuery } from '@tanstack/react-query';
import { toChatMessage } from '../mappers/messaging.mapper';
import { fetchChatMessages } from '../services/messaging.service';
import type { ChatFilter, ChatMessage } from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

interface UseChatMessagesParams {
  leagueId: string;
  teamId?: string | null;
  filter: ChatFilter;
  adminView: boolean;
}

export function useChatMessages({
  leagueId,
  teamId,
  filter,
  adminView,
}: UseChatMessagesParams) {
  return useQuery<ChatMessage[]>({
    queryKey: messagingQueryKeys.messages(leagueId, {
      teamId: teamId ?? null,
      filter,
      adminView,
    }),
    queryFn: async () => {
      const dto = await fetchChatMessages(leagueId, {
        teamId,
        filter,
        adminView,
      });
      return dto.data.messages.map(toChatMessage);
    },
    enabled: !!leagueId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}
