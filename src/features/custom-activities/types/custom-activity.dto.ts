export type MeasurementTypeDTO = 'duration' | 'distance' | 'hole' | 'steps' | 'none';

export interface ActivityCategorySummaryDTO {
  category_id: string;
  category_name: string;
  display_name: string;
}

export interface CustomActivityDTO {
  custom_activity_id: string;
  activity_name: string;
  description: string | null;
  category_id: string | null;
  category?: ActivityCategorySummaryDTO | null;
  measurement_type: MeasurementTypeDTO;
  requires_proof: boolean;
  requires_notes: boolean;
  is_active: boolean;
  created_by: string;
  created_date: string;
  usage_count?: number;
}

export interface CustomActivitiesResponseDTO {
  success: boolean;
  data: CustomActivityDTO[];
}

export interface CustomActivityMutationResponseDTO {
  success: boolean;
  data: CustomActivityDTO;
  message?: string;
}

export interface DeleteCustomActivityResponseDTO {
  success: boolean;
  message?: string;
}

export interface CreateCustomActivityPayloadDTO {
  activity_name: string;
  description?: string;
  category_id?: string;
  measurement_type: MeasurementTypeDTO;
  requires_proof?: boolean;
  requires_notes?: boolean;
}

export interface UpdateCustomActivityPayloadDTO {
  custom_activity_id: string;
  activity_name?: string;
  description?: string;
  category_id?: string | null;
  measurement_type?: MeasurementTypeDTO;
  requires_proof?: boolean;
  requires_notes?: boolean;
}
