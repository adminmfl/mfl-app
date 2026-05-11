import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchGovernors } from '../services/governor.service';
import { toGovernor } from '../mappers/governor.mapper';
import type { Governor } from '../types/governor.model';

export function useGovernors(leagueId: string) {
  return useQuery<Governor[]>({
    queryKey: queryKeys.leagues.governor(leagueId),
    queryFn: async () => {
      const dto = await fetchGovernors(leagueId);
      return dto.data.map(toGovernor);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
