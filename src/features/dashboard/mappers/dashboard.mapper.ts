import type { DashboardSummaryDTO } from '../types/dashboard.dto';
import type { DashboardSummary } from '../types/dashboard.model';

export function toDashboardSummary(dto: DashboardSummaryDTO): DashboardSummary {
  return {
    activitiesLogged: dto.data.activitiesLogged,
    challengePoints: dto.data.challengePoints,
    totalPoints: dto.data.totalPoints,
    currentStreak: dto.data.currentStreak,
    bestStreak: dto.data.bestStreak,
    hasLeagues: dto.data.hasLeagues,
  };
}
