import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchCeremonyPhotos,
  uploadCeremonyPhoto,
} from '../services/ceremony-photos.service';

export function useCeremonyPhotos(leagueId: string) {
  return useQuery({
    queryKey: queryKeys.leagues.ceremonyPhotos(leagueId),
    queryFn: () => fetchCeremonyPhotos(leagueId),
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUploadCeremonyPhoto(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fileUri,
      fileName,
      mimeType,
    }: {
      fileUri: string;
      fileName: string;
      mimeType: string;
    }) => uploadCeremonyPhoto(leagueId, fileUri, fileName, mimeType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.ceremonyPhotos(leagueId),
      });
    },
  });
}
