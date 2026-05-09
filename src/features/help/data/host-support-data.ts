export interface ChecklistItem {
  title: string;
  desc: string;
}

export const LEAGUE_CONCEPT_POINTS = [
  'Members log fitness activities (workouts, rest days, challenges)',
  'You approve/reject submissions and award points',
  'Leaderboards automatically rank members by points',
  'League runs for a fixed duration (days you set)',
] as const;

export const LEAGUE_CONCEPT_DESC =
  'A fitness league is a time-bound competition where members compete individually and/or in teams. Members log activities, submit challenges, and earn points based on their performance. You define the rules, duration, and how points are awarded.';

export const SETTINGS_CHECKLIST: ChecklistItem[] = [
  { title: 'Choose a Tier', desc: 'Select Basic, Medium, or Pro based on participant count and duration needs' },
  { title: 'Set Start & End Dates', desc: 'Define the exact days the league runs (includes start and end day)' },
  { title: 'Configure Teams', desc: 'Set number of teams and max participants per team' },
  { title: 'Set Rest Days', desc: 'Define how many rest days members get during the league' },
  { title: 'Enable Auto Rest Day', desc: 'Optional: Automatically give rest days on specific days (e.g., Sundays)' },
  { title: 'Pick Activities', desc: 'Choose which activities count (running, gym, yoga, steps, etc.)' },
  { title: 'Set Activity Minimums', desc: 'Define minimum duration/distance/steps per activity' },
  { title: 'League Visibility', desc: 'Choose public (discoverable) or private (invite-only)' },
  { title: 'Generate Invite Code', desc: 'Create and share unique code for members to join' },
  { title: 'Upload Rules & Docs', desc: 'Add any league-specific rules or documentation' },
];
