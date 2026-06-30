import type {
  ChallengeDTO,
  ChallengeSubmissionDTO,
  ChallengeLeaderboardEntryDTO,
  ChallengePresetDTO,
  WeightLogPlayerResponseDTO,
  WeightLogHostParticipantDTO,
  WeightLossTierDTO,
} from '../types/challenge.dto';
import type {
  Challenge,
  ChallengeSubmission,
  ChallengeLeaderboardEntry,
  ChallengePreset,
  WeightLogPlayerResponse,
  WeightLogHostParticipant,
  WeightLossTier,
} from '../types/challenge.model';

export function toChallenge(dto: ChallengeDTO): Challenge {
  return {
    challengeId: dto.id,
    leagueId: dto.league_id,
    name: dto.name,
    description: dto.description,
    challengeType: dto.challenge_type,
    totalPoints: dto.total_points,
    isCustom: dto.is_custom,
    isUniqueWorkout: dto.is_unique_workout,
    docUrl: dto.doc_url,
    templateId: dto.template_id,
    startDate: dto.start_date,
    endDate: dto.end_date,
    status: dto.status,
    config: dto.config,
    mySubmission: dto.my_submission,
    stats: dto.stats,
  };
}

export function toChallengeSubmission(dto: ChallengeSubmissionDTO): ChallengeSubmission {
  return {
    submissionId: dto.id,
    leagueMemberId: dto.league_member_id,
    teamId: dto.team_id,
    subTeamId: dto.sub_team_id,
    userId: dto.leaguemembers?.users?.user_id || '',
    username: dto.leaguemembers?.users?.username || 'Unknown',
    teamName: dto.leaguemembers?.teams?.team_name || null,
    proofUrl: dto.proof_url,
    status: dto.status,
    pointsAwarded: dto.awarded_points,
    createdAt: dto.created_at,
    reviewedAt: dto.reviewed_at,
  };
}

export function toChallengeLeaderboardEntry(dto: ChallengeLeaderboardEntryDTO): ChallengeLeaderboardEntry {
  return {
    teamId: dto.id,
    teamName: dto.name,
    score: dto.score,
    rank: dto.rank,
  };
}

export function toChallengePreset(dto: ChallengePresetDTO): ChallengePreset {
  return {
    presetId: dto.id,
    name: dto.name,
    description: dto.description,
    docUrl: dto.doc_url,
    challengeType: dto.challenge_type,
  };
}

export function toWeightLossTier(dto: WeightLossTierDTO | null | undefined): WeightLossTier | null {
  if (!dto) return null;
  return {
    thresholdPercent: dto.threshold_percent,
    points: dto.points,
  };
}

export function toWeightLogPlayerResponse(dto: WeightLogPlayerResponseDTO): WeightLogPlayerResponse {
  return {
    logs: (dto.data?.logs ?? []).map((log) => ({
      id: log.id,
      leagueMemberId: log.league_member_id,
      weight: log.weight,
      logType: log.log_type,
      createdAt: log.created_at,
    })),
    prediction: dto.data?.prediction
      ? {
          predictedPoints: dto.data.prediction.predicted_points,
          currentPercentLost: dto.data.prediction.current_percent_lost,
          matchedTier: toWeightLossTier(dto.data.prediction.matched_tier),
        }
      : null,
    result: dto.data?.result
      ? {
          finalPoints: dto.data.result.final_points,
          finalPercentLost: dto.data.result.final_percent_lost,
          matchedTier: toWeightLossTier(dto.data.result.matched_tier),
        }
      : null,
  };
}

export function toWeightLogHostParticipant(dto: WeightLogHostParticipantDTO): WeightLogHostParticipant {
  return {
    leagueMemberId: dto.league_member_id,
    username: dto.username,
    startWeight: dto.start_weight,
    endWeight: dto.end_weight,
    percentLost: dto.percent_lost,
    points: dto.points,
  };
}
