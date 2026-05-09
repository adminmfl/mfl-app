import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { sendCoachMessage } from '../services/ai-coach.service';
import type { AiCoachResponseDTO } from '../types/ai-coach.dto';

interface SendCoachMessageVars {
  leagueId: string;
  message: string;
}

export function useSendCoachMessage() {
  const queryClient = useQueryClient();

  return useMutation<AiCoachResponseDTO, Error, SendCoachMessageVars>({
    mutationFn: async ({ leagueId, message }) => {
      return sendCoachMessage(leagueId, message);
    },
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.aiCoachHistory(leagueId) });
    },
  });
}
