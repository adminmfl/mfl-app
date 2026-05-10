import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchInterventions } from '../services/ai-manager.service';
import { toIntervention } from '../mappers/ai-manager.mapper';
import type { Intervention } from '../types/ai-manager.model';

export function useInterventions(leagueId: string) {
  return useQuery<Intervention[]>({
    queryKey: [...queryKeys.leagues.all, leagueId, 'ai-manager', 'interventions'],
    queryFn: async () => {
      const dtos = await fetchInterventions(leagueId);
      return dtos.map(toIntervention);
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}
