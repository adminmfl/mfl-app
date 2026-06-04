// DTOs for league management API endpoints (snake_case — matches server JSON)

// POST /api/leagues/join-by-code
export interface JoinLeagueResponseDTO {
  success: boolean;
  leagueId: string;
  leagueName: string;
  alreadyMember?: boolean;
  message?: string;
}

// POST /api/invite/team/[code]
export interface TeamInviteJoinResponseDTO {
  success: boolean;
  alreadyMember?: boolean;
  leagueId: string;
  leagueName: string;
  teamId: string;
  teamName: string;
  message?: string;
}

// POST /api/leagues — request body
export interface CreateLeagueRequestDTO {
  league_name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  tier_id: string;
  num_teams: number;
  max_participants: number;
  rest_days: number;
  rr_config: { formula: string };
  is_public: boolean;
  is_exclusive: boolean;
}

// POST /api/leagues — response
export interface CreateLeagueResponseDTO {
  success: boolean;
  data: {
    league_id: string;
    league_name: string;
    description: string | null;
    status: string;
    start_date: string;
    end_date: string;
    num_teams: number;
    is_public: boolean;
    is_exclusive: boolean;
    invite_code: string | null;
    rr_config: Record<string, any> | null;
    rest_days: number;
    max_team_capacity: number | null;
  };
}

// PATCH /api/leagues/[id] — request body (all optional)
export interface UpdateLeagueRequestDTO {
  league_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
  is_exclusive?: boolean;
  num_teams?: number;
  rest_days?: number;
  max_team_capacity?: number | null;
  auto_rest_day_enabled?: boolean;
  normalize_points_by_team_size?: boolean;
  rr_config?: { formula: string };
  league_mode?: string;
  player_team_workout_visibility?: boolean;
  player_league_workout_visibility?: boolean;
  cross_team_visibility?: boolean;
  ai_daily_question_limit?: number;
  tiered_rank_enabled?: boolean;
  tiered_rank_config?: {
    top_percent: number;
    middle_percent: number;
    bottom_percent: number;
  } | null;
  branding?: {
    display_name?: string;
    tagline?: string;
    primary_color?: string;
    powered_by_visible?: boolean;
  } | null;
}

// PATCH /api/leagues/[id] — response
export interface UpdateLeagueResponseDTO {
  success: boolean;
  data: {
    league_id: string;
    league_name: string;
    description: string | null;
    status: string;
    start_date: string;
    end_date: string;
    num_teams: number;
    is_public: boolean;
    is_exclusive: boolean;
    invite_code: string | null;
    rr_config: Record<string, any> | null;
    rest_days: number;
    max_team_capacity: number | null;
  };
}

// GET /api/leagues/[id]/rules
export interface LeagueRulesDTO {
  success: boolean;
  data: {
    rules_summary: string | null;
    rules_doc_url: string | null;
    file_type: string | null;
  };
}
