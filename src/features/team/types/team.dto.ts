// GET /api/leagues/[id]/members
export interface LeagueMemberDTO {
  league_member_id: string;
  user_id: string;
  league_id: string;
  team_id: string | null;
  username: string | null;
  roles: string[];
}

export interface LeagueMembersResponseDTO {
  data: LeagueMemberDTO[];
  success: boolean;
}

// GET /api/leagues/[id]/teams
export interface TeamDTO {
  team_id: string;
  team_name: string;
  league_id: string;
  logo_url: string | null;
  member_count: number;
}

// Backend returns: { success, data: { teams, members, governors, league, ... } }
export interface TeamsResponseDTO {
  success: boolean;
  data: {
    teams: TeamDTO[];
    members: {
      allocated: LeagueMemberDTO[];
      unallocated: LeagueMemberDTO[];
    };
    governors: any[];
    league: any;
    teamSizeVariance: any;
    meta: {
      current_team_count: number;
      max_teams: number;
      can_create_more: boolean;
    };
  };
}

// GET /api/leagues/[id]/teams/[teamId]/members
export interface TeamMemberDTO {
  league_member_id: string;
  user_id: string;
  team_id: string;
  league_id: string;
  username: string;
  email: string;
  is_captain: boolean;
  roles: string[];
  profile_picture_url?: string | null;
  rest_days_used?: number;
}

export interface TeamMembersResponseDTO {
  success: boolean;
  data: TeamMemberDTO[];
}

// GET /api/leagues/[id]/my-team/summary
export interface TeamSummaryDTO {
  teamId: string | null;
  memberCount: number;
  restUsed: number;
  missedDays: number;
}

export interface TeamSummaryResponseDTO {
  success: boolean;
  data: TeamSummaryDTO;
}

// GET /api/leagues/[id]/balance
export interface BalanceBreakdownDTO {
  fitnessScore: number;
  genderScore: number;
  ageScore: number;
  departmentScore: number;
  overallScore: number;
}

export interface TeamBalanceResponseDTO {
  success: boolean;
  score: BalanceBreakdownDTO;
  error?: string;
}
