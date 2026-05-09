/** Get today's date as yyyy-MM-dd in local timezone. */
export function todayISO(): string {
  const d = new Date();
  return formatDateISO(d);
}

/** Get yesterday's date as yyyy-MM-dd in local timezone. */
export function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateISO(d);
}

/** Format a Date to yyyy-MM-dd. */
export function formatDateISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Parse yyyy-MM-dd to a Date (local midnight). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Format date for display. */
export function formatDisplayDate(iso: string): string {
  const date = parseISO(iso);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Shift a yyyy-MM-dd by N days and return new yyyy-MM-dd. */
export function shiftDateISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

/** Compare two yyyy-MM-dd strings. Returns -1, 0, or 1. */
export function compareDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Clamp a date string between min and max (inclusive). */
export function clampDate(date: string, min: string, max: string): string {
  if (compareDates(date, min) < 0) return min;
  if (compareDates(date, max) > 0) return max;
  return date;
}

/** Get IANA timezone string (e.g., 'Asia/Kolkata'). */
export function getIANATimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/** Get timezone offset in minutes (same as Date.getTimezoneOffset()). */
export function getTZOffsetMinutes(): number {
  return new Date().getTimezoneOffset();
}
