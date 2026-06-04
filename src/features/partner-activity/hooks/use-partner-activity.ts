import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../core/config';
import { fetchPartnerActivity } from '../services/partner-activity.service';
import type { PartnerActivityData } from '../types/partner-activity.model';
import { toPartnerActivityData } from '../utils/partner-activity-mappers';

export function usePartnerActivity(leagueId: string, teamId?: string) {
  return useQuery<PartnerActivityData>({
    queryKey: queryKeys.leagues.partnerActivity(leagueId, teamId),
    queryFn: async () => {
      const dto = await fetchPartnerActivity(leagueId, teamId);
      return toPartnerActivityData(dto);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
