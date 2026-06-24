/**
 * Shared formatting utilities for submission display.
 */

/**
 * Formats a snake_case workout type key into a human-readable label.
 * Falls back to customActivityName when provided, then to fallback (default: 'General Activity').
 *
 * Note: reupload-submission.tsx passes 'General' explicitly.
 * Pass the fallback param when the default doesn't match the desired text.
 */
export function formatWorkoutType(
  workoutType: string | null,
  customActivityName?: string,
  fallback = 'General Activity',
): string {
  if (customActivityName) return customActivityName;
  if (!workoutType) return fallback;
  return workoutType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats an ISO date string as a full weekday + date string.
 * e.g. "Monday, June 15, 2026"
 */
export function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats an ISO date string as a short date + time.
 * e.g. "Jun 15, 2026 at 3:45 PM"
 */
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

/**
 * Formats an ISO date string as a short date.
 * e.g. "Jun 15, 2026"
 */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
