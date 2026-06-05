import { api } from '../../../core/api';
import type {
  ManualEntryEntriesResponseDTO,
  ManualEntryMembersResponseDTO,
  ManualEntrySaveRequestDTO,
  ManualEntrySaveResponseDTO,
  PickedProofImage,
} from '../types/manual-entry';

export async function fetchManualEntryMembers(
  leagueId: string,
): Promise<ManualEntryMembersResponseDTO> {
  const res = await api.get<ManualEntryMembersResponseDTO>(
    `/api/leagues/${leagueId}/manual-entry`,
  );
  return res.data;
}

export async function fetchManualEntryWeekEntries(
  leagueId: string,
  memberId: string,
  startDate: string,
  endDate: string,
): Promise<ManualEntryEntriesResponseDTO> {
  const res = await api.get<ManualEntryEntriesResponseDTO>(
    `/api/leagues/${leagueId}/members/${memberId}/entries`,
    { params: { startDate, endDate } },
  );
  return res.data;
}

export async function saveManualEntry(
  leagueId: string,
  data: ManualEntrySaveRequestDTO,
): Promise<ManualEntrySaveResponseDTO> {
  const res = await api.post<ManualEntrySaveResponseDTO>(
    `/api/leagues/${leagueId}/manual-entry`,
    data,
  );
  return res.data;
}

export async function uploadManualEntryProof(
  leagueId: string,
  file: PickedProofImage,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);
  formData.append('league_id', leagueId);

  const res = await api.post<{ success: boolean; data: { url: string } }>(
    '/api/upload/proof',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return res.data.data.url;
}
