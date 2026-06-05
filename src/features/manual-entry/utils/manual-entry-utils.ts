import type { LeagueActivity } from '../../leagues/hooks/use-league-activities';
import type {
  ManualEntryDTO,
  ManualEntryForm,
  ManualEntryKind,
  ManualEntryMember,
  ManualEntryMemberDTO,
  ManualEntryStatus,
  ManualEntryState,
  ManualWeekRow,
} from '../types/manual-entry';

export function toManualEntryMember(dto: ManualEntryMemberDTO): ManualEntryMember {
  return {
    leagueMemberId: dto.league_member_id,
    userId: dto.user_id,
    username: dto.username || 'Unknown',
    email: dto.email || '',
    teamId: dto.team_id,
    teamName: dto.team_name,
  };
}

export function normalizedTeamName(teamName: string | null): string {
  return teamName && teamName.trim().length > 0 ? teamName : 'Unassigned';
}

export function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function fromISODate(iso: string): Date {
  const [yyyy, mm, dd] = iso.split('-').map(Number);
  return new Date(yyyy || 1970, (mm || 1) - 1, dd || 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeekSunday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getWeekRange(weekOffset: number) {
  const start = addDays(startOfWeekSunday(new Date()), -weekOffset * 7);
  const end = addDays(start, 6);
  return {
    start,
    end,
    startDate: toISODate(start),
    endDate: toISODate(end),
  };
}

export function formatDisplayDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  const startText = start.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
  const endText = end.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  return `${startText} - ${endText}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return (name || 'PL').substring(0, 2).toUpperCase();
}

export function normalizeStatus(status?: string | null): ManualEntryStatus | '' {
  const value = (status || '').toLowerCase();
  if (value === 'approved' || value === 'accepted') return 'approved';
  if (value === 'pending') return 'pending';
  if (value === 'rejected') return 'rejected';
  return '';
}

function latestEntry(a: ManualEntryDTO, b: ManualEntryDTO) {
  const tsA = String(a.modified_date || a.created_date || '');
  const tsB = String(b.modified_date || b.created_date || '');
  return tsB > tsA ? b : a;
}

export function buildWeekRows(
  start: Date,
  entries: ManualEntryDTO[],
  showRR: boolean,
): ManualWeekRow[] {
  const byDate = new Map<string, ManualEntryDTO>();
  entries.forEach((entry) => {
    if (!entry.date) return;
    const existing = byDate.get(entry.date);
    byDate.set(entry.date, existing ? latestEntry(existing, entry) : entry);
  });

  const today = todayISO();
  const rows: ManualWeekRow[] = [];

  for (let i = 0; i < 7; i += 1) {
    const day = addDays(start, i);
    const ymd = toISODate(day);
    const entry = byDate.get(ymd) || null;
    const status = normalizeStatus(entry?.status);
    let state: ManualEntryState = 'nodata';

    if (!entry) {
      state = ymd > today ? 'upcoming' : 'missed';
    } else if (status === 'approved') {
      state = 'approved';
    } else if (status === 'pending') {
      state = 'pending';
    } else if (status === 'rejected') {
      state = 'rejected';
    }

    const rr = typeof entry?.rr_value === 'number' ? entry.rr_value : null;
    const pointsLabel =
      rr === null ? '0 pt' : showRR ? `${rr.toFixed(1)} RR` : `${rr.toFixed(1)} pt`;

    rows.push({
      date: ymd,
      label: formatDisplayDate(ymd),
      entry,
      state,
      pointsLabel,
    });
  }

  return rows;
}

export function makeEmptyManualEntryForm(entry?: ManualEntryDTO | null): ManualEntryForm {
  return {
    type: entry?.type || 'workout',
    workoutType: entry?.workout_type || '',
    duration: entry?.duration?.toString() || '',
    distance: entry?.distance?.toString() || '',
    steps: entry?.steps?.toString() || '',
    holes: entry?.holes?.toString() || '',
    proofUrl: entry?.proof_url || '',
    notes: entry?.notes || '',
  };
}

export function computeRunRateFromForm(form: ManualEntryForm): number {
  const baseDuration = 45;
  const minSteps = 10000;
  const maxSteps = 20000;

  if (form.type === 'rest') return 1.0;

  const steps = toNumber(form.steps);
  const holes = toNumber(form.holes);
  const duration = toNumber(form.duration);
  const distance = toNumber(form.distance);
  const workoutType = form.workoutType.toLowerCase();

  if (workoutType === 'steps' && typeof steps === 'number') {
    if (steps < minSteps) return 0;
    const capped = Math.min(steps, maxSteps);
    return Math.min(1 + (capped - minSteps) / (maxSteps - minSteps), 2.0);
  }

  if (workoutType === 'golf' && typeof holes === 'number') {
    return Math.min(holes / 9, 2.0);
  }

  if (workoutType === 'run' || workoutType === 'cardio') {
    const rrDur = typeof duration === 'number' ? duration / baseDuration : 0;
    const rrDist = typeof distance === 'number' ? distance / 4 : 0;
    return Math.min(Math.max(rrDur, rrDist), 2.0);
  }

  if (workoutType === 'cycling') {
    const rrDur = typeof duration === 'number' ? duration / baseDuration : 0;
    const rrDist = typeof distance === 'number' ? distance / 10 : 0;
    return Math.min(Math.max(rrDur, rrDist), 2.0);
  }

  if (typeof duration === 'number') {
    return Math.min(duration / baseDuration, 2.0);
  }

  return 1.0;
}

export function getWorkoutCategory(
  type: ManualEntryKind,
  workoutType: string,
  measurementType?: LeagueActivity['measurement_type'] | null,
) {
  if (type === 'rest') return 'rest';

  if (measurementType) {
    switch (measurementType) {
      case 'steps':
        return 'steps';
      case 'hole':
        return 'golf';
      case 'distance':
        return 'run';
      case 'duration':
        return 'other';
      case 'none':
        return 'none';
      default:
        break;
    }
  }

  const normalized = workoutType.toLowerCase();
  if (normalized === 'steps') return 'steps';
  if (normalized === 'golf') return 'golf';
  if (normalized === 'cycling') return 'cycling';
  if (normalized === 'run' || normalized === 'running' || normalized === 'cardio') {
    return 'run';
  }
  return 'other';
}

export function getActivityNameMap(activities: LeagueActivity[]) {
  const map = new Map<string, string>();
  activities.forEach((activity) => {
    map.set(activity.value, activity.activity_name);
    const anyActivity = activity as LeagueActivity & {
      custom_activity_id?: string;
      activity_id?: string;
    };
    if (anyActivity.custom_activity_id) {
      map.set(anyActivity.custom_activity_id, activity.activity_name);
    }
    if (anyActivity.activity_id) {
      map.set(anyActivity.activity_id, activity.activity_name);
    }
  });
  return map;
}

export function resolveWorkoutType(
  workoutType: string | null,
  activityNameMap: Map<string, string>,
): string {
  if (!workoutType) return '';
  return activityNameMap.get(workoutType) || workoutType;
}

export function getEntrySummary(
  entry: ManualEntryDTO | null,
  activityNameMap: Map<string, string>,
) {
  if (!entry) return 'No submission';
  const typeLabel = entry.type === 'workout' ? 'Workout' : 'Rest Day';
  const workout = resolveWorkoutType(entry.workout_type, activityNameMap);
  const status = entry.status ? ` - ${entry.status}` : '';
  return `${typeLabel}${workout ? ` - ${workout}` : ''}${status}`;
}
