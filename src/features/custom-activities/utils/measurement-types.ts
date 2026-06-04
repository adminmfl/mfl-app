import type { MeasurementType } from '../types/custom-activity.model';

export interface MeasurementOption {
  value: MeasurementType;
  label: string;
  shortLabel: string;
  description: string;
}

export const MEASUREMENT_OPTIONS: MeasurementOption[] = [
  {
    value: 'none',
    label: 'None (No measurement required)',
    shortLabel: 'None',
    description: 'Completion only, with no RR calculation.',
  },
  {
    value: 'duration',
    label: 'Duration (minutes)',
    shortLabel: 'Duration',
    description: 'Time-based activities like workouts or yoga.',
  },
  {
    value: 'distance',
    label: 'Distance (km/miles)',
    shortLabel: 'Distance',
    description: 'Distance-based activities like running or cycling.',
  },
  {
    value: 'steps',
    label: 'Steps',
    shortLabel: 'Steps',
    description: 'Step-count activities.',
  },
  {
    value: 'hole',
    label: 'Holes',
    shortLabel: 'Holes',
    description: 'Golf or similar hole-based activities.',
  },
];

export function getMeasurementShortLabel(type: MeasurementType): string {
  return MEASUREMENT_OPTIONS.find((option) => option.value === type)?.shortLabel ?? type;
}
