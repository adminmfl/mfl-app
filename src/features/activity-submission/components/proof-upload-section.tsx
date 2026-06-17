import { Alert, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { OcrSuggestionPanel } from './ocr-suggestion-panel';
import { getAutoFillFields } from '../hooks/use-proof-ocr';
import type { UseProofOcrReturn } from '../hooks/use-proof-ocr';
import type { UseProofUploadReturn } from '../hooks/use-proof-upload';
import type { LeagueActivity } from '../types';

interface ProofUploadSectionProps {
  selectedActivity: LeagueActivity | null;
  proofUpload: UseProofUploadReturn;
  proofOcr: UseProofOcrReturn;
  error?: string;
  onOcrApply: (field: string, value: string) => void;
}

export function ProofUploadSection({
  selectedActivity,
  proofUpload,
  proofOcr,
  error,
  onOcrApply,
}: ProofUploadSectionProps) {
  const ocrFill = proofOcr.extraction ? getAutoFillFields(proofOcr.extraction) : null;
  const ocrProcessing = proofOcr.status === 'processing';

  const handlePickWithOcr = async () => {
    const image = await proofUpload.pickImage(1);
    if (!image) return;

    const extraction = await proofOcr.extract(image);
    if (!extraction) return;

    const fill = getAutoFillFields(extraction);
    if (fill.autoFilledFields.length > 0) {
      for (const field of fill.autoFilledFields) {
        const value =
          field === 'duration'
            ? fill.duration
            : field === 'distance'
              ? fill.distance
              : field === 'steps'
                ? fill.steps
                : undefined;
        if (value !== undefined) {
          onOcrApply(field, value);
        }
      }
      Alert.alert('Auto-filled', `Auto-filled: ${fill.autoFilledFields.join(', ')}`);
    }
  };

  const isProofRequired = (selectedActivity?.proof_requirement ?? 'mandatory') === 'mandatory';

  return (
    <View className="gap-2">
      <AppText className="text-sm font-semibold text-muted">
        Proof Image{isProofRequired ? ' *' : ''}
      </AppText>

      {proofUpload.proof ? (
        <View className="rounded-xl overflow-hidden border border-separator">
          <Image
            source={{ uri: proofUpload.proof.uri }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => {
              proofUpload.removeImage(1);
              proofOcr.reset();
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
          >
            <Feather name="x" size={18} color="white" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePickWithOcr}
          disabled={ocrProcessing}
          className="border-2 border-dashed border-default-300 rounded-xl p-6 items-center justify-center gap-2"
        >
          <Feather name="camera" size={28} color={mflColors.textMuted} />
          <AppText className="text-sm text-muted">Tap to select proof image</AppText>
        </Pressable>
      )}

      <OcrSuggestionPanel
        extraction={proofOcr.extraction}
        status={proofOcr.status}
        error={proofOcr.error}
        autoFilledFields={ocrFill?.autoFilledFields ?? []}
        suggestedFields={ocrFill?.suggestedFields ?? []}
        onApplySuggestion={(field, value) => {
          onOcrApply(field, value);
          Alert.alert('Applied', `Applied ${field}: ${value}`);
        }}
      />

      {/* Second proof image */}
      {proofUpload.proof && !proofUpload.proof2 && (selectedActivity?.max_images ?? 1) >= 2 && (
        <Pressable
          onPress={() => proofUpload.pickImage(2)}
          className="border border-dashed border-default-300 rounded-xl p-3 items-center"
        >
          <AppText className="text-xs text-muted">+ Add second proof image (optional)</AppText>
        </Pressable>
      )}

      {proofUpload.proof2 && (
        <View className="rounded-xl overflow-hidden border border-separator">
          <Image
            source={{ uri: proofUpload.proof2.uri }}
            style={{ width: '100%', height: 150 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => proofUpload.removeImage(2)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
          >
            <Feather name="x" size={18} color="white" />
          </Pressable>
        </View>
      )}

      {error && (
        <AppText className="text-sm" style={{ color: mflColors.danger }}>
          {error}
        </AppText>
      )}
    </View>
  );
}
