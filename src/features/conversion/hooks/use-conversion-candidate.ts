import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchConversionCandidate } from '../services/conversion.service';

export function useConversionCandidate(sourceLeagueId: string) {
  return useQuery({
    queryKey: queryKeys.conversion.candidate(sourceLeagueId),
    queryFn: () => fetchConversionCandidate(sourceLeagueId),
    enabled: !!sourceLeagueId,
    staleTime: 5 * 60 * 1000,
  });
}
