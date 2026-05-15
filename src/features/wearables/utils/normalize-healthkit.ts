import { Platform } from 'react-native';
import type { NormalizedActivityDTO } from '../types/wearable.dto';

// Mirrors @kingstinct/react-native-healthkit's WorkoutActivityType enum.
// Source of truth: HKWorkoutActivityType in the package's generated types.
// We label-map to readable activity names that backend mapActivityType already understands
// (running, walking, cycling, swimming, yoga, etc.).
const ACTIVITY_TYPE_NAMES: Record<number, string> = {
  1: 'American Football',
  2: 'Archery',
  3: 'Australian Football',
  4: 'Badminton',
  5: 'Baseball',
  6: 'Basketball',
  7: 'Bowling',
  8: 'Boxing',
  9: 'Climbing',
  10: 'Cricket',
  11: 'Cross Training',
  12: 'Curling',
  13: 'Cycling',
  14: 'Dance',
  15: 'Dance Inspired Training',
  16: 'Elliptical',
  17: 'Equestrian Sports',
  18: 'Fencing',
  19: 'Fishing',
  20: 'Functional Strength Training',
  21: 'Golf',
  22: 'Gymnastics',
  23: 'Handball',
  24: 'Hiking',
  25: 'Hockey',
  26: 'Hunting',
  27: 'Lacrosse',
  28: 'Martial Arts',
  29: 'Mind And Body',
  30: 'Mixed Metabolic Cardio Training',
  31: 'Paddle Sports',
  32: 'Play',
  33: 'Preparation And Recovery',
  34: 'Racquetball',
  35: 'Rowing',
  36: 'Rugby',
  37: 'Running',
  38: 'Sailing',
  39: 'Skating Sports',
  40: 'Snow Sports',
  41: 'Soccer',
  42: 'Softball',
  43: 'Squash',
  44: 'Stair Climbing',
  45: 'Surfing Sports',
  46: 'Swimming',
  47: 'Table Tennis',
  48: 'Tennis',
  49: 'Track And Field',
  50: 'Traditional Strength Training',
  51: 'Volleyball',
  52: 'Walking',
  53: 'Water Fitness',
  54: 'Water Polo',
  55: 'Water Sports',
  56: 'Wrestling',
  57: 'Yoga',
  58: 'Barre',
  59: 'Core Training',
  60: 'Cross Country Skiing',
  61: 'Downhill Skiing',
  62: 'Flexibility',
  63: 'HIIT',
  64: 'Jump Rope',
  65: 'Kickboxing',
  66: 'Pilates',
  67: 'Snowboarding',
  68: 'Stairs',
  69: 'Step Training',
  70: 'Wheelchair Walk Pace',
  71: 'Wheelchair Run Pace',
  72: 'Tai Chi',
  73: 'Mixed Cardio',
  74: 'Hand Cycling',
  75: 'Disc Sports',
  76: 'Fitness Gaming',
  77: 'Cardio Dance',
  78: 'Social Dance',
  79: 'Pickleball',
  80: 'Cooldown',
  82: 'Swim Bike Run',
  83: 'Transition',
  84: 'Underwater Diving',
  3000: 'Other Workout',
};

function getActivityTypeName(type: number | undefined | null): string {
  if (type == null) return 'Other Workout';
  return ACTIVITY_TYPE_NAMES[type] ?? 'Other Workout';
}

function computeDurationSeconds(startDate: Date, endDate: Date): number {
  const start = startDate.getTime();
  const end = endDate.getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 1000));
}

export interface HealthKitWorkoutInput {
  uuid: string;
  workoutActivityType: number;
  startDate: Date;
  endDate: Date;
  duration?: { quantity: number; unit: string };
  totalEnergyBurned?: { quantity: number; unit: string };
  totalDistance?: { quantity: number; unit: string };
  sourceRevision?: {
    source: { name: string; bundleIdentifier: string };
  };
  device?: {
    name?: string;
    model?: string;
    manufacturer?: string;
  };
}

export interface HealthKitAggregatedData {
  steps: number | null;
  distanceMeters: number | null;
  calories: number | null;
}

/**
 * Convert a HealthKit workout (HKWorkout) into the shared NormalizedActivityDTO shape.
 * Distance and calories are taken from the workout totals first; aggregated quantity-sample
 * fallbacks (e.g. when totals are missing) come from the hook layer.
 */
export function normalizeHealthKitWorkout(
  workout: HealthKitWorkoutInput,
  aggregated: HealthKitAggregatedData,
): NormalizedActivityDTO {
  const distanceMeters =
    workout.totalDistance?.quantity ?? aggregated.distanceMeters ?? null;

  const calories =
    workout.totalEnergyBurned?.quantity ?? aggregated.calories ?? null;

  const deviceParts = [workout.device?.manufacturer, workout.device?.model]
    .filter(Boolean)
    .join(' ');
  const sourceDevice = workout.device?.name || deviceParts || null;

  const sourceApp = workout.sourceRevision?.source.name ?? null;

  return {
    provider: 'healthkit',
    provider_activity_id: workout.uuid,
    activity_type: getActivityTypeName(workout.workoutActivityType),
    started_at: workout.startDate.toISOString(),
    ended_at: workout.endDate.toISOString(),
    duration_seconds: computeDurationSeconds(workout.startDate, workout.endDate),
    distance_meters: distanceMeters,
    steps: aggregated.steps,
    calories,
    source_app: sourceApp,
    source_device: sourceDevice,
    raw_payload: {
      platform: Platform.OS,
      workoutActivityType: workout.workoutActivityType,
      workoutActivityTypeName: getActivityTypeName(workout.workoutActivityType),
      sourceBundleId: workout.sourceRevision?.source.bundleIdentifier ?? null,
    },
  };
}
