// Severity/priority color helpers for mobile (return { bg, text } style objects)

export function severityColor(severity: string): { bg: string; text: string } {
  switch (severity) {
    case 'critical':
      return { bg: '#FEE2E2', text: '#991B1B' };
    case 'high':
      return { bg: '#FFEDD5', text: '#9A3412' };
    case 'medium':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'low':
    default:
      return { bg: '#DBEAFE', text: '#1E40AF' };
  }
}

export function priorityColor(p: number): { bg: string; text: string } {
  if (p >= 8) return { bg: '#FEE2E2', text: '#991B1B' };
  if (p >= 6) return { bg: '#FFEDD5', text: '#9A3412' };
  if (p >= 4) return { bg: '#FEF3C7', text: '#92400E' };
  return { bg: '#DBEAFE', text: '#1E40AF' };
}

export function draftStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'sent':
      return { bg: '#DCFCE7', text: '#166534' };
    case 'scheduled':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#991B1B' };
    case 'dismissed':
      return { bg: '#F3F4F6', text: '#374151' };
    default:
      return { bg: '#DBEAFE', text: '#1E40AF' };
  }
}

export function draftStatusLabel(status: string): string {
  if (status === 'pending') return 'Draft';
  if (status === 'edited') return 'Draft (edited)';
  if (status === 'scheduled') return 'Scheduled';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    participation_drop: 'Participation',
    inactive_members: 'Inactive',
    streak_alert: 'Streaks',
    competition_gap: 'Competition Gap',
    challenge_ending: 'Challenge',
    rr_anomaly: 'Run Rate',
    league_health: 'League Health',
    milestone: 'Milestone',
    weekly_summary: 'Weekly Digest',
  };
  return labels[cat] || cat.replace(/_/g, ' ');
}
