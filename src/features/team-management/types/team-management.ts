export interface ManagedTeam {
  team_id: string;
  team_name: string;
  league_id: string;
  invite_code: string | null;
  member_count: number;
  captain: {
    user_id: string;
    username: string;
  } | null;
  logo_url?: string | null;
  created_by: string | null;
  created_date: string;
}

export interface ManagedLeagueMember {
  league_member_id: string;
  user_id: string;
  team_id: string | null;
  league_id: string;
  username: string;
  email: string;
  roles: string[];
  team_name?: string | null;
  points?: number;
}

export interface ManagedTeamMember {
  league_member_id: string;
  user_id: string;
  team_id: string | null;
  league_id: string;
  username: string;
  email: string;
  is_captain: boolean;
  roles: string[];
  points?: number;
}

export interface ManagedGovernor {
  user_id: string;
  username: string;
}

export interface TeamManagementData {
  teams: ManagedTeam[];
  members: {
    allocated: ManagedLeagueMember[];
    unallocated: ManagedLeagueMember[];
  };
  governors: ManagedGovernor[];
  league: {
    league_id: string;
    league_name: string;
    invite_code?: string | null;
    num_teams: number;
    league_capacity: number;
    status: string;
    host_user_id: string;
    logo_url?: string | null;
    normalize_points_by_team_size?: boolean;
    tier_name?: string | null;
  };
  teamSizeVariance?: {
    hasVariance: boolean;
    minSize: number;
    maxSize: number;
    avgSize: number;
  };
  meta: {
    current_team_count: number;
    max_teams: number;
    can_create_more: boolean;
  };
}

export interface TeamManagementResponseDTO {
  success: boolean;
  data: TeamManagementData;
}

export interface TeamMembersResponseDTO {
  success: boolean;
  data: ManagedTeamMember[];
}

export interface PickedTeamLogo {
  uri: string;
  name: string;
  type: string;
}
