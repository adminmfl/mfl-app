export type SubmissionId = string | number;
export type SubmissionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'rejected_resubmit'
  | 'rejected_permanent';

export interface SubmissionMember {
  userId: string;
  username: string;
  email: string;
  teamId: string | null;
  teamName: string | null;
  suspiciousProofStrikes: number;
}

export interface SubmissionForValidation {
  id: SubmissionId;
  leagueMemberId: SubmissionId;
  date: string;
  type: string;
  workoutType: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rrValue: number;
  status: SubmissionStatus;
  proofUrl: string | null;
  notes: string | null;
  rejectionReason: string | null;
  effectivePoints: number | null;
  customActivityName: string | null;
  createdDate: string;
  modifiedDate: string | null;
  reuploadOf: SubmissionId | null;
  outcome: string | null;
  member: SubmissionMember;
}

export interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SubmissionTeam {
  teamId: string;
  teamName: string;
  logoUrl: string | null;
}

export interface SubmissionsForValidation {
  submissions: SubmissionForValidation[];
  stats: SubmissionStats;
  teams: SubmissionTeam[];
}
