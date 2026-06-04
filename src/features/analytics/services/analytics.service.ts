import { api } from '../../../core/api';
import type { LeagueAnalyticsDTO } from '../types/analytics.dto';

export async function fetchAnalytics(leagueId: string): Promise<LeagueAnalyticsDTO> {
  const res = await api.get<LeagueAnalyticsDTO>(`/api/leagues/${leagueId}/analytics`);
  return res.data;
}
