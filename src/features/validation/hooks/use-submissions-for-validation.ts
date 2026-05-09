import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchSubmissionsForValidation } from '../services/validation.service';
import { toSubmissionsForValidation } from '../mappers/validation.mapper';
import type { SubmissionsForValidation } from '../types/validation.model';

export function useSubmissionsForValidation(leagueId: string) {
  return useQuery<SubmissionsForValidation>({
    queryKey: queryKeys.leagues.submissions(leagueId),
    queryFn: async () => {
      const dto = await fetchSubmissionsForValidation(leagueId);
      return toSubmissionsForValidation(dto);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000, // 1 minute
  });
}
