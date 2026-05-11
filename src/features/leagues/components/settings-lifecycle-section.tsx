import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Chip, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useLeaguePhase, useTransitionPhase } from '../hooks/use-league-phase';
import {
  PHASE_LABELS,
  ALLOWED_PHASE_TRANSITIONS,
  PHASE_ACTION_LABELS,
  type LeaguePhase,
} from '../types/league-phase.model';

interface Props {
  leagueId: string;
}

export function SettingsLifecycleSection({ leagueId }: Props) {
  const phaseQuery = useLeaguePhase(leagueId);
  const transitionMutation = useTransitionPhase(leagueId);
  const [transitioningTo, setTransitioningTo] = useState<LeaguePhase | null>(null);

  if (phaseQuery.isLoading) {
    return (
      <View className="gap-3">
        <SectionLabel label="LEAGUE LIFECYCLE" />
        <Card className="p-4 items-center">
          <Spinner size="sm" />
          <AppText className="text-sm text-muted mt-2">Loading lifecycle dashboard...</AppText>
        </Card>
      </View>
    );
  }

  if (phaseQuery.isError || !phaseQuery.data) {
    return (
      <View className="gap-3">
        <SectionLabel label="LEAGUE LIFECYCLE" />
        <Card className="p-4" style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: mflColors.border }}>
          <AppText className="text-sm text-muted">
            Lifecycle details are unavailable right now.
          </AppText>
        </Card>
      </View>
    );
  }

  const info = phaseQuery.data;
  const checklist = info.checklist ?? [];
  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const nextPhases = ALLOWED_PHASE_TRANSITIONS[info.phase] ?? [];

  const handleTransition = (nextPhase: LeaguePhase) => {
    const label = PHASE_ACTION_LABELS[nextPhase];
    Alert.alert('Confirm Phase Transition', `Are you sure you want to: ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          setTransitioningTo(nextPhase);
          transitionMutation.mutate(nextPhase, {
            onSuccess: () => {
              Alert.alert('Phase Updated', `Phase updated to ${PHASE_LABELS[nextPhase]}`);
              setTransitioningTo(null);
            },
            onError: (e: any) => {
              Alert.alert('Transition Failed', e?.response?.data?.error || e?.message || 'Failed.');
              setTransitioningTo(null);
            },
          });
        },
      },
    ]);
  };

  return (
    <View className="gap-3">
      <SectionLabel label="LEAGUE LIFECYCLE" />
      <Card className="p-4 gap-4" style={{ borderWidth: 1, borderColor: mflColors.brandLight }}>
        {/* Phase badge + days remaining */}
        <View className="flex-row items-center justify-between">
          <AppText className="text-base font-bold text-foreground">League Lifecycle</AppText>
          <Chip
            size="sm"
            variant="soft"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <Chip.Label style={{ color: mflColors.brand, textTransform: 'capitalize' }}>
              {PHASE_LABELS[info.phase] ?? info.phase}
            </Chip.Label>
          </Chip>
        </View>

        {/* Config summary */}
        <View className="flex-row flex-wrap gap-x-3 gap-y-1">
          <AppText className="text-xs text-muted">
            {info.days_remaining === null ? 'No countdown' : `${info.days_remaining} days remaining`}
          </AppText>
          <AppText className="text-xs text-muted">
            {info.config.enrolment_period_days}d enrolment
          </AppText>
          <AppText className="text-xs text-muted">
            {info.config.trial_period_days}d trial
          </AppText>
          <AppText className="text-xs text-muted">
            {info.config.challenge_frequency_days}d challenge cadence
          </AppText>
        </View>

        {/* Progress bar */}
        <View>
          <View className="flex-row items-center justify-between mb-1">
            <AppText className="text-xs text-muted">Setup Progress</AppText>
            <AppText className="text-xs font-medium" style={{ color: mflColors.brand }}>
              {progressPercent}%
            </AppText>
          </View>
          <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: mflColors.inkLight }}>
            <View
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: mflColors.brand }}
            />
          </View>
        </View>

        {/* Checklist grid */}
        <View className="gap-2">
          {checklist.map((item) => (
            <View
              key={item.id}
              className="flex-row items-start gap-3 rounded-lg p-3"
              style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.border }}
            >
              <Feather
                name={item.completed ? 'check-circle' : 'circle'}
                size={16}
                color={item.completed ? '#16a34a' : mflColors.textMuted}
                style={{ marginTop: 2 }}
              />
              <View className="flex-1">
                <AppText className="text-sm font-medium text-foreground">{item.label}</AppText>
                {item.details && (
                  <AppText className="text-xs text-muted mt-0.5">{item.details}</AppText>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Host-confirmed transitions */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Feather name="arrow-right" size={16} color={mflColors.brand} />
            <AppText className="text-sm font-medium text-foreground">Host-confirmed transitions</AppText>
          </View>
          {nextPhases.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {nextPhases.map((np) => (
                <Button
                  key={np}
                  variant={np === 'post_league_archive' ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => handleTransition(np)}
                  isDisabled={transitioningTo !== null}
                >
                  {transitioningTo === np ? (
                    <Spinner size="sm" />
                  ) : (
                    <Button.Label>{PHASE_ACTION_LABELS[np]}</Button.Label>
                  )}
                </Button>
              ))}
            </View>
          ) : (
            <AppText className="text-sm text-muted">
              No further manual transitions are available.
            </AppText>
          )}
          {info.phase === 'grand_finale' && (
            <AppText className="text-xs text-muted">
              This phase auto-archives after 14 days.
            </AppText>
          )}
        </View>
      </Card>
    </View>
  );
}
