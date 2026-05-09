import Feather from '@expo/vector-icons/Feather';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { mflColors } from '../../../constants/colors';
import { useQuickStartLeague } from './use-quick-start-league';
import { TemplateStep } from './template-step';
import { ConfigureStep } from './configure-step';
import { ReviewStep } from './review-step';
import {
  addDaysToDate,
  getTeamCount,
  getTomorrowString,
  type QuickStartLeagueType,
  type QuickStartTemplate,
} from './quick-start.types';

const STEP_LABELS = ['Template', 'Configure', 'Review'] as const;

export function QuickStartScreen() {
  const router = useRouter();
  const mutation = useQuickStartLeague();

  // Wizard state
  const [step, setStep] = useState<number | 'success'>(0);

  // Step 1
  const [selectedTemplate, setSelectedTemplate] = useState<QuickStartTemplate | null>(null);

  // Step 2
  const [leagueType, setLeagueType] = useState<QuickStartLeagueType>('corporate');
  const [playerCount, setPlayerCount] = useState(20);
  const [leagueName, setLeagueName] = useState('');
  const [startDate, setStartDate] = useState(getTomorrowString);

  // Derived
  const autoName = useMemo(() => {
    if (!selectedTemplate) return '';
    const typeLabel = leagueType === 'corporate' ? 'Corporate' : 'Residential';
    return `${typeLabel} ${selectedTemplate.duration}-Day League`;
  }, [selectedTemplate, leagueType]);

  const effectiveName = leagueName.trim() || autoName;

  const endDate = useMemo(() => {
    if (!selectedTemplate || startDate.length !== 10) return '';
    return addDaysToDate(startDate, selectedTemplate.duration);
  }, [startDate, selectedTemplate]);

  // Handlers
  const handleSelectTemplate = useCallback((template: QuickStartTemplate) => {
    setSelectedTemplate(template);
    setStep(1);
  }, []);

  const handleBack = useCallback(() => {
    if (typeof step === 'number' && step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  }, [step, router]);

  const handleNext = useCallback(() => {
    if (playerCount < 4 || playerCount > 120) {
      Alert.alert('Invalid', 'Player count must be between 4 and 120.');
      return;
    }
    if (startDate.length !== 10 || startDate < getTomorrowString()) {
      Alert.alert('Invalid', 'Start date must be tomorrow or later (YYYY-MM-DD).');
      return;
    }
    setStep(2);
  }, [playerCount, startDate]);

  const handleCreate = useCallback(async () => {
    if (!selectedTemplate) return;

    const teamCount = getTeamCount(playerCount);

    mutation.mutate(
      {
        template: selectedTemplate.id,
        league_name: effectiveName,
        league_type: leagueType,
        player_count: playerCount,
        num_teams: teamCount,
        start_date: startDate,
        end_date: endDate,
        duration: selectedTemplate.duration,
        rest_days: selectedTemplate.restDays,
        activities: selectedTemplate.activityList,
      },
      {
        onSuccess: () => setStep('success'),
        onError: (err) => Alert.alert('Error', err.message || 'Failed to create league'),
      },
    );
  }, [selectedTemplate, effectiveName, leagueType, playerCount, startDate, endDate, mutation]);

  // ── Success state ──
  if (step === 'success') {
    const data = mutation.data?.data;
    return (
      <ScreenScrollView>
        <View className="py-10 items-center gap-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <Feather name="check" size={40} color={mflColors.brand} />
          </View>
          <View className="items-center gap-2">
            <AppText className="text-2xl font-bold text-foreground">League Created!</AppText>
            <AppText className="text-sm text-muted text-center">
              <AppText className="font-semibold" style={{ color: mflColors.brand }}>
                {data?.league_name ?? effectiveName}
              </AppText>{' '}
              has been created successfully.
            </AppText>
          </View>

          <View className="flex-row gap-4">
            <SuccessStat value={String(data?.teams_created ?? getTeamCount(playerCount))} label="Teams" />
            <SuccessStat value={String(playerCount)} label="Capacity" />
            <SuccessStat value={String(selectedTemplate?.duration ?? 0)} label="Days" />
          </View>

          <View className="w-full gap-3 mt-4">
            <Button
              size="lg"
              style={{ backgroundColor: mflColors.brand }}
              onPress={() => router.replace('/(app)/(tabs)/dashboard')}
              className="w-full"
            >
              <Button.Label>Go to Dashboard</Button.Label>
            </Button>
          </View>
        </View>
      </ScreenScrollView>
    );
  }

  // ── Main form ──
  return (
    <ScreenScrollView avoidKeyboard>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Pressable onPress={handleBack} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={18} color={mflColors.brand} />
          <AppText className="text-lg font-bold text-foreground">Quick Start</AppText>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <AppText className="text-xs text-muted text-center mb-4">
        Create a league in under a minute
      </AppText>

      {/* Step indicator */}
      <StepIndicator currentStep={typeof step === 'number' ? step : 2} />

      <View className="gap-4 mt-2">
        {step === 0 && <TemplateStep onSelect={handleSelectTemplate} />}

        {step === 1 && selectedTemplate && (
          <ConfigureStep
            leagueType={leagueType}
            setLeagueType={setLeagueType}
            playerCount={playerCount}
            setPlayerCount={setPlayerCount}
            leagueName={leagueName}
            setLeagueName={setLeagueName}
            startDate={startDate}
            setStartDate={setStartDate}
            autoName={autoName}
            endDate={endDate}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === 2 && selectedTemplate && (
          <ReviewStep
            template={selectedTemplate}
            leagueType={leagueType}
            playerCount={playerCount}
            effectiveName={effectiveName}
            startDate={startDate}
            endDate={endDate}
            loading={mutation.isPending}
            onBack={handleBack}
            onCreate={handleCreate}
          />
        )}
      </View>
    </ScreenScrollView>
  );
}

// ── Sub-components ──

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2 mb-2">
      {STEP_LABELS.map((label, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        return (
          <View key={label} className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive
                  ? mflColors.brand
                  : isCompleted
                    ? mflColors.brandLight
                    : mflColors.inkLight,
              }}
            >
              {isCompleted ? (
                <Feather name="check" size={16} color={mflColors.brand} />
              ) : (
                <AppText
                  className="text-xs font-bold"
                  style={{ color: isActive ? mflColors.white : mflColors.textMuted }}
                >
                  {idx + 1}
                </AppText>
              )}
            </View>
            {idx < STEP_LABELS.length - 1 && (
              <View
                style={{
                  width: 24,
                  height: 2,
                  backgroundColor: isCompleted ? mflColors.brand : mflColors.border,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function SuccessStat({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center p-3 rounded-xl" style={{ backgroundColor: mflColors.brandLight }}>
      <AppText className="text-xl font-bold" style={{ color: mflColors.brand }}>
        {value}
      </AppText>
      <AppText className="text-xs text-muted">{label}</AppText>
    </View>
  );
}
