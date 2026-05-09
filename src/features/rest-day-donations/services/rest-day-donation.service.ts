import { api } from '../../../core/api';
import type {
  CreateRestDayDonationRequestDTO,
  CreateRestDayDonationResponseDTO,
  RestDayDonationsResponseDTO,
  UpdateRestDayDonationResponseDTO,
  UploadDonationProofResponseDTO,
} from '../types/rest-day-donation.dto';
import type { PickedDonationProof } from '../types/rest-day-donation.model';

export async function fetchRestDayDonations(
  leagueId: string,
): Promise<RestDayDonationsResponseDTO> {
  const res = await api.get<RestDayDonationsResponseDTO>(
    `/api/leagues/${leagueId}/rest-day-donations`,
  );
  return res.data;
}

export async function uploadDonationProof(
  leagueId: string,
  proofFile: PickedDonationProof,
): Promise<UploadDonationProofResponseDTO> {
  const formData = new FormData();
  formData.append('file', proofFile as any);
  formData.append('league_id', leagueId);

  const res = await api.post<UploadDonationProofResponseDTO>(
    '/api/upload/donation-proof',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (!res.data.success) {
    throw new Error('Failed to upload proof');
  }

  return res.data;
}

export async function createRestDayDonation(
  leagueId: string,
  data: CreateRestDayDonationRequestDTO,
): Promise<CreateRestDayDonationResponseDTO> {
  const res = await api.post<CreateRestDayDonationResponseDTO>(
    `/api/leagues/${leagueId}/rest-day-donations`,
    data,
  );

  if (!res.data.success) {
    throw new Error('Failed to create donation request');
  }

  return res.data;
}

export async function updateRestDayDonationStatus(
  leagueId: string,
  donationId: string,
  action: 'approve' | 'reject',
): Promise<UpdateRestDayDonationResponseDTO> {
  const res = await api.patch<UpdateRestDayDonationResponseDTO>(
    `/api/leagues/${leagueId}/rest-day-donations/${donationId}`,
    { action },
  );

  if (!res.data.success) {
    throw new Error('Failed to update donation');
  }

  return res.data;
}
