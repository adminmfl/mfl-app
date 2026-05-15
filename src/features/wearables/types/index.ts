export type {
  WearableConnectionDTO,
  WearableConnectionsResponseDTO,
  RegisterHealthConnectResponseDTO,
  SyncHealthConnectResponseDTO,
  RegisterWearableResponseDTO,
  SyncWearableResponseDTO,
  PendingWorkoutDTO,
  PendingConfirmationsResponseDTO,
  ConfirmWorkoutResponseDTO,
  RejectWorkoutResponseDTO,
  NormalizedActivityDTO,
  WearableProvider as WearableProviderDTO,
} from './wearable.dto';

export type {
  WearableConnection,
  WearableProvider,
  PendingWorkout,
  SyncResult,
  ConfirmResult,
  HealthConnectStatus,
  HealthKitStatus,
} from './wearable.model';
