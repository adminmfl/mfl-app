import Feather from '@expo/vector-icons/Feather';
import { useCallback } from 'react';
import { View, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface ProofImageFile {
  uri: string;
  name: string;
  type: string;
}

interface ProofUploadFieldProps {
  image: ProofImageFile | null;
  onImagePicked: (image: ProofImageFile) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ProofUploadField({
  image,
  onImagePicked,
  onRemove,
  disabled,
}: ProofUploadFieldProps) {
  const handlePick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0] as {
      uri: string;
      fileName?: string | null;
      mimeType?: string;
      fileSize?: number;
    };
    const mimeType = asset.mimeType ?? 'image/jpeg';

    if (!ALLOWED_TYPES.includes(mimeType)) {
      Alert.alert('Invalid File', 'Allowed: JPG, PNG, GIF, WebP');
      return;
    }

    if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
      Alert.alert('File Too Large', 'Maximum size is 10MB');
      return;
    }

    onImagePicked({
      uri: asset.uri,
      name: asset.fileName ?? `challenge_proof_${Date.now()}.jpg`,
      type: mimeType,
    });
  }, [onImagePicked]);

  return (
    <View className="gap-2">
      <AppText className="text-sm font-semibold text-muted">Proof Image *</AppText>
      <Pressable
        onPress={handlePick}
        disabled={disabled}
        className="border-2 border-dashed rounded-xl items-center justify-center overflow-hidden"
        style={{
          borderColor: image ? mflColors.brand : mflColors.border,
          height: image ? 200 : 120,
          backgroundColor: mflColors.surface,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {image ? (
          <Image
            source={{ uri: image.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="items-center gap-2">
            <Feather name="camera" size={28} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted">Tap to select proof image</AppText>
          </View>
        )}
      </Pressable>
      {image && (
        <Pressable onPress={onRemove} disabled={disabled}>
          <AppText className="text-xs" style={{ color: mflColors.danger }}>
            Remove image
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
