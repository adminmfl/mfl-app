import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import {
  useDeleteRulesDocument,
  useLeagueRules,
  useUpdateLeagueRules,
} from '../hooks/use-league-rules';
import type { PickedRulesDocument } from '../types/league-management.model';
import { RulesDocumentSection } from './rules-document-section';
import { RulesEditorModal } from './rules-editor-modal';
import { RulesEmptyState } from './rules-empty-state';
import { RulesQuickLinks } from './rules-quick-links';
import { RulesSummarySection } from './rules-summary-section';

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { error?: string } };
    message?: string;
  } | null;

  return err?.response?.data?.error || err?.message || fallback;
}

export function LeagueRulesScreen() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const canEdit = isHost || isGovernor;

  const rulesQuery = useLeagueRules(leagueId);
  const updateMutation = useUpdateLeagueRules();
  const deleteMutation = useDeleteRulesDocument();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [pickedFile, setPickedFile] = useState<PickedRulesDocument | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (rulesQuery.data) {
      setEditedSummary(rulesQuery.data.rulesSummary ?? '');
    }
  }, [rulesQuery.data]);

  if (!leagueId) {
    return (
      <ScreenState
        screen="league-rules"
        state="empty"
        message="No active league selected."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (rulesQuery.isLoading) {
    return (
      <ScreenState
        screen="league-rules"
        state="loading"
        message="Loading rules..."
      />
    );
  }

  if (rulesQuery.isError) {
    return (
      <ScreenState
        screen="league-rules"
        state="error"
        message={getErrorMessage(rulesQuery.error, 'Failed to load rules.')}
        actionLabel="Retry"
        onAction={() => {
          void rulesQuery.refetch();
        }}
      />
    );
  }

  const rules = rulesQuery.data;
  const summary = rules?.rulesSummary ?? '';
  const docUrl = rules?.rulesDocUrl ?? '';
  const hasSummary = summary.trim().length > 0;
  const hasDocUrl = docUrl.trim().length > 0;
  const hasRules = hasSummary || hasDocUrl;

  const openEditor = () => {
    if (!canEdit) return;
    setSuccessMessage('');
    setEditedSummary(summary);
    setPickedFile(null);
    setEditorOpen(true);
  };

  const handleSave = () => {
    if (!canEdit) return;
    setSuccessMessage('');
    updateMutation.mutate(
      { leagueId, rulesSummary: editedSummary.trim(), file: pickedFile },
      {
        onSuccess: (updatedRules) => {
          setEditorOpen(false);
          setPickedFile(null);
          setEditedSummary(updatedRules.rulesSummary ?? '');
          setSuccessMessage('Rules updated successfully.');
        },
        onError: (error) => {
          Alert.alert('Failed', getErrorMessage(error, 'Failed to save rules.'));
        },
      },
    );
  };

  const handleDeleteDocument = () => {
    if (!canEdit) return;

    Alert.alert(
      'Delete Document',
      'This will permanently remove the rules document.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSuccessMessage('');
            deleteMutation.mutate(leagueId, {
              onSuccess: () => {
                setPickedFile(null);
                setSuccessMessage('Rules document deleted.');
              },
              onError: (error) => {
                Alert.alert(
                  'Failed',
                  getErrorMessage(error, 'Failed to delete document.'),
                );
              },
            });
          },
        },
      ],
    );
  };

  const mutationError =
    updateMutation.error || deleteMutation.error
      ? getErrorMessage(
          updateMutation.error || deleteMutation.error,
          'Failed to update rules.',
        )
      : null;

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerClassName="gap-5"
      onRefresh={() => rulesQuery.refetch()}
    >
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>

          {canEdit && (
            <Pressable onPress={openEditor} hitSlop={12}>
              <View
                className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5"
                style={{ backgroundColor: mflColors.brandLight }}
              >
                <Feather name="edit-3" size={16} color={mflColors.brand} />
                <AppText
                  className="text-sm font-medium"
                  style={{ color: mflColors.brand }}
                >
                  {hasRules ? 'Edit Rules' : 'Add Rules'}
                </AppText>
              </View>
            </Pressable>
          )}
        </View>

        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Feather name="file-text" size={20} color={mflColors.brand} />
            <AppText className="text-xl font-bold text-foreground">
              {canEdit ? 'Manage League Rules' : 'League Rules'}
            </AppText>
          </View>
          <AppText className="text-sm text-muted">
            {canEdit
              ? 'Add or update the rules summary and document for participants'
              : 'Official rules and guidelines for this league'}
          </AppText>
        </View>

        {activeLeague?.creatorName ? (
          <View
            className="self-start flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: mflColors.amberLight }}
          >
            <Feather name="award" size={14} color={mflColors.amber} />
            <AppText
              className="text-xs font-medium"
              style={{ color: mflColors.amber }}
            >
              League is hosted by {activeLeague.creatorName}
            </AppText>
          </View>
        ) : null}
      </View>

      {mutationError ? (
        <View
          className="rounded-lg p-3"
          style={{ backgroundColor: mflColors.dangerLight }}
        >
          <AppText className="text-sm" style={{ color: mflColors.danger }}>
            {mutationError}
          </AppText>
        </View>
      ) : null}

      {successMessage ? (
        <View
          className="flex-row items-center gap-2 rounded-lg p-3"
          style={{ backgroundColor: mflColors.brandLight }}
        >
          <Feather name="check-circle" size={18} color={mflColors.brand} />
          <AppText
            className="flex-1 text-sm font-medium"
            style={{ color: mflColors.brand }}
          >
            {successMessage}
          </AppText>
        </View>
      ) : null}

      {!hasRules ? (
        <RulesEmptyState canEdit={canEdit} onAddRules={openEditor} />
      ) : null}

      {hasSummary ? <RulesSummarySection summary={summary} /> : null}

      <RulesQuickLinks showActivities={hasRules} />

      {hasDocUrl ? (
        <RulesDocumentSection
          docUrl={docUrl}
          fileType={rules?.fileType ?? null}
          canEdit={canEdit}
          deleting={deleteMutation.isPending}
          onDeleteDocument={handleDeleteDocument}
        />
      ) : null}

      {canEdit ? (
        <RulesEditorModal
          visible={editorOpen}
          summary={editedSummary}
          onChangeSummary={setEditedSummary}
          pickedFile={pickedFile}
          onPickFile={setPickedFile}
          hasExistingDoc={hasDocUrl}
          existingFileType={rules?.fileType ?? null}
          saving={updateMutation.isPending}
          deleting={deleteMutation.isPending}
          onSave={handleSave}
          onClose={() => setEditorOpen(false)}
          onDeleteDocument={handleDeleteDocument}
        />
      ) : null}
    </ScreenScrollView>
  );
}
