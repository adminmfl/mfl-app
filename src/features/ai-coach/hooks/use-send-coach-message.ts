import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { sendCoachMessage } from '../services/ai-coach.service';
import type { AiCoachResponseDTO } from '../types/ai-coach.dto';
import type { AiCoachMessage } from '../types/ai-coach.model';
import { sortCoachMessages } from '../utils/sort-coach-messages';

interface SendCoachMessageVars {
  leagueId: string;
  message: string;
}

interface SendCoachMessageContext {
  previous?: AiCoachMessage[];
}

function createOptimisticUserMessage(content: string): AiCoachMessage {
  return {
    messageId: `optimistic-user-${Date.now()}`,
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
}

export function useSendCoachMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    AiCoachResponseDTO,
    Error,
    SendCoachMessageVars,
    SendCoachMessageContext
  >({
    mutationFn: async ({ leagueId, message }) => {
      return sendCoachMessage(leagueId, message);
    },
    onMutate: async ({ leagueId, message }) => {
      const historyKey = queryKeys.leagues.aiCoachHistory(leagueId);
      await queryClient.cancelQueries({ queryKey: historyKey });

      const previous = queryClient.getQueryData<AiCoachMessage[]>(historyKey);
      const optimisticUser = createOptimisticUserMessage(message);

      queryClient.setQueryData<AiCoachMessage[]>(historyKey, (current) =>
        sortCoachMessages([...(current ?? []), optimisticUser]),
      );

      return { previous };
    },
    onError: (_error, { leagueId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.leagues.aiCoachHistory(leagueId),
          context.previous,
        );
      }
    },
    onSettled: (_data, _error, { leagueId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.aiCoachHistory(leagueId),
      });
    },
  });
}
