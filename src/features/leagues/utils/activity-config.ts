import type {
  FrequencyType,
  MeasurementType,
  RequirementLevel,
} from '../types/activity-config.model';

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  none: 'None',
  duration: 'Duration',
  distance: 'Distance',
  steps: 'Steps',
  hole: 'Holes',
};

export const REQUIREMENT_LABELS: Record<RequirementLevel, string> = {
  mandatory: 'Required',
  optional: 'Optional',
  not_required: 'Not needed',
};

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function nextRequirement(value: RequirementLevel): RequirementLevel {
  if (value === 'mandatory') return 'optional';
  if (value === 'optional') return 'not_required';
  return 'mandatory';
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = error.response.data as { error?: string; message?: string };
    return data.error || data.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
