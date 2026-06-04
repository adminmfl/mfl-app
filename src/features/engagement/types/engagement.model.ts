// Domain models — camelCase

export interface EngagementData {
  participationRate: number;
  totalMembers: number;
  activeUsersLast7Days: number;
  dailyActiveUsers: DailyActiveUser[];
  eventBreakdown: EventBreakdownItem[];
  atRiskPlayers: AtRiskPlayer[];
  streakDistribution: StreakBucket[];
  topEngagers: TopEngager[];
  exportedAt: string;
}

export interface DailyActiveUser {
  date: string;
  count: number;
}

export interface EventBreakdownItem {
  type: string;
  count: number;
}

export interface AtRiskPlayer {
  userId: string;
  username: string;
  lastActive: string | null;
  daysGap: number;
}

export interface StreakBucket {
  range: string;
  count: number;
}

export interface TopEngager {
  userId: string;
  username: string;
  eventCount: number;
}
