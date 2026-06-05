import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchUserLeagues } from '../services/league.service';
import { toUserLeague } from '../mappers/league.mapper';
import type { UserLeague } from '../types/league.model';

interface Options {
  enabled?: boolean;
}

export function useUserLeagues(options?: Options) {
  return useQuery<UserLeague[]>({
    queryKey: queryKeys.user.leagues(),
    queryFn: async () => {
      const dto = await fetchUserLeagues();
      return dto.leagues.map(toUserLeague);
    },
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
