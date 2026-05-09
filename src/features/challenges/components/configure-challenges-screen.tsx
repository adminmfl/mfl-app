import Feather from '@expo/vector-icons/Feather';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { uploadChallengeDocument } from '../services/challenge.service';
import type { ChallengeConfigForm, PickedChallengeDocument } from '../types/challenge-config';
import { EMPTY_CHALLENGE_FORM } from '../types/challenge-config';
import type { Challenge, ChallengePreset, ChallengeSubmission } from '../types/challenge.model';
import {
  useChallengeAdminActions,
  useChallengeReviewSubmissions,
  useChallengeSubTeams,
  useChallengeTeams,
  useConfigureChallenges,
} from '../hooks/use-configure-challenges';
import { ChallengeAdminCard } from './challenge-admin-card';
import { ChallengeConfigFormCard } from './challenge-config-form-card';
import { ChallengeReviewPanel } from './challenge-review-panel';
import { ChallengeSubTeamManager } from './challenge-sub-team-manager';
import { ChallengeTournamentPanel } from './challenge-tournament-panel';
import {
  formatChallengeType,
  parseOptionalNumber,
  toDateInput,
} from '../utils/challenge-config-utils';

export function ConfigureChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const canUsePage = isHost || isGovernor;
  const queryLeagueId = canUsePage ? leagueId : '';

  const configQuery = useConfigureChallenges(queryLeagueId);
  const teamsQuery = useChallengeTeams(queryLeagueId);
  const actions = useChallengeAdminActions(queryLeagueId);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ChallengeConfigForm>(EMPTY_CHALLENGE_FORM);
  const [createDocument, setCreateDocument] = useState<PickedChallengeDocument | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<ChallengePreset | null>(null);
  const [activateForm, setActivateForm] = useState<ChallengeConfigForm>(EMPTY_CHALLENGE_FORM);

  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);
  const [editForm, setEditForm] = useState<ChallengeConfigForm>(EMPTY_CHALLENGE_FORM);
  const [editDocument, setEditDocument] = useState<PickedChallengeDocument | null>(null);

  const [finishChallenge, setFinishChallenge] = useState<Challenge | null>(null);
  const [finishForm, setFinishForm] = useState<ChallengeConfigForm>(EMPTY_CHALLENGE_FORM);

  const [reviewChallenge, setReviewChallenge] = useState<Challenge | null>(null);
  const [subTeamChallenge, setSubTeamChallenge] = useState<Challenge | null>(null);
  const [tournamentChallenge, setTournamentChallenge] = useState<Challenge | null>(null);
  const [tournamentTab, setTournamentTab] = useState<'fixtures' | 'standings' | 'scores'>('fixtures');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedSubTeamId, setSelectedSubTeamId] = useState('');
  const [awardedPoints, setAwardedPoints] = useState<Record<string, string>>({});
  const [teamScore, setTeamScore] = useState('');
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const reviewSubTeams = useChallengeSubTeams(
    queryLeagueId,
    reviewChallenge?.challengeId ?? '',
    selectedTeamId,
  );
  const reviewSubmissions = useChallengeReviewSubmissions(
    queryLeagueId,
    reviewChallenge?.challengeId ?? '',
    {
      teamId: selectedTeamId || undefined,
      subTeamId: selectedSubTeamId || undefined,
    },
  );

  const challenges = configQuery.data?.challenges ?? [];
  const presets = configQuery.data?.presets ?? [];
  const teams = teamsQuery.data ?? [];

  useEffect(() => {
    if (!reviewChallenge) return;
    if (
      (reviewChallenge.challengeType === 'team' || reviewChallenge.challengeType === 'sub_team') &&
      teams.length > 0 &&
      !selectedTeamId
    ) {
      setSelectedTeamId(teams[0]!.teamId);
    }
  }, [reviewChallenge, selectedTeamId, teams]);

  useEffect(() => {
    setSelectedSubTeamId('');
  }, [selectedTeamId]);

  const handleRefresh = useCallback(async () => {
    await configQuery.refetch();
    await teamsQuery.refetch();
    if (reviewChallenge) await reviewSubmissions.refetch();
  }, [configQuery, reviewChallenge, reviewSubmissions, teamsQuery]);

  const pickDocument = useCallback(async (): Promise<PickedChallengeDocument | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/*',
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name || `challenge_document_${Date.now()}`,
      type: asset.mimeType || 'application/octet-stream',
    };
  }, []);

  const resolveDocumentUrl = useCallback(
    async (form: ChallengeConfigForm, document: PickedChallengeDocument | null) => {
      if (!document) return form.docUrl.trim() || null;
      setIsUploadingDocument(true);
      try {
        return await uploadChallengeDocument(leagueId, document);
      } finally {
        setIsUploadingDocument(false);
      }
    },
    [leagueId],
  );

  const resetCreate = () => {
    setCreateForm(EMPTY_CHALLENGE_FORM);
    setCreateDocument(null);
    setShowCreate(false);
  };

  const handleCreate = async () => {
    try {
      const docUrl = await resolveDocumentUrl(createForm, createDocument);
      await actions.createMutation.mutateAsync({
        name: createForm.name.trim(),
        description: createForm.description.trim() || '',
        challengeType: createForm.challengeType,
        totalPoints: Number(createForm.totalPoints) || 0,
        docUrl,
        startDate: createForm.startDate || null,
        endDate: createForm.endDate || null,
        isCustom: true,
        isUniqueWorkout: createForm.isUniqueWorkout,
      });
      Alert.alert('Challenge Created', 'The challenge has been created.');
      resetCreate();
    } catch (error) {
      Alert.alert('Create Failed', error instanceof Error ? error.message : 'Failed to create challenge.');
    }
  };

  const handleActivatePreset = async () => {
    if (!selectedPreset) return;
    try {
      await actions.createMutation.mutateAsync({
        name: selectedPreset.name,
        description: selectedPreset.description || '',
        challengeType: selectedPreset.challengeType,
        totalPoints: Number(activateForm.totalPoints) || 0,
        startDate: activateForm.startDate || null,
        endDate: activateForm.endDate || null,
        docUrl: selectedPreset.docUrl,
        templateId: selectedPreset.presetId,
        isCustom: false,
        isUniqueWorkout: activateForm.isUniqueWorkout,
        status: 'active',
      });
      Alert.alert('Challenge Activated', 'The preset challenge is now active.');
      setSelectedPreset(null);
      setActivateForm(EMPTY_CHALLENGE_FORM);
    } catch (error) {
      Alert.alert('Activation Failed', error instanceof Error ? error.message : 'Failed to activate challenge.');
    }
  };

  const startEdit = (challenge: Challenge) => {
    setEditChallenge(challenge);
    setEditDocument(null);
    setEditForm({
      name: challenge.name,
      description: challenge.description ?? '',
      challengeType: challenge.challengeType,
      totalPoints: String(challenge.totalPoints ?? ''),
      docUrl: challenge.docUrl ?? '',
      startDate: toDateInput(challenge.startDate),
      endDate: toDateInput(challenge.endDate),
      isUniqueWorkout: !!challenge.isUniqueWorkout,
    });
  };

  const handleEdit = async () => {
    if (!editChallenge) return;
    try {
      const docUrl = await resolveDocumentUrl(editForm, editDocument);
      await actions.updateMutation.mutateAsync({
        challengeId: editChallenge.challengeId,
        input: {
          name: editForm.name.trim(),
          description: editForm.description.trim() || '',
          challengeType: editForm.challengeType,
          totalPoints: Number(editForm.totalPoints) || 0,
          docUrl,
          startDate: editForm.startDate || null,
          endDate: editForm.endDate || null,
          isUniqueWorkout: editForm.isUniqueWorkout,
        },
      });
      Alert.alert('Challenge Updated', 'The challenge has been updated.');
      setEditChallenge(null);
      setEditDocument(null);
    } catch (error) {
      Alert.alert('Update Failed', error instanceof Error ? error.message : 'Failed to update challenge.');
    }
  };

  const startFinish = (challenge: Challenge) => {
    setFinishChallenge(challenge);
    setFinishForm({
      ...EMPTY_CHALLENGE_FORM,
      challengeType: challenge.challengeType,
      totalPoints: String(challenge.totalPoints ?? ''),
      startDate: toDateInput(challenge.startDate),
      endDate: toDateInput(challenge.endDate),
    });
  };

  const handleFinish = async () => {
    if (!finishChallenge) return;
    if (!finishForm.startDate || !finishForm.endDate) {
      Alert.alert('Dates Required', 'Start date and end date are required.');
      return;
    }
    try {
      await actions.updateMutation.mutateAsync({
        challengeId: finishChallenge.challengeId,
        input: {
          startDate: finishForm.startDate,
          endDate: finishForm.endDate,
        },
      });
      Alert.alert('Challenge Activated', 'The challenge has been activated.');
      setFinishChallenge(null);
    } catch (error) {
      Alert.alert('Activation Failed', error instanceof Error ? error.message : 'Failed to activate challenge.');
    }
  };

  const handleDelete = (challenge: Challenge) => {
    Alert.alert(
      'Delete Challenge?',
      `This will permanently delete "${challenge.name}" and all its submissions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.deleteMutation.mutateAsync(challenge.challengeId);
              Alert.alert('Challenge Deleted', 'The challenge has been deleted.');
            } catch (error) {
              Alert.alert('Delete Failed', error instanceof Error ? error.message : 'Failed to delete challenge.');
            }
          },
        },
      ],
    );
  };

  const openReview = (challenge: Challenge) => {
    setReviewChallenge(challenge);
    setSubTeamChallenge(null);
    setTournamentChallenge(null);
    setSelectedTeamId('');
    setSelectedSubTeamId('');
    setAwardedPoints({});
    setTeamScore('');
  };

  const openSubTeamManager = (challenge: Challenge) => {
    setSubTeamChallenge(challenge);
    setReviewChallenge(null);
    setTournamentChallenge(null);
  };

  const openTournamentPanel = (challenge: Challenge, tab: 'fixtures' | 'standings' | 'scores') => {
    setTournamentChallenge(challenge);
    setTournamentTab(tab);
    setReviewChallenge(null);
    setSubTeamChallenge(null);
  };

  const handlePublish = async (challenge: Challenge) => {
    if (challenge.stats && challenge.stats.pending > 0 && challenge.challengeType !== 'team') {
      Alert.alert('Pending Submissions', 'Review all pending submissions before publishing.');
      return;
    }
    setPublishingId(challenge.challengeId);
    try {
      await actions.publishMutation.mutateAsync(challenge.challengeId);
      Alert.alert('Scores Published', 'Challenge scores have been published.');
    } catch (error) {
      Alert.alert('Publish Failed', error instanceof Error ? error.message : 'Failed to publish scores.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleValidate = async (submission: ChallengeSubmission, status: 'approved' | 'rejected') => {
    let points: number | null | undefined = undefined;
    if (reviewChallenge?.challengeType === 'individual' && status === 'approved') {
      const parsed = parseOptionalNumber(awardedPoints[submission.submissionId] ?? String(submission.pointsAwarded ?? ''));
      if (parsed === null) {
        points = undefined;
      } else if (parsed < 0) {
        Alert.alert('Invalid Points', 'Points must be a non-negative number.');
        return;
      } else {
        points = parsed;
      }
    }

    setValidatingId(submission.submissionId);
    try {
      await actions.validateMutation.mutateAsync({
        submissionId: submission.submissionId,
        status,
        awardedPoints: points,
      });
      await reviewSubmissions.refetch();
    } catch (error) {
      Alert.alert('Review Failed', error instanceof Error ? error.message : 'Failed to update submission.');
    } finally {
      setValidatingId(null);
    }
  };

  const handleAssignTeamScore = async () => {
    if (!reviewChallenge || !selectedTeamId) return;
    const score = parseOptionalNumber(teamScore);
    if (score === null || score < 0) {
      Alert.alert('Invalid Score', 'Enter a non-negative score.');
      return;
    }
    try {
      await actions.teamScoreMutation.mutateAsync({
        challengeId: reviewChallenge.challengeId,
        teamId: selectedTeamId,
        score,
      });
      Alert.alert('Score Assigned', 'The team score has been saved.');
    } catch (error) {
      Alert.alert('Score Failed', error instanceof Error ? error.message : 'Failed to assign score.');
    }
  };

  const isBusy =
    actions.createMutation.isPending ||
    actions.updateMutation.isPending ||
    actions.deleteMutation.isPending ||
    actions.publishMutation.isPending ||
    isUploadingDocument;

  const activeReviewSubmissions = useMemo(
    () => reviewSubmissions.data ?? [],
    [reviewSubmissions.data],
  );

  if (!activeLeague) {
    return (
      <ScreenState
        screen="challenges"
        state="empty"
        message="Select a league to configure challenges."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!canUsePage) {
    return (
      <ScreenState
        screen="challenges"
        state="error"
        message="Only hosts and governors can configure challenges."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (configQuery.isLoading) {
    return <ScreenState screen="challenges" state="loading" />;
  }

  if (configQuery.isError) {
    return (
      <ScreenState
        screen="challenges"
        state="error"
        message="Failed to load challenges."
        actionLabel="Retry"
        onAction={() => configQuery.refetch()}
      />
    );
  }

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
      onRefresh={handleRefresh}
    >
      <View className="gap-4 pb-12">
        <View className="flex-row items-center py-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <AppText className="flex-1 text-xl font-bold text-foreground text-center">
            Configure Challenges
          </AppText>
          <Button variant="secondary" size="sm" onPress={handleRefresh}>
            <Feather name="refresh-cw" size={16} color={mflColors.text} />
          </Button>
        </View>

        <View className="flex-row items-start gap-4">
          <View className="w-14 h-14 rounded-xl items-center justify-center" style={{ backgroundColor: mflColors.blue }}>
            <Feather name="flag" size={26} color="#fff" />
          </View>
          <View className="flex-1">
            <AppText className="text-2xl font-bold text-foreground">
              Configure Challenges
            </AppText>
            <AppText className="text-sm text-muted mt-1">
              Create, review, and manage challenges for {activeLeague.name}.
            </AppText>
          </View>
        </View>

        <Button
          variant={showCreate ? 'secondary' : 'primary'}
          size="lg"
          onPress={() => {
            if (showCreate) resetCreate();
            else setShowCreate(true);
          }}
        >
          <Button.Label>{showCreate ? 'Cancel Create' : 'Create Challenge'}</Button.Label>
        </Button>

        {showCreate ? (
          <ChallengeConfigFormCard
            title="Create Challenge"
            subtitle="Create a custom challenge for this league."
            form={createForm}
            document={createDocument}
            submitLabel="Create Challenge"
            isSaving={isBusy}
            onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
            onPickDocument={async () => setCreateDocument(await pickDocument())}
            onClearDocument={() => setCreateDocument(null)}
            onSubmit={handleCreate}
            onCancel={resetCreate}
          />
        ) : null}

        {selectedPreset ? (
          <ChallengeConfigFormCard
            title="Activate Preset"
            subtitle={`${selectedPreset.name} - ${formatChallengeType(selectedPreset.challengeType)}`}
            form={activateForm}
            document={null}
            submitLabel="Activate Challenge"
            showNameFields={false}
            isSaving={actions.createMutation.isPending}
            onChange={(patch) => setActivateForm((current) => ({ ...current, ...patch }))}
            onSubmit={handleActivatePreset}
            onCancel={() => {
              setSelectedPreset(null);
              setActivateForm(EMPTY_CHALLENGE_FORM);
            }}
          />
        ) : null}

        {editChallenge ? (
          <ChallengeConfigFormCard
            title="Edit Challenge"
            subtitle="Update challenge details."
            form={editForm}
            document={editDocument}
            submitLabel="Save Changes"
            isSaving={isBusy}
            onChange={(patch) => setEditForm((current) => ({ ...current, ...patch }))}
            onPickDocument={async () => setEditDocument(await pickDocument())}
            onClearDocument={() => setEditDocument(null)}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditChallenge(null);
              setEditDocument(null);
            }}
          />
        ) : null}

        {finishChallenge ? (
          <ChallengeConfigFormCard
            title="Finish Creation"
            subtitle={`Set dates to activate ${finishChallenge.name}.`}
            form={finishForm}
            document={null}
            submitLabel="Activate Challenge"
            showNameFields={false}
            isSaving={actions.updateMutation.isPending}
            onChange={(patch) => setFinishForm((current) => ({ ...current, ...patch }))}
            onSubmit={handleFinish}
            onCancel={() => setFinishChallenge(null)}
          />
        ) : null}

        {presets.length > 0 ? (
          <View className="gap-3">
            <SectionLabel label="PRE-CONFIGURED CHALLENGES" />
            <Card className="p-4 gap-3">
              <AppText className="text-base font-bold text-foreground">
                Select a challenge template to activate
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 pr-4">
                  {presets.map((preset) => (
                    <Pressable
                      key={preset.presetId}
                      onPress={() => {
                        setSelectedPreset(preset);
                        setActivateForm({
                          ...EMPTY_CHALLENGE_FORM,
                          name: preset.name,
                          description: preset.description ?? '',
                          challengeType: preset.challengeType,
                        });
                      }}
                      className="rounded-xl border p-3"
                      style={{
                        width: 210,
                        borderColor:
                          selectedPreset?.presetId === preset.presetId
                            ? mflColors.brand
                            : mflColors.border,
                        backgroundColor:
                          selectedPreset?.presetId === preset.presetId
                            ? mflColors.brandLight
                            : mflColors.card,
                      }}
                    >
                      <AppText className="text-sm font-bold text-foreground" numberOfLines={2}>
                        {preset.name}
                      </AppText>
                      <AppText className="text-xs text-muted mt-2">
                        {formatChallengeType(preset.challengeType)}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </Card>
          </View>
        ) : null}

        {reviewChallenge ? (
          <ChallengeReviewPanel
            challenge={reviewChallenge}
            submissions={activeReviewSubmissions}
            teams={teams}
            subTeams={reviewSubTeams.data ?? []}
            selectedTeamId={selectedTeamId}
            selectedSubTeamId={selectedSubTeamId}
            awardedPoints={awardedPoints}
            teamScore={teamScore}
            isLoading={reviewSubmissions.isLoading || teamsQuery.isLoading || reviewSubTeams.isLoading}
            validatingId={validatingId}
            isAssigningScore={actions.teamScoreMutation.isPending}
            onTeamChange={setSelectedTeamId}
            onSubTeamChange={setSelectedSubTeamId}
            onAwardedPointsChange={(submissionId, value) =>
              setAwardedPoints((current) => ({ ...current, [submissionId]: value }))
            }
            onTeamScoreChange={setTeamScore}
            onAssignTeamScore={handleAssignTeamScore}
            onValidate={handleValidate}
            onClose={() => setReviewChallenge(null)}
          />
        ) : null}

        {subTeamChallenge ? (
          <ChallengeSubTeamManager
            leagueId={leagueId}
            challenge={subTeamChallenge}
            teams={teams}
            onClose={() => setSubTeamChallenge(null)}
          />
        ) : null}

        {tournamentChallenge ? (
          <ChallengeTournamentPanel
            leagueId={leagueId}
            challenge={tournamentChallenge}
            teams={teams}
            defaultTab={tournamentTab}
            onClose={() => setTournamentChallenge(null)}
            onPublish={handlePublish}
          />
        ) : null}

        <SectionLabel label={`${challenges.length} CHALLENGE${challenges.length === 1 ? '' : 'S'}`} />

        {challenges.length === 0 && presets.length === 0 ? (
          <Card className="p-5 items-center">
            <Feather name="file-text" size={28} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted text-center mt-3">
              No challenges yet.
            </AppText>
          </Card>
        ) : (
          <View className="gap-3">
            {challenges.map((challenge) => (
              <ChallengeAdminCard
                key={challenge.challengeId}
                challenge={challenge}
                isHost={isHost}
                isPublishing={publishingId === challenge.challengeId}
                onFinish={startFinish}
                onReview={openReview}
                onPublish={handlePublish}
                onManageSubTeams={openSubTeamManager}
                onManageTournament={(challenge) => openTournamentPanel(challenge, 'fixtures')}
                onFinalizeTournament={(challenge) => openTournamentPanel(challenge, 'scores')}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
