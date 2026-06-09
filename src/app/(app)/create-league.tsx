import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { mflColors } from '../../constants/colors';
import { LeagueBasicsStep } from '../../features/leagues/components/create-league/LeagueBasicsStep';
import { LeagueActivitiesStep } from '../../features/leagues/components/create-league/LeagueActivitiesStep';
import { LeagueTeamsStep } from '../../features/leagues/components/create-league/LeagueTeamsStep';
import { LeagueReviewStep } from '../../features/leagues/components/create-league/LeagueReviewStep';
import { LeagueCreatedSuccess } from '../../features/leagues/components/create-league/LeagueCreatedSuccess';
import { useCreateLeagueForm } from '../../features/leagues/hooks/use-create-league-form';

const STEP_TITLES = ['Basics', 'Activities', 'Teams', 'Review'] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2 mb-4">
      {STEP_TITLES.map((title, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <View key={title} className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive ? mflColors.brand : isCompleted ? mflColors.brandLight : mflColors.inkLight,
              }}
            >
              {isCompleted ? (
                <Feather name="check" size={16} color={mflColors.brand} />
              ) : (
                <AppText className="text-xs font-bold" style={{ color: isActive ? mflColors.white : mflColors.textMuted }}>
                  {index + 1}
                </AppText>
              )}
            </View>
            {index < STEP_TITLES.length - 1 && (
              <View style={{ width: 24, height: 2, backgroundColor: isCompleted ? mflColors.brand : mflColors.border }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function CreateLeagueScreen() {
  const router = useRouter();
  const form = useCreateLeagueForm();

  if (form.step === 'success') {
    return (
      <LeagueCreatedSuccess
        leagueName={form.leagueName}
        numTeams={form.numTeams}
        maxParticipants={form.maxParticipantsNum}
        durationDays={form.durationNum}
        onGoToDashboard={() => router.replace('/(app)/(tabs)/dashboard')}
      />
    );
  }

  return (
    <ScreenScrollView avoidKeyboard>
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => (typeof form.step === 'number' && form.step > 0 ? form.setStep((form.step - 1) as 0 | 1 | 2 | 3) : router.back())}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <AppText className="text-lg font-bold text-foreground">Create League</AppText>
        <View style={{ width: 24 }} />
      </View>

      <View className="gap-4">
        <StepIndicator currentStep={form.step as number} />

        {form.error && (
          <View className="p-3 rounded-lg" style={{ backgroundColor: mflColors.dangerLight }}>
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {form.error}
            </AppText>
          </View>
        )}

        {form.step === 0 && (
          <LeagueBasicsStep
            leagueName={form.leagueName}
            description={form.description}
            startDate={form.startDate}
            duration={form.duration}
            durationNum={form.durationNum}
            restDays={form.restDays}
            endDate={form.endDate}
            stepOneValid={form.stepOneValid}
            onChangeLeagueName={form.setLeagueName}
            onChangeDescription={form.setDescription}
            onChangeStartDate={form.setStartDate}
            onChangeDuration={form.setDuration}
            onNext={() => {
              form.setError(null);
              form.setStep(1);
            }}
            onBack={() => router.back()}
          />
        )}

        {form.step === 1 && (
          <LeagueActivitiesStep
            rrFormula={form.rrFormula}
            isPublic={form.isPublic}
            isExclusive={form.isExclusive}
            onChangeRrFormula={form.setRrFormula}
            onTogglePublic={() => form.setIsPublic((value) => !value)}
            onToggleExclusive={() => form.setIsExclusive((value) => !value)}
            onNext={() => {
              form.setError(null);
              form.setStep(2);
            }}
            onBack={() => form.setStep(0)}
          />
        )}

        {form.step === 2 && (
          <LeagueTeamsStep
            maxParticipants={form.maxParticipants}
            numTeams={form.numTeams}
            estimatedParticipants={form.estimatedParticipants}
            onChangeMaxParticipants={form.setMaxParticipants}
            onChangeNumTeams={form.setNumTeams}
            onNext={() => {
              form.setError(null);
              form.setStep(3);
            }}
            onBack={() => form.setStep(1)}
          />
        )}

        {form.step === 3 && (
          <LeagueReviewStep
            leagueName={form.leagueName}
            description={form.description}
            startDate={form.startDate}
            endDate={form.endDate}
            durationNum={form.durationNum}
            maxParticipantsNum={form.maxParticipantsNum}
            numTeams={form.numTeams}
            restDays={form.restDays}
            rrFormula={form.rrFormula}
            isPublic={form.isPublic}
            selectedTierId={form.selectedTierId}
            selectedTier={form.selectedTier}
            tiers={form.tiers}
            tiersLoading={form.tiersLoading}
            recommendation={form.recommendation}
            pricePreview={form.pricePreview}
            validation={form.validation}
            loadingPrice={form.loadingPrice}
            showAllTiers={form.showAllTiers}
            canSubmit={form.canSubmit}
            isFree={form.isFree}
            submitting={form.submitting}
            onSetSelectedTierId={form.setSelectedTierId}
            onToggleShowAllTiers={form.setShowAllTiers}
            onCreate={form.handleCreate}
            onBack={() => form.setStep(2)}
          />
        )}
      </View>
    </ScreenScrollView>
  );
}
