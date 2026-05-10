import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { uploadProof } from '../../submissions/services/submission.service';
import type { ProofImage } from '../types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 10;

export function useProofUpload(leagueId: string) {
  const [proof, setProof] = useState<ProofImage | null>(null);
  const [proof2, setProof2] = useState<ProofImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = useCallback(async (slot: 1 | 2 = 1): Promise<ProofImage | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0] as {
      uri: string;
      fileName?: string | null;
      mimeType?: string;
      fileSize?: number;
    };
    const fileName = asset.fileName ?? `proof_${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    if (!ALLOWED_TYPES.includes(mimeType)) {
      Alert.alert('Invalid File', 'Allowed: JPG, PNG, GIF, WebP');
      return null;
    }

    if (asset.fileSize && asset.fileSize > MAX_SIZE_MB * 1024 * 1024) {
      Alert.alert('File Too Large', `Maximum size is ${MAX_SIZE_MB}MB`);
      return null;
    }

    const img: ProofImage = { uri: asset.uri, name: fileName, type: mimeType };
    if (slot === 1) setProof(img);
    else setProof2(img);
    return img;
  }, []);

  const removeImage = useCallback((slot: 1 | 2 = 1) => {
    if (slot === 1) setProof(null);
    else setProof2(null);
  }, []);

  const uploadAll = useCallback(async (): Promise<{
    proofUrl: string | null;
    proofUrl2: string | null;
  }> => {
    setUploading(true);
    try {
      let proofUrl: string | null = null;
      let proofUrl2: string | null = null;

      if (proof) {
        const res = await uploadProof(proof, leagueId);
        proofUrl = res.data.url;
      }
      if (proof2) {
        const res = await uploadProof(proof2, leagueId);
        proofUrl2 = res.data.url;
      }
      return { proofUrl, proofUrl2 };
    } finally {
      setUploading(false);
    }
  }, [proof, proof2, leagueId]);

  const reset = useCallback(() => {
    setProof(null);
    setProof2(null);
  }, []);

  return {
    proof,
    proof2,
    uploading,
    hasProof: !!proof,
    pickImage,
    removeImage,
    uploadAll,
    reset,
  };
}
