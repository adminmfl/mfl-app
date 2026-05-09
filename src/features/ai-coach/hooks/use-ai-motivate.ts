import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { getMotivation } from '../services/ai-coach.service';
import type { AiMotivateResponseDTO } from '../types/ai-coach.dto';

export function useAiMotivate() {
  const queryClient = useQueryClient();

  return useMutation<AiMotivateResponseDTO, Error, string>({
    mutationFn: (leagueId: string) => getMotivation(leagueId),
    onSuccess: (_data, leagueId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.aiCoachHistory(leagueId) });
    },
  });
}
