// DTO types — match backend /api/captain/* JSON shape

export interface AtRiskPlayerDTO {
  userId: string;
  username: string;
  teamId: string | null;
  reason: 'inactive_48h' | 'below_team_average';
  lastSubmissionAt: string | null;
  teamAverage: number;
  playerActivity: number;
}

export interface MilestoneDraftDTO {
  id: string;
  league_id: string;
  type: string;
  target_scope: string;
  target_id?: string;
  content: string;
  status: string;
  milestone_type?: string;
  created_at: string;
  target_user?: { username: string };
}
