import type { LeagueDashboardSummaryDTO } from '../types/league-dashboard.dto';
import type { LeagueDashboardSummary } from '../types/league-dashboard.model';

export function toLeagueDashboardSummary(
  dto: LeagueDashboardSummaryDTO,
): LeagueDashboardSummary {
  const { league, mySummary, rejectedCount } = dto.data;
  return {
    restDays: league.rest_days ?? 0,
    rrFormula: league.rr_config?.formula ?? 'standard',
    isChallengesOnly: league.league_mode === 'challenges_only',
    mySummary: {
      points: mySummary.points,
      challengePoints: mySummary.challengePoints,
      avgRR: mySummary.avgRR,
      restUsed: mySummary.restUsed,
      restUnused: mySummary.restUnused,
      missedDays: mySummary.missedDays,
      teamRank: mySummary.teamRank,
    },
    rejectedCount,
  };
}
