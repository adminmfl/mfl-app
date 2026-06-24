import { mflColors } from '../../../constants/colors';
import type { SubmissionEntry } from '../types/submission.model';

export function formatWorkoutType(
  workoutType: string | null,
  customActivityName?: string,
): string {
  if (customActivityName) return customActivityName;
  if (!workoutType) return 'General Activity';
  return workoutType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' at ' +
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  );
}

export function getStatusLabel(status: SubmissionEntry['status']): string {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'rejected_resubmit': return 'Rejected (Retry)';
    case 'rejected_permanent': return 'Rejected (Final)';
    default: return status;
  }
}

export function getStatusColor(status: SubmissionEntry['status']): string {
  switch (status) {
    case 'pending': return mflColors.amber;
    case 'approved': return '#16a34a';
    case 'rejected':
    case 'rejected_resubmit':
    case 'rejected_permanent':
      return mflColors.danger;
    default: return mflColors.textMuted;
  }
}

export function isExemptionRequest(entry: SubmissionEntry): boolean {
  return entry.type === 'rest' && (entry.notes?.includes('[EXEMPTION_REQUEST]') ?? false);
}
