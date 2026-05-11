import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchMySubmissions } from '../services/submission.service';
import { toMySubmissionsData } from '../mappers/submission.mapper';
import type { MySubmissionsData } from '../types/submission.model';

export function useMySubmissions(leagueId: string) {
  return useQuery<MySubmissionsData>({
    queryKey: queryKeys.entries.mySubmissions(leagueId),
    queryFn: async () => {
      const dto = await fetchMySubmissions(leagueId);
      return toMySubmissionsData(dto);
    },
    enabled: !!leagueId,
    staleTime: 1 * 60 * 1000,
  });
}
