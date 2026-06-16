export interface LeagueMember {
  memberId: string;
  userId: string;
  leagueId: string;
  teamId: string | null;
  username: string | null;
  roles: string[];
}

export interface Team {
  teamId: string;
  teamName: string;
  leagueId: string;
  logoUrl: string | null;
  memberCount: number;
}

export interface TeamMember {
  leagueMemberId: string;
  userId: string;
  teamId: string;
  leagueId: string;
  username: string;
  email: string;
  isCaptain: boolean;
  roles: string[];
  points: number;
  avgRr: number;
  restDaysUsed: number;
  profilePictureUrl: string | null;
}

export interface MyTeamStats {
  teamRank: string;
  teamPoints: number;
  teamAvgRR: number;
  teamName: string | null;
  memberCapacity: number;
  challengePoints?: number | null;
}

export interface TeamViewStats extends MyTeamStats {
  activityPoints: number | null;
  challengePoints: number | null;
  restUsed: number | null;
  missedDays: number | null;
  teamLogoUrl: string | null;
}

export interface TeamViewData {
  members: TeamMember[];
  stats: TeamViewStats;
}
