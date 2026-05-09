import type { LeagueAnalyticsDTO } from '../types/analytics.dto';
import type { LeagueAnalytics } from '../types/analytics.model';

export function toLeagueAnalytics(dto: LeagueAnalyticsDTO): LeagueAnalytics {
  const d = dto.data;
  return {
    generatedAt: dto.generatedAt,
    leagueHealth: d.leagueHealth,
    participation: d.participation,
    topPerformers: d.topPerformers || [],
    bottomPerformers: d.bottomPerformers || [],
    teamPerformance: d.teamPerformance || [],
    restDayAnalytics: d.restDayAnalytics,
    alerts: (d.alerts || []).map((a) => ({ type: a.type, message: a.message, teams: a.teams, users: a.users })),
  };
}
