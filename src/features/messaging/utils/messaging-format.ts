import type { RecentWorkout } from '../types/messaging.model';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatRelativeMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) {
    return `Yesterday ${date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
  if (diffDay < 7) {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'short',
    })} ${date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatWorkoutTypeLabel(type: string | null): string {
  if (!type || uuidPattern.test(type)) return 'Activity';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getWorkoutDisplayName(workout: RecentWorkout): string {
  return workout.customActivityName || formatWorkoutTypeLabel(workout.workoutType);
}

export function getWorkoutDeepLinkLabel(workout: RecentWorkout): string {
  const date = new Date(workout.date);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const base = getWorkoutDisplayName(workout);
  const sessionLabel = /session$/i.test(base) ? base : `${base} Session`;
  return `${sessionLabel} - ${dateLabel}`;
}

export function getDeepLinkLabel(path: string): string {
  try {
    const url = new URL(path, 'https://mfl.local');
    const label = url.searchParams.get('label');
    if (label && !uuidPattern.test(label)) return label;
  } catch {
    // Fall through to path labels.
  }

  const normalized = path.replace(/\/+$/, '');
  const match = normalized.match(/\/leagues\/[^/]+\/(.+)/);
  const section = match?.[1]?.split('/')[0] ?? normalized.split('/').filter(Boolean).at(-1);

  const labels: Record<string, string> = {
    submit: 'Submit Activity',
    challenges: 'Challenges',
    leaderboard: 'Leaderboard',
    activities: 'Activities',
    'manual-entry': 'Manual Entry',
    'my-team': 'My Team',
    rules: 'Rules',
    settings: 'Settings',
    analytics: 'Analytics',
    validate: 'Validate',
    submissions: 'Submissions',
  };

  if (!section) return 'Link';
  return labels[section] || section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getRoleLabel(role: string | null): string {
  if (!role) return 'player';
  return role.replace('_', ' ');
}

export function getInitial(value: string | null | undefined): string {
  return (value || '?').trim().charAt(0).toUpperCase() || '?';
}
