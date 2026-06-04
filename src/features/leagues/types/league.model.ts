export interface UserLeague {
  leagueId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  numTeams: number;
  leagueCapacity: number;
  isPublic: boolean;
  isExclusive: boolean;
  inviteCode: string | null;
  roles: string[];
  teamId: string | null;
  teamName: string | null;
  teamLogoUrl: string | null;
  isHost: boolean;
  creatorName: string | null;
  branding: Record<string, any> | null;
  rrConfig: Record<string, any> | null;
  restDays: number;
  leagueMode: string;
}

export interface LeagueDetail {
  leagueId: string;
  name: string;
  description: string | null;
  status: string;
  phase: string;
  startDate: string;
  endDate: string;
  numTeams: number;
  tierId: string | null;
  isPublic: boolean;
  isExclusive: boolean;
  inviteCode: string | null;
  createdBy: string;
  logoUrl: string | null;
  branding: Record<string, any> | null;
  rrConfig: Record<string, any> | null;
  restDays: number;
  normalizePointsByTeamSize: boolean;
  maxTeamCapacity: number | null;
  autoRestDayEnabled: boolean;
  leagueMode: string;
  playerTeamWorkoutVisibility: boolean;
  playerLeagueWorkoutVisibility: boolean;
  crossTeamVisibility: boolean;
  aiDailyQuestionLimit: number;
  tieredRankEnabled: boolean;
  tieredRankConfig: {
    topPercent: number;
    middlePercent: number;
    bottomPercent: number;
  } | null;
}
