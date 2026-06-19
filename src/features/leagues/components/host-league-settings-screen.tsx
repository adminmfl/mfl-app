import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Spinner } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useHostLeagueSettingsForm } from '../hooks/use-host-league-settings-form';
import { SettingsActivityConfigSection } from './settings-activity-config-section';
import { SettingsAIKeySection } from './settings-ai-key-section';
import { SettingsBrandingSection } from './settings-branding-section';
import { SettingsCustomActivitiesSection } from './settings-custom-activities-section';
import { SettingsGeneralSection } from './settings-general-section';
import { SettingsLifecycleSection } from './settings-lifecycle-section';
import { SettingsLogoSection } from './settings-logo-section';
import { SettingsScoringSection } from './settings-scoring-section';
import { SettingsStatusSection } from './settings-status-section';
import { SettingsTeamSection } from './settings-team-section';
import { SettingsVisibilitySection } from './settings-visibility-section';

export function HostLeagueSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    leagueId,
    form,
    updateForm,
    hasHostRole,
    detailQuery,
    updateMutation,
    launchMutation,
    deleteMutation,
    successMsg,
    phase,
    canEditStructure,
    canEditStartDate,
    canEditEndDate,
    handleSave,
    handleLaunch,
    handleDelete,
  } = useHostLeagueSettingsForm();

  if (!leagueId) {
    return (
      <ScreenState
        screen="settings"
        state="empty"
        message="No active league selected."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!hasHostRole) {
    return (
      <ScreenState
        screen="settings"
        state="error"
        message="Only the league host can access settings."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (detailQuery.isLoading) {
    return <ScreenState screen="settings" state="loading" />;
  }

  if (detailQuery.isError) {
    return (
      <ScreenState
        screen="settings"
        state="error"
        message="Unable to load league settings."
        actionLabel="Retry"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  const isDraft = detailQuery.data?.status === 'draft';

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-row flex-wrap items-center gap-2">
          <Feather name="settings" size={20} color={mflColors.brand} />
          <AppText className="text-xl font-bold text-foreground">
            League Settings
          </AppText>
          <View
            className="rounded-md px-2 py-0.5"
            style={{
              backgroundColor:
                phase === 'league_active'
                  ? mflColors.brandLight
                  : mflColors.inkLight,
            }}
          >
            <AppText
              className="text-xs font-medium"
              style={{
                color:
                  phase === 'league_active'
                    ? mflColors.brand
                    : mflColors.textMuted,
                textTransform: 'capitalize',
              }}
            >
              {phase.replace(/_/g, ' ')}
            </AppText>
          </View>
        </View>
        <View className="mt-1 flex-row items-center gap-1">
          <Feather name="calendar" size={12} color={mflColors.textMuted} />
          <AppText className="text-xs text-muted">
            {form.startDate
              ? form.startDate.split('-').reverse().join('-')
              : '-'}{' '}
            to{' '}
            {form.endDate ? form.endDate.split('-').reverse().join('-') : '-'}
          </AppText>
        </View>
        <AppText className="mt-1 text-sm text-muted">
          Configure your league settings and preferences
        </AppText>
      </View>

      <View className="gap-5">
        {updateMutation.isError && (
          <View className="rounded-lg p-3" style={{ backgroundColor: mflColors.dangerLight }}>
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : 'Failed to save changes.'}
            </AppText>
          </View>
        )}

        {successMsg ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={18} color={mflColors.brand} />
              <AppText
                className="text-sm font-medium"
                style={{ color: mflColors.brand }}
              >
                {successMsg}
              </AppText>
            </View>
          </View>
        ) : null}

        <SettingsLifecycleSection leagueId={leagueId} />

        <SettingsStatusSection
          status={detailQuery.data?.status ?? 'unknown'}
          phase={phase}
          inviteCode={detailQuery.data?.inviteCode ?? null}
          leagueId={leagueId}
          isDraft={isDraft}
          isLaunching={launchMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onLaunch={handleLaunch}
          onDelete={handleDelete}
        />

        <SettingsActivityConfigSection leagueId={leagueId} />
        <SettingsCustomActivitiesSection leagueId={leagueId} />

        <SettingsGeneralSection
          leagueName={form.leagueName}
          description={form.description}
          startDate={form.startDate}
          endDate={form.endDate}
          onChangeLeagueName={(value) => updateForm('leagueName', value)}
          onChangeDescription={(value) => updateForm('description', value)}
          onChangeStartDate={(value) => updateForm('startDate', value)}
          onChangeEndDate={(value) => updateForm('endDate', value)}
          canEditStartDate={canEditStartDate}
          canEditEndDate={canEditEndDate}
        />

        <SettingsTeamSection
          numTeams={form.numTeams}
          restDays={form.restDays}
          maxTeamCapacity={form.maxTeamCapacity}
          autoRestDayEnabled={form.autoRestDayEnabled}
          onChangeNumTeams={(value) => updateForm('numTeams', value)}
          onChangeRestDays={(value) => updateForm('restDays', value)}
          onChangeMaxTeamCapacity={(value) =>
            updateForm('maxTeamCapacity', value)
          }
          onToggleAutoRestDay={() =>
            updateForm('autoRestDayEnabled', !form.autoRestDayEnabled)
          }
          canEditStructure={canEditStructure}
        />

        <SettingsVisibilitySection
          isExclusive={form.isExclusive}
          playerTeamWorkoutVisibility={form.playerTeamWorkoutVisibility}
          playerLeagueWorkoutVisibility={form.playerLeagueWorkoutVisibility}
          crossTeamVisibility={form.crossTeamVisibility}
          onTogglePublic={() => updateForm('isPublic', !form.isPublic)}
          onToggleExclusive={() =>
            updateForm('isExclusive', !form.isExclusive)
          }
          onToggleTeamWorkout={() =>
            updateForm(
              'playerTeamWorkoutVisibility',
              !form.playerTeamWorkoutVisibility,
            )
          }
          onToggleLeagueWorkout={() =>
            updateForm(
              'playerLeagueWorkoutVisibility',
              !form.playerLeagueWorkoutVisibility,
            )
          }
          onToggleCrossTeam={() =>
            updateForm('crossTeamVisibility', !form.crossTeamVisibility)
          }
          canEditStructure={canEditStructure}
        />

        <SettingsScoringSection
          rrFormula={form.rrFormula}
          leagueMode={form.leagueMode}
          normalizePointsByTeamSize={form.normalizePoints}
          tieredRankEnabled={form.tieredRankEnabled}
          tieredRankTop={form.tieredTop}
          tieredRankMiddle={form.tieredMiddle}
          tieredRankBottom={form.tieredBottom}
          aiDailyQuestionLimit={form.aiDailyLimit}
          onChangeRrFormula={(value) => updateForm('rrFormula', value)}
          onChangeLeagueMode={(value) => updateForm('leagueMode', value)}
          onToggleNormalize={() =>
            updateForm('normalizePoints', !form.normalizePoints)
          }
          onToggleTieredRank={() =>
            updateForm('tieredRankEnabled', !form.tieredRankEnabled)
          }
          onChangeTieredTop={(value) => updateForm('tieredTop', value)}
          onChangeTieredMiddle={(value) => updateForm('tieredMiddle', value)}
          onChangeTieredBottom={(value) => updateForm('tieredBottom', value)}
          onChangeAiLimit={(value) => updateForm('aiDailyLimit', value)}
        />

        <SettingsBrandingSection
          displayName={form.brandDisplayName}
          tagline={form.brandTagline}
          primaryColor={form.brandColor}
          poweredByVisible={form.brandPoweredBy}
          onChangeDisplayName={(value) =>
            updateForm('brandDisplayName', value)
          }
          onChangeTagline={(value) => updateForm('brandTagline', value)}
          onChangePrimaryColor={(value) => updateForm('brandColor', value)}
          onTogglePoweredBy={() =>
            updateForm('brandPoweredBy', !form.brandPoweredBy)
          }
        />

        <SettingsLogoSection
          leagueId={leagueId}
          logoUrl={form.logoUrl}
          onLogoChange={(value) => updateForm('logoUrl', value)}
        />

        <SettingsAIKeySection leagueId={leagueId} />

        <Button
          variant="primary"
          size="lg"
          onPress={handleSave}
          isDisabled={updateMutation.isPending || !form.leagueName.trim()}
          className="w-full"
        >
          {updateMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Save Changes</Button.Label>
          )}
        </Button>
      </View>
    </ScreenScrollView>
  );
}
