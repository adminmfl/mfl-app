import type { SubmissionForValidationDTO, SubmissionsResponseDTO } from '../types/validation.dto';
import type { SubmissionForValidation, SubmissionsForValidation } from '../types/validation.model';

function toSubmissionForValidation(dto: SubmissionForValidationDTO): SubmissionForValidation {
  return {
    id: dto.id,
    leagueMemberId: dto.league_member_id,
    date: dto.date,
    type: dto.type,
    workoutType: dto.workout_type,
    duration: dto.duration,
    distance: dto.distance,
    steps: dto.steps,
    holes: dto.holes,
    rrValue: dto.rr_value,
    status: dto.status,
    proofUrl: dto.proof_url,
    notes: dto.notes,
    rejectionReason: dto.rejection_reason,
    effectivePoints: dto.effective_points,
    customActivityName: dto.custom_activity_name,
    createdDate: dto.created_date,
    modifiedDate: dto.modified_date,
    reuploadOf: dto.reupload_of,
    outcome: dto.outcome ?? null,
    member: {
      userId: dto.member.user_id,
      username: dto.member.username,
      email: dto.member.email,
      teamId: dto.member.team_id,
      teamName: dto.member.team_name,
      suspiciousProofStrikes: dto.member.suspicious_proof_strikes ?? 0,
    },
  };
}

export function toSubmissionsForValidation(dto: SubmissionsResponseDTO): SubmissionsForValidation {
  return {
    submissions: dto.data.submissions.map(toSubmissionForValidation),
    stats: {
      total: dto.data.stats.total,
      pending: dto.data.stats.pending,
      approved: dto.data.stats.approved,
      rejected: dto.data.stats.rejected,
    },
    teams: dto.data.teams.map((team) => ({
      teamId: team.team_id,
      teamName: team.team_name,
      logoUrl: team.logo_url ?? null,
    })),
  };
}
