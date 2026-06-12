import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { toLeagueDashboardSummary } from '../mappers/league-dashboard.mapper';
import { fetchLeagueDashboardSummary } from '../services/league-dashboard.service';
import type { LeagueDashboardSummary } from '../types/league-dashboard.model';

export function useLeagueDashboardSummary(leagueId: string | null) {
  const tzOffsetMinutes = new Date().getTimezoneOffset();
  const ianaTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useQuery<LeagueDashboardSummary>({
    queryKey: queryKeys.leagues.dashboardSummary(leagueId ?? ''),
    queryFn: async () => {
      const dto = await fetchLeagueDashboardSummary(
        leagueId!,
        tzOffsetMinutes,
        ianaTimezone,
      );
      return toLeagueDashboardSummary(dto);
    },
    enabled: !!leagueId,
    staleTime: 30 * 1000,
  });
}
