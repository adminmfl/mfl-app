import type { RestDayDTO, RestDayDonationDTO, RestDaySummaryResponseDTO, RestDayDonationsDetailResponseDTO, RestDayDonationDetailDTO } from '../types/rest-day.dto';
import type { RestDay, RestDayDonation, RestDaySummary, RestDayDonationDetail, RestDayDonationsData } from '../types/rest-day.model';

export function toRestDay(dto: RestDayDTO): RestDay {
  return {
    restDayId: dto.rest_day_id,
    leagueId: dto.league_id,
    userId: dto.user_id,
    restDate: dto.rest_date,
    source: dto.source,
    donatedBy: dto.donated_by,
    createdAt: dto.created_at,
  };
}

export function toRestDayDonation(dto: RestDayDonationDTO): RestDayDonation {
  return {
    donationId: dto.donation_id,
    leagueId: dto.league_id,
    fromUserId: dto.from_user_id,
    toUserId: dto.to_user_id,
    restDate: dto.rest_date,
    createdAt: dto.created_at,
  };
}

export function toRestDaySummary(dto: RestDaySummaryResponseDTO): RestDaySummary {
  return {
    totalAllowed: dto.data.totalAllowed,
    used: dto.data.used,
    autoUsed: dto.data.autoUsed,
    pending: dto.data.pending,
    remaining: dto.data.remaining,
    isAtLimit: dto.data.isAtLimit,
    donations: {
      received: dto.data.donations.received,
      donated: dto.data.donations.donated,
    },
  };
}

function toDonationDetail(dto: RestDayDonationDetailDTO): RestDayDonationDetail {
  return {
    id: dto.id,
    daysTransferred: dto.days_transferred,
    status: dto.status,
    notes: dto.notes,
    proofUrl: dto.proof_url,
    donorUsername: dto.donor.username,
    receiverUsername: dto.receiver.username,
    createdAt: dto.created_at,
  };
}

export function toRestDayDonationsData(dto: RestDayDonationsDetailResponseDTO): RestDayDonationsData {
  return {
    donations: dto.data.map(toDonationDetail),
    members: dto.members.map((m) => ({
      leagueMemberId: m.league_member_id,
      userId: m.user_id,
      username: m.username,
    })),
    userRole: dto.userRole,
    userMemberId: dto.userMemberId,
  };
}
