import { api } from '../../../core/api';
import type {
  RestDaysResponseDTO,
  RestDaySummaryResponseDTO,
  RestDayDonationsResponseDTO,
  RestDayDonationsDetailResponseDTO,
  CreateDonationRequestDTO,
  UpdateDonationResponseDTO,
} from '../types/rest-day.dto';

export async function fetchRestDays(leagueId: string): Promise<RestDaysResponseDTO> {
  const res = await api.get<RestDaysResponseDTO>(`/api/leagues/${leagueId}/rest-days`);
  return res.data;
}

export async function fetchRestDaySummary(leagueId: string): Promise<RestDaySummaryResponseDTO> {
  const res = await api.get<RestDaySummaryResponseDTO>(`/api/leagues/${leagueId}/rest-days`);
  return res.data;
}

export async function fetchDonations(leagueId: string): Promise<RestDayDonationsResponseDTO> {
  const res = await api.get<RestDayDonationsResponseDTO>(
    `/api/leagues/${leagueId}/rest-day-donations`,
  );
  return res.data;
}

export async function fetchDonationsDetail(leagueId: string): Promise<RestDayDonationsDetailResponseDTO> {
  const res = await api.get<RestDayDonationsDetailResponseDTO>(
    `/api/leagues/${leagueId}/rest-day-donations`,
  );
  return res.data;
}

export async function donateRestDay(
  leagueId: string,
  data: { to_user_id: string; rest_date: string },
): Promise<{ success: boolean }> {
  const res = await api.post(`/api/leagues/${leagueId}/rest-day-donations`, data);
  return res.data;
}

export async function createDonation(
  leagueId: string,
  data: CreateDonationRequestDTO,
): Promise<{ success: boolean }> {
  const res = await api.post(`/api/leagues/${leagueId}/rest-day-donations`, data);
  return res.data;
}

export async function updateDonationStatus(
  leagueId: string,
  donationId: number,
  action: 'approve' | 'reject',
): Promise<UpdateDonationResponseDTO> {
  const res = await api.patch<UpdateDonationResponseDTO>(
    `/api/leagues/${leagueId}/rest-day-donations/${donationId}`,
    { action },
  );
  return res.data;
}
