import { api } from '../../../core/api';
import type {
  WearableConnectionsResponseDTO,
  RegisterWearableResponseDTO,
  SyncWearableResponseDTO,
  PendingConfirmationsResponseDTO,
  ConfirmWorkoutResponseDTO,
  RejectWorkoutResponseDTO,
  NormalizedActivityDTO,
} from '../types/wearable.dto';

export async function fetchWearableConnections(
  leagueId: string,
): Promise<WearableConnectionsResponseDTO> {
  const res = await api.get<WearableConnectionsResponseDTO>(
    `/api/leagues/${leagueId}/wearables/connections`,
  );
  return res.data;
}

export async function registerHealthConnect(
  leagueId: string,
  data: { deviceName?: string; androidVersion?: string; device_name?: string },
): Promise<RegisterWearableResponseDTO> {
  const res = await api.post<RegisterWearableResponseDTO>(
    `/api/leagues/${leagueId}/wearables/health-connect/register`,
    data,
  );
  return res.data;
}

export async function registerHealthKit(
  leagueId: string,
  data: { deviceName?: string; iosVersion?: string; device_name?: string },
): Promise<RegisterWearableResponseDTO> {
  const res = await api.post<RegisterWearableResponseDTO>(
    `/api/leagues/${leagueId}/wearables/healthkit/register`,
    data,
  );
  return res.data;
}

export async function deleteWearableConnection(
  leagueId: string,
  connectionId: string,
): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(
    `/api/leagues/${leagueId}/wearables/connections/${connectionId}`,
  );
  return res.data;
}

export async function syncHealthConnect(
  leagueId: string,
  activities: NormalizedActivityDTO[],
  connectionId?: string | null,
): Promise<SyncWearableResponseDTO> {
  const res = await api.post<SyncWearableResponseDTO>(
    `/api/leagues/${leagueId}/wearables/health-connect/sync`,
    connectionId
      ? { activities, connection_id: connectionId }
      : { activities },
  );
  return res.data;
}

export async function syncHealthKit(
  leagueId: string,
  activities: NormalizedActivityDTO[],
  connectionId?: string | null,
): Promise<SyncWearableResponseDTO> {
  const res = await api.post<SyncWearableResponseDTO>(
    `/api/leagues/${leagueId}/wearables/healthkit/sync`,
    connectionId
      ? { activities, connection_id: connectionId }
      : { activities },
  );
  return res.data;
}

export async function fetchPendingConfirmations(
  leagueId: string,
): Promise<PendingConfirmationsResponseDTO> {
  const res = await api.get<PendingConfirmationsResponseDTO>(
    `/api/leagues/${leagueId}/wearables/pending-confirmations`,
  );
  return res.data;
}

export async function confirmWorkout(
  leagueId: string,
  workoutId: string,
): Promise<ConfirmWorkoutResponseDTO> {
  const res = await api.post<ConfirmWorkoutResponseDTO>(
    `/api/leagues/${leagueId}/wearables/pending-confirmations/${workoutId}/confirm`,
  );
  return res.data;
}

export async function rejectWorkout(
  leagueId: string,
  workoutId: string,
): Promise<RejectWorkoutResponseDTO> {
  const res = await api.post<RejectWorkoutResponseDTO>(
    `/api/leagues/${leagueId}/wearables/pending-confirmations/${workoutId}/reject`,
  );
  return res.data;
}
