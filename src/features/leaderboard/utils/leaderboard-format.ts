export interface WeekPreset {
  label: string;
  startDate: string;
  endDate: string;
  weekNumber: number;
}

function parseYmd(value: string): Date | null {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!match) return null;
  const parts = value.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function calculateWeekPresets(
  leagueStartDate: string,
  leagueEndDate: string,
): WeekPreset[] {
  const start = parseYmd(leagueStartDate);
  const end = parseYmd(leagueEndDate);
  if (!start || !end) return [];

  const today = new Date();
  const weeks: WeekPreset[] = [];
  let weekStart = start;
  let weekNumber = 1;

  while (weekStart <= end && weekStart <= today) {
    const weekEnd = addDays(weekStart, 6);
    const actualEnd = weekEnd > end ? end : weekEnd;
    weeks.push({
      label: `Week ${weekNumber}`,
      startDate: toYmd(weekStart),
      endDate: toYmd(actualEnd),
      weekNumber,
    });
    weekStart = addDays(weekStart, 7);
    weekNumber += 1;
  }

  return weeks;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatDateLabel(value?: string | null): string {
  if (!value) return '-';
  const date = parseYmd(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return 'All Time';
  if (start && end) return `${formatDateLabel(start)} - ${formatDateLabel(end)}`;
  return start ? `From ${formatDateLabel(start)}` : `Until ${formatDateLabel(end)}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function capitalizeName(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function isPostLeague(endDate?: string | null): boolean {
  if (!endDate) return false;
  const date = parseYmd(endDate) ?? new Date(endDate);
  if (Number.isNaN(date.getTime())) return false;
  date.setHours(23, 59, 59, 999);
  return new Date() > date;
}

export function isValidYmd(value: string): boolean {
  return !!parseYmd(value);
}

export function getTimezoneParams() {
  let ianaTimezone: string | undefined;
  try {
    ianaTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {}

  return {
    tzOffsetMinutes: new Date().getTimezoneOffset(),
    ianaTimezone,
  };
}
