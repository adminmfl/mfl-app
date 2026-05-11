import Feather from '@expo/vector-icons/Feather';
import { Linking, Pressable, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { Challenge } from '../types/challenge.model';
import {
  canPublishChallenge,
  formatChallengeDate,
  formatChallengeType,
  getChallengeTypeDescription,
  getStatusColors,
  getStatusLabel,
  isReviewEnabled,
} from '../utils/challenge-config-utils';

interface ChallengeAdminCardProps {
  challenge: Challenge;
  isHost: boolean;
  isPublishing: boolean;
  onFinish: (challenge: Challenge) => void;
  onReview: (challenge: Challenge) => void;
  onPublish: (challenge: Challenge) => void;
  onManageSubTeams: (challenge: Challenge) => void;
  onManageTournament: (challenge: Challenge) => void;
  onFinalizeTournament: (challenge: Challenge) => void;
  onEdit: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
}

export function ChallengeAdminCard({
  challenge,
  isHost,
  isPublishing,
  onFinish,
  onReview,
  onPublish,
  onManageSubTeams,
  onManageTournament,
  onFinalizeTournament,
  onEdit,
  onDelete,
}: ChallengeAdminCardProps) {
  const colors = getStatusColors(challenge.status);
  const pending = challenge.stats?.pending ?? 0;
  const reviewEnabled = isReviewEnabled(challenge.challengeType, challenge.status);
  const publishEnabled = canPublishChallenge(challenge.challengeType, challenge.status, pending);

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-base font-bold text-foreground">{challenge.name}</AppText>
          <AppText className="text-xs text-muted mt-1">
            {challenge.description || 'No description provided'}
          </AppText>
        </View>
        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.bgColor }}>
          <AppText className="text-[10px] font-bold" style={{ color: colors.color }}>
            {getStatusLabel(challenge.status)}
          </AppText>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <InfoPill icon="flag" label={formatChallengeType(challenge.challengeType)} />
        <InfoPill icon="award" label={`${challenge.totalPoints} pts`} />
        {challenge.isUniqueWorkout ? <InfoPill icon="link" label="Unique workout" /> : null}
      </View>

      <AppText className="text-xs text-muted">
        {getChallengeTypeDescription(challenge.challengeType)}
      </AppText>

      {(challenge.startDate || challenge.endDate) ? (
        <View className="rounded-xl bg-default-100 p-3">
          <AppText className="text-xs text-muted">
            Start: {formatChallengeDate(challenge.startDate)} - End: {formatChallengeDate(challenge.endDate)}
          </AppText>
        </View>
      ) : null}

      {challenge.stats ? (
        <View className="flex-row gap-2">
          <Stat label="Pending" value={challenge.stats.pending} color={mflColors.amber} />
          <Stat label="Approved" value={challenge.stats.approved} color={mflColors.brand} />
          <Stat label="Rejected" value={challenge.stats.rejected} color={mflColors.danger} />
        </View>
      ) : null}

      {challenge.docUrl ? (
        <Pressable onPress={() => Linking.openURL(challenge.docUrl!)} className="flex-row items-center gap-2">
          <Feather name="file-text" size={16} color={mflColors.brand} />
          <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
            View rules document
          </AppText>
        </Pressable>
      ) : null}

      {challenge.status === 'submission_closed' && pending > 0 ? (
        <AppText className="text-xs text-muted">
          Review pending submissions before publishing.
        </AppText>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        {challenge.status === 'draft' ? (
          <Button size="sm" variant="primary" onPress={() => onFinish(challenge)}>
            <Button.Label>Finish Creation</Button.Label>
          </Button>
        ) : challenge.challengeType === 'tournament' ? (
          <Button size="sm" variant="secondary" onPress={() => onManageTournament(challenge)}>
            <Button.Label>Manage Matches</Button.Label>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onPress={() => onReview(challenge)}
            isDisabled={!reviewEnabled}
          >
            <Button.Label>
              {challenge.challengeType === 'team' ? 'Assign Scores' : 'Review'}
            </Button.Label>
          </Button>
        )}

        {challenge.challengeType === 'sub_team' &&
        (challenge.status === 'draft' || challenge.status === 'scheduled') ? (
          <Button size="sm" variant="secondary" onPress={() => onManageSubTeams(challenge)}>
            <Button.Label>Manage Sub-Teams</Button.Label>
          </Button>
        ) : null}

        {challenge.challengeType === 'tournament' &&
        (challenge.status === 'submission_closed' || challenge.status === 'published') ? (
          <Button size="sm" variant="primary" onPress={() => onFinalizeTournament(challenge)}>
            <Button.Label>Edit Scores</Button.Label>
          </Button>
        ) : null}

        {challenge.challengeType !== 'tournament' ? (
          <Button
            size="sm"
            variant="primary"
            onPress={() => onPublish(challenge)}
            isDisabled={!publishEnabled || isPublishing}
          >
            {isPublishing ? <Spinner size="sm" /> : <Button.Label>Publish Scores</Button.Label>}
          </Button>
        ) : null}

        {isHost ? (
          <>
            <Button size="sm" variant="secondary" onPress={() => onEdit(challenge)}>
              <Button.Label>Edit</Button.Label>
            </Button>
            <Button size="sm" variant="secondary" onPress={() => onDelete(challenge)}>
              <Button.Label style={{ color: mflColors.danger }}>Delete</Button.Label>
            </Button>
          </>
        ) : null}
      </View>
    </Card>
  );
}

function InfoPill({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-default-100 px-3 py-1.5">
      <Feather name={icon} size={13} color={mflColors.textMuted} />
      <AppText className="text-xs font-semibold text-foreground">{label}</AppText>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="flex-1 rounded-xl bg-default-100 p-2 items-center">
      <AppText className="text-base font-bold" style={{ color }}>
        {value}
      </AppText>
      <AppText className="text-[10px] text-muted">{label}</AppText>
    </View>
  );
}
