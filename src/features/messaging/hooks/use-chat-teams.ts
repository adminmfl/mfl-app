import { useQuery } from '@tanstack/react-query';
import { toChatTeam } from '../mappers/messaging.mapper';
import { fetchChatTeams } from '../services/messaging.service';
import type { ChatTeam } from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';

export function useChatTeams(leagueId: string, enabled = true) {
  return useQuery<ChatTeam[]>({
    queryKey: messagingQueryKeys.teams(leagueId),
    queryFn: async () => {
      const dto = await fetchChatTeams(leagueId);
      return dto.data.teams.map(toChatTeam);
    },
    enabled: enabled && !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
