import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleChatReaction } from '../services/messaging.service';
import { messagingQueryKeys } from '../utils/messaging-query-keys';
import type { ChatMessage } from '../types/messaging.model';

interface ToggleChatReactionVars {
  leagueId: string;
  messageId: string;
  emoji: string;
  userId?: string;
}

export function useToggleChatReaction() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ToggleChatReactionVars>({
    mutationFn: ({ leagueId, messageId, emoji }) =>
      toggleChatReaction(leagueId, messageId, emoji),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: messagingQueryKeys.messagesRoot(variables.leagueId),
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueriesData({
        queryKey: messagingQueryKeys.messagesRoot(variables.leagueId),
      });

      // Optimistically update all message queries
      queryClient.setQueriesData<ChatMessage[]>(
        { queryKey: messagingQueryKeys.messagesRoot(variables.leagueId) },
        (old) => {
          if (!old) return old;
          
          return old.map((msg) => {
            if (msg.messageId !== variables.messageId) return msg;
            
            const existingReaction = msg.reactions.find(r => r.emoji === variables.emoji);
            
            if (existingReaction && variables.userId) {
              // Toggle off if user already reacted
              if (existingReaction.userIds.includes(variables.userId)) {
                const newUserIds = existingReaction.userIds.filter(id => id !== variables.userId);
                return {
                  ...msg,
                  reactions: newUserIds.length > 0
                    ? msg.reactions.map(r => 
                        r.emoji === variables.emoji 
                          ? { ...r, userIds: newUserIds }
                          : r
                      )
                    : msg.reactions.filter(r => r.emoji !== variables.emoji)
                };
              } else {
                // Add user to existing reaction
                return {
                  ...msg,
                  reactions: msg.reactions.map(r =>
                    r.emoji === variables.emoji
                      ? { ...r, userIds: [...r.userIds, variables.userId] }
                      : r
                  )
                };
              }
            } else if (variables.userId) {
              // Add new reaction
              return {
                ...msg,
                reactions: [
                  ...msg.reactions,
                  { emoji: variables.emoji, userIds: [variables.userId] }
                ]
              };
            }
            
            return msg;
          });
        }
      );

      return { previousMessages };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        context.previousMessages.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.messagesRoot(variables.leagueId),
      });
    },
  });
}
