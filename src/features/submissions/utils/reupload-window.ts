/**
 * Reupload window logic — ported from web source of truth.
 * Users can reupload a rejected submission until end of next day (11:59:59.999 pm)
 * in their local time zone.
 */

export function getReuploadCutoffUtc(
  rejectionTimestamp: string | Date,
  tzOffsetMinutes: number,
): number | null {
  const rejection = new Date(rejectionTimestamp);
  if (Number.isNaN(rejection.getTime())) return null;

  const offset = Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0;

  const rejectionLocalMs = rejection.getTime() - offset * 60_000;
  const rejectionLocal = new Date(rejectionLocalMs);

  const cutoffUtc =
    Date.UTC(
      rejectionLocal.getUTCFullYear(),
      rejectionLocal.getUTCMonth(),
      rejectionLocal.getUTCDate() + 1,
      23,
      59,
      59,
      999,
    ) + offset * 60_000;

  return cutoffUtc;
}

export function isReuploadWindowOpen(
  rejectionTimestamp: string | Date | null | undefined,
  tzOffsetMinutes: number,
  nowMs: number = Date.now(),
): boolean {
  if (!rejectionTimestamp) return false;
  const cutoffUtc = getReuploadCutoffUtc(rejectionTimestamp, tzOffsetMinutes);
  if (cutoffUtc === null) return false;
  return nowMs <= cutoffUtc;
}
