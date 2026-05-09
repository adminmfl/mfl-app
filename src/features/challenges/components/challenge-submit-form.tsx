import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  View,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useSubmitChallenge } from '../hooks/use-submit-challenge';
import { uploadChallengeProof } from '../services/challenge.service';
import {
  canSubmitChallenge,
  getSubmitButtonLabel,
  isReuploadWindowOpen,
  getChallengeTypeLabel,
} from '../utils/challenge-helpers';
import type { Challenge } from '../types/challenge.model';
import { ProofUploadField } from './proof-upload-field';
import type { ProofImageFile } from './proof-upload-field';

interface ChallengeSubmitFormProps {
  challenge: Challenge;
  leagueId: string;
}

export function ChallengeSubmitForm({ challenge, leagueId }: ChallengeSubmitFormProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const submitMutation = useSubmitChallenge();

  const [proofImage, setProofImage] = useState<ProofImageFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mySubmission = challenge.mySubmission as {
    status: string;
    reviewed_at?: string | null;
    created_at?: string;
    proof_url?: string;
  } | null;

  const reuploadOpen = mySubmission?.status === 'rejected'
    ? isReuploadWindowOpen(mySubmission.reviewed_at ?? mySubmission.created_at)
    : false;

  const canSubmit = canSubmitChallenge(
    challenge.status,
    challenge.challengeType,
    challenge.isUniqueWorkout,
    mySubmission,
    reuploadOpen,
  );

  const buttonLabel = getSubmitButtonLabel(challenge.isUniqueWorkout, mySubmission);
  const isBusy = isUploading || submitMutation.isPending;

  const handleSubmit = useCallback(async () => {
    if (challenge.isUniqueWorkout) {
      Alert.alert(
        'Not Available',
        'Unique workout challenge selection is not yet available on mobile. Please use the web app.',
      );
      return;
    }

    if (!proofImage) {
      Alert.alert('Proof Required', 'Please select a proof image before submitting.');
      return;
    }

    setIsUploading(true);

    let proofUrl: string;
    try {
      const uploadResult = await uploadChallengeProof(proofImage, leagueId, challenge.challengeId);
      proofUrl = uploadResult.data.url;
    } catch {
      Alert.alert('Upload Failed', 'Could not upload proof image. Please try again.');
      setIsUploading(false);
      return;
    }

    setIsUploading(false);

    submitMutation.mutate(
      {
        leagueId,
        challengeId: challenge.challengeId,
        proofUrl,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Proof submitted! Waiting for review.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert(
            'Submission Failed',
            err.message || 'Could not submit proof. Please try again.',
          );
        },
      },
    );
  }, [proofImage, leagueId, challenge, submitMutation, router]);

  // Submission status banner
  const renderSubmissionStatus = () => {
    if (!mySubmission) return null;

    const statusColor =
      mySubmission.status === 'approved'
        ? mflColors.brand
        : mySubmission.status === 'rejected'
          ? mflColors.danger
          : mflColors.amber;

    const statusLabel =
      mySubmission.status === 'approved'
        ? 'Approved'
        : mySubmission.status === 'rejected'
          ? 'Rejected'
          : 'Pending Review';

    return (
      <Card variant="secondary" className="p-4">
        <View className="flex-row items-center gap-2">
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }}
          />
          <AppText className="text-sm font-semibold" style={{ color: statusColor }}>
            Current submission: {statusLabel}
          </AppText>
        </View>
        {mySubmission.status === 'rejected' && reuploadOpen && (
          <AppText className="text-xs text-muted mt-1">
            Reupload window is open. You may resubmit your proof.
          </AppText>
        )}
        {mySubmission.status === 'rejected' && !reuploadOpen && (
          <AppText className="text-xs text-muted mt-1">
            Reupload window has closed.
          </AppText>
        )}
      </Card>
    );
  };

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
            {buttonLabel}
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Challenge info */}
        <Card variant="secondary" className="p-4">
          <AppText className="text-lg font-bold text-foreground">
            {challenge.name}
          </AppText>
          {challenge.description ? (
            <AppText className="text-sm text-muted mt-1">
              {challenge.description}
            </AppText>
          ) : null}
          <View className="flex-row items-center gap-3 mt-2">
            <AppText className="text-xs font-medium" style={{ color: mflColors.brand }}>
              {challenge.totalPoints} pts
            </AppText>
            <AppText className="text-xs text-muted">
              {getChallengeTypeLabel(challenge.challengeType)}
            </AppText>
          </View>
        </Card>

        {/* Submission status */}
        {renderSubmissionStatus()}

        {/* Eligibility gate */}
        {!canSubmit ? (
          <Card variant="secondary" className="p-4">
            <AppText className="text-sm text-muted text-center">
              {challenge.status !== 'active'
                ? 'This challenge is not currently accepting submissions.'
                : challenge.challengeType === 'tournament'
                  ? 'Tournament challenges are scored automatically.'
                  : mySubmission?.status === 'pending'
                    ? 'Your submission is pending review.'
                    : mySubmission?.status === 'approved' && !challenge.isUniqueWorkout
                      ? 'Your submission has been approved.'
                      : 'You cannot submit at this time.'}
            </AppText>
          </Card>
        ) : (
          <>
            {/* Proof image upload */}
            {!challenge.isUniqueWorkout && (
              <ProofUploadField
                image={proofImage}
                onImagePicked={setProofImage}
                onRemove={() => setProofImage(null)}
                disabled={isBusy}
              />
            )}

            {/* Unique workout info */}
            {challenge.isUniqueWorkout && (
              <Card variant="secondary" className="p-4">
                <AppText className="text-sm text-muted">
                  This is a unique workout challenge. Select a workout activity you have
                  never done before in this league. Currently available on web only.
                </AppText>
              </Card>
            )}

            {/* Submit button */}
            <View className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onPress={handleSubmit}
                isDisabled={isBusy || (!challenge.isUniqueWorkout && !proofImage)}
                className="w-full"
              >
                {isBusy ? (
                  <Spinner size="sm" />
                ) : (
                  <Button.Label>{buttonLabel}</Button.Label>
                )}
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
