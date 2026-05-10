import type { SubmissionEntryDTO, MySubmissionsResponseDTO, PreviewRRResponseDTO } from '../types/submission.dto';
import type { SubmissionEntry, MySubmissionsData, RRPreview } from '../types/submission.model';

export function toSubmissionEntry(dto: SubmissionEntryDTO): SubmissionEntry {
  return {
    id: dto.id,
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
    createdDate: dto.created_date,
    modifiedDate: dto.modified_date,
    reuploadOf: dto.reupload_of,
    rejectionReason: dto.rejection_reason,
    customActivityName: dto.custom_activity_name,
    effectivePoints: dto.effective_points,
    customFieldLabel: dto.custom_field_label ?? null,
    customFieldLabel2: dto.custom_field_label_2 ?? null,
    customFieldValue: dto.custom_field_value ?? null,
    customFieldValue2: dto.custom_field_value_2 ?? null,
    outcome: dto.outcome ?? null,
    hrAvg: dto.hr_avg ?? null,
    caloriesBurned: dto.calories_burned ?? null,
    plausibilityScore: dto.plausibility_score ?? null,
    reviewTier: dto.review_tier ?? null,
    plausibilityReason: dto.plausibility_reason ?? null,
    reviewerNotes: dto.reviewer_notes ?? null,
  };
}

export function toMySubmissionsData(dto: MySubmissionsResponseDTO): MySubmissionsData {
  return {
    submissions: dto.data.submissions.map(toSubmissionEntry),
    stats: dto.data.stats,
    leagueMemberId: dto.data.leagueMemberId,
    teamId: dto.data.teamId,
    suspiciousProofStrikes: dto.data.suspiciousProofStrikes ?? 0,
    suspiciousProofLastStrikeAt: dto.data.suspiciousProofLastStrikeAt ?? null,
    suspiciousProofWarningThreshold: dto.data.suspiciousProofWarningThreshold ?? 2,
    suspiciousProofRejectionThreshold: dto.data.suspiciousProofRejectionThreshold ?? 3,
  };
}

export function toRRPreview(dto: PreviewRRResponseDTO): RRPreview {
  return {
    rrScore: dto.data.rr_value ?? dto.data.rr_score ?? 0,
    breakdown: dto.data.breakdown ?? null,
  };
}
