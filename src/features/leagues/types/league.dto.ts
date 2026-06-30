// Exact shape returned by GET /api/user/leagues
export interface UserLeagueDTO {
  league_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  num_teams: number;
  league_capacity: number;
  is_public: boolean;
  is_exclusive: boolean;
  invite_code: string | null;
  roles: string[];
  team_id: string | null;
  team_name: string | null;
  team_logo_url: string | null;
  is_host: boolean;
  creator_name: string | null;
  branding: Record<string, any> | null;
  rr_config: Record<string, any> | null;
  rest_days: number;
  league_mode?: string;
}

export interface UserLeaguesResponseDTO {
  leagues: UserLeagueDTO[];
}

// GET /api/leagues/[id]
export interface LeagueDetailDTO {
  data: {
    league_id: string;
    league_name: string;
    description: string | null;
    status: string;
    phase: string;
    start_date: string;
    end_date: string;
    num_teams: number;
    tier_id: string | null;
    is_public: boolean;
    is_exclusive: boolean;
    invite_code: string | null;
    created_by: string;
    logo_url: string | null;
    branding: Record<string, any> | null;
    rr_config: Record<string, any> | null;
    rest_days: number;
    normalize_points_by_team_size: boolean;
    max_team_capacity: number | null;
    auto_rest_day_enabled: boolean;
    league_mode?: string;
    player_team_workout_visibility?: boolean;
    player_league_workout_visibility?: boolean;
    cross_team_visibility?: boolean;
    ai_daily_question_limit?: number;
    tiered_rank_enabled?: boolean;
    tiered_rank_config?: {
      top_percent?: number;
      middle_percent?: number;
      bottom_percent?: number;
    } | null;
    min_submissions_per_day?: number;
    max_submissions_per_day?: number;
  };
  success: boolean;
}
