import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../../components/app-text';
import { ScreenScrollView } from '../../../../components/screen-scroll-view';
import { ScreenState } from '../../../../components/screen-state';
import { mflColors } from '../../../../constants/colors';
import { useHostLeagueSettingsForm } from '../../hooks/use-host-league-settings-form';
import { SettingsGroupCard } from './settings-group-card';
import { SETTINGS_GROUPS } from './settings-groups';

export function SettingsMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    leagueId,
    hasHostRole,
    detailQuery,
    form,
    phase,
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

  const getHint = (slug: string): string | undefined => {
    switch (slug) {
      case 'general':
        return form.leagueName || undefined;
      case 'teams':
        return `${form.numTeams} teams, ${form.maxTeamCapacity} cap`;
      case 'scoring':
        return `${form.rrFormula} formula`;
      case 'lifecycle':
        return phase.replace(/_/g, ' ');
      default:
        return undefined;
    }
  };

  return (
    <ScreenScrollView
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
    >
      {/* Header */}
      <View className="mb-5">
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

      {/* Group cards */}
      <View style={{ gap: 10 }}>
        {SETTINGS_GROUPS.map((group) => (
          <SettingsGroupCard
            key={group.slug}
            group={group}
            hint={getHint(group.slug)}
            onPress={() =>
              router.push(`/(app)/league-settings/${group.slug}` as any)
            }
          />
        ))}
      </View>
    </ScreenScrollView>
  );
}
