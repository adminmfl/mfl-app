import Feather from '@expo/vector-icons/Feather';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Spinner } from 'heroui-native';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../../components/app-text';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useMySubmissions } from '../../features/submissions/hooks/use-my-submissions';
import { useReuploadSubmission } from '../../features/submissions/hooks/use-reupload-submission';
import { uploadProof } from '../../features/submissions/services/submission.service';
import { isReuploadWindowOpen } from '../../features/submissions/utils/reupload-window';
import { mflColors } from '../../constants/colors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatWorkoutType(
  workoutType: string | null,
  customActivityName?: string,
): string {
  if (customActivityName) return customActivityName;
  if (!workoutType) return 'General';
  return workoutType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ReuploadSubmissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: submissionsData } = useMySubmissions(leagueId);
  const submission = useMemo(
    () => submissionsData?.submissions.find((s) => s.id === submissionId) ?? null,
    [submissionsData, submissionId],
  );

  const tzOffsetMinutes = useMemo(() => new Date().getTimezoneOffset(), []);

  const canReupload = useMemo(() => {
    if (!submission) return false;
    if (submission.status !== 'rejected' && submission.status !== 'rejected_resubmit') return false;
    const rejectionTime = submission.modifiedDate || submission.createdDate;
    return isReuploadWindowOpen(rejectionTime, tzOffsetMinutes);
  }, [submission, tzOffsetMinutes]);

  const reuploadMutation = useReuploadSubmission();

  // -- Form state --
  const [proofImage, setProofImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [durationText, setDurationText] = useState('');
  const [distanceText, setDistanceText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [holesText, setHolesText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // -- Pick image --
  const handlePickImage = useCallback(async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `proof_${Date.now()}.jpg`;
      const fileType = (asset as { mimeType?: string }).mimeType ?? 'image/jpeg';
      setProofImage({
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });
    }
  }, []);

  // -- Submit --
  const handleSubmit = useCallback(async () => {
    if (!submission) return;

    if (!canReupload) {
      Alert.alert(
        'Window Closed',
        'The reupload window has closed (allowed until next-day 11:59pm local time after rejection).',
      );
      return;
    }

    setIsUploading(true);

    let proofUrl: string | undefined;
    if (proofImage) {
      try {
        const uploadResult = await uploadProof(proofImage, leagueId);
        proofUrl = uploadResult.data.url;
      } catch {
        Alert.alert('Upload Failed', 'Could not upload proof image. Please try again.');
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    const duration = durationText.trim() ? Number(durationText) : undefined;
    const distance = distanceText.trim() ? Number(distanceText) : undefined;
    const steps = stepsText.trim() ? Number(stepsText) : undefined;
    const holes = holesText.trim() ? Number(holesText) : undefined;

    reuploadMutation.mutate(
      {
        submissionId: submission.id,
        data: {
          proof_url: proofUrl,
          notes: notes.trim() || undefined,
          duration: duration != null && !isNaN(duration) ? duration : undefined,
          distance: distance != null && !isNaN(distance) ? distance : undefined,
          steps: steps != null && !isNaN(steps) ? steps : undefined,
          holes: holes != null && !isNaN(holes) ? holes : undefined,
          tzOffsetMinutes,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Your submission has been reuploaded for review.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert('Reupload Failed', err.message || 'Could not resubmit. Please try again.');
        },
      },
    );
  }, [submission, canReupload, proofImage, notes, durationText, distanceText, stepsText, holesText, tzOffsetMinutes, reuploadMutation, router, leagueId]);

  const isBusy = isUploading || reuploadMutation.isPending;

  // -- Guards --
  if (!activeLeague) {
    return (
      <ScreenState
        screen="reupload-submission"
        state="empty"
        message="Join a league first."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!submission) {
    return (
      <ScreenState
        screen="reupload-submission"
        state="loading"
      />
    );
  }

  if (!canReupload) {
    return (
      <ScreenState
        screen="reupload-submission"
        state="error"
        message="Reupload window closed (allowed until next-day 11:59pm local time after rejection)."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  // -- Render --
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}
        contentContainerClassName="px-5 gap-5 pb-12"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center pt-3 pb-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <AppText className="flex-1 text-xl font-bold text-foreground text-center">
            Reupload Submission
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Rejected submission info */}
        <Card variant="secondary" className="p-4">
          <AppText className="text-sm font-semibold text-foreground">
            {submission.type === 'workout'
              ? formatWorkoutType(submission.workoutType, submission.customActivityName)
              : 'Rest Day'}
          </AppText>
          <AppText className="text-xs text-muted mt-1">
            {formatDate(submission.date)}
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">
            {submission.duration != null ? `Duration: ${submission.duration} min` : ''}
            {submission.distance != null ? ` | Distance: ${submission.distance} km` : ''}
            {submission.steps != null ? ` | Steps: ${submission.steps.toLocaleString()}` : ''}
            {submission.holes != null ? ` | Holes: ${submission.holes}` : ''}
          </AppText>
        </Card>

        {/* Rejection reason */}
        {submission.rejectionReason && (
          <View className="rounded-lg p-3" style={{ backgroundColor: mflColors.dangerLight }}>
            <AppText className="text-xs font-semibold" style={{ color: mflColors.danger }}>
              Rejection Reason
            </AppText>
            <AppText className="text-sm mt-1" style={{ color: mflColors.danger }}>
              {submission.rejectionReason}
            </AppText>
          </View>
        )}

        {/* Proof image upload */}
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Proof Image</AppText>
          <Pressable
            onPress={handlePickImage}
            className="border-2 border-dashed rounded-xl items-center justify-center overflow-hidden"
            style={{
              borderColor: mflColors.border,
              height: proofImage ? 200 : 120,
              backgroundColor: mflColors.surface,
            }}
          >
            {proofImage ? (
              <Image
                source={{ uri: proofImage.uri }}
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
          {proofImage && (
            <Pressable onPress={() => setProofImage(null)}>
              <AppText className="text-xs" style={{ color: mflColors.danger }}>
                Remove image
              </AppText>
            </Pressable>
          )}
        </View>

        {/* Notes */}
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">Notes (optional)</AppText>
          <TextInput
            style={{
              backgroundColor: mflColors.card,
              borderWidth: 1,
              borderColor: mflColors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: mflColors.text,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note about your resubmission..."
            placeholderTextColor={mflColors.textMuted}
            multiline
          />
        </View>

        {/* Duration adjustment */}
        <View className="gap-2">
          <AppText className="text-sm font-semibold text-muted">
            Duration (minutes) - leave blank to keep original
          </AppText>
          <TextInput
            style={{
              backgroundColor: mflColors.card,
              borderWidth: 1,
              borderColor: mflColors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: mflColors.text,
            }}
            value={durationText}
            onChangeText={setDurationText}
            placeholder={submission.duration != null ? String(submission.duration) : ''}
            placeholderTextColor={mflColors.textMuted}
            keyboardType="number-pad"
            inputMode="numeric"
          />
        </View>

        {/* Distance adjustment */}
        {submission.distance != null && (
          <View className="gap-2">
            <AppText className="text-sm font-semibold text-muted">
              Distance (km) - leave blank to keep original
            </AppText>
            <TextInput
              style={{
                backgroundColor: mflColors.card,
                borderWidth: 1,
                borderColor: mflColors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: mflColors.text,
              }}
              value={distanceText}
              onChangeText={setDistanceText}
              placeholder={String(submission.distance)}
              placeholderTextColor={mflColors.textMuted}
              keyboardType="decimal-pad"
              inputMode="decimal"
            />
          </View>
        )}

        {/* Steps adjustment */}
        {submission.steps != null && (
          <View className="gap-2">
            <AppText className="text-sm font-semibold text-muted">
              Steps - leave blank to keep original
            </AppText>
            <TextInput
              style={{
                backgroundColor: mflColors.card,
                borderWidth: 1,
                borderColor: mflColors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: mflColors.text,
              }}
              value={stepsText}
              onChangeText={setStepsText}
              placeholder={String(submission.steps)}
              placeholderTextColor={mflColors.textMuted}
              keyboardType="number-pad"
              inputMode="numeric"
            />
          </View>
        )}

        {/* Holes adjustment */}
        {submission.holes != null && (
          <View className="gap-2">
            <AppText className="text-sm font-semibold text-muted">
              Holes - leave blank to keep original
            </AppText>
            <TextInput
              style={{
                backgroundColor: mflColors.card,
                borderWidth: 1,
                borderColor: mflColors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: mflColors.text,
              }}
              value={holesText}
              onChangeText={setHolesText}
              placeholder={String(submission.holes)}
              placeholderTextColor={mflColors.textMuted}
              keyboardType="number-pad"
              inputMode="numeric"
            />
          </View>
        )}

        {/* Submit */}
        <View className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            isDisabled={isBusy}
            className="w-full"
          >
            {isBusy ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Resubmit</Button.Label>
            )}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
