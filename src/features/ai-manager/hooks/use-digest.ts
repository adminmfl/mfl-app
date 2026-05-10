import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchDigestItems } from '../services/ai-manager.service';
import { toDigestItem } from '../mappers/ai-manager.mapper';
import type { DigestItem } from '../types/ai-manager.model';

export function useDigest(leagueId: string) {
  return useQuery<DigestItem[]>({
    queryKey: [...queryKeys.leagues.all, leagueId, 'ai-manager', 'digest'],
    queryFn: async () => {
      const dtos = await fetchDigestItems(leagueId);
      return dtos.map(toDigestItem);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}
