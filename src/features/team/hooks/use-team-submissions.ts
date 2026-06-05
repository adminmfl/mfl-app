import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTeamSubmissions } from '../services/team-submissions.service';
import { toTeamSubmissionsData, type TeamSubmissionsData } from '../mappers/team-submission.mapper';

export function useTeamSubmissions(leagueId: string) {
  return useQuery<TeamSubmissionsData>({
    queryKey: queryKeys.leagues.teamSubmissions(leagueId),
    queryFn: async () => {
      const dto = await fetchTeamSubmissions(leagueId);
      return toTeamSubmissionsData(dto);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}
