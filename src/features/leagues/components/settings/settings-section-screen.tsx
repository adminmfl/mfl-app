import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../../components/app-text';
import { ScreenScrollView } from '../../../../components/screen-scroll-view';
import { ScreenState } from '../../../../components/screen-state';
import { mflColors } from '../../../../constants/colors';
import { useHostLeagueSettingsForm } from '../../hooks/use-host-league-settings-form';
import { SettingsSubmissionLimitsSection } from '../settings-submission-limits-section';
import { SettingsActivityConfigSection } from '../settings-activity-config-section';
import { SettingsAIKeySection } from '../settings-ai-key-section';
import { SettingsBrandingSection } from '../settings-branding-section';
import { SettingsCustomActivitiesSection } from '../settings-custom-activities-section';
import { SettingsGeneralSection } from '../settings-general-section';
import { SettingsLifecycleSection } from '../settings-lifecycle-section';
import { SettingsLogoSection } from '../settings-logo-section';
import { SettingsScoringSection } from '../settings-scoring-section';
import { SettingsStatusSection } from '../settings-status-section';
import { SettingsTeamSection } from '../settings-team-section';
import { SettingsVisibilitySection } from '../settings-visibility-section';
import { SETTINGS_GROUPS } from './settings-groups';

const SAVE_GROUPS = new Set([
  'general',
  'teams',
  'visibility',
  'scoring',
  'activities',
  'branding',
]);

export function SettingsSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
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

  const group = SETTINGS_GROUPS.find((g) => g.slug === section);

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

  if (!group) {
    return (
      <ScreenState
        screen="settings"
        state="error"
        message={`Unknown settings section: ${section}`}
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  const isDraft = detailQuery.data?.status === 'draft';
  const showSave = SAVE_GROUPS.has(section!);

  const renderSection = () => {
    switch (section) {
      case 'general':
        return (
          <SettingsGeneralSection
            leagueName={form.leagueName}
            description={form.description}
            startDate={form.startDate}
            endDate={form.endDate}
            onChangeLeagueName={(v) => updateForm('leagueName', v)}
            onChangeDescription={(v) => updateForm('description', v)}
            onChangeStartDate={(v) => updateForm('startDate', v)}
            onChangeEndDate={(v) => updateForm('endDate', v)}
            canEditStartDate={canEditStartDate}
            canEditEndDate={canEditEndDate}
          />
        );
      case 'teams':
        return (
          <SettingsTeamSection
            numTeams={form.numTeams}
            restDays={form.restDays}
            maxTeamCapacity={form.maxTeamCapacity}
            autoRestDayEnabled={form.autoRestDayEnabled}
            onChangeNumTeams={(v) => updateForm('numTeams', v)}
            onChangeRestDays={(v) => updateForm('restDays', v)}
            onChangeMaxTeamCapacity={(v) => updateForm('maxTeamCapacity', v)}
            onToggleAutoRestDay={() =>
              updateForm('autoRestDayEnabled', !form.autoRestDayEnabled)
            }
            canEditStructure={canEditStructure}
          />
        );
      case 'visibility':
        return (
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
        );
      case 'scoring':
        return (
          <SettingsScoringSection
            rrFormula={form.rrFormula}
            leagueMode={form.leagueMode}
            normalizePointsByTeamSize={form.normalizePoints}
            tieredRankEnabled={form.tieredRankEnabled}
            tieredRankTop={form.tieredTop}
            tieredRankMiddle={form.tieredMiddle}
            tieredRankBottom={form.tieredBottom}
            aiDailyQuestionLimit={form.aiDailyLimit}
            onChangeRrFormula={(v) => updateForm('rrFormula', v)}
            onChangeLeagueMode={(v) => updateForm('leagueMode', v)}
            onToggleNormalize={() =>
              updateForm('normalizePoints', !form.normalizePoints)
            }
            onToggleTieredRank={() =>
              updateForm('tieredRankEnabled', !form.tieredRankEnabled)
            }
            onChangeTieredTop={(v) => updateForm('tieredTop', v)}
            onChangeTieredMiddle={(v) => updateForm('tieredMiddle', v)}
            onChangeTieredBottom={(v) => updateForm('tieredBottom', v)}
            onChangeAiLimit={(v) => updateForm('aiDailyLimit', v)}
          />
        );
      case 'activities':
        return (
          <>
            <SettingsSubmissionLimitsSection
              minSubmissionsPerDay={form.minSubmissionsPerDay}
              maxSubmissionsPerDay={form.maxSubmissionsPerDay}
              onChangeMin={(v) => updateForm('minSubmissionsPerDay', v)}
              onChangeMax={(v) => updateForm('maxSubmissionsPerDay', v)}
            />
            <SettingsActivityConfigSection leagueId={leagueId} />
          </> 
        );
      case 'custom-activities':
        return <SettingsCustomActivitiesSection leagueId={leagueId} />;
      case 'branding':
        return (
          <>
            <SettingsBrandingSection
              displayName={form.brandDisplayName}
              tagline={form.brandTagline}
              primaryColor={form.brandColor}
              poweredByVisible={form.brandPoweredBy}
              onChangeDisplayName={(v) => updateForm('brandDisplayName', v)}
              onChangeTagline={(v) => updateForm('brandTagline', v)}
              onChangePrimaryColor={(v) => updateForm('brandColor', v)}
              onTogglePoweredBy={() =>
                updateForm('brandPoweredBy', !form.brandPoweredBy)
              }
            />
            <SettingsLogoSection
              leagueId={leagueId}
              logoUrl={form.logoUrl}
              onLogoChange={(v) => updateForm('logoUrl', v)}
            />
          </>
        );
      case 'ai':
        return <SettingsAIKeySection leagueId={leagueId} />;
      case 'lifecycle':
        return (
          <>
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
    >
      {/* Header */}
      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-row items-center gap-2">
          <Feather name={group.icon} size={20} color={mflColors.brand} />
          <AppText className="text-xl font-bold text-foreground">
            {group.title}
          </AppText>
        </View>
      </View>

      {/* Feedback messages */}
      <View className="gap-5">
        {updateMutation.isError && (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.dangerLight }}
          >
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {(updateMutation.error as any)?.response?.data?.error ||
                updateMutation.error?.message ||
                'Failed to save changes.'}
            </AppText>
          </View>
        )}

        {successMsg ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <View className="flex-row items-center gap-2">
              <Feather
                name="check-circle"
                size={18}
                color={mflColors.brand}
              />
              <AppText
                className="text-sm font-medium"
                style={{ color: mflColors.brand }}
              >
                {successMsg}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* Section content */}
        {renderSection()}

        {/* Save button for groups that share the main form */}
        {showSave && (
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
        )}
      </View>
    </ScreenScrollView>
  );
}
