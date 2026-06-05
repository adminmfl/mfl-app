export interface RestDayDTO {
  rest_day_id: string;
  league_id: string;
  user_id: string;
  rest_date: string;
  source: 'manual' | 'auto' | 'donated';
  donated_by: string | null;
  created_at: string;
}

export interface RestDaysResponseDTO {
  success: boolean;
  data: RestDayDTO[];
}

export interface RestDaySummaryResponseDTO {
  success: boolean;
  data: {
    totalAllowed: number;
    used: number;
    autoUsed: number;
    pending: number;
    remaining: number;
    isAtLimit: boolean;
    donations: {
      received: number;
      donated: number;
    };
  };
}

export interface RestDayDonationDTO {
  donation_id: string;
  league_id: string;
  from_user_id: string;
  to_user_id: string;
  rest_date: string;
  created_at: string;
}

export interface RestDayDonationDetailDTO {
  id: number;
  days_transferred: number;
  status: string;
  notes: string | null;
  proof_url: string | null;
  donor: { username: string };
  receiver: { username: string };
  created_at: string;
}

export interface RestDayDonationsResponseDTO {
  success: boolean;
  data: RestDayDonationDTO[];
}

export interface RestDayDonationsDetailResponseDTO {
  success: boolean;
  data: RestDayDonationDetailDTO[];
  members: Array<{ league_member_id: number; user_id: string; username: string }>;
  userRole: string;
  userMemberId: number;
}

export interface CreateDonationRequestDTO {
  receiver_member_id: number;
  days_transferred: number;
  notes?: string;
  proof_url?: string;
}

export interface UpdateDonationResponseDTO {
  success: boolean;
  data: Record<string, unknown>;
  message: string;
}
