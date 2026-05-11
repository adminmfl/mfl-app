import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTeams } from '../services/team.service';
import { toLeagueMember } from '../mappers/team.mapper';
import type { LeagueMember } from '../types/team.model';

export function useUnallocatedMembers(leagueId: string, enabled: boolean = true) {
  return useQuery<LeagueMember[]>({
    queryKey: [...queryKeys.leagues.teams(leagueId), 'unallocated'],
    queryFn: async () => {
      const dto = await fetchTeams(leagueId);
      return (dto.data.members?.unallocated || []).map(toLeagueMember);
    },
    enabled: !!leagueId && enabled,
    staleTime: 2 * 60 * 1000,
  });
}
