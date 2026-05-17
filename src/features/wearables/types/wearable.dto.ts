export type WearableProvider =
  | 'health_connect'
  | 'healthkit'
  | 'strava'
  | 'google_health';

export interface WearableConnectionDTO {
  connection_id: string;
  provider: WearableProvider;
  status: 'active' | 'disconnected' | 'expired';
  device_name: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface WearableConnectionsResponseDTO {
  success: boolean;
  data: {
    connections: WearableConnectionDTO[];
  };
}

export interface RegisterWearableResponseDTO {
  success: boolean;
  data: {
    connection_id: string;
  };
}

export interface SyncWearableResponseDTO {
  success: boolean;
  data: {
    imported: number;
    duplicates: number;
  };
}

// Backwards-compatible aliases for existing imports.
export type RegisterHealthConnectResponseDTO = RegisterWearableResponseDTO;
export type SyncHealthConnectResponseDTO = SyncWearableResponseDTO;

export interface PendingWorkoutDTO {
  workout_id: string;
  provider: string;
  provider_activity_id: string;
  activity_type: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number | null;
  steps: number | null;
  calories: number | null;
  source_app: string | null;
  source_device: string | null;
  created_at: string;
}

export interface PendingConfirmationsResponseDTO {
  success: boolean;
  data: {
    pending_workouts: PendingWorkoutDTO[];
  };
}

export interface ConfirmWorkoutResponseDTO {
  success: boolean;
  data: {
    points_awarded: number;
  };
}

export interface RejectWorkoutResponseDTO {
  success: boolean;
}

export interface NormalizedActivityDTO {
  provider: 'health_connect' | 'healthkit';
  provider_activity_id: string;
  activity_type: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number | null;
  steps: number | null;
  calories: number | null;
  source_app: string | null;
  source_device: string | null;
  raw_payload: Record<string, unknown>;
}
