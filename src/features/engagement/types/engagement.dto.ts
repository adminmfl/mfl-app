// DTO types — match backend JSON shape

export interface EngagementResponseDTO {
  success: boolean;
  data: EngagementDataDTO;
}

export interface EngagementDataDTO {
  participationRate: number;
  totalMembers: number;
  activeUsersLast7Days: number;
  dailyActiveUsers: DailyActiveUserDTO[];
  eventBreakdown: Record<string, number>;
  atRiskPlayers: AtRiskPlayerDTO[];
  streakDistribution: StreakBucketDTO[];
  topEngagers: TopEngagerDTO[];
  exportedAt: string;
}

export interface DailyActiveUserDTO {
  date: string;
  count: number;
}

export interface AtRiskPlayerDTO {
  user_id: string;
  username: string;
  last_active: string | null;
  days_gap: number;
}

export interface StreakBucketDTO {
  range: string;
  count: number;
}

export interface TopEngagerDTO {
  user_id: string;
  username: string;
  event_count: number;
}
