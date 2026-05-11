import { useQuery } from '@tanstack/react-query';

import { fetchManualEntryWeekEntries } from '../services/manual-entry.service';
import type { ManualWeekRow } from '../types/manual-entry';
import { buildWeekRows, getWeekRange } from '../utils/manual-entry-utils';

interface UseManualEntryWeekArgs {
  leagueId: string;
  memberId: string;
  weekOffset: number;
  showRR: boolean;
}

export function useManualEntryWeek({
  leagueId,
  memberId,
  weekOffset,
  showRR,
}: UseManualEntryWeekArgs) {
  const weekRange = getWeekRange(weekOffset);

  const query = useQuery<ManualWeekRow[]>({
    queryKey: [
      'leagues',
      leagueId,
      'manual-entry',
      'members',
      memberId,
      'entries',
      weekRange.startDate,
      weekRange.endDate,
      showRR,
    ],
    queryFn: async () => {
      const dto = await fetchManualEntryWeekEntries(
        leagueId,
        memberId,
        weekRange.startDate,
        weekRange.endDate,
      );
      return buildWeekRows(weekRange.start, dto.data?.entries || [], showRR);
    },
    enabled: !!leagueId && !!memberId,
    staleTime: 30 * 1000,
  });

  return { ...query, weekRange };
}
