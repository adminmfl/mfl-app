import { api } from '../../../core/api';
import type {
  CreateCustomActivityPayloadDTO,
  CustomActivitiesResponseDTO,
  CustomActivityMutationResponseDTO,
  DeleteCustomActivityResponseDTO,
  UpdateCustomActivityPayloadDTO,
} from '../types/custom-activity.dto';
import { getCustomActivityApiErrorMessage } from '../utils/custom-activity-api-error';

export async function fetchCustomActivities(): Promise<CustomActivitiesResponseDTO> {
  try {
    const res = await api.get<CustomActivitiesResponseDTO>('/api/custom-activities');
    return res.data;
  } catch (error) {
    throw new Error(
      getCustomActivityApiErrorMessage(error, 'Failed to fetch custom activities'),
    );
  }
}

export async function createCustomActivity(
  data: CreateCustomActivityPayloadDTO,
): Promise<CustomActivityMutationResponseDTO> {
  try {
    const res = await api.post<CustomActivityMutationResponseDTO>(
      '/api/custom-activities',
      data,
    );
    return res.data;
  } catch (error) {
    throw new Error(
      getCustomActivityApiErrorMessage(error, 'Failed to create custom activity'),
    );
  }
}

export async function updateCustomActivity(
  data: UpdateCustomActivityPayloadDTO,
): Promise<CustomActivityMutationResponseDTO> {
  try {
    const res = await api.patch<CustomActivityMutationResponseDTO>(
      '/api/custom-activities',
      data,
    );
    return res.data;
  } catch (error) {
    throw new Error(
      getCustomActivityApiErrorMessage(error, 'Failed to update custom activity'),
    );
  }
}

export async function deleteCustomActivity(
  customActivityId: string,
): Promise<DeleteCustomActivityResponseDTO> {
  try {
    const res = await api.delete<DeleteCustomActivityResponseDTO>(
      '/api/custom-activities',
      {
        data: { custom_activity_id: customActivityId },
      },
    );
    return res.data;
  } catch (error) {
    throw new Error(
      getCustomActivityApiErrorMessage(error, 'Failed to delete custom activity'),
    );
  }
}
