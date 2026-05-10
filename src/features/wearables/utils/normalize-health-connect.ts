import { Platform } from 'react-native';
import type { NormalizedActivityDTO } from '../types/wearable.dto';

const EXERCISE_TYPE_NAMES: Record<number, string> = {
  0: 'Other Workout',
  2: 'Badminton',
  4: 'Baseball',
  5: 'Basketball',
  8: 'Biking',
  9: 'Biking (Stationary)',
  10: 'Boot Camp',
  11: 'Boxing',
  13: 'Calisthenics',
  14: 'Cricket',
  16: 'Dancing',
  25: 'Elliptical',
  26: 'Exercise Class',
  28: 'Football (American)',
  29: 'Football (Australian)',
  32: 'Golf',
  33: 'Guided Breathing',
  34: 'Gymnastics',
  35: 'Handball',
  36: 'HIIT',
  37: 'Hiking',
  38: 'Ice Hockey',
  39: 'Ice Skating',
  44: 'Martial Arts',
  46: 'Paddling',
  48: 'Pilates',
  50: 'Racquetball',
  51: 'Rock Climbing',
  53: 'Rowing',
  54: 'Rowing Machine',
  55: 'Rugby',
  56: 'Running',
  57: 'Running (Treadmill)',
  58: 'Sailing',
  60: 'Skating',
  61: 'Skiing',
  62: 'Snowboarding',
  64: 'Soccer',
  66: 'Squash',
  68: 'Stair Climbing',
  70: 'Strength Training',
  71: 'Stretching',
  72: 'Surfing',
  73: 'Swimming (Open Water)',
  74: 'Swimming (Pool)',
  75: 'Table Tennis',
  76: 'Tennis',
  78: 'Volleyball',
  79: 'Walking',
  80: 'Water Polo',
  81: 'Weightlifting',
  83: 'Yoga',
};

function getExerciseTypeName(type: number): string {
  return EXERCISE_TYPE_NAMES[type] ?? 'Other Workout';
}

function computeDurationSeconds(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 1000));
}

function createProviderActivityId(record: {
  metadata?: { id?: string };
  startTime: string;
  endTime: string;
  exerciseType: number;
}): string {
  if (record.metadata?.id) return record.metadata.id;
  const fingerprint = `${record.startTime}|${record.endTime}|${record.exerciseType}`;
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash + fingerprint.charCodeAt(i)) | 0;
  }
  return `hc_${Math.abs(hash).toString(36)}`;
}

interface ExerciseRecord {
  metadata?: {
    id?: string;
    dataOrigin?: string;
    device?: { manufacturer?: string; model?: string };
  };
  startTime: string;
  endTime: string;
  exerciseType: number;
  title?: string;
}

interface AggregatedData {
  steps: number | null;
  distanceMeters: number | null;
  calories: number | null;
}

export function normalizeExerciseSession(
  record: ExerciseRecord,
  aggregated: AggregatedData,
): NormalizedActivityDTO {
  const device = record.metadata?.device;
  const sourceDevice = device
    ? [device.manufacturer, device.model].filter(Boolean).join(' ') || null
    : null;

  return {
    provider: 'health_connect',
    provider_activity_id: createProviderActivityId(record),
    activity_type: record.title || getExerciseTypeName(record.exerciseType),
    started_at: record.startTime,
    ended_at: record.endTime,
    duration_seconds: computeDurationSeconds(record.startTime, record.endTime),
    distance_meters: aggregated.distanceMeters,
    steps: aggregated.steps,
    calories: aggregated.calories,
    source_app: record.metadata?.dataOrigin ?? null,
    source_device: sourceDevice,
    raw_payload: {
      platform: Platform.OS,
      exerciseType: record.exerciseType,
      exerciseTypeName: getExerciseTypeName(record.exerciseType),
      metadataId: record.metadata?.id ?? null,
    },
  };
}
