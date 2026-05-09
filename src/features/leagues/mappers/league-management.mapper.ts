import type {
  JoinLeagueResponseDTO,
  CreateLeagueResponseDTO,
  LeagueRulesDTO,
} from '../types/league-management.dto';
import type {
  JoinLeagueResult,
  CreatedLeague,
  LeagueRules,
  CreateLeagueInput,
  UpdateLeagueInput,
} from '../types/league-management.model';
import type {
  CreateLeagueRequestDTO,
  UpdateLeagueRequestDTO,
} from '../types/league-management.dto';

export function toJoinLeagueResult(dto: JoinLeagueResponseDTO): JoinLeagueResult {
  return {
    success: dto.success,
    leagueId: dto.leagueId,
    leagueName: dto.leagueName,
    alreadyMember: dto.alreadyMember ?? false,
    message: dto.message ?? '',
  };
}

export function toCreatedLeague(dto: CreateLeagueResponseDTO): CreatedLeague {
  const d = dto.data;
  return {
    leagueId: d.league_id,
    name: d.league_name,
    description: d.description,
    status: d.status,
    startDate: d.start_date,
    endDate: d.end_date,
    numTeams: d.num_teams,
    isPublic: d.is_public,
    inviteCode: d.invite_code,
  };
}

export function toLeagueRules(dto: LeagueRulesDTO): LeagueRules {
  const d = dto.data;
  return {
    rulesSummary: d.rules_summary,
    rulesDocUrl: d.rules_doc_url,
    fileType: d.file_type,
  };
}

export function toCreateLeagueRequest(input: CreateLeagueInput): CreateLeagueRequestDTO {
  return {
    league_name: input.leagueName,
    description: input.description || null,
    start_date: input.startDate,
    end_date: input.endDate,
    tier_id: input.tierId,
    num_teams: input.numTeams,
    max_participants: input.maxParticipants,
    rest_days: input.restDays,
    rr_config: { formula: input.rrFormula },
    is_public: input.isPublic,
    is_exclusive: input.isExclusive,
  };
}

export function toUpdateLeagueRequest(input: UpdateLeagueInput): UpdateLeagueRequestDTO {
  const dto: UpdateLeagueRequestDTO = {};
  if (input.leagueName !== undefined) dto.league_name = input.leagueName;
  if (input.description !== undefined) dto.description = input.description;
  if (input.startDate !== undefined) dto.start_date = input.startDate;
  if (input.endDate !== undefined) dto.end_date = input.endDate;
  if (input.isPublic !== undefined) dto.is_public = input.isPublic;
  if (input.isExclusive !== undefined) dto.is_exclusive = input.isExclusive;
  if (input.numTeams !== undefined) dto.num_teams = input.numTeams;
  if (input.restDays !== undefined) dto.rest_days = input.restDays;
  if (input.maxTeamCapacity !== undefined) dto.max_team_capacity = input.maxTeamCapacity;
  if (input.autoRestDayEnabled !== undefined) dto.auto_rest_day_enabled = input.autoRestDayEnabled;
  if (input.normalizePointsByTeamSize !== undefined) dto.normalize_points_by_team_size = input.normalizePointsByTeamSize;
  if (input.rrFormula !== undefined) dto.rr_config = { formula: input.rrFormula };
  if (input.leagueMode !== undefined) dto.league_mode = input.leagueMode;
  if (input.playerTeamWorkoutVisibility !== undefined) dto.player_team_workout_visibility = input.playerTeamWorkoutVisibility;
  if (input.playerLeagueWorkoutVisibility !== undefined) dto.player_league_workout_visibility = input.playerLeagueWorkoutVisibility;
  if (input.crossTeamVisibility !== undefined) dto.cross_team_visibility = input.crossTeamVisibility;
  if (input.aiDailyQuestionLimit !== undefined) dto.ai_daily_question_limit = input.aiDailyQuestionLimit;
  if (input.tieredRankEnabled !== undefined) dto.tiered_rank_enabled = input.tieredRankEnabled;
  if (input.tieredRankConfig !== undefined) {
    dto.tiered_rank_config = input.tieredRankConfig
      ? {
          top_percent: input.tieredRankConfig.topPercent,
          middle_percent: input.tieredRankConfig.middlePercent,
          bottom_percent: input.tieredRankConfig.bottomPercent,
        }
      : null;
  }
  if (input.branding !== undefined) {
    dto.branding = input.branding
      ? {
          display_name: input.branding.displayName,
          tagline: input.branding.tagline,
          primary_color: input.branding.primaryColor,
          powered_by_visible: input.branding.poweredByVisible,
        }
      : null;
  }
  return dto;
}
