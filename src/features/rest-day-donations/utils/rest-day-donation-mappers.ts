import type {
  RestDayDonationDTO,
  RestDayDonationMemberDTO,
  RestDayDonationsResponseDTO,
} from '../types/rest-day-donation.dto';
import type {
  RestDayDonation,
  RestDayDonationMember,
  RestDayDonationsData,
} from '../types/rest-day-donation.model';

function toDonation(dto: RestDayDonationDTO): RestDayDonation {
  return {
    id: dto.id,
    daysTransferred: dto.days_transferred,
    status: dto.status,
    notes: dto.notes,
    proofUrl: dto.proof_url,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? null,
    donor: {
      memberId: dto.donor.member_id,
      teamId: dto.donor.team_id ?? null,
      userId: dto.donor.user_id,
      username: dto.donor.username,
    },
    receiver: {
      memberId: dto.receiver.member_id,
      userId: dto.receiver.user_id,
      username: dto.receiver.username,
    },
    captainApprovedBy: dto.captain_approved_by,
    captainApprovedAt: dto.captain_approved_at,
    finalApprovedBy: dto.final_approved_by,
    finalApprovedAt: dto.final_approved_at,
  };
}

function toMember(dto: RestDayDonationMemberDTO): RestDayDonationMember {
  return {
    leagueMemberId: dto.league_member_id,
    userId: dto.user_id,
    username: dto.username,
    teamId: dto.team_id,
    teamName: dto.team_name,
  };
}

export function toRestDayDonationsData(
  dto: RestDayDonationsResponseDTO,
): RestDayDonationsData {
  return {
    donations: dto.data.map(toDonation),
    members: dto.members.map(toMember),
    userRole: dto.userRole,
    userMemberId: dto.userMemberId,
    userTeamId: dto.userTeamId,
  };
}
