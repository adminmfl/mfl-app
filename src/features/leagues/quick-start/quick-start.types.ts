// Types, constants, and helpers for the Quick Start League flow.
// Matches web PR #270: src/components/quick-start/types.ts

export type TemplateId = '40_day' | '60_day' | '90_day_pfl';
export type LeagueTypeOption = 'corporate' | 'residential' | 'custom';
export type ScoringFormula = 'standard' | 'simple' | 'points_only';
export type ProofRequirement = 'mandatory' | 'optional';
export type LeagueMode = 'standard' | 'challenges_only';

export interface TemplateConfig {
  id: TemplateId;
  title: string;
  subtitle: string;
  duration: number;
  activities: number;
  restDays: number;
  activityList: string[];
}

export interface WizardData {
  // Step 1: League Type & Template
  template: TemplateId | null;
  leagueType: LeagueTypeOption;
  cloneFromLeagueId: string | null;

  // Step 2: Basics
  leagueName: string;
  startDate: string;
  duration: number;
  maxParticipants: number;
  isPublic: boolean;

  // Step 3: Teams
  playerCount: number;
  numTeams: number;
  maxTeamCapacity: number;

  // Step 4: Activities & Rules
  activities: string[];
  restDays: number;
  scoringFormula: ScoringFormula;
  proofRequirement: ProofRequirement;
  notesRequirement: boolean;
  leagueMode: LeagueMode;

  // Wizard meta
  currentStep: number;
}

export interface WizardResult {
  league_id: string;
  league_name: string;
  invite_code: string;
  teams_created: number;
  activities_added: number;
  start_date: string;
  end_date: string;
  team_invites: TeamInvite[];
}

export interface TeamInvite {
  team_name: string;
  invite_code: string;
}

export interface CloneableLeague {
  league_id: string;
  league_name: string;
  start_date: string;
  end_date: string;
  num_teams: number;
  rest_days: number;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: '40_day',
    title: '40-Day League',
    subtitle: 'Perfect for a focused fitness sprint. 40 days, 5 core activities.',
    duration: 40,
    activities: 5,
    restDays: 1,
    activityList: ['Running', 'Walking', 'Cycling', 'Yoga', 'Gym'],
  },
  {
    id: '60_day',
    title: '60-Day League',
    subtitle: 'Full fitness journey. 60 days, all activities included.',
    duration: 60,
    activities: 8,
    restDays: 1,
    activityList: [
      'Running', 'Walking', 'Cycling', 'Yoga', 'Gym',
      'Swimming', 'Sports', 'Dance',
    ],
  },
  {
    id: '90_day_pfl',
    title: '90-Day PFL Format',
    subtitle:
      'The full Pristine Fitness League format. 90 days, 10 activities including Golf & Steps.',
    duration: 90,
    activities: 10,
    restDays: 1,
    activityList: [
      'Running', 'Walking', 'Cycling', 'Yoga', 'Gym',
      'Swimming', 'Dance', 'Sports', 'Steps', 'Golf',
    ],
  },
];

export const ALL_ACTIVITIES = [
  'Running', 'Walking', 'Cycling', 'Yoga', 'Gym',
  'Swimming', 'Dance', 'Sports', 'Steps', 'Golf',
];

export const STEP_LABELS = [
  'Type & Template',
  'Basics',
  'Teams',
  'Activities & Rules',
  'Review & Launch',
] as const;

export function getDefaultWizardData(): WizardData {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  const startDate = `${y}-${m}-${d}`;

  return {
    template: null,
    leagueType: 'corporate',
    cloneFromLeagueId: null,
    leagueName: '',
    startDate,
    duration: 40,
    maxParticipants: 40,
    isPublic: false,
    playerCount: 20,
    numTeams: 4,
    maxTeamCapacity: 10,
    activities: ['Running', 'Walking', 'Cycling', 'Yoga', 'Gym'],
    restDays: 1,
    scoringFormula: 'standard',
    proofRequirement: 'mandatory',
    notesRequirement: false,
    leagueMode: 'standard',
    currentStep: 1,
  };
}

export function calculateTeams(playerCount: number) {
  let numTeams: number;
  if (playerCount <= 8) numTeams = 2;
  else if (playerCount <= 15) numTeams = 3;
  else if (playerCount <= 24) numTeams = 4;
  else if (playerCount <= 40) numTeams = 5;
  else if (playerCount <= 60) numTeams = 6;
  else if (playerCount <= 80) numTeams = 8;
  else if (playerCount <= 100) numTeams = 10;
  else numTeams = 12;

  const maxTeamCapacity = Math.ceil(playerCount / numTeams) + 2;
  return { numTeams, maxTeamCapacity };
}

/** Add days to a YYYY-MM-DD string, returns YYYY-MM-DD. */
export function addDaysToDate(dateStr: string, days: number): string {
  const dt = new Date(dateStr + 'T00:00:00');
  dt.setDate(dt.getDate() + days - 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format YYYY-MM-DD to readable string (e.g. "12 Jun 2026"). */
export function formatDate(dateStr: string): string {
  try {
    const dt = new Date(dateStr + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Returns tomorrow as YYYY-MM-DD. */
export function getTomorrowString(): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
