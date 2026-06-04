import type { LeagueMemberDTO, TeamDTO, TeamMemberDTO } from '../types/team.dto';
import type { LeagueMember, Team, TeamMember } from '../types/team.model';

export function toLeagueMember(dto: LeagueMemberDTO): LeagueMember {
  return {
    memberId: dto.league_member_id,
    userId: dto.user_id,
    leagueId: dto.league_id,
    teamId: dto.team_id,
    username: dto.username,
    roles: dto.roles || [],
  };
}

export function toTeam(dto: TeamDTO): Team {
  return {
    teamId: dto.team_id,
    teamName: dto.team_name,
    leagueId: dto.league_id,
    logoUrl: dto.logo_url,
    memberCount: dto.member_count,
  };
}

export function toTeamMember(
  dto: TeamMemberDTO,
  points: number = 0,
  avgRr: number = 0,
  profilePictureUrl?: string | null,
): TeamMember {
  return {
    leagueMemberId: dto.league_member_id,
    userId: dto.user_id,
    teamId: dto.team_id,
    leagueId: dto.league_id,
    username: dto.username,
    email: dto.email,
    isCaptain: dto.is_captain,
    roles: dto.roles || [],
    points,
    avgRr,
    restDaysUsed: dto.rest_days_used ?? 0,
    profilePictureUrl: profilePictureUrl ?? dto.profile_picture_url ?? null,
  };
}
