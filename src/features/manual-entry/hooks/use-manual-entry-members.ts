import { useQuery } from '@tanstack/react-query';

import { fetchManualEntryMembers } from '../services/manual-entry.service';
import type { ManualEntryMember } from '../types/manual-entry';
import { toManualEntryMember } from '../utils/manual-entry-utils';

export function useManualEntryMembers(leagueId: string) {
  return useQuery<ManualEntryMember[]>({
    queryKey: ['leagues', leagueId, 'manual-entry', 'members'],
    queryFn: async () => {
      const dto = await fetchManualEntryMembers(leagueId);
      return (dto.data || []).map(toManualEntryMember);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}
