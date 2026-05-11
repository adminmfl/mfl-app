export type MeasurementType = 'duration' | 'distance' | 'hole' | 'steps' | 'none';

export interface ActivityCategorySummary {
  categoryId: string;
  categoryName: string;
  displayName: string;
}

export interface ActivityCategory extends ActivityCategorySummary {
  description: string | null;
  displayOrder: number;
}

export interface CustomActivity {
  customActivityId: string;
  activityName: string;
  description: string | null;
  categoryId: string | null;
  category: ActivityCategorySummary | null;
  measurementType: MeasurementType;
  requiresProof: boolean;
  requiresNotes: boolean;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  usageCount: number;
}

export interface CreateCustomActivityInput {
  activityName: string;
  description?: string;
  categoryId?: string | null;
  measurementType: MeasurementType;
  requiresProof?: boolean;
  requiresNotes?: boolean;
}

export interface UpdateCustomActivityInput extends CreateCustomActivityInput {
  customActivityId: string;
}
