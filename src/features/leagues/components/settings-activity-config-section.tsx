import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useRole } from '../../../contexts/role-context';
import { useConfigurableLeagueActivities } from '../hooks/use-configurable-league-activities';
import type {
  ActivityCategory,
  LeagueActivityConfig,
  RequirementLevel,
} from '../types/activity-config.model';
import {
  getApiErrorMessage
} from '../utils/activity-config';
import { inputStyle } from './settings-form-fields';
import { ActivityConfigCard } from './activity-config-card';
import { SelectableChip } from './selectable-chip';

interface Props {
  leagueId: string;
}

function getCategories(activities: LeagueActivityConfig[]): ActivityCategory[] {
  const byId = new Map<string, ActivityCategory>();
  for (const activity of activities) {
    if (activity.category?.category_id) {
      byId.set(activity.category.category_id, activity.category);
    }
  }
  return [...byId.values()].sort((a, b) =>
    a.display_name.localeCompare(b.display_name),
  );
}

function mergeEnabledConfig(
  allActivities: LeagueActivityConfig[],
  enabledActivities: LeagueActivityConfig[],
) {
  const enabledMap = new Map(
    enabledActivities.map((activity) => [activity.activity_id, activity]),
  );
  return allActivities.map((activity) => ({
    ...activity,
    ...(enabledMap.get(activity.activity_id) ?? {}),
  }));
}

export function SettingsActivityConfigSection({ leagueId }: Props) {
  const { isHost, isGovernor, availableRoles } = useRole();
  const canConfigure = isHost || availableRoles.includes('host');
  const isAdmin = canConfigure || isGovernor;
  const activitiesQuery = useConfigurableLeagueActivities(leagueId, isAdmin);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [busyActivityId, setBusyActivityId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const enabledActivities = activitiesQuery.data?.activities ?? [];
  const allActivities = useMemo(() => {
    const source =
      activitiesQuery.data?.allActivities && activitiesQuery.data.allActivities.length > 0
        ? activitiesQuery.data.allActivities
        : enabledActivities;
    return mergeEnabledConfig(source, enabledActivities);
  }, [activitiesQuery.data?.allActivities, enabledActivities]);

  const categories = useMemo(() => getCategories(allActivities), [allActivities]);
  const enabledIds = useMemo(
    () => new Set(enabledActivities.map((activity) => activity.activity_id)),
    [enabledActivities],
  );

  const filteredActivities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return allActivities
      .filter((activity) => {
        const categoryMatch =
          selectedCategory === 'all' ||
          activity.category?.category_id === selectedCategory;
        const searchMatch =
          !search ||
          activity.activity_name.toLowerCase().includes(search) ||
          (activity.description ?? '').toLowerCase().includes(search);
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        const aEnabled = enabledIds.has(a.activity_id) ? 1 : 0;
        const bEnabled = enabledIds.has(b.activity_id) ? 1 : 0;
        if (aEnabled !== bEnabled) return bEnabled - aEnabled;
        return a.activity_name.localeCompare(b.activity_name);
      });
  }, [allActivities, enabledIds, searchTerm, selectedCategory]);

  const handleAdd = (activity: LeagueActivityConfig) => {
    setBusyActivityId(activity.activity_id);
    setSuccessMsg('');
    activitiesQuery.addMutation.mutate(
      {
        leagueId,
        activityId: activity.activity_id,
        isCustom: !!activity.is_custom,
      },
      {
        onSuccess: () => setSuccessMsg('Activity enabled.'),
        onError: (error) =>
          Alert.alert(
            'Enable Failed',
            getApiErrorMessage(error, 'Failed to enable activity.'),
          ),
        onSettled: () => setBusyActivityId(null),
      },
    );
  };

  const handleRemove = (activity: LeagueActivityConfig) => {
    Alert.alert(
      'Remove Activity',
      `Players will no longer be able to submit "${activity.activity_name}". Existing submissions will not be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setBusyActivityId(activity.activity_id);
            setSuccessMsg('');
            activitiesQuery.removeMutation.mutate(
              {
                leagueId,
                activityId: activity.activity_id,
                isCustom: !!activity.is_custom,
              },
              {
                onSuccess: () => setSuccessMsg('Activity removed.'),
                onError: (error) =>
                  Alert.alert(
                    'Remove Failed',
                    getApiErrorMessage(error, 'Failed to remove activity.'),
                  ),
                onSettled: () => setBusyActivityId(null),
              },
            );
          },
        },
      ],
    );
  };

  const handleRequirementChange = (
    activity: LeagueActivityConfig,
    field: 'proof_requirement' | 'notes_requirement',
    value: RequirementLevel,
  ) => {
    setBusyActivityId(activity.activity_id);
    setSuccessMsg('');
    activitiesQuery.updateConfigMutation.mutate(
      {
        leagueId,
        input: {
          activity_id: activity.activity_id,
          [field]: value,
        },
      },
      {
        onSuccess: () => setSuccessMsg('Activity submission settings updated.'),
        onError: (error) =>
          Alert.alert(
            'Update Failed',
            getApiErrorMessage(error, 'Failed to update activity settings.'),
          ),
        onSettled: () => setBusyActivityId(null),
      },
    );
  };

  return (
    <View className="gap-3">
      <SectionLabel label="CONFIGURE ACTIVITIES" />
      <Card className="p-4 gap-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <AppText className="text-base font-bold text-foreground">
              League Activities
            </AppText>
            <AppText className="text-xs text-muted mt-0.5">
              {enabledActivities.length} active
            </AppText>
          </View>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => activitiesQuery.refetch()}
            isDisabled={activitiesQuery.isFetching}
          >
            {activitiesQuery.isFetching ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Refresh</Button.Label>
            )}
          </Button>
        </View>

        {successMsg ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <AppText
              className="text-sm font-medium"
              style={{ color: mflColors.brand }}
            >
              {successMsg}
            </AppText>
          </View>
        ) : null}

        <TextInput
          style={inputStyle}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search activities"
          placeholderTextColor={mflColors.textMuted}
          autoCapitalize="none"
        />

        {categories.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            <SelectableChip
              label="All"
              selected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
            />
            {categories.map((category) => (
              <SelectableChip
                key={category.category_id}
                label={category.display_name}
                selected={selectedCategory === category.category_id}
                onPress={() => setSelectedCategory(category.category_id)}
              />
            ))}
          </View>
        ) : null}

        {activitiesQuery.isLoading ? (
          <View className="items-center py-6">
            <Spinner size="sm" />
            <AppText className="text-sm text-muted mt-2">
              Loading activities...
            </AppText>
          </View>
        ) : null}

        {activitiesQuery.isError ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.dangerLight }}
          >
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {getApiErrorMessage(
                activitiesQuery.error,
                'Failed to load activities.',
              )}
            </AppText>
          </View>
        ) : null}

        {!activitiesQuery.isLoading &&
        !activitiesQuery.isError &&
        allActivities.length === 0 ? (
          <View
            className="items-center rounded-lg border p-5"
            style={{ borderColor: mflColors.border }}
          >
            <Feather name="activity" size={24} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted mt-2 text-center">
              No activities are available yet.
            </AppText>
          </View>
        ) : null}

        {!activitiesQuery.isLoading &&
        !activitiesQuery.isError &&
        allActivities.length > 0 &&
        filteredActivities.length === 0 ? (
          <View
            className="items-center rounded-lg border p-5"
            style={{ borderColor: mflColors.border }}
          >
            <AppText className="text-sm text-muted text-center">
              No activities match this filter.
            </AppText>
          </View>
        ) : null}

        <View className="gap-3">
          {filteredActivities.map((activity) => {
            const isEnabled = enabledIds.has(activity.activity_id);
            const isBusy = busyActivityId === activity.activity_id;
            return (
              <ActivityConfigCard
                key={activity.activity_id}
                activity={activity}
                isEnabled={isEnabled}
                isBusy={isBusy}
                canConfigure={canConfigure}
                onAdd={() => handleAdd(activity)}
                onRemove={() => handleRemove(activity)}
                onChangeRequirement={(field, value) =>
                  handleRequirementChange(activity, field, value)
                }
              />
            );
          })}
        </View>
      </Card>
    </View>
  );
}
