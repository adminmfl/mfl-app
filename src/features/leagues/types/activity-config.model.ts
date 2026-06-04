export const MEASUREMENT_TYPES = [
  'none',
  'duration',
  'distance',
  'steps',
  'hole',
] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];
export type RequirementLevel = 'not_required' | 'optional' | 'mandatory';
export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface ActivityCategory {
  category_id: string;
  category_name: string;
  display_name: string;
  description?: string | null;
  display_order?: number | null;
}

export interface LeagueActivityConfig {
  activity_id: string;
  custom_activity_id?: string;
  activity_name: string;
  description: string | null;
  category_id: string | null;
  category?: ActivityCategory | null;
  value: string;
  measurement_type: MeasurementType;
  settings?: Record<string, any> | null;
  admin_info?: string | null;
  is_custom?: boolean;
  requires_proof?: boolean;
  requires_notes?: boolean;
  frequency?: number | null;
  frequency_type?: FrequencyType | null;
  min_value?: number | null;
  age_group_overrides?: Record<string, any> | null;
  proof_requirement?: RequirementLevel;
  notes_requirement?: RequirementLevel;
  points_per_session?: number;
  outcome_config?: { label: string; points: number }[] | null;
  max_images?: number;
  custom_field_label?: string | null;
  custom_field_placeholder?: string | null;
  custom_field_label_2?: string | null;
  custom_field_placeholder_2?: string | null;
  submission_window_days?: number | null;
}

export interface LeagueActivitiesConfigData {
  activities: LeagueActivityConfig[];
  allActivities?: LeagueActivityConfig[];
  isLeagueSpecific: boolean;
  isHost?: boolean;
  supportsFrequency?: boolean;
}

export interface LeagueActivitiesConfigResponse {
  success: boolean;
  error?: string;
  message?: string;
  data: LeagueActivitiesConfigData;
}

export interface UpdateLeagueActivityConfigInput {
  activity_id: string;
  frequency?: number | null;
  frequency_type?: FrequencyType | null;
  proof_requirement?: RequirementLevel;
  notes_requirement?: RequirementLevel;
  points_per_session?: number;
  outcome_config?: { label: string; points: number }[] | null;
  max_images?: number;
  custom_field_label?: string | null;
  custom_field_placeholder?: string | null;
  custom_field_label_2?: string | null;
  custom_field_placeholder_2?: string | null;
  submission_window_days?: number | null;
}

export interface CustomActivityConfig {
  custom_activity_id: string;
  activity_name: string;
  description: string | null;
  category_id: string | null;
  category?: ActivityCategory | null;
  measurement_type: MeasurementType;
  requires_proof: boolean;
  requires_notes: boolean;
  is_active: boolean;
  created_by: string;
  created_date: string;
  usage_count?: number;
}

export interface CustomActivitiesConfigResponse {
  success: boolean;
  data: CustomActivityConfig[];
}

export interface CustomActivityInput {
  activity_name: string;
  description?: string;
  category_id?: string | null;
  measurement_type: MeasurementType;
  requires_proof: boolean;
  requires_notes: boolean;
}

export interface UpdateCustomActivityInput extends CustomActivityInput {
  custom_activity_id: string;
}
