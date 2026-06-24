import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from 'heroui-native';
import { EMPTY_CHALLENGE_FORM } from '../types/challenge-config';
import { useChallengeConfigState } from '../hooks/use-challenge-config-state';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import {
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
  const state = useChallengeConfigState(queryLeagueId);
  const { actions } = state;
  const handleRefresh = useCallback(async () => {
    await configQuery.refetch();
    await teamsQuery.refetch();
  }, [configQuery, teamsQuery]);
  const challenges = configQuery.data?.challenges ?? [];
  const presets = configQuery.data?.presets ?? [];
  const teams = teamsQuery.data ?? [];

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
          variant={state.showCreate ? 'secondary' : 'primary'}
          size="lg"
          onPress={() => {
            if (state.showCreate) state.resetCreate();
            else state.setShowCreate(true);
          }}
        >
          <Button.Label>{state.showCreate ? 'Cancel Create' : 'Create Challenge'}</Button.Label>
        </Button>

        {state.showCreate ? (
          <ChallengeConfigFormCard
            title="Create Challenge"
            subtitle="Create a custom challenge for this league."
            form={state.createForm}
            document={state.createDocument}
            submitLabel="Create Challenge"
            isSaving={state.isBusy}
            onChange={(patch) => state.setCreateForm((current) => ({ ...current, ...patch }))}
            onPickDocument={async () => state.setCreateDocument(await state.pickDocument())}
            onClearDocument={() => state.setCreateDocument(null)}
            onSubmit={state.handleCreate}
            onCancel={state.resetCreate}
          />
        ) : null}

        {state.selectedPreset ? (
          <ChallengeConfigFormCard
            title="Activate Preset"
            subtitle={`${state.selectedPreset.name} - ${formatChallengeType(state.selectedPreset.challengeType)}`}
            form={state.activateForm}
            document={null}
            submitLabel="Activate Challenge"
            showNameFields={false}
            isSaving={actions.createMutation.isPending}
            onChange={(patch) => state.setActivateForm((current) => ({ ...current, ...patch }))}
            onSubmit={state.handleActivatePreset}
            onCancel={() => {
              state.setSelectedPreset(null);
              state.setActivateForm(EMPTY_CHALLENGE_FORM);
            }}
          />
        ) : null}

        {state.editChallenge ? (
          <ChallengeConfigFormCard
            title="Edit Challenge"
            subtitle="Update challenge details."
            form={state.editForm}
            document={state.editDocument}
            submitLabel="Save Changes"
            isSaving={state.isBusy}
            onChange={(patch) => state.setEditForm((current) => ({ ...current, ...patch }))}
            onPickDocument={async () => state.setEditDocument(await state.pickDocument())}
            onClearDocument={() => state.setEditDocument(null)}
            onSubmit={state.handleEdit}
            onCancel={() => {
              state.setEditChallenge(null);
              state.setEditDocument(null);
            }}
          />
        ) : null}

        {state.finishChallenge ? (
          <ChallengeConfigFormCard
            title="Finish Creation"
            subtitle={`Set dates to activate ${state.finishChallenge.name}.`}
            form={state.finishForm}
            document={null}
            submitLabel="Activate Challenge"
            showNameFields={false}
            isSaving={actions.updateMutation.isPending}
            onChange={(patch) => state.setFinishForm((current) => ({ ...current, ...patch }))}
            onSubmit={state.handleFinish}
            onCancel={() => state.setFinishChallenge(null)}
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
                        state.setSelectedPreset(preset);
                        state.setActivateForm({
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
                          state.selectedPreset?.presetId === preset.presetId
                            ? mflColors.brand
                            : mflColors.border,
                        backgroundColor:
                          state.selectedPreset?.presetId === preset.presetId
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

        {state.reviewChallenge ? (
          <ChallengeReviewPanel
            challenge={state.reviewChallenge}
            submissions={state.activeReviewSubmissions}
            teams={teams}
            subTeams={state.reviewSubTeams.data ?? []}
            selectedTeamId={state.selectedTeamId}
            selectedSubTeamId={state.selectedSubTeamId}
            awardedPoints={state.awardedPoints}
            teamScore={state.teamScore}
            isLoading={state.reviewSubmissions.isLoading || teamsQuery.isLoading || state.reviewSubTeams.isLoading}
            validatingId={state.validatingId}
            isAssigningScore={state.actions.teamScoreMutation.isPending}
            onTeamChange={state.setSelectedTeamId}
            onSubTeamChange={state.setSelectedSubTeamId}
            onAwardedPointsChange={(submissionId, value) =>
              state.setAwardedPoints((current) => ({ ...current, [submissionId]: value }))
            }
            onTeamScoreChange={state.setTeamScore}
            onAssignTeamScore={() =>
              state.handleAssignTeamScore(
                state.reviewChallenge!.challengeId,
                () => {},
              )
            }
            onValidate={(submission, status) =>
              state.handleValidate(
                submission,
                status,
                state.reviewChallenge!.challengeType,
                () => state.reviewSubmissions.refetch(),
              )
            }
            onClose={() => state.setReviewChallenge(null)}
          />
        ) : null}

        {state.subTeamChallenge ? (
          <ChallengeSubTeamManager
            leagueId={leagueId}
            challenge={state.subTeamChallenge}
            teams={teams}
            onClose={() => state.setSubTeamChallenge(null)}
          />
        ) : null}

        {state.tournamentChallenge ? (
          <ChallengeTournamentPanel
            leagueId={leagueId}
            challenge={state.tournamentChallenge}
            teams={teams}
            defaultTab={state.tournamentTab}
            onClose={() => state.setTournamentChallenge(null)}
            onPublish={state.handlePublish}
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
                isPublishing={state.publishingId === challenge.challengeId}
                onFinish={state.startFinish}
                onReview={state.openReview}
                onPublish={state.handlePublish}
                onManageSubTeams={state.openSubTeamManager}
                onManageTournament={(challenge) => state.openTournamentPanel(challenge, 'fixtures')}
                onFinalizeTournament={(challenge) => state.openTournamentPanel(challenge, 'scores')}
                onEdit={state.startEdit}
                onDelete={state.handleDelete}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
