export interface WearableConnection {
  connectionId: string;
  provider: 'health_connect' | 'strava' | 'google_health';
  status: 'active' | 'disconnected' | 'expired';
  deviceName: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface PendingWorkout {
  workoutId: string;
  provider: string;
  providerActivityId: string;
  activityType: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  distanceMeters: number | null;
  steps: number | null;
  calories: number | null;
  sourceApp: string | null;
  sourceDevice: string | null;
  createdAt: string;
}

export interface SyncResult {
  imported: number;
  duplicates: number;
}

export interface ConfirmResult {
  pointsAwarded: number;
}

export type HealthConnectStatus =
  | 'unsupported'
  | 'not_installed'
  | 'not_connected'
  | 'permission_needed'
  | 'connected';
