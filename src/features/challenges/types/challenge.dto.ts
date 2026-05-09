export type ChallengeTypeDTO = 'individual' | 'team' | 'sub_team' | 'tournament';
export type ChallengeStatusDTO =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'submission_closed'
  | 'published'
  | 'closed';

// Backend challenge object from GET /api/leagues/[id]/challenges -> data.active[]
export interface ChallengeDTO {
  id: string;
  league_id: string;
  name: string;
  description: string | null;
  challenge_type: ChallengeTypeDTO;
  total_points: number;
  is_custom: boolean;
  is_unique_workout: boolean;
  pricing_id: string | null;
  payment_id: string | null;
  doc_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ChallengeStatusDTO;
  template_id: string | null;
  my_submission: any | null;
  stats: { pending: number; approved: number; rejected: number } | null;
}

export interface ChallengePresetDTO {
  id: string;
  name: string;
  description: string | null;
  doc_url: string | null;
  challenge_type: ChallengeTypeDTO;
  is_preset: boolean;
}

// Backend returns: { success, data: { active, availablePresets, defaultPricing } }
export interface ChallengesResponseDTO {
  success: boolean;
  data: {
    active: ChallengeDTO[];
    availablePresets: ChallengePresetDTO[];
    defaultPricing: any | null;
  };
}

// Backend challenge submission from GET /challenges/[challengeId]/submissions
export interface ChallengeSubmissionDTO {
  id: string;
  league_member_id: string;
  team_id: string | null;
  sub_team_id: string | null;
  awarded_points: number | null;
  status: 'pending' | 'approved' | 'rejected';
  proof_url: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  leaguemembers?: {
    user_id: string;
    team_id: string | null;
    teams: { team_id: string; team_name: string } | null;
    users: { user_id: string; username: string; email: string };
  };
}

export interface ChallengeSubmissionsResponseDTO {
  success: boolean;
  data: ChallengeSubmissionDTO[];
}

// Backend challenge leaderboard entry
export interface ChallengeLeaderboardEntryDTO {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export interface ChallengeLeaderboardResponseDTO {
  success: boolean;
  data: ChallengeLeaderboardEntryDTO[];
}

export interface CreateChallengeResponseDTO {
  success: boolean;
  data: any;
}

export interface MutateChallengeResponseDTO {
  success: boolean;
  data?: any;
  message?: string;
  status?: ChallengeStatusDTO;
}

export interface SubmitChallengeProofResponseDTO {
  success: boolean;
  data: ChallengeSubmissionDTO;
  message?: string;
}

export interface UploadChallengeProofResponseDTO {
  success: boolean;
  data: {
    url: string;
    path: string;
    bucket: string;
  };
}
