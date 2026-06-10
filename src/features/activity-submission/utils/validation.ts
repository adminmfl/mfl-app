import type { LeagueActivity } from '../../leagues/hooks/use-league-activities';
import type { SubmissionFormErrors } from '../types';

interface ValidationInput {
  workoutType: string;
  duration: string;
  distance: string;
  steps: string;
  holes: string;
  notes: string;
  outcome: string;
  customFieldValue: string;
  customFieldValue2: string;
  selectedActivity: LeagueActivity | null;
  hasProof: boolean;
  isResubmit: boolean;
}

const MAX_LIMITS: Record<string, { max: number; label: string }> = {
  duration: { max: 1440, label: 'Duration cannot exceed 1440 minutes (24 hours)' },
  distance: { max: 1000, label: 'Distance cannot exceed 1000 km' },
  steps: { max: 500000, label: 'Steps cannot exceed 500,000' },
  holes: { max: 36, label: 'Holes cannot exceed 36' },
};

export function validateWorkoutForm(input: ValidationInput): SubmissionFormErrors {
  const errors: SubmissionFormErrors = {};
  const { selectedActivity } = input;

  if (!input.workoutType) {
    errors.workoutType = 'Select an activity type';
  }

  if (!selectedActivity) return errors;

  const measurementType = selectedActivity.measurement_type || 'duration';
  const secondaryMeasurement = selectedActivity.settings?.secondary_measurement_type as string | undefined;

  if (measurementType !== 'none') {
    const fieldMap: Record<string, string> = {
      duration: input.duration,
      distance: input.distance,
      steps: input.steps,
      hole: input.holes,
    };

    const hasPrimary = !!fieldMap[measurementType]?.trim();
    const hasSecondary = secondaryMeasurement ? !!fieldMap[secondaryMeasurement]?.trim() : false;

    if (secondaryMeasurement) {
      if (!hasPrimary && !hasSecondary) {
        errors.duration = `Enter either ${measurementType} or ${secondaryMeasurement}`;
      } else if (hasPrimary && hasSecondary) {
        errors.duration = `Enter only ${measurementType} OR ${secondaryMeasurement}, not both`;
      }
    } else if (!hasPrimary) {
      const key = measurementType === 'hole' ? 'holes' : measurementType;
      (errors as any)[key] = `${measurementType} is required`;
    }
  }

  // Max value checks
  const numericFields = [
    { key: 'duration', value: input.duration },
    { key: 'distance', value: input.distance },
    { key: 'steps', value: input.steps },
    { key: 'holes', value: input.holes },
  ];
  for (const { key, value } of numericFields) {
    if (value.trim()) {
      const num = parseFloat(value);
      if (!Number.isFinite(num) || num < 0) {
        (errors as any)[key] = `${key} must be a valid positive number`;
      } else {
        const limit = MAX_LIMITS[key];
        if (limit && num > limit.max) {
          (errors as any)[key] = limit.label;
        }
      }
    }
  }

  // Proof requirement
  const proofReq = selectedActivity.proof_requirement ?? 'mandatory';
  if (proofReq === 'mandatory' && !input.hasProof && !input.isResubmit) {
    errors.proof = 'Proof screenshot is required';
  }

  // Outcome requirement
  if (selectedActivity.outcome_config) {
    const cfg = selectedActivity.outcome_config as any;
    const arr = Array.isArray(cfg) ? cfg : Array.isArray(cfg?.options) ? cfg.options : [];
    if (arr.length > 0 && !input.outcome) {
      errors.outcome = 'Outcome is required for this activity';
    }
  }

  // Custom field requirements
  if (selectedActivity.custom_field_label && !input.customFieldValue.trim()) {
    errors.customField = `"${selectedActivity.custom_field_label}" is required`;
  }
  if (selectedActivity.custom_field_label_2 && !input.customFieldValue2.trim()) {
    errors.customField2 = `"${selectedActivity.custom_field_label_2}" is required`;
  }

  return errors;
}
