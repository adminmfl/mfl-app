import { ActivityIndicator, Alert, Dimensions, Image, Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../../../components/app-text';
import { useCeremonyPhotos, useUploadCeremonyPhoto } from '../hooks/use-ceremony-photos';

const gf = {
  bgMuted: '#0D1F44',
  textHeading: '#F1D675',
  textSecondary: '#E7D7A2',
  textSubtle: '#D8C996',
  badgeBg: '#D4AF37',
  badgeText: '#0A1A3A',
  border25: 'rgba(212,175,55,0.15)',
} as const;

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = (SCREEN_WIDTH - 32 - 12) / 2; // 2 columns with gap

interface CeremonyPhotosSectionProps {
  leagueId: string;
}

export function CeremonyPhotosSection({ leagueId }: CeremonyPhotosSectionProps) {
  const { data, isLoading, error } = useCeremonyPhotos(leagueId);
  const uploadMutation = useUploadCeremonyPhoto(leagueId);

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = asset.fileName || `photo-${Date.now()}.jpg`;
    const mimeType = (asset as { mimeType?: string }).mimeType ?? 'image/jpeg';

    uploadMutation.mutate(
      { fileUri: uri, fileName, mimeType },
      {
        onError: (err) => {
          Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Could not upload photo.');
        },
      },
    );
  };

  return (
    <View
      className="rounded-lg p-4"
      style={{ backgroundColor: gf.bgMuted, borderWidth: 1, borderColor: gf.border25 }}
    >
      <View className="flex-row items-center justify-between">
        <AppText className="text-base font-semibold" style={{ color: gf.textHeading }}>
          Ceremony Photos
        </AppText>
        {data?.canUpload ? (
          <Pressable
            onPress={handleUpload}
            disabled={uploadMutation.isPending}
            className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{
              backgroundColor: gf.badgeBg,
              opacity: uploadMutation.isPending ? 0.6 : 1,
            }}
          >
            {uploadMutation.isPending ? (
              <ActivityIndicator size="small" color={gf.badgeText} />
            ) : (
              <Feather name="upload" size={14} color={gf.badgeText} />
            )}
            <AppText className="text-xs font-bold" style={{ color: gf.badgeText }}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <AppText className="mt-3 text-sm" style={{ color: gf.textSecondary }}>
          Loading ceremony photos...
        </AppText>
      ) : error ? (
        <AppText className="mt-3 text-sm" style={{ color: '#FCA5A5' }}>
          {error instanceof Error ? error.message : 'Failed to load photos'}
        </AppText>
      ) : !data?.photos.length ? (
        <AppText className="mt-3 text-sm" style={{ color: gf.textSecondary }}>
          No ceremony photos uploaded yet.
        </AppText>
      ) : (
        <View className="mt-3 flex-row flex-wrap gap-3">
          {data.photos.map((photo) => (
            <Image
              key={photo.path}
              source={{ uri: photo.url }}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE * 0.75,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: gf.border25,
              }}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
    </View>
  );
}
