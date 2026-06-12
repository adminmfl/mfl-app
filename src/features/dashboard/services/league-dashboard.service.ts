import { api } from '../../../core/api';
import type { LeagueDashboardSummaryDTO } from '../types/league-dashboard.dto';

export async function fetchLeagueDashboardSummary(
  leagueId: string,
  tzOffsetMinutes: number,
  ianaTimezone?: string,
): Promise<LeagueDashboardSummaryDTO> {
  const params = new URLSearchParams({
    tzOffsetMinutes: String(tzOffsetMinutes),
  });
  if (ianaTimezone) {
    params.set('ianaTimezone', ianaTimezone);
  }
  const res = await api.get<LeagueDashboardSummaryDTO>(
    `/api/leagues/${leagueId}/dashboard-summary?${params.toString()}`,
  );
  return res.data;
}
