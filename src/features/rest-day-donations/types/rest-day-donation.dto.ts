export type RestDayDonationStatus =
  | 'pending'
  | 'captain_approved'
  | 'approved'
  | 'rejected';

export interface RestDayDonationPersonDTO {
  member_id: string;
  team_id?: string | null;
  user_id: string;
  username: string;
}

export interface RestDayDonationDTO {
  id: string;
  days_transferred: number;
  status: RestDayDonationStatus;
  notes: string | null;
  proof_url: string | null;
  created_at: string;
  updated_at?: string | null;
  donor: RestDayDonationPersonDTO;
  receiver: Omit<RestDayDonationPersonDTO, 'team_id'>;
  captain_approved_by: string | null;
  captain_approved_at: string | null;
  final_approved_by: string | null;
  final_approved_at: string | null;
}

export interface RestDayDonationMemberDTO {
  league_member_id: string;
  user_id: string;
  username: string;
  team_id: string | null;
  team_name: string | null;
}

export interface RestDayDonationsResponseDTO {
  success: boolean;
  data: RestDayDonationDTO[];
  members: RestDayDonationMemberDTO[];
  userRole: string;
  userMemberId: string;
  userTeamId: string | null;
}

export interface CreateRestDayDonationRequestDTO {
  receiver_member_id: string;
  days_transferred: number;
  notes?: string;
  proof_url: string;
}

export interface CreateRestDayDonationResponseDTO {
  success: boolean;
  data: Record<string, unknown>;
}

export interface UpdateRestDayDonationResponseDTO {
  success: boolean;
  data: Record<string, unknown>;
  message: string;
}

export interface UploadDonationProofResponseDTO {
  success: boolean;
  data: {
    url: string;
    path: string;
  };
}
