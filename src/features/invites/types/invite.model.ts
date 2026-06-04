export interface InviteLeaguePreview {
  leagueId: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  memberCount: number;
  maxCapacity: number | null;
  isFull: boolean;
  canJoin: boolean;
}

export interface InviteValidation {
  valid: boolean;
  league: InviteLeaguePreview;
}

export interface JoinByInviteResult {
  success: boolean;
  leagueId: string;
  leagueName: string;
  alreadyMember: boolean;
  message: string | null;
}

export interface TeamInviteTeam {
  teamId: string;
  name: string;
  memberCount: number;
  maxCapacity: number | null;
  isFull: boolean;
}

export interface TeamInviteLeague {
  leagueId: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

export interface TeamInviteValidation {
  valid: boolean;
  team: TeamInviteTeam;
  league: TeamInviteLeague;
  canJoin: boolean;
}

export interface JoinByTeamInviteResult {
  success: boolean;
  alreadyMember: boolean;
  leagueId: string;
  leagueName: string;
  teamId: string;
  teamName: string;
  message: string | null;
}
