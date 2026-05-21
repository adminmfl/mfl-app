import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleChatReaction } from '../services/messaging.service';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

interface ToggleChatReactionVars {
  leagueId: string;
  messageId: string;
  emoji: string;
}

export function useToggleChatReaction() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ToggleChatReactionVars>({
    mutationFn: ({ leagueId, messageId, emoji }) =>
      toggleChatReaction(leagueId, messageId, emoji),
    onSettled: (_data, _error, variables) => {
      // Extract before any conditional so TypeScript keeps the narrowed type
      // inside closures (fixes re-widening to string | undefined in .map()).
      const { leagueId } = variables;
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.messagesRoot(leagueId),
      });
    },
  });
}
