export interface LeaderboardTeam {
  teamId: string;
  teamName: string;
  totalPoints: number;
  challengeBonus: number;
  avgRR: number;
  rank: number;
  memberCount: number;
  submissionCount: number;
  players: LeaderboardPlayer[];
}

export interface LeaderboardPlayer {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  teamId: string | null;
  teamName: string | null;
  totalPoints: number;
  avgRR: number;
  rank: number;
  submissionCount: number;
}

export interface LeaderboardStats {
  totalSubmissions: number;
  approved: number;
  pending: number;
  rejected: number;
  totalRR: number;
}

export interface LeaderboardDateRange {
  startDate: string;
  endDate: string;
}

export interface Leaderboard {
  teams: LeaderboardTeam[];
  individuals: LeaderboardPlayer[];
  stats: LeaderboardStats;
  dateRange: LeaderboardDateRange;
  leagueName: string;
}
