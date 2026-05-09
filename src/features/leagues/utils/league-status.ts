/**
 * Determine whether a league's end-date has passed.
 * Mirrors the web helper in src/lib/utils.ts so both platforms agree.
 */
function parseLeagueEndDateUtc(endDate?: string | null): Date | null {
  if (!endDate) return null;
  const [y, m, d] = String(endDate).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const cutoff = new Date(Date.UTC(y, m - 1, d));
  cutoff.setUTCHours(cutoff.getUTCHours() + 33, 0, 0, 0);
  return cutoff;
}

export function isLeagueEnded(endDate?: string | null, now = new Date()): boolean {
  const cutoff = parseLeagueEndDateUtc(endDate);
  return cutoff ? now > cutoff : false;
}
