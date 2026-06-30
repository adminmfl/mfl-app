import { View } from 'react-native';
import { Button } from 'heroui-native';
import { useRouter } from 'expo-router';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { Challenge } from '../types/challenge.model';

interface ChallengeActionBarProps {
  challenge: Challenge;
  onSubmitProof: () => void;
}

export function ChallengeActionBar({ challenge, onSubmitProof }: ChallengeActionBarProps) {
  const router = useRouter();

  if (challenge.challengeType === 'tournament') {
    return null;
  }

  if (challenge.challengeType === 'weight_loss') {
    return (
      <Button
        variant="primary"
        size="lg"
        onPress={() => {
          router.push({
            pathname: '/(app)/challenges/weight-log' as any,
            params: { challengeId: challenge.challengeId },
          });
        }}
        className="w-full"
      >
        <Button.Label>Log Weight</Button.Label>
      </Button>
    );
  }

  const myStatus = challenge.mySubmission?.status as string | undefined;
  const canSubmit =
    challenge.status === 'active' &&
    (!myStatus || myStatus === 'rejected');

  if (!canSubmit) {
    if (myStatus === 'pending') {
      return (
        <View className="rounded-xl p-4 items-center" style={{ backgroundColor: mflColors.amberLight }}>
          <AppText className="text-sm font-semibold" style={{ color: mflColors.amber }}>
            Submission Pending Review
          </AppText>
        </View>
      );
    }

    if (myStatus === 'approved') {
      return (
        <View className="rounded-xl p-4 items-center" style={{ backgroundColor: mflColors.brandLight }}>
          <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
            Submission Approved
          </AppText>
        </View>
      );
    }

    return null;
  }

  const label = myStatus === 'rejected' ? 'Resubmit Proof' : 'Submit Proof';

  return (
    <Button variant="primary" size="lg" onPress={onSubmitProof} className="w-full">
      <Button.Label>{label}</Button.Label>
    </Button>
  );
}
