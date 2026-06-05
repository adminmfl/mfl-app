import type { EngagementDataDTO } from '../types/engagement.dto';
import type {
  EngagementData,
  EventBreakdownItem,
  AtRiskPlayer,
  TopEngager,
} from '../types/engagement.model';

export function toEngagementData(dto: EngagementDataDTO): EngagementData {
  const eventBreakdown: EventBreakdownItem[] = Object.entries(
    dto.eventBreakdown,
  )
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const atRiskPlayers: AtRiskPlayer[] = dto.atRiskPlayers.map((p) => ({
    userId: p.user_id,
    username: p.username,
    lastActive: p.last_active,
    daysGap: p.days_gap,
  }));

  const topEngagers: TopEngager[] = dto.topEngagers.map((e) => ({
    userId: e.user_id,
    username: e.username,
    eventCount: e.event_count,
  }));

  return {
    participationRate: dto.participationRate,
    totalMembers: dto.totalMembers,
    activeUsersLast7Days: dto.activeUsersLast7Days,
    dailyActiveUsers: dto.dailyActiveUsers,
    eventBreakdown,
    atRiskPlayers,
    streakDistribution: dto.streakDistribution,
    topEngagers,
    exportedAt: dto.exportedAt,
  };
}
