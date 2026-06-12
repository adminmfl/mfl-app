export interface LeagueMySummary {
  points: number;
  challengePoints: number;
  avgRR: number | null;
  restUsed: number;
  restUnused: number;
  missedDays: number;
  teamRank: number | null;
}

export interface LeagueDashboardSummary {
  restDays: number;
  rrFormula: string;
  isChallengesOnly: boolean;
  mySummary: LeagueMySummary;
  rejectedCount: number;
}
