import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { patchCoachMessages } from '../services/ai-coach.service';

interface DismissVars {
  leagueId: string;
  messageId: string;
}

export function useDismissMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leagueId, messageId }: DismissVars) =>
      patchCoachMessages(leagueId, { messageIds: [messageId], action: 'dismiss' }),
    onSuccess: (_data, { leagueId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.aiCoachMilestones(leagueId),
      });
    },
  });
}
