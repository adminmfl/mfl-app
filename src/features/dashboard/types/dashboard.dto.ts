// Exact shape returned by GET /api/user/dashboard-summary
export interface DashboardSummaryDTO {
  success: boolean;
  data: {
    activitiesLogged: number;
    challengePoints: number;
    totalPoints: number;
    currentStreak: number;
    bestStreak: number;
    hasLeagues: boolean;
  };
}
