import type { ActivityCategoryDTO } from '../types/activity-category.dto';
import type {
  ActivityCategory,
  ActivityCategorySummary,
  CustomActivity,
} from '../types/custom-activity.model';
import type { ActivityCategorySummaryDTO, CustomActivityDTO } from '../types/custom-activity.dto';

export function toActivityCategory(dto: ActivityCategoryDTO): ActivityCategory {
  return {
    categoryId: dto.category_id,
    categoryName: dto.category_name,
    displayName: dto.display_name,
    description: dto.description,
    displayOrder: dto.display_order,
  };
}

function toActivityCategorySummary(
  dto: ActivityCategorySummaryDTO | null | undefined,
): ActivityCategorySummary | null {
  if (!dto) return null;
  return {
    categoryId: dto.category_id,
    categoryName: dto.category_name,
    displayName: dto.display_name,
  };
}

export function toCustomActivity(dto: CustomActivityDTO): CustomActivity {
  return {
    customActivityId: dto.custom_activity_id,
    activityName: dto.activity_name,
    description: dto.description,
    categoryId: dto.category_id,
    category: toActivityCategorySummary(dto.category),
    measurementType: dto.measurement_type,
    requiresProof: dto.requires_proof,
    requiresNotes: dto.requires_notes,
    isActive: dto.is_active,
    createdBy: dto.created_by,
    createdDate: dto.created_date,
    usageCount: dto.usage_count ?? 0,
  };
}
