export interface InviteLeaguePreviewDTO {
  league_id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  member_count: number;
  max_capacity: number | null;
  is_full: boolean;
  can_join: boolean;
}

export interface ValidateInviteResponseDTO {
  valid: boolean;
  league: InviteLeaguePreviewDTO;
}

export interface JoinByInviteResponseDTO {
  success: boolean;
  leagueId: string;
  leagueName: string;
  alreadyMember?: boolean;
  message?: string;
}

export interface TeamInviteTeamDTO {
  team_id: string;
  name: string;
  member_count: number;
  max_capacity: number | null;
  is_full: boolean;
}

export interface TeamInviteLeagueDTO {
  league_id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ValidateTeamInviteResponseDTO {
  valid: boolean;
  team: TeamInviteTeamDTO;
  league: TeamInviteLeagueDTO;
  can_join: boolean;
}

export interface JoinByTeamInviteResponseDTO {
  success: boolean;
  alreadyMember?: boolean;
  leagueId: string;
  leagueName: string;
  teamId: string;
  teamName: string;
  message?: string;
}
