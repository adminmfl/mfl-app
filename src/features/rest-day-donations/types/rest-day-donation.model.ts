import type { RestDayDonationStatus } from './rest-day-donation.dto';

export type { RestDayDonationStatus };

export interface RestDayDonationPerson {
  memberId: string;
  teamId?: string | null;
  userId: string;
  username: string;
}

export interface RestDayDonation {
  id: string;
  daysTransferred: number;
  status: RestDayDonationStatus;
  notes: string | null;
  proofUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  donor: RestDayDonationPerson;
  receiver: Omit<RestDayDonationPerson, 'teamId'>;
  captainApprovedBy: string | null;
  captainApprovedAt: string | null;
  finalApprovedBy: string | null;
  finalApprovedAt: string | null;
}

export interface RestDayDonationMember {
  leagueMemberId: string;
  userId: string;
  username: string;
  teamId: string | null;
  teamName: string | null;
}

export interface RestDayDonationsData {
  donations: RestDayDonation[];
  members: RestDayDonationMember[];
  userRole: string;
  userMemberId: string;
  userTeamId: string | null;
}

export interface PickedDonationProof {
  uri: string;
  name: string;
  type: string;
}

export interface CreateRestDayDonationInput {
  receiverMemberId: string;
  daysTransferred: number;
  notes?: string;
  proofFile: PickedDonationProof;
}
