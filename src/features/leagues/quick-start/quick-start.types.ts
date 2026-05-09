// Types, constants, and helpers for the Quick Start League flow.
// Matches web: src/app/(app)/leagues/quick-start/page.tsx

export type QuickStartTemplateId = '40_day' | '60_day' | '90_day_pfl';
export type QuickStartLeagueType = 'corporate' | 'residential';

export interface QuickStartTemplate {
  id: QuickStartTemplateId;
  title: string;
  subtitle: string;
  duration: number;
  activities: number;
  restDays: number;
  activityList: string[];
}

export interface QuickStartPayload {
  template: QuickStartTemplateId;
  league_name: string;
  league_type: QuickStartLeagueType;
  player_count: number;
  num_teams: number;
  start_date: string;
  end_date: string;
  duration: number;
  rest_days: number;
  activities: string[];
}

export interface QuickStartResponse {
  success: boolean;
  data: {
    league_id: string;
    league_name: string;
    teams_created: number;
    activities_added: number;
    start_date: string;
    end_date: string;
  };
  warning?: string;
}

// ── Template definitions (matches web exactly) ──

export const TEMPLATES: QuickStartTemplate[] = [
  {
    id: '40_day',
    title: '40-Day League',
    subtitle: 'Perfect for a focused fitness sprint. 40 days, 5 core activities.',
    duration: 40,
    activities: 5,
    restDays: 8,
    activityList: ['Running', 'Walking', 'Cycling', 'Yoga', 'Gym'],
  },
  {
    id: '60_day',
    title: '60-Day League',
    subtitle: 'Full fitness journey. 60 days, all activities included.',
    duration: 60,
    activities: 8,
    restDays: 12,
    activityList: ['Running', 'Walking', 'Cycling', 'Yoga', 'Gym', 'Swimming', 'Sports', 'Dance'],
  },
  {
    id: '90_day_pfl',
    title: '90-Day PFL Format',
    subtitle:
      'The full Pristine Fitness League format. 90 days, 18 rest days, 10 activities including Golf & Steps.',
    duration: 90,
    activities: 10,
    restDays: 18,
    activityList: [
      'Running', 'Walking', 'Cycling', 'Yoga', 'Gym',
      'Swimming', 'Dance', 'Sports', 'Steps', 'Golf',
    ],
  },
];

// ── Helpers ──

/** Team count algorithm matching web frontend ranges. */
export function getTeamCount(playerCount: number): number {
  if (playerCount <= 8) return 2;
  if (playerCount <= 15) return 3;
  if (playerCount <= 24) return 4;
  if (playerCount <= 40) return 5;
  if (playerCount <= 60) return 6;
  if (playerCount <= 80) return 8;
  if (playerCount <= 100) return 10;
  return 12;
}

/** Returns tomorrow as YYYY-MM-DD. */
export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Add days to a YYYY-MM-DD string, returns YYYY-MM-DD. */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Format YYYY-MM-DD to readable string (e.g. "12 Jun 2026"). */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
