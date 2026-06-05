import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchCannedMessages } from '../services/ai-manager.service';
import { toCannedMessage } from '../mappers/ai-manager.mapper';

export const cannedMessagesQueryKey = (leagueId: string) =>
  [...queryKeys.leagues.all, leagueId, 'ai-manager', 'canned-messages'] as const;

export function useCannedMessages(leagueId: string) {
  return useQuery({
    queryKey: cannedMessagesQueryKey(leagueId),
    queryFn: async () => (await fetchCannedMessages(leagueId)).map(toCannedMessage),
    enabled: !!leagueId,
  });
}
