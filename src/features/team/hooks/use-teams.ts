import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTeams } from '../services/team.service';
import { toTeam } from '../mappers/team.mapper';
import type { Team } from '../types/team.model';

export function useTeams(leagueId: string) {
  return useQuery<Team[]>({
    queryKey: queryKeys.leagues.teams(leagueId),
    queryFn: async () => {
      const dto = await fetchTeams(leagueId);
      return dto.data.teams.map(toTeam);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
