export interface ActivityCategoryDTO {
  category_id: string;
  category_name: string;
  display_name: string;
  description: string | null;
  display_order: number;
}

export interface ActivityCategoriesResponseDTO {
  success: boolean;
  data: ActivityCategoryDTO[];
}
