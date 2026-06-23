import { mflColors } from '../../../constants/colors';

/**
 * Shared display utilities for invite screens.
 */

/**
 * Formats an ISO date string for display on invite screens.
 * Returns 'N/A' for null/undefined values.
 */
export function formatInviteDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns chip color/background for a given league status string.
 */
export function inviteStatusChipStyle(status: string): { color: string; bgColor: string } {
  switch (status.toLowerCase()) {
    case 'active':
      return { color: mflColors.brand, bgColor: mflColors.brandLight };
    case 'upcoming':
      return { color: mflColors.accent, bgColor: mflColors.accentLight };
    case 'ended':
    case 'completed':
      return { color: mflColors.textMuted, bgColor: mflColors.surface };
    default:
      return { color: mflColors.amber, bgColor: mflColors.amberLight };
  }
}
