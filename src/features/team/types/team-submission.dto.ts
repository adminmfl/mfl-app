import type { SubmissionStatusDTO } from '../../validation/types/validation.dto';

export interface TeamSubmissionDTO {
  id: string;
  league_member_id: string;
  date: string;
  type: string;
  workout_type: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rr_value: number | null;
  status: SubmissionStatusDTO;
  proof_url: string | null;
  notes: string | null;
  created_date: string;
  modified_date: string;
  modified_by: string | null;
  reupload_of: string | null;
  graded_by_role: 'host' | 'governor' | 'captain' | 'vice_captain' | 'player' | 'system' | null;
  effective_points?: number;
  custom_activity_name?: string | null;
  custom_field_label?: string | null;
  custom_field_label_2?: string | null;
  custom_field_value?: string | null;
  custom_field_value_2?: string | null;
  outcome?: string | null;
  rejection_reason?: string | null;
  member: {
    user_id: string;
    username: string;
    email: string;
  };
}

export interface TeamSubmissionStatsDTO {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface TeamSubmissionsResponseDTO {
  success: boolean;
  data: {
    submissions: TeamSubmissionDTO[];
    stats: TeamSubmissionStatsDTO;
    teamId: string;
  };
}
