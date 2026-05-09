import type { TeamSubmissionDTO, TeamSubmissionsResponseDTO } from '../types/team-submission.dto';
import type {
  SubmissionForValidation,
  SubmissionStats,
} from '../../validation/types/validation.model';

function toSubmissionForValidation(dto: TeamSubmissionDTO): SubmissionForValidation {
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
    rrValue: dto.rr_value ?? 0,
    status: dto.status,
    proofUrl: dto.proof_url,
    notes: dto.notes,
    rejectionReason: dto.rejection_reason ?? null,
    effectivePoints: dto.effective_points ?? null,
    customActivityName: dto.custom_activity_name ?? null,
    createdDate: dto.created_date,
    modifiedDate: dto.modified_date,
    reuploadOf: dto.reupload_of,
    outcome: dto.outcome ?? null,
    member: {
      userId: dto.member.user_id,
      username: dto.member.username,
      email: dto.member.email,
      teamId: null,
      teamName: null,
      suspiciousProofStrikes: 0,
    },
  };
}

export interface TeamSubmissionsData {
  submissions: SubmissionForValidation[];
  stats: SubmissionStats;
  teamId: string;
}

export function toTeamSubmissionsData(dto: TeamSubmissionsResponseDTO): TeamSubmissionsData {
  return {
    submissions: dto.data.submissions.map(toSubmissionForValidation),
    stats: {
      total: dto.data.stats.total,
      pending: dto.data.stats.pending,
      approved: dto.data.stats.approved,
      rejected: dto.data.stats.rejected,
    },
    teamId: dto.data.teamId,
  };
}
