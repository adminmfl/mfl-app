import type { WearableConnectionDTO, PendingWorkoutDTO } from '../types/wearable.dto';
import type { WearableConnection, PendingWorkout } from '../types/wearable.model';

export function toWearableConnection(dto: WearableConnectionDTO): WearableConnection {
  return {
    connectionId: dto.connection_id,
    provider: dto.provider,
    status: dto.status,
    deviceName: dto.device_name,
    lastSyncedAt: dto.last_synced_at,
    createdAt: dto.created_at,
  };
}

export function toPendingWorkout(dto: PendingWorkoutDTO): PendingWorkout {
  return {
    workoutId: dto.workout_id,
    provider: dto.provider,
    providerActivityId: dto.provider_activity_id,
    activityType: dto.activity_type,
    startedAt: dto.started_at,
    endedAt: dto.ended_at,
    durationSeconds: dto.duration_seconds,
    distanceMeters: dto.distance_meters,
    steps: dto.steps,
    calories: dto.calories,
    sourceApp: dto.source_app,
    sourceDevice: dto.source_device,
    createdAt: dto.created_at,
  };
}
