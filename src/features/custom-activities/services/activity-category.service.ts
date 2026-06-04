import { api } from '../../../core/api';
import type { ActivityCategoriesResponseDTO } from '../types/activity-category.dto';
import { getCustomActivityApiErrorMessage } from '../utils/custom-activity-api-error';

export async function fetchActivityCategories(): Promise<ActivityCategoriesResponseDTO> {
  try {
    const res = await api.get<ActivityCategoriesResponseDTO>('/api/activity-categories');
    return res.data;
  } catch (error) {
    throw new Error(
      getCustomActivityApiErrorMessage(error, 'Failed to fetch activity categories'),
    );
  }
}
