import type { UserLeagueDTO, LeagueDetailDTO } from '../types/league.dto';
import type { UserLeague, LeagueDetail } from '../types/league.model';

export function toUserLeague(dto: UserLeagueDTO): UserLeague {
  return {
    leagueId: dto.league_id,
    name: dto.name,
    description: dto.description,
    logoUrl: dto.logo_url,
    status: dto.status,
    startDate: dto.start_date,
    endDate: dto.end_date,
    numTeams: dto.num_teams,
    leagueCapacity: dto.league_capacity,
    isPublic: dto.is_public,
    isExclusive: dto.is_exclusive,
    inviteCode: dto.invite_code,
    roles: dto.roles,
    teamId: dto.team_id,
    teamName: dto.team_name,
    teamLogoUrl: dto.team_logo_url,
    isHost: dto.is_host,
    creatorName: dto.creator_name,
    branding: dto.branding,
    rrConfig: dto.rr_config,
    restDays: dto.rest_days,
    leagueMode: dto.league_mode || 'standard',
  };
}

export function toLeagueDetail(dto: LeagueDetailDTO): LeagueDetail {
  const d = dto.data;
  return {
    leagueId: d.league_id,
    name: d.league_name,
    description: d.description,
    status: d.status,
    phase: d.phase || d.status || 'mobilisation',
    startDate: d.start_date,
    endDate: d.end_date,
    numTeams: d.num_teams,
    tierId: d.tier_id,
    isPublic: d.is_public,
    isExclusive: d.is_exclusive,
    inviteCode: d.invite_code,
    createdBy: d.created_by,
    logoUrl: d.logo_url,
    branding: d.branding,
    rrConfig: d.rr_config,
    restDays: d.rest_days,
    normalizePointsByTeamSize: d.normalize_points_by_team_size,
    maxTeamCapacity: d.max_team_capacity,
    autoRestDayEnabled: d.auto_rest_day_enabled,
    leagueMode: d.league_mode || 'standard',
    playerTeamWorkoutVisibility: !!d.player_team_workout_visibility,
    playerLeagueWorkoutVisibility: !!d.player_league_workout_visibility,
    crossTeamVisibility: !!d.cross_team_visibility,
    aiDailyQuestionLimit: d.ai_daily_question_limit ?? 20,
    tieredRankEnabled: !!d.tiered_rank_enabled,
    tieredRankConfig: d.tiered_rank_config
      ? {
          topPercent: d.tiered_rank_config.top_percent ?? 20,
          middlePercent: d.tiered_rank_config.middle_percent ?? 50,
          bottomPercent: d.tiered_rank_config.bottom_percent ?? 30,
        }
      : null,
      minSubmissionsPerDay: dto.min_submissions_per_day ?? 1,
      maxSubmissionsPerDay: dto.max_submissions_per_day ?? 1,
  };
}
