// Domain models — camelCase

export interface CaptainAtRiskPlayer {
  userId: string;
  username: string;
  teamId: string | null;
  reason: 'inactive_48h' | 'below_team_average';
  lastSubmissionAt: string | null;
  teamAverage: number;
  playerActivity: number;
}

export interface MilestoneDraft {
  id: string;
  leagueId: string;
  type: string;
  targetScope: string;
  targetId?: string;
  content: string;
  status: string;
  milestoneType?: string;
  createdAt: string;
  targetUsername: string;
}
