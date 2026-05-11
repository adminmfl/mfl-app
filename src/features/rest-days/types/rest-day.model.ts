export interface RestDay {
  restDayId: string;
  leagueId: string;
  userId: string;
  restDate: string;
  source: 'manual' | 'auto' | 'donated';
  donatedBy: string | null;
  createdAt: string;
}

export interface RestDaySummary {
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
}

export interface RestDayDonation {
  donationId: string;
  leagueId: string;
  fromUserId: string;
  toUserId: string;
  restDate: string;
  createdAt: string;
}

export interface RestDayDonationDetail {
  id: number;
  daysTransferred: number;
  status: string;
  notes: string | null;
  proofUrl: string | null;
  donorUsername: string;
  receiverUsername: string;
  createdAt: string;
}

export interface DonationMember {
  leagueMemberId: number;
  userId: string;
  username: string;
}

export interface RestDayDonationsData {
  donations: RestDayDonationDetail[];
  members: DonationMember[];
  userRole: string;
  userMemberId: number;
}
