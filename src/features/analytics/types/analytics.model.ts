export interface LeagueAnalytics {
  generatedAt: string;
  leagueHealth: {
    totalMembers: number;
    activeMembers: number;
    activeMembersPercent: number;
    inactiveMembersPercent: number;
    totalTeams: number;
    daysCompleted: number;
    totalDays: number;
    leagueProgress: number;
  };
  participation: {
    dailyData: Array<{
      date: string;
      participationRate: number;
      submissions: number;
    }>;
    avgDailySubmissions: number;
  };
  topPerformers: Array<{ memberId: string; username: string; submissions: number }>;
  bottomPerformers: Array<{ memberId: string; username: string; submissions: number }>;
  teamPerformance: Array<{
    teamId: string;
    teamName: string;
    size: number;
    rawPoints: number;
    avgPointsPerPlayer: number;
  }>;
  restDayAnalytics: { totalUsed: number; avgPerMember: number };
  alerts: Array<{ type: string; message: string; teams?: string[]; users?: string[] }>;
}
