import type { ChallengeType, ChallengeStatus } from '../types/challenge.model';

export function getChallengeTypeLabel(type: ChallengeType): string {
  switch (type) {
    case 'team':
      return 'Team Challenge';
    case 'individual':
      return 'Individual Challenge';
    case 'sub_team':
      return 'Sub-Team Challenge';
    case 'tournament':
      return 'Tournament';
    default:
      return type;
  }
}

export function getChallengeStatusLabel(status: ChallengeStatus): string {
  switch (status) {
    case 'draft':
    case 'scheduled':
      return 'Coming Soon';
    case 'active':
      return 'Active';
    case 'submission_closed':
      return 'Submissions Closed';
    case 'published':
    case 'closed':
      return 'Completed';
    default:
      return status;
  }
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Dates TBD';
  const fmt = (iso: string | null) => {
    if (!iso) return 'TBD';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

export function formatDateLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatSubmissionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Determines whether the player can submit (or re-submit) proof for a challenge.
 * Matches web logic exactly.
 */
export function canSubmitChallenge(
  status: ChallengeStatus,
  challengeType: ChallengeType,
  isUniqueWorkout: boolean,
  mySubmission: { status: string; reviewed_at?: string | null; created_at?: string } | null,
  isReuploadOpen: boolean,
): boolean {
  if (status !== 'active') return false;
  if (challengeType === 'tournament') return false;

  // No submission yet — can submit
  if (!mySubmission) return true;

  // Unique workout with approved submission — can change selection
  if (isUniqueWorkout && mySubmission.status === 'approved') return true;

  // Rejected — only if reupload window is open
  if (mySubmission.status === 'rejected') return isReuploadOpen;

  // Pending or approved (non-unique) — cannot submit
  return false;
}

/**
 * Determines the label for the submit button based on submission state.
 */
export function getSubmitButtonLabel(
  isUniqueWorkout: boolean,
  mySubmission: { status: string } | null,
): string {
  if (mySubmission?.status === 'rejected') return 'Resubmit Proof';
  if (isUniqueWorkout && mySubmission?.status === 'approved') return 'Change Selection';
  return 'Submit Proof';
}

/**
 * Checks if the 24-hour reupload window is still open after rejection.
 * Matches web logic from src/lib/utils/reupload-window.ts
 */
export function isReuploadWindowOpen(
  rejectionTimestamp: string | null | undefined,
): boolean {
  if (!rejectionTimestamp) return false;
  const rejected = new Date(rejectionTimestamp);
  if (Number.isNaN(rejected.getTime())) return false;

  // Window closes at end of the next calendar day (local time)
  const deadline = new Date(rejected);
  deadline.setDate(deadline.getDate() + 1);
  deadline.setHours(23, 59, 59, 999);

  return Date.now() <= deadline.getTime();
}
