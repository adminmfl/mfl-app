export interface LeagueDashboardSummaryDTO {
  success: boolean;
  data: {
    league: {
      rest_days?: number;
      rr_config?: { formula?: string };
      league_mode?: string;
    };
    mySummary: {
      points: number;
      challengePoints: number;
      avgRR: number | null;
      restUsed: number;
      restUnused: number;
      missedDays: number;
      teamRank: number | null;
    };
    rejectedCount: number;
  };
}
