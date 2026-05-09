/**
 * DTOs matching the web API response for /api/leagues/[id]/my-submissions
 */

export interface SubmissionEntryDTO {
  id: string;
  date: string;
  type: 'workout' | 'rest';
  workout_type: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rr_value: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'rejected_resubmit' | 'rejected_permanent';
  proof_url: string | null;
  notes: string | null;
  created_date: string;
  modified_date: string;
  reupload_of: string | null;
  rejection_reason: string | null;
  custom_activity_name?: string;
  effective_points?: number;
  custom_field_label?: string | null;
  custom_field_label_2?: string | null;
  custom_field_value?: string | null;
  custom_field_value_2?: string | null;
  outcome?: string | null;
}

export interface SubmissionStatsDTO {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface MySubmissionsResponseDTO {
  success: boolean;
  data: {
    submissions: SubmissionEntryDTO[];
    stats: SubmissionStatsDTO;
    leagueMemberId: string;
    teamId: string | null;
    suspiciousProofStrikes: number;
    suspiciousProofLastStrikeAt: string | null;
    suspiciousProofWarningThreshold: number;
    suspiciousProofRejectionThreshold: number;
  };
}

export interface UpsertEntryRequestDTO {
  league_id: string;
  date: string;
  type: 'workout' | 'rest';
  workout_type?: string;
  duration?: number;
  distance?: number;
  steps?: number;
  holes?: number;
  proof_url?: string;
  proof_url_2?: string;
  notes?: string;
  outcome?: string;
  custom_field_value?: string;
  custom_field_value_2?: string;
  reupload_of?: string;
  overwrite?: boolean;
  tzOffsetMinutes?: number;
  ianaTimezone?: string;
}

export interface UpsertEntryResponseDTO {
  success: boolean;
  data: SubmissionEntryDTO;
}

export interface PreviewRRRequestDTO {
  league_id: string;
  type: 'workout' | 'rest';
  workout_type?: string;
  duration?: number;
  distance?: number;
  steps?: number;
  holes?: number;
}

export interface PreviewRRResponseDTO {
  success: boolean;
  data: {
    rr_value?: number;
    rr_score?: number;
    canSubmit?: boolean;
    formula?: string;
    minRR?: number;
    maxRR?: number;
    breakdown?: Record<string, any>;
  };
}

export interface ReuploadSubmissionRequestDTO {
  proof_url?: string;
  notes?: string;
  duration?: number;
  distance?: number;
  steps?: number;
  holes?: number;
  tzOffsetMinutes?: number;
  timeZone?: string;
}

export interface ReuploadSubmissionResponseDTO {
  success: boolean;
  data: SubmissionEntryDTO;
  message?: string;
}

export interface UploadProofResponseDTO {
  success: boolean;
  data: {
    url: string;
  };
}
