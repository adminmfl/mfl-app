import { mflColors } from '../../../constants/colors';
import type {
  SubmissionForValidation,
  SubmissionStatus,
  SubmissionTeam,
} from '../types/validation.model';

export type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected_resubmit' | 'rejected_permanent';

export const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected_resubmit', label: 'Soft Rejected' },
  { value: 'rejected_permanent', label: 'Perm Rejected' },
];

export function getInitials(name: string, fallback = 'M'): string {
  const cleanName = name.trim();
  if (!cleanName) return fallback.substring(0, 2).toUpperCase();
  const parts = cleanName.split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return cleanName.substring(0, 2).toUpperCase();
}

export function formatSubmissionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function formatStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'rejected_resubmit':
      return 'Rejected (Retry)';
    case 'rejected_permanent':
      return 'Rejected (Final)';
    default:
      return status;
  }
}

export function getStatusColors(status: SubmissionStatus): { color: string; bgColor: string } {
  switch (status) {
    case 'pending':
      return { color: mflColors.amber, bgColor: mflColors.amberLight };
    case 'approved':
      return { color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'rejected':
    case 'rejected_resubmit':
    case 'rejected_permanent':
      return { color: mflColors.danger, bgColor: mflColors.dangerLight };
    default:
      return { color: mflColors.textMuted, bgColor: mflColors.surface };
  }
}

export function isRejectedStatus(status: SubmissionStatus): boolean {
  return status === 'rejected' || status === 'rejected_resubmit' || status === 'rejected_permanent';
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatActivityName(submission: SubmissionForValidation): string {
  if (submission.type === 'rest') return 'Rest Day';
  if (submission.customActivityName) return submission.customActivityName;
  if (submission.workoutType) return titleCase(submission.workoutType);
  return titleCase(submission.type);
}

export function formatPoints(submission: SubmissionForValidation, pointsUnit: string): string {
  const value = submission.effectivePoints ?? submission.rrValue;
  if (value == null) return '-';
  return `${Number(value).toFixed(1)} ${pointsUnit}`;
}

export function formatMetric(value: number | null, suffix: string): string | null {
  if (value == null) return null;
  if (suffix === 'steps') return Number(value).toLocaleString();
  return `${Number(value).toLocaleString()} ${suffix}`;
}

export function getSubmissionMetrics(submission: SubmissionForValidation) {
  return [
    { label: 'Duration', value: formatMetric(submission.duration, 'min') },
    { label: 'Distance', value: formatMetric(submission.distance, 'km') },
    { label: 'Steps', value: formatMetric(submission.steps, 'steps') },
    { label: 'Holes', value: formatMetric(submission.holes, 'holes') },
    { label: 'Avg HR', value: formatMetric(submission.hrAvg, 'bpm') },
    { label: 'Calories', value: formatMetric(submission.caloriesBurned, 'kcal') },
  ].filter((metric): metric is { label: string; value: string } => Boolean(metric.value));
}

export function filterSubmissions(
  submissions: SubmissionForValidation[],
  filters: {
    status: StatusFilter;
    teamId: string;
    dateText: string;
    searchText: string;
  },
): SubmissionForValidation[] {
  const search = filters.searchText.trim().toLowerCase();
  const dateKey = filters.dateText.trim();

  return submissions.filter((submission) => {
    if (filters.status !== 'all' && submission.status !== filters.status) return false;
    if (filters.teamId !== 'all' && submission.member.teamId !== filters.teamId) return false;
    if (dateKey && toDateKey(submission.date) !== dateKey) return false;
    if (!search) return true;

    const haystack = [
      submission.member.username,
      submission.member.email,
      submission.member.teamName,
      formatActivityName(submission),
      submission.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function getTeamLabel(team: SubmissionTeam): string {
  return team.teamName || 'Unnamed Team';
}
