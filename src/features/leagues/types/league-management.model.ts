// Models for league management screens (camelCase — consumed by UI)

export interface JoinLeagueResult {
  success: boolean;
  leagueId: string;
  leagueName: string;
  alreadyMember: boolean;
  message: string;
}

export interface CreateLeagueInput {
  leagueName: string;
  description: string;
  startDate: string;
  endDate: string;
  tierId: string;
  numTeams: number;
  maxParticipants: number;
  restDays: number;
  rrFormula: string;
  isPublic: boolean;
  isExclusive: boolean;
}

export interface CreatedLeague {
  leagueId: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string;
  numTeams: number;
  isPublic: boolean;
  inviteCode: string | null;
}

export interface UpdateLeagueInput {
  leagueName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  isExclusive?: boolean;
  numTeams?: number;
  restDays?: number;
  maxTeamCapacity?: number | null;
  autoRestDayEnabled?: boolean;
  normalizePointsByTeamSize?: boolean;
  rrFormula?: string;
  leagueMode?: string;
  playerTeamWorkoutVisibility?: boolean;
  playerLeagueWorkoutVisibility?: boolean;
  crossTeamVisibility?: boolean;
  aiDailyQuestionLimit?: number;
  tieredRankEnabled?: boolean;
  tieredRankConfig?: {
    topPercent: number;
    middlePercent: number;
    bottomPercent: number;
  } | null;
  branding?: {
    displayName?: string;
    tagline?: string;
    primaryColor?: string;
    poweredByVisible?: boolean;
  } | null;
  minSubmissionsPerDay?: number;
  maxSubmissionsPerDay?: number;
}

export interface LeagueRules {
  rulesSummary: string | null;
  rulesDocUrl: string | null;
  fileType: string | null;
}

export interface PickedRulesDocument {
  uri: string;
  name: string;
  type: string;
}
