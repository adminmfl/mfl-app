import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { AppRoutes } from '../../../core/config/routes';
import type { ApiError } from '../../../core/types/api-error';
import { useDeleteLeague } from './use-delete-league';
import { useLaunchLeague } from './use-launch-league';
import { useLeagueDetail } from './use-league-detail';
import { useUpdateLeague } from './use-update-league';
import type { UpdateLeagueInput } from '../types/league-management.model';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiError;
    return apiError.response?.data?.error ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export interface SettingsFormState {
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
  minSubmissionsPerDay: number;
  maxSubmissionsPerDay: number;
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
  minSubmissionsPerDay: 1,
  maxSubmissionsPerDay: 1,
};

export function useHostLeagueSettingsForm() {
  const router = useRouter();
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
      minSubmissionsPerDay: detail.minSubmissionsPerDay ?? 1,
      maxSubmissionsPerDay: detail.maxSubmissionsPerDay ?? 1,
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

    if (form.maxSubmissionsPerDay < form.minSubmissionsPerDay) {
      Alert.alert(
        'Validation Error',
        'Max submissions per day must be greater than or equal to min.',
      );
      return;
    }

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
      minSubmissionsPerDay: form.minSubmissionsPerDay,
      maxSubmissionsPerDay: form.maxSubmissionsPerDay,
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
              onError: (error: unknown) => {
                Alert.alert(
                  'Launch Failed',
                  getApiErrorMessage(error, 'Failed to launch league.'),
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
              onSuccess: () => router.replace(AppRoutes.dashboard),
              onError: (error: unknown) => {
                Alert.alert(
                  'Delete Failed',
                  getApiErrorMessage(error, 'Failed to delete league.'),
                );
              },
            });
          },
        },
      ],
    );
  };

  return {
    leagueId,
    form,
    updateForm,
    hasHostRole,
    detailQuery,
    updateMutation,
    launchMutation,
    deleteMutation,
    successMsg,
    setSuccessMsg,
    phase,
    canEditStructure,
    canEditStartDate,
    canEditEndDate,
    handleSave,
    handleLaunch,
    handleDelete,
  };
}
