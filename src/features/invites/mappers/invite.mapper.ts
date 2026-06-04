import type { ValidateInviteResponseDTO, JoinByInviteResponseDTO, ValidateTeamInviteResponseDTO, JoinByTeamInviteResponseDTO } from '../types/invite.dto';
import type { InviteValidation, JoinByInviteResult, TeamInviteValidation, JoinByTeamInviteResult } from '../types/invite.model';

export function toInviteValidation(dto: ValidateInviteResponseDTO): InviteValidation {
  return {
    valid: dto.valid,
    league: {
      leagueId: dto.league.league_id,
      name: dto.league.name,
      description: dto.league.description,
      status: dto.league.status,
      startDate: dto.league.start_date,
      endDate: dto.league.end_date,
      memberCount: dto.league.member_count,
      maxCapacity: dto.league.max_capacity,
      isFull: dto.league.is_full,
      canJoin: dto.league.can_join,
    },
  };
}

export function toJoinByInviteResult(dto: JoinByInviteResponseDTO): JoinByInviteResult {
  return {
    success: dto.success,
    leagueId: dto.leagueId,
    leagueName: dto.leagueName,
    alreadyMember: dto.alreadyMember ?? false,
    message: dto.message ?? null,
  };
}

export function toTeamInviteValidation(dto: ValidateTeamInviteResponseDTO): TeamInviteValidation {
  return {
    valid: dto.valid,
    team: {
      teamId: dto.team.team_id,
      name: dto.team.name,
      memberCount: dto.team.member_count,
      maxCapacity: dto.team.max_capacity,
      isFull: dto.team.is_full,
    },
    league: {
      leagueId: dto.league.league_id,
      name: dto.league.name,
      description: dto.league.description,
      status: dto.league.status,
      startDate: dto.league.start_date,
      endDate: dto.league.end_date,
    },
    canJoin: dto.can_join,
  };
}

export function toJoinByTeamInviteResult(dto: JoinByTeamInviteResponseDTO): JoinByTeamInviteResult {
  return {
    success: dto.success,
    alreadyMember: dto.alreadyMember ?? false,
    leagueId: dto.leagueId,
    leagueName: dto.leagueName,
    teamId: dto.teamId,
    teamName: dto.teamName,
    message: dto.message ?? null,
  };
}
