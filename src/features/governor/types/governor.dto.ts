// Backend GET /api/leagues/[id]/governor returns: { success, data: GovernorDTO[] }
export interface GovernorDTO {
  user_id: string;
  username: string;
  email: string;
}

export interface GovernorListResponseDTO {
  success: boolean;
  data: GovernorDTO[];
}
