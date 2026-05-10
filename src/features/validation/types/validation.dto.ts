// GET /api/leagues/{id}/submissions response (snake_case)
export type SubmissionIdDTO = string | number;
export type SubmissionStatusDTO =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'rejected_resubmit'
  | 'rejected_permanent';

export interface SubmissionForValidationDTO {
  id: SubmissionIdDTO;
  league_member_id: SubmissionIdDTO;
  date: string;
  type: string;
  workout_type: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rr_value: number;
  status: SubmissionStatusDTO;
  proof_url: string | null;
  notes: string | null;
  rejection_reason: string | null;
  effective_points: number | null;
  custom_activity_name: string | null;
  created_date: string;
  modified_date: string | null;
  reupload_of: SubmissionIdDTO | null;
  outcome?: string | null;
  hr_avg?: number | null;
  calories_burned?: number | null;
  plausibility_score?: number | null;
  review_tier?: 'none' | 'captain' | 'governor' | null;
  plausibility_reason?: string | null;
  reviewer_notes?: string | null;
  member: {
    user_id: string;
    username: string;
    email: string;
    team_id: string | null;
    team_name: string | null;
    suspicious_proof_strikes?: number | null;
  };
}

export interface SubmissionStatsDTO {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SubmissionTeamDTO {
  team_id: string;
  team_name: string;
  logo_url?: string | null;
}

export interface SubmissionsResponseDTO {
  success: boolean;
  data: {
    submissions: SubmissionForValidationDTO[];
    stats: SubmissionStatsDTO;
    teams: SubmissionTeamDTO[];
  };
}

export interface ValidateSubmissionRequestDTO {
  status: 'approved' | 'rejected' | 'rejected_resubmit' | 'rejected_permanent';
  rejection_reason?: string;
  reviewer_notes?: string;
  awarded_points?: number;
  suspicious_proof?: boolean;
}

export interface ValidateSubmissionResponseDTO {
  success: boolean;
  data: SubmissionForValidationDTO;
}
