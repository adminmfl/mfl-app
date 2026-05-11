// Exact shapes returned by GET /api/leagues/[id]/leaderboard
// Response envelope: { success: true, data: LeaderboardDataDTO }

export interface TeamRankingDTO {
  rank: number;
  team_id: string;
  team_name: string;
  points: number;
  challenge_bonus: number;
  total_points: number;
  avg_rr: number;
  member_count: number;
  submission_count: number;
  logo_url?: string | null;
  normalized_points?: number;
  rank_tier?: 'top' | 'middle' | 'bottom';
  rank_band?: string;
  motivational_nudge?: string;
  individual_challenge_points?: number;
  fixed_team_points?: number;
}

export interface IndividualRankingDTO {
  rank: number;
  user_id: string;
  username: string;
  team_id: string | null;
  team_name: string | null;
  points: number;
  challenge_points?: number;
  avg_rr: number;
  submission_count: number;
  profile_picture_url?: string | null;
  rank_tier?: 'top' | 'middle' | 'bottom';
  rank_band?: string;
  motivational_nudge?: string;
}

export interface LeaderboardStatsDTO {
  total_submissions: number;
  approved: number;
  pending: number;
  rejected: number;
  total_rr: number;
}

export interface LeaderboardLeagueDTO {
  league_id: string;
  league_name: string;
  start_date: string;
  end_date: string;
  status?: string;
  phase?: string;
  rr_config: Record<string, any>;
  rest_days: number;
  tiered_rank_enabled?: boolean;
  tiered_rank_config?: {
    top_percent: number;
    middle_percent: number;
    bottom_percent: number;
  };
}

export interface PendingTeamWindowRankingDTO {
  rank: number;
  team_id: string;
  team_name: string;
  total_points: number;
  avg_rr: number;
  pointsByDate: Record<string, number>;
  logo_url?: string | null;
}

export interface SubTeamRankingDTO {
  rank: number;
  subteam_id: string;
  subteam_name: string;
  team_id: string | null;
  team_name: string | null;
  points: number;
  submission_count: number;
}

export interface LeaderboardDataDTO {
  teams: TeamRankingDTO[];
  individuals: IndividualRankingDTO[];
  subTeams?: SubTeamRankingDTO[];
  challengeTeams?: TeamRankingDTO[];
  challengeIndividuals?: IndividualRankingDTO[];
  stats: LeaderboardStatsDTO;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  league: LeaderboardLeagueDTO;
  pendingWindow?: {
    dates: string[];
    teams: PendingTeamWindowRankingDTO[];
  };
  normalization?: {
    active: boolean;
    hasVariance: boolean;
    avgSize: number;
    minSize: number;
    maxSize: number;
  };
}

export interface LeaderboardResponseDTO {
  success: boolean;
  data: LeaderboardDataDTO;
  error?: string;
}

export interface TeamMetadataDTO {
  team_id: string;
  team_name: string;
  league_id: string;
  logo_url: string | null;
  member_count: number;
}

export interface TeamsMetadataResponseDTO {
  success: boolean;
  data: {
    teams: TeamMetadataDTO[];
    league: {
      normalize_points_by_team_size?: boolean;
    };
    teamSizeVariance?: {
      hasVariance: boolean;
      avgSize: number;
      minSize: number;
      maxSize: number;
    };
  };
}

export interface ChallengeSummaryDTO {
  id: string;
  name: string;
  challenge_type: 'individual' | 'team' | 'sub_team' | string;
  total_points: number;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  template_id?: string | null;
}

export interface ChallengesResponseDTO {
  success: boolean;
  data: {
    active: ChallengeSummaryDTO[];
    availablePresets?: unknown[];
    defaultPricing?: unknown | null;
  };
  error?: string;
}

export interface SpecialChallengeSummaryDTO {
  challenge_id: string;
  name: string;
}

export interface SpecialChallengesResponseDTO {
  success: boolean;
  data: SpecialChallengeSummaryDTO[];
  error?: string;
}

export interface ChallengeScoreDTO {
  id: string;
  name: string;
  score: number;
  rank: number;
  teamName?: string;
}

export interface ChallengeScoresResponseDTO {
  success: boolean;
  data: ChallengeScoreDTO[];
  error?: string;
}
