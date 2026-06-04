import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { sendMessage } from '../services/message.service';

interface SendMessageVars {
  leagueId: string;
  content: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, SendMessageVars>({
    mutationFn: async ({ leagueId, content }) => {
      return sendMessage(leagueId, content);
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.messages(leagueId) });
    },
  });
}
