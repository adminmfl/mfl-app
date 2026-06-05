import Feather from '@expo/vector-icons/Feather';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Spinner } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { useDeleteLeague } from '../hooks/use-delete-league';
import { useLaunchLeague } from '../hooks/use-launch-league';
import { useLeagueDetail } from '../hooks/use-league-detail';
import { useUpdateLeague } from '../hooks/use-update-league';
import type { UpdateLeagueInput } from '../types/league-management.model';
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

interface SettingsFormState {
  leagueName: string;
  description: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  isExclusive: boolean;
  numTeams: number;
  restDays: number;
  maxTeamCapacity: number;
  autoRestDayEnabled: boolean;
  normalizePoints: boolean;
  rrFormula: string;
  leagueMode: string;
  playerTeamWorkoutVisibility: boolean;
  playerLeagueWorkoutVisibility: boolean;
  crossTeamVisibility: boolean;
  aiDailyLimit: number;
  tieredRankEnabled: boolean;
  tieredTop: string;
  tieredMiddle: string;
  tieredBottom: string;
  brandDisplayName: string;
  brandTagline: string;
  brandColor: string;
  brandPoweredBy: boolean;
  logoUrl: string | null;
}

const DEFAULT_FORM: SettingsFormState = {
  leagueName: '',
  description: '',
  startDate: '',
  endDate: '',
  isPublic: false,
  isExclusive: true,
  numTeams: 4,
  restDays: 1,
  maxTeamCapacity: 10,
  autoRestDayEnabled: true,
  normalizePoints: true,
  rrFormula: 'standard',
  leagueMode: 'standard',
  playerTeamWorkoutVisibility: false,
  playerLeagueWorkoutVisibility: false,
  crossTeamVisibility: false,
  aiDailyLimit: 20,
  tieredRankEnabled: false,
  tieredTop: '20',
  tieredMiddle: '50',
  tieredBottom: '30',
  brandDisplayName: '',
  brandTagline: '',
  brandColor: '',
  brandPoweredBy: true,
  logoUrl: null,
};

export function HostLeagueSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, availableRoles } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';

  const detailQuery = useLeagueDetail(leagueId);
  const updateMutation = useUpdateLeague();
  const launchMutation = useLaunchLeague();
  const deleteMutation = useDeleteLeague();

  const [form, setForm] = useState<SettingsFormState>(DEFAULT_FORM);
  const [successMsg, setSuccessMsg] = useState('');

  const hasHostRole = isHost || availableRoles.includes('host');

  useEffect(() => {
    if (!detailQuery.data) return;
    const detail = detailQuery.data;
    const branding = detail.branding ?? {};

    setForm({
      leagueName: detail.name || '',
      description: detail.description ?? '',
      startDate: detail.startDate || '',
      endDate: detail.endDate || '',
      isPublic: !!detail.isPublic,
      isExclusive: !!detail.isExclusive,
      numTeams: detail.numTeams || 4,
      restDays: detail.restDays ?? 1,
      maxTeamCapacity: detail.maxTeamCapacity ?? 10,
      autoRestDayEnabled: !!detail.autoRestDayEnabled,
      normalizePoints: !!detail.normalizePointsByTeamSize,
      rrFormula: detail.rrConfig?.formula || 'standard',
      leagueMode: detail.leagueMode || 'standard',
      playerTeamWorkoutVisibility: !!detail.playerTeamWorkoutVisibility,
      playerLeagueWorkoutVisibility: !!detail.playerLeagueWorkoutVisibility,
      crossTeamVisibility: !!detail.crossTeamVisibility,
      aiDailyLimit: detail.aiDailyQuestionLimit ?? 20,
      tieredRankEnabled: !!detail.tieredRankEnabled,
      tieredTop: String(detail.tieredRankConfig?.topPercent ?? 20),
      tieredMiddle: String(detail.tieredRankConfig?.middlePercent ?? 50),
      tieredBottom: String(detail.tieredRankConfig?.bottomPercent ?? 30),
      brandDisplayName: String(branding.display_name ?? ''),
      brandTagline: String(branding.tagline ?? ''),
      brandColor: String(branding.primary_color ?? ''),
      brandPoweredBy: branding.powered_by_visible !== false,
      logoUrl: detail.logoUrl ?? null,
    });
  }, [detailQuery.data]);

  const phase = detailQuery.data?.phase ?? 'mobilisation';
  const canEditStructure = phase === 'mobilisation';
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const canEditStartDate =
    canEditStructure || !form.startDate || form.startDate >= today;
  const canEditEndDate =
    canEditStructure || !form.endDate || form.endDate >= today;

  const updateForm = <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSuccessMsg('');

    if (form.tieredRankEnabled) {
      const top = Number(form.tieredTop) || 0;
      const middle = Number(form.tieredMiddle) || 0;
      const bottom = Number(form.tieredBottom) || 0;
      if (top + middle + bottom !== 100) {
        Alert.alert(
          'Validation Error',
          'Tiered rank percentages must sum up to exactly 100%.',
        );
        return;
      }
    }

    const input: UpdateLeagueInput = {
      leagueName: form.leagueName,
      restDays: Number(form.restDays),
      autoRestDayEnabled: form.autoRestDayEnabled,
      description: form.description,
      normalizePointsByTeamSize: form.normalizePoints,
      maxTeamCapacity: Number(form.maxTeamCapacity),
      rrFormula: form.rrFormula,
      leagueMode: form.leagueMode,
      playerTeamWorkoutVisibility: form.playerTeamWorkoutVisibility,
      playerLeagueWorkoutVisibility: form.playerLeagueWorkoutVisibility,
      crossTeamVisibility: form.crossTeamVisibility,
      aiDailyQuestionLimit: Number(form.aiDailyLimit),
      tieredRankEnabled: form.tieredRankEnabled,
      tieredRankConfig: {
        topPercent: Number(form.tieredTop),
        middlePercent: Number(form.tieredMiddle),
        bottomPercent: Number(form.tieredBottom),
      },
      branding:
        form.brandDisplayName || form.brandTagline || form.brandColor
          ? {
              displayName: form.brandDisplayName || undefined,
              tagline: form.brandTagline || undefined,
              primaryColor: form.brandColor || undefined,
              poweredByVisible: form.brandPoweredBy,
            }
          : null,
    };

    if (canEditStartDate) input.startDate = form.startDate;
    if (canEditEndDate) input.endDate = form.endDate;

    if (canEditStructure) {
      input.isPublic = form.isPublic;
      input.isExclusive = form.isExclusive;
      input.numTeams = Number(form.numTeams);
    }

    updateMutation.mutate(
      { leagueId, input },
      {
        onSuccess: () => {
          setSuccessMsg('League settings updated.');
          void detailQuery.refetch();
        },
      },
    );
  };

  const handleLaunch = () => {
    Alert.alert(
      'Launch League',
      'Are you sure? Members will be able to start participating.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Launch',
          onPress: () => {
            launchMutation.mutate(leagueId, {
              onSuccess: () => {
                void detailQuery.refetch();
                Alert.alert('League Launched', 'Your league is now live.');
              },
              onError: (error: any) => {
                Alert.alert(
                  'Launch Failed',
                  error?.response?.data?.error ||
                    error?.message ||
                    'Failed to launch league.',
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete League',
      'This action cannot be undone. This will permanently delete the league and remove associated data including teams, members, and submissions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete League',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(leagueId, {
              onSuccess: () => router.replace('/(app)/(tabs)/dashboard' as any),
              onError: (error: any) => {
                Alert.alert(
                  'Delete Failed',
                  error?.response?.data?.error ||
                    error?.message ||
                    'Failed to delete league.',
                );
              },
            });
          },
        },
      ],
    );
  };

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
