import { api } from '../../../core/api/client';

export interface CeremonyPhoto {
  path: string;
  url: string;
  name: string;
  createdAt: string | null;
}

interface CeremonyPhotosResponse {
  success: boolean;
  data: {
    canUpload: boolean;
    photos: CeremonyPhoto[];
  };
}

export async function fetchCeremonyPhotos(
  leagueId: string,
): Promise<{ canUpload: boolean; photos: CeremonyPhoto[] }> {
  const res = await api.get<CeremonyPhotosResponse>(
    `/api/leagues/${leagueId}/ceremony-photos`,
  );
  if (!res.data.success) {
    throw new Error('Failed to load ceremony photos');
  }
  return res.data.data;
}

export async function uploadCeremonyPhoto(
  leagueId: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const res = await api.post<{ success: boolean; data: { path: string; url: string } }>(
    `/api/leagues/${leagueId}/ceremony-photos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (!res.data.success) {
    throw new Error('Failed to upload ceremony photo');
  }
  return res.data.data;
}
