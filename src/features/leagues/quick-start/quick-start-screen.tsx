import Feather from '@expo/vector-icons/Feather';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { mflColors } from '../../../constants/colors';
import { useQuickStartLeague } from './use-quick-start-league';
import { useWizardDraft, clearDraft } from './use-wizard-draft';
import { StepLeagueType } from './template-step';
import { StepBasics } from './basics-step';
import { StepTeams } from './teams-step';
import { StepActivitiesRules } from './activities-rules-step';
import { StepReviewLaunch } from './review-step';
import { STEP_LABELS, type WizardResult } from './quick-start.types';

export function QuickStartScreen() {
  const router = useRouter();
  const mutation = useQuickStartLeague();

  const {
    data,
    updateData,
    setStep,
    hasDraft,
    resumeDraft,
    discardDraft,
    draftStatus,
  } = useWizardDraft();

  const [result, setResult] = useState<WizardResult | null>(null);

  const goNext = useCallback(
    () => setStep(Math.min(data.currentStep + 1, 5)),
    [data.currentStep, setStep],
  );
  const goBack = useCallback(() => {
    if (data.currentStep > 1) {
      setStep(data.currentStep - 1);
    } else {
      router.back();
    }
  }, [data.currentStep, setStep, router]);

  const handleSubmit = useCallback(() => {
    mutation.mutate(data, {
      onSuccess: (res) => {
        clearDraft();
        setResult(res.data);
      },
      onError: (err) => {
        Alert.alert('Error', err.message || 'Failed to create league');
      },
    });
  }, [data, mutation]);

  return (
    <ScreenScrollView avoidKeyboard>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-1">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={18} color={mflColors.brand} />
          <AppText className="text-lg font-bold text-foreground">Quick Start Wizard</AppText>
        </View>
        <View className="flex-row items-center">
          {draftStatus === 'saved' && (
            <View className="flex-row items-center gap-1">
              <Feather name="save" size={12} color={mflColors.textMuted} />
              <AppText className="text-[10px] text-muted">Saved</AppText>
            </View>
          )}
          {draftStatus !== 'saved' && <View style={{ width: 24 }} />}
        </View>
      </View>
      <AppText className="text-xs text-muted text-center mb-3">
        Create a league in under 10 minutes
      </AppText>

      {/* Step indicator */}
      {!result && <StepIndicator currentStep={data.currentStep} />}

      {/* Resume draft banner */}
      {hasDraft && !result && (
        <View
          className="p-3 rounded-xl mb-3 flex-row items-center justify-between"
          style={{
            backgroundColor: mflColors.brandLight,
            borderWidth: 1,
            borderColor: mflColors.brand + '50',
          }}
        >
          <AppText className="text-sm text-foreground flex-1 mr-2">
            You have an unfinished draft. Resume?
          </AppText>
          <View className="flex-row gap-2">
            <Button variant="secondary" size="sm" onPress={discardDraft}>
              <Button.Label>Fresh</Button.Label>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={resumeDraft}
              style={{ backgroundColor: mflColors.brand }}
            >
              <Button.Label>Resume</Button.Label>
            </Button>
          </View>
        </View>
      )}

      {/* Step content */}
      <View className="gap-4 mt-2">
        {data.currentStep === 1 && !result && (
          <StepLeagueType data={data} onUpdate={updateData} onNext={goNext} />
        )}
        {data.currentStep === 2 && !result && (
          <StepBasics data={data} onUpdate={updateData} onNext={goNext} onBack={goBack} />
        )}
        {data.currentStep === 3 && !result && (
          <StepTeams data={data} onUpdate={updateData} onNext={goNext} onBack={goBack} />
        )}
        {data.currentStep === 4 && !result && (
          <StepActivitiesRules data={data} onUpdate={updateData} onNext={goNext} onBack={goBack} />
        )}
        {(data.currentStep === 5 || result) && (
          <StepReviewLaunch
            data={data}
            onBack={goBack}
            onSubmit={handleSubmit}
            loading={mutation.isPending}
            result={result}
          />
        )}

        {/* Go to Dashboard after success */}
        {result && (
          <Button
            size="lg"
            style={{ backgroundColor: mflColors.brand }}
            onPress={() => router.replace('/(app)/(tabs)/dashboard')}
            className="w-full"
          >
            <Button.Label>Go to Dashboard</Button.Label>
          </Button>
        )}
      </View>
    </ScreenScrollView>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row items-center justify-center gap-1 mb-3">
      {STEP_LABELS.map((_, idx) => {
        const s = idx + 1;
        const isActive = s === currentStep;
        const isCompleted = s < currentStep;
        return (
          <View key={s} className="flex-row items-center gap-1">
            <View
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive
                  ? mflColors.brand
                  : isCompleted
                    ? mflColors.brandLight
                    : mflColors.inkLight,
              }}
            >
              {isCompleted ? (
                <Feather name="check" size={14} color={mflColors.brand} />
              ) : (
                <AppText
                  className="text-xs font-bold"
                  style={{ color: isActive ? mflColors.white : mflColors.textMuted }}
                >
                  {s}
                </AppText>
              )}
            </View>
            {s < 5 && (
              <View
                style={{
                  width: 16,
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
