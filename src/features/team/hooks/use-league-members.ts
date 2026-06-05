import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchLeagueMembers } from '../services/team.service';
import { toLeagueMember } from '../mappers/team.mapper';
import type { LeagueMember } from '../types/team.model';

export function useLeagueMembers(leagueId: string) {
  return useQuery<LeagueMember[]>({
    queryKey: queryKeys.leagues.members(leagueId),
    queryFn: async () => {
      const dto = await fetchLeagueMembers(leagueId);
      return dto.data.map(toLeagueMember);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
