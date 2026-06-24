import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { ChallengeConfigForm, PickedChallengeDocument } from '../types/challenge-config';
import { EMPTY_CHALLENGE_FORM } from '../types/challenge-config';
import type { Challenge, ChallengePreset, ChallengeSubmission } from '../types/challenge.model';
import { parseOptionalNumber, toDateInput } from '../utils/challenge-config-utils';
import { uploadChallengeDocument } from '../services/challenge.service';
import * as DocumentPicker from 'expo-document-picker';
import {
  useChallengeAdminActions,
  useChallengeReviewSubmissions,
  useChallengeSubTeams,
} from './use-configure-challenges';

export function useChallengeConfigState(leagueId: string) {
  const actions = useChallengeAdminActions(leagueId);

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

    const reviewSubmissions = useChallengeReviewSubmissions(
      leagueId,
      reviewChallenge?.challengeId ?? '',
      {
        teamId: selectedTeamId || undefined,
        subTeamId: selectedSubTeamId || undefined,
      },
    );
  
    const reviewSubTeams = useChallengeSubTeams(
      leagueId,
      reviewChallenge?.challengeId ?? '',
      selectedTeamId,
    );
  
    const activeReviewSubmissions = useMemo(
      () => reviewSubmissions.data ?? [],
      [reviewSubmissions.data],
    );
  

  useEffect(() => {
    setSelectedSubTeamId('');
  }, [selectedTeamId]);

  const isBusy =
    actions.createMutation.isPending ||
    actions.updateMutation.isPending ||
    actions.deleteMutation.isPending ||
    actions.publishMutation.isPending ||
    isUploadingDocument;

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

  const resetCreate = useCallback(() => {
    setCreateForm(EMPTY_CHALLENGE_FORM);
    setCreateDocument(null);
    setShowCreate(false);
  }, []);

  const handleCreate = useCallback(async () => {
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
  }, [actions.createMutation, createDocument, createForm, resetCreate, resolveDocumentUrl]);

  const handleActivatePreset = useCallback(async () => {
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
  }, [actions.createMutation, activateForm, selectedPreset]);

  const startEdit = useCallback((challenge: Challenge) => {
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
  }, []);

  const handleEdit = useCallback(async () => {
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
  }, [actions.updateMutation, editChallenge, editDocument, editForm, resolveDocumentUrl]);

  const startFinish = useCallback((challenge: Challenge) => {
    setFinishChallenge(challenge);
    setFinishForm({
      ...EMPTY_CHALLENGE_FORM,
      challengeType: challenge.challengeType,
      totalPoints: String(challenge.totalPoints ?? ''),
      startDate: toDateInput(challenge.startDate),
      endDate: toDateInput(challenge.endDate),
    });
  }, []);

  const handleFinish = useCallback(async () => {
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
  }, [actions.updateMutation, finishChallenge, finishForm]);

  const handleDelete = useCallback((challenge: Challenge) => {
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
  }, [actions.deleteMutation]);

  const openReview = useCallback((challenge: Challenge) => {
    setReviewChallenge(challenge);
    setSubTeamChallenge(null);
    setTournamentChallenge(null);
    setSelectedTeamId('');
    setSelectedSubTeamId('');
    setAwardedPoints({});
    setTeamScore('');
  }, []);

  const openSubTeamManager = useCallback((challenge: Challenge) => {
    setSubTeamChallenge(challenge);
    setReviewChallenge(null);
    setTournamentChallenge(null);
  }, []);

  const openTournamentPanel = useCallback((challenge: Challenge, tab: 'fixtures' | 'standings' | 'scores') => {
    setTournamentChallenge(challenge);
    setTournamentTab(tab);
    setReviewChallenge(null);
    setSubTeamChallenge(null);
  }, []);

  const handlePublish = useCallback(async (challenge: Challenge) => {
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
  }, [actions.publishMutation]);

  const handleValidate = useCallback(async (
    submission: ChallengeSubmission,
    status: 'approved' | 'rejected',
    reviewChallengeType: string,
    onSuccess: () => void,
  ) => {
    let points: number | null | undefined = undefined;
    if (reviewChallengeType === 'individual' && status === 'approved') {
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
      onSuccess();
    } catch (error) {
      Alert.alert('Review Failed', error instanceof Error ? error.message : 'Failed to update submission.');
    } finally {
      setValidatingId(null);
    }
  }, [actions.validateMutation, awardedPoints]);

  const handleAssignTeamScore = useCallback(async (
    challengeId: string,
    onSuccess: () => void,
  ) => {
    if (!selectedTeamId) return;
    const score = parseOptionalNumber(teamScore);
    if (score === null || score < 0) {
      Alert.alert('Invalid Score', 'Enter a non-negative score.');
      return;
    }
    try {
      await actions.teamScoreMutation.mutateAsync({ challengeId, teamId: selectedTeamId, score });
      Alert.alert('Score Assigned', 'The team score has been saved.');
      onSuccess();
    } catch (error) {
      Alert.alert('Score Failed', error instanceof Error ? error.message : 'Failed to assign score.');
    }
  }, [actions.teamScoreMutation, selectedTeamId, teamScore]);

  return {
    actions,
    // create
    showCreate, setShowCreate,
    createForm, setCreateForm,
    createDocument, setCreateDocument,
    resetCreate, handleCreate,
    // preset
    selectedPreset, setSelectedPreset,
    activateForm, setActivateForm,
    handleActivatePreset,
    // edit
    editChallenge, setEditChallenge,
    editForm, setEditForm,
    editDocument, setEditDocument,
    startEdit, handleEdit,
    // finish
    finishChallenge, setFinishChallenge,
    finishForm, setFinishForm,
    startFinish, handleFinish,
    // panels
    reviewChallenge, setReviewChallenge,
    subTeamChallenge, setSubTeamChallenge,
    tournamentChallenge, setTournamentChallenge,
    tournamentTab,
    openReview, openSubTeamManager, openTournamentPanel,
    // review state
    selectedTeamId, setSelectedTeamId,
    selectedSubTeamId, setSelectedSubTeamId,
    awardedPoints, setAwardedPoints,
    teamScore, setTeamScore,
    validatingId,
    publishingId,
    // actions
    handlePublish, handleValidate, handleAssignTeamScore,
    // utils
    pickDocument,
    isBusy,
    reviewSubmissions,
    reviewSubTeams,
    activeReviewSubmissions,
    handleDelete,
  };
}
