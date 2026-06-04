import { api } from '../../../core/api';
import type {
  MySubmissionsResponseDTO,
  UpsertEntryRequestDTO,
  UpsertEntryResponseDTO,
  PreviewRRRequestDTO,
  PreviewRRResponseDTO,
  ReuploadSubmissionRequestDTO,
  ReuploadSubmissionResponseDTO,
  UploadProofResponseDTO,
} from '../types/submission.dto';

export async function fetchMySubmissions(leagueId: string): Promise<MySubmissionsResponseDTO> {
  const res = await api.get<MySubmissionsResponseDTO>(`/api/leagues/${leagueId}/my-submissions`);
  return res.data;
}

export async function upsertEntry(data: UpsertEntryRequestDTO): Promise<UpsertEntryResponseDTO> {
  const res = await api.post<UpsertEntryResponseDTO>('/api/entries/upsert', data);
  return res.data;
}

export async function previewRR(data: PreviewRRRequestDTO): Promise<PreviewRRResponseDTO> {
  const res = await api.post<PreviewRRResponseDTO>('/api/entries/preview-rr', data);
  return res.data;
}

export async function reuploadSubmission(
  submissionId: string,
  data: ReuploadSubmissionRequestDTO,
): Promise<ReuploadSubmissionResponseDTO> {
  const res = await api.post<ReuploadSubmissionResponseDTO>(
    `/api/submissions/${submissionId}/reupload`,
    data,
  );
  return res.data;
}

export async function uploadProof(
  file: { uri: string; name: string; type: string },
  leagueId: string,
): Promise<UploadProofResponseDTO> {
  const formData = new FormData();
  formData.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
  formData.append('league_id', leagueId);
  const res = await api.post<UploadProofResponseDTO>('/api/upload/proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
