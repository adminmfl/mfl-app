import type { LeagueActivity } from '../../leagues/hooks/use-league-activities';

export interface SubmissionFormState {
  submissionType: 'workout' | 'rest';
  activityDate: string; // yyyy-MM-dd
  workoutType: string; // activity value/id
  duration: string;
  distance: string;
  steps: string;
  holes: string;
  notes: string;
  outcome: string;
  customFieldValue: string;
  customFieldValue2: string;
  restDayReason: string;
  isExemptionRequest: boolean;
}

export interface SubmissionFormErrors {
  workoutType?: string;
  duration?: string;
  distance?: string;
  steps?: string;
  holes?: string;
  notes?: string;
  outcome?: string;
  customField?: string;
  customField2?: string;
  proof?: string;
  date?: string;
}

export interface ProofImage {
  uri: string;
  name: string;
  type: string;
}

export interface ResubmitParams {
  resubmitId: string;
  date?: string;
  type?: 'workout' | 'rest';
  workoutType?: string;
  duration?: string;
  distance?: string;
  steps?: string;
  holes?: string;
  notes?: string;
}

export type { LeagueActivity };
