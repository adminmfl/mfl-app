import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchAtRiskPlayers } from '../services/captain-engagement.service';
import { toCaptainAtRiskPlayer } from '../mappers/captain-engagement.mapper';
import type { CaptainAtRiskPlayer } from '../types/captain-engagement.model';

export function useCaptainAtRisk(leagueId: string) {
  return useQuery<CaptainAtRiskPlayer[]>({
    queryKey: queryKeys.leagues.captainAtRisk(leagueId),
    queryFn: async () => {
      const dtos = await fetchAtRiskPlayers(leagueId);
      return dtos.map(toCaptainAtRiskPlayer);
    },
    enabled: !!leagueId,
  });
}
