import { Image, Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type {
  Challenge,
  ChallengeSubmission,
  ChallengeSubTeam,
  ChallengeTeam,
} from '../types/challenge.model';
import {
  formatChallengeDate,
  formatChallengeType,
} from '../utils/challenge-config-utils';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 15,
  color: mflColors.text,
};

interface ChallengeReviewPanelProps {
  challenge: Challenge;
  submissions: ChallengeSubmission[];
  teams: ChallengeTeam[];
  subTeams: ChallengeSubTeam[];
  selectedTeamId: string;
  selectedSubTeamId: string;
  awardedPoints: Record<string, string>;
  teamScore: string;
  isLoading: boolean;
  validatingId: string | null;
  isAssigningScore: boolean;
  onTeamChange: (value: string) => void;
  onSubTeamChange: (value: string) => void;
  onAwardedPointsChange: (submissionId: string, value: string) => void;
  onTeamScoreChange: (value: string) => void;
  onAssignTeamScore: () => void;
  onValidate: (submission: ChallengeSubmission, status: 'approved' | 'rejected') => void;
  onClose: () => void;
}

export function ChallengeReviewPanel({
  challenge,
  submissions,
  teams,
  subTeams,
  selectedTeamId,
  selectedSubTeamId,
  awardedPoints,
  teamScore,
  isLoading,
  validatingId,
  isAssigningScore,
  onTeamChange,
  onSubTeamChange,
  onAwardedPointsChange,
  onTeamScoreChange,
  onAssignTeamScore,
  onValidate,
  onClose,
}: ChallengeReviewPanelProps) {
  const showTeamFilter = challenge.challengeType === 'team' || challenge.challengeType === 'sub_team';
  const showSubTeamFilter = challenge.challengeType === 'sub_team' && selectedTeamId;

  return (
    <View className="gap-3">
      <Card className="p-4 gap-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AppText className="text-lg font-bold text-foreground">
              {challenge.challengeType === 'team' ? 'Assign Scores' : 'Review Submissions'}
            </AppText>
            <AppText className="text-sm text-muted mt-1">
              {challenge.name} - {formatChallengeType(challenge.challengeType)}
            </AppText>
          </View>
          <Button variant="secondary" size="sm" onPress={onClose}>
            <Button.Label>Close</Button.Label>
          </Button>
        </View>

        <View className="rounded-xl bg-default-100 p-3">
          <AppText className="text-xs text-muted">
            Start: {formatChallengeDate(challenge.startDate)} - End: {formatChallengeDate(challenge.endDate)} - {challenge.totalPoints} pts
          </AppText>
        </View>

        {showTeamFilter ? (
          <View className="gap-2">
            <AppText className="text-xs font-semibold text-muted uppercase">Team</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 pr-4">
                {teams.map((team) => (
                  <FilterChip
                    key={team.teamId}
                    label={team.teamName}
                    active={selectedTeamId === team.teamId}
                    onPress={() => onTeamChange(team.teamId)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}

        {showSubTeamFilter ? (
          <View className="gap-2">
            <AppText className="text-xs font-semibold text-muted uppercase">Sub-Team</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 pr-4">
                {subTeams.map((subTeam) => (
                  <FilterChip
                    key={subTeam.subTeamId}
                    label={subTeam.name}
                    active={selectedSubTeamId === subTeam.subTeamId}
                    onPress={() => onSubTeamChange(subTeam.subTeamId)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}

        {challenge.challengeType === 'team' && selectedTeamId ? (
          <View className="rounded-xl border border-default-200 p-3 gap-2">
            <AppText className="text-sm font-bold text-foreground">Team Score</AppText>
            <AppText className="text-xs text-muted">
              Assign one final score to the selected team. Submissions below remain visible for proof verification.
            </AppText>
            <View className="flex-row gap-2">
              <TextInput
                style={{ ...inputStyle, flex: 1 }}
                value={teamScore}
                onChangeText={onTeamScoreChange}
                placeholder="Score"
                placeholderTextColor={mflColors.textMuted}
                keyboardType="numeric"
              />
              <Button
                variant="primary"
                size="md"
                onPress={onAssignTeamScore}
                isDisabled={isAssigningScore || !teamScore.trim()}
              >
                {isAssigningScore ? <Spinner size="sm" /> : <Button.Label>Assign</Button.Label>}
              </Button>
            </View>
          </View>
        ) : null}
      </Card>

      {isLoading ? (
        <Card className="p-5 items-center">
          <Spinner size="sm" />
          <AppText className="text-sm text-muted mt-2">Loading submissions...</AppText>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-5">
          <AppText className="text-sm text-muted text-center py-4">No submissions yet.</AppText>
        </Card>
      ) : (
        submissions.map((submission) => (
          <SubmissionRow
            key={submission.submissionId}
            challenge={challenge}
            submission={submission}
            pointsValue={awardedPoints[submission.submissionId] ?? String(submission.pointsAwarded ?? '')}
            isValidating={validatingId === submission.submissionId}
            onPointsChange={(value) => onAwardedPointsChange(submission.submissionId, value)}
            onValidate={onValidate}
          />
        ))
      )}
    </View>
  );
}

function SubmissionRow({
  challenge,
  submission,
  pointsValue,
  isValidating,
  onPointsChange,
  onValidate,
}: {
  challenge: Challenge;
  submission: ChallengeSubmission;
  pointsValue: string;
  isValidating: boolean;
  onPointsChange: (value: string) => void;
  onValidate: (submission: ChallengeSubmission, status: 'approved' | 'rejected') => void;
}) {
  const colors =
    submission.status === 'pending'
      ? { color: mflColors.amber, bgColor: mflColors.amberLight }
      : submission.status === 'approved'
        ? { color: mflColors.brand, bgColor: mflColors.brandLight }
        : { color: mflColors.danger, bgColor: mflColors.dangerLight };

  return (
    <Card className="p-4 gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-sm font-bold text-foreground">{submission.username}</AppText>
          <AppText className="text-xs text-muted mt-0.5">{submission.teamName || 'Unassigned'}</AppText>
          <AppText className="text-[10px] text-muted mt-1">
            Submitted: {formatChallengeDate(submission.createdAt)}
          </AppText>
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.bgColor }}>
          <AppText className="text-[10px] font-bold" style={{ color: colors.color }}>
            {submission.status}
          </AppText>
        </View>
      </View>

      {submission.proofUrl ? (
        <Pressable onPress={() => Linking.openURL(submission.proofUrl!)}>
          <Image
            source={{ uri: submission.proofUrl }}
            style={{ width: '100%', height: 150, borderRadius: 12 }}
            resizeMode="cover"
          />
        </Pressable>
      ) : (
        <View className="rounded-xl border border-dashed border-default-200 p-3 items-center">
          <AppText className="text-xs text-muted">No proof attached.</AppText>
        </View>
      )}

      {challenge.challengeType === 'individual' ? (
        <View className="flex-row gap-2">
          <TextInput
            style={{ ...inputStyle, flex: 1 }}
            value={pointsValue}
            onChangeText={onPointsChange}
            placeholder="Points"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="numeric"
          />
          <Button
            size="md"
            variant="secondary"
            onPress={() => onValidate(submission, 'rejected')}
            isDisabled={isValidating}
          >
            <Button.Label style={{ color: mflColors.danger }}>Reject</Button.Label>
          </Button>
          <Button
            size="md"
            variant="primary"
            onPress={() => onValidate(submission, 'approved')}
            isDisabled={isValidating}
          >
            {isValidating ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>{submission.status === 'approved' ? 'Update' : 'Approve'}</Button.Label>
            )}
          </Button>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <Button
            size="md"
            variant="secondary"
            onPress={() => onValidate(submission, 'rejected')}
            isDisabled={isValidating}
            className="flex-1"
          >
            <Button.Label style={{ color: mflColors.danger }}>Reject</Button.Label>
          </Button>
          <Button
            size="md"
            variant="primary"
            onPress={() => onValidate(submission, 'approved')}
            isDisabled={isValidating}
            className="flex-1"
          >
            {isValidating ? <Spinner size="sm" /> : <Button.Label>Approve</Button.Label>}
          </Button>
        </View>
      )}
    </Card>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border px-4 py-2"
      style={{
        backgroundColor: active ? mflColors.brand : mflColors.card,
        borderColor: active ? mflColors.brand : mflColors.border,
      }}
    >
      <AppText className="text-sm font-semibold" style={{ color: active ? '#fff' : mflColors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}
