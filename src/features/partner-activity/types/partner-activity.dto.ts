export interface PartnerActivityDTO {
  date: string;
  type: string;
  workout_type: string;
  rr_value: number;
  player_name: string;
  team_name: string;
  team_id: string | null;
}

export interface PartnerTeamDTO {
  team_id: string;
  team_name: string;
}

export interface PartnerActivityResponseDTO {
  success: boolean;
  data: {
    activities: PartnerActivityDTO[];
    teams: PartnerTeamDTO[];
  };
}
