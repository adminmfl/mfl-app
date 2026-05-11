// Mirrors web's lib/utils/league-phases.ts

export const LEAGUE_PHASES = [
  'mobilisation',
  'launch_meet',
  'league_active',
  'challenges_live',
  'league_closure',
  'grand_finale',
  'post_league_archive',
] as const;

export type LeaguePhase = (typeof LEAGUE_PHASES)[number];

export interface LeaguePhaseConfig {
  enrolment_period_days: number;
  trial_period_days: number;
  challenge_frequency_days: number;
}

export interface LeaguePhaseChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  details?: string;
}

export interface LeaguePhaseInfo {
  league_id: string;
  league_name: string;
  role: 'host' | 'member';
  phase: LeaguePhase;
  phase_label: string;
  phase_description: string;
  phase_started_at: string | null;
  days_remaining: number | null;
  next_allowed_phases: LeaguePhase[];
  checklist: LeaguePhaseChecklistItem[];
  config: LeaguePhaseConfig;
  is_host_only: boolean;
  is_archive_due: boolean;
}

export const PHASE_LABELS: Record<LeaguePhase, string> = {
  mobilisation: 'Mobilisation',
  launch_meet: 'Launch Meet',
  league_active: 'League Active',
  challenges_live: 'Challenges Live',
  league_closure: 'League Closure',
  grand_finale: 'Grand Finale',
  post_league_archive: 'Post-League Archive',
};

export const ALLOWED_PHASE_TRANSITIONS: Record<LeaguePhase, LeaguePhase[]> = {
  mobilisation: ['launch_meet'],
  launch_meet: ['league_active'],
  league_active: ['challenges_live', 'league_closure'],
  challenges_live: ['league_closure', 'grand_finale'],
  league_closure: ['grand_finale'],
  grand_finale: ['post_league_archive'],
  post_league_archive: [],
};

export const PHASE_ACTION_LABELS: Record<LeaguePhase, string> = {
  mobilisation: 'Confirm Launch Meet',
  launch_meet: 'Move to League Active',
  league_active: 'Open Challenges Live',
  challenges_live: 'Move to League Closure',
  league_closure: 'Start Grand Finale',
  grand_finale: 'Archive After 14 Days',
  post_league_archive: 'Archive Locked',
};
