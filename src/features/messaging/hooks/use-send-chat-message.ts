import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toChatMessage } from '../mappers/messaging.mapper';
import { sendChatMessage } from '../services/messaging.service';
import type {
  ChatMessage,
  SendChatMessageInput,
} from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage, Error, SendChatMessageInput>({
    mutationFn: async ({
      leagueId,
      content,
      teamId,
      messageType,
      visibility,
      isImportant,
      parentMessageId,
      deepLink,
      photoUrl,
    }) => {
      const response = await sendChatMessage(leagueId, {
        content,
        team_id: teamId ?? null,
        message_type: messageType,
        visibility,
        is_important: isImportant,
        parent_message_id: parentMessageId ?? null,
        deep_link: deepLink ?? null,
        photo_url: photoUrl ?? null,
      });
      return toChatMessage(response.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.messagesRoot(variables.leagueId),
      });
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.unread(variables.leagueId),
      });
    },
  });
}
