export interface SubmissionEntry {
  id: string;
  date: string;
  type: 'workout' | 'rest';
  workoutType: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rrValue: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'rejected_resubmit' | 'rejected_permanent';
  proofUrl: string | null;
  notes: string | null;
  createdDate: string;
  modifiedDate: string;
  reuploadOf: string | null;
  rejectionReason: string | null;
  customActivityName?: string;
  effectivePoints?: number;
  customFieldLabel?: string | null;
  customFieldLabel2?: string | null;
  customFieldValue?: string | null;
  customFieldValue2?: string | null;
  outcome?: string | null;
  hrAvg?: number | null;
  caloriesBurned?: number | null;
  plausibilityScore?: number | null;
  reviewTier?: 'none' | 'captain' | 'governor' | null;
  plausibilityReason?: string | null;
  reviewerNotes?: string | null;
}

export interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface MySubmissionsData {
  submissions: SubmissionEntry[];
  stats: SubmissionStats;
  leagueMemberId: string;
  teamId: string | null;
  suspiciousProofStrikes: number;
  suspiciousProofLastStrikeAt: string | null;
  suspiciousProofWarningThreshold: number;
  suspiciousProofRejectionThreshold: number;
}

export interface RRPreview {
  rrScore: number;
  breakdown: Record<string, any> | null;
}
