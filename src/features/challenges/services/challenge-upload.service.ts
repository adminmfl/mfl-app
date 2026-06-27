import { api } from '../../../core/api';
import type { UploadChallengeProofResponseDTO } from '../types/challenge.dto';

/**
 * React Native's FormData accepts { uri, name, type } for file fields but
 * TypeScript's DOM types expect a Blob. The cast to unknown→Blob is required
 * because the RN runtime correctly handles this object shape at runtime.
 */
type RNFilePayload = { uri: string; name: string; type: string };

export async function uploadChallengeDocument(
  leagueId: string,
  file: RNFilePayload,
): Promise<string> {
  const formData = new FormData();
  formData.append('league_id', leagueId);
  formData.append('file', file as unknown as Blob);

  const res = await api.post<{ success: boolean; data?: { url?: string }; error?: string }>(
    '/api/upload/challenge-document',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  const url = res.data.data?.url;
  if (!url) throw new Error(res.data.error ?? 'Document upload failed.');
  return url;
}

export async function uploadChallengeProof(
  file: RNFilePayload,
  leagueId: string,
  challengeId: string,
): Promise<UploadChallengeProofResponseDTO> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  formData.append('league_id', leagueId);
  formData.append('challenge_id', challengeId);

  const res = await api.post<UploadChallengeProofResponseDTO>(
    '/api/upload/challenge-proof',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}
