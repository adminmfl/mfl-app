import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchDrafts } from '../services/ai-manager.service';
import { toDraft } from '../mappers/ai-manager.mapper';
import type { Draft } from '../types/ai-manager.model';

export const draftQueryKey = (leagueId: string) =>
  [...queryKeys.leagues.all, leagueId, 'ai-manager', 'drafts'] as const;

export function useDrafts(leagueId: string) {
  return useQuery<Draft[]>({
    queryKey: draftQueryKey(leagueId),
    queryFn: async () => {
      const dtos = await fetchDrafts(leagueId);
      return dtos.map(toDraft);
    },
    enabled: !!leagueId,
    staleTime: 30 * 1000,
  });
}
