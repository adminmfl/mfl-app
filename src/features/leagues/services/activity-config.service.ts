import { api } from '../../../core/api';
import type {
  ActivityCategory,
  CustomActivitiesConfigResponse,
  CustomActivityConfig,
  CustomActivityInput,
  LeagueActivitiesConfigResponse,
  UpdateCustomActivityInput,
  UpdateLeagueActivityConfigInput,
} from '../types/activity-config.model';

export async function fetchConfigurableLeagueActivities(
  leagueId: string,
  includeAll: boolean,
): Promise<LeagueActivitiesConfigResponse> {
  const url = includeAll
    ? `/api/leagues/${leagueId}/activities?includeAll=true`
    : `/api/leagues/${leagueId}/activities`;
  const res = await api.get<LeagueActivitiesConfigResponse>(url);
  return res.data;
}

export async function addLeagueActivity(
  leagueId: string,
  activityId: string,
  isCustom: boolean,
): Promise<{ success: boolean; message?: string }> {
  const body = isCustom
    ? { custom_activity_ids: [activityId] }
    : { activity_ids: [activityId] };
  const res = await api.post<{ success: boolean; message?: string }>(
    `/api/leagues/${leagueId}/activities`,
    body,
  );
  return res.data;
}

export async function removeLeagueActivity(
  leagueId: string,
  activityId: string,
  isCustom: boolean,
): Promise<{ success: boolean; message?: string }> {
  const body = isCustom
    ? { custom_activity_id: activityId }
    : { activity_id: activityId };
  const res = await api.delete<{ success: boolean; message?: string }>(
    `/api/leagues/${leagueId}/activities`,
    { data: body },
  );
  return res.data;
}

export async function updateLeagueActivityConfig(
  leagueId: string,
  data: UpdateLeagueActivityConfigInput,
): Promise<{ success: boolean }> {
  const res = await api.patch<{ success: boolean }>(
    `/api/leagues/${leagueId}/activities`,
    data,
  );
  return res.data;
}

export async function fetchActivityCategories(): Promise<ActivityCategory[]> {
  const res = await api.get<{ success: boolean; data: ActivityCategory[] }>(
    '/api/activity-categories',
  );
  return res.data.data ?? [];
}

export async function fetchHostCustomActivities(): Promise<CustomActivityConfig[]> {
  const res = await api.get<CustomActivitiesConfigResponse>(
    '/api/custom-activities',
  );
  return res.data.data ?? [];
}

export async function createHostCustomActivity(
  input: CustomActivityInput,
): Promise<{ success: boolean; data?: CustomActivityConfig; message?: string }> {
  const body = {
    activity_name: input.activity_name,
    description: input.description,
    category_id: input.category_id || undefined,
    measurement_type: input.measurement_type,
    requires_proof: input.requires_proof,
    requires_notes: input.requires_notes,
  };
  const res = await api.post<{
    success: boolean;
    data?: CustomActivityConfig;
    message?: string;
  }>('/api/custom-activities', body);
  return res.data;
}

export async function updateHostCustomActivity(
  input: UpdateCustomActivityInput,
): Promise<{ success: boolean; data?: CustomActivityConfig; message?: string }> {
  const body = {
    custom_activity_id: input.custom_activity_id,
    activity_name: input.activity_name,
    description: input.description,
    category_id: input.category_id || null,
    measurement_type: input.measurement_type,
    requires_proof: input.requires_proof,
    requires_notes: input.requires_notes,
  };
  const res = await api.patch<{
    success: boolean;
    data?: CustomActivityConfig;
    message?: string;
  }>('/api/custom-activities', body);
  return res.data;
}

export async function deleteHostCustomActivity(
  customActivityId: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await api.delete<{ success: boolean; message?: string }>(
    '/api/custom-activities',
    { data: { custom_activity_id: customActivityId } },
  );
  return res.data;
}
