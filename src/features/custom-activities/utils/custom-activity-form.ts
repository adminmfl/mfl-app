import type {
  CreateCustomActivityInput,
  CustomActivity,
  MeasurementType,
} from '../types/custom-activity.model';

export interface CustomActivityFormData {
  activityName: string;
  description: string;
  categoryId: string;
  measurementType: MeasurementType;
  requiresProof: boolean;
  requiresNotes: boolean;
}

export function getDefaultCustomActivityForm(): CustomActivityFormData {
  return {
    activityName: '',
    description: '',
    categoryId: '',
    measurementType: 'none',
    requiresProof: true,
    requiresNotes: false,
  };
}

export function getCustomActivityEditForm(
  activity: CustomActivity,
): CustomActivityFormData {
  return {
    activityName: activity.activityName,
    description: activity.description ?? '',
    categoryId: activity.categoryId ?? '',
    measurementType: activity.measurementType,
    requiresProof: activity.requiresProof,
    requiresNotes: activity.requiresNotes,
  };
}

export function validateCustomActivityForm(
  form: CustomActivityFormData,
): string | null {
  if (form.activityName.trim().length < 2) {
    return 'Activity name must be at least 2 characters.';
  }

  return null;
}

export function toCustomActivityInput(
  form: CustomActivityFormData,
): CreateCustomActivityInput {
  const description = form.description.trim();
  const categoryId = form.categoryId.trim();

  return {
    activityName: form.activityName.trim(),
    description: description || undefined,
    categoryId: categoryId || undefined,
    measurementType: form.measurementType,
    requiresProof: form.requiresProof,
    requiresNotes: form.requiresNotes,
  };
}
