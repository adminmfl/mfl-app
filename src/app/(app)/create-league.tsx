import Feather from '@expo/vector-icons/Feather';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Spinner } from 'heroui-native';
import { useQueryClient } from '@tanstack/react-query';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { useCreateLeague } from '../../features/leagues/hooks/use-create-league';
import { useTiers } from '../../features/leagues/hooks/use-tiers';
import { checkLeagueName, previewPrice } from '../../features/leagues/services/tier.service';
import { recommendTier } from '../../features/leagues/types/tier';
import { queryKeys } from '../../core/config';
import type { CreateLeagueInput } from '../../features/leagues/types/league-management.model';
import type { PriceBreakdown, TierConfig, TierValidationResult } from '../../features/leagues/types/tier';
import { fetchLeagueDetail } from '../../features/leagues/services/league.service';
import { trackConversionEvent } from '../../features/conversion/services/conversion.service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RR_FORMULAS = [
  { value: 'standard', label: 'Standard (Run Rate)', description: 'Full RR calculation with all factors' },
  { value: 'simple', label: 'Simple', description: '1 point per activity' },
  { value: 'points_only', label: 'Points Only', description: 'Raw points without RR modifiers' },
] as const;

const STEP_TITLES = ['Basic Info', 'Configuration', 'Tier & Review'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2 mb-4">
      {STEP_TITLES.map((title, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        return (
          <View key={title} className="flex-row items-center gap-2">
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
            {idx < STEP_TITLES.length - 1 && (
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

function Stepper({
  label,
  value,
  onIncrement,
  onDecrement,
  min,
  max,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min: number;
  max: number;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <AppText className="text-sm font-medium text-foreground">{label}</AppText>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onDecrement}
          disabled={value <= min}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: value <= min ? mflColors.inkLight : mflColors.brandLight,
          }}
        >
          <Feather name="minus" size={18} color={value <= min ? mflColors.textMuted : mflColors.brand} />
        </Pressable>
        <AppText className="text-lg font-bold text-foreground" style={{ minWidth: 32, textAlign: 'center' }}>
          {value}
        </AppText>
        <Pressable
          onPress={onIncrement}
          disabled={value >= max}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: value >= max ? mflColors.inkLight : mflColors.brandLight,
          }}
        >
          <Feather name="plus" size={18} color={value >= max ? mflColors.textMuted : mflColors.brand} />
        </Pressable>
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable className="flex-row items-center justify-between py-3" onPress={onToggle}>
      <View className="flex-1 mr-4">
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
        {description && <AppText className="text-xs text-muted mt-0.5">{description}</AppText>}
      </View>
      <View
        className="w-12 h-7 rounded-full justify-center px-0.5"
        style={{ backgroundColor: value ? mflColors.brand : mflColors.border }}
      >
        <View
          className="w-6 h-6 rounded-full"
          style={{
            backgroundColor: mflColors.white,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <AppText className="text-sm text-muted">{label}</AppText>
      <AppText
        className="text-sm font-medium text-foreground flex-shrink"
        style={{ maxWidth: '60%', textAlign: 'right' }}
      >
        {value}
      </AppText>
    </View>
  );
}

function TierCard({
  tier,
  isSelected,
  isRecommended,
  onSelect,
}: {
  tier: TierConfig;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      className="rounded-xl p-4"
      style={{
        backgroundColor: isSelected ? mflColors.brandLight : mflColors.white,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? mflColors.brand : mflColors.border,
      }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <AppText className="text-base font-bold text-foreground">{tier.display_name}</AppText>
          {isRecommended && (
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: mflColors.brand }}
            >
              <AppText className="text-[10px] font-bold" style={{ color: mflColors.white }}>
                RECOMMENDED
              </AppText>
            </View>
          )}
        </View>
        <View
          className="w-5 h-5 rounded-full items-center justify-center"
          style={{
            borderWidth: 2,
            borderColor: isSelected ? mflColors.brand : mflColors.textMuted,
          }}
        >
          {isSelected && (
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: mflColors.brand }} />
          )}
        </View>
      </View>
      <AppText className="text-xs text-muted">{tier.description}</AppText>
      <AppText className="text-xs text-muted mt-1">
        Up to {tier.max_days} days, {tier.max_participants} participants
      </AppText>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Input styling
// ---------------------------------------------------------------------------

const inputStyle = {
  backgroundColor: mflColors.white,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function CreateLeagueScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useCreateLeague();
  const params = useLocalSearchParams<{ source_league_id?: string }>();
  const sourceLeagueId = params.source_league_id;

  // Wizard step: 0=Basic, 1=Config, 2=Review, 'success'=done
  const [step, setStep] = useState<number | 'success'>(0);

  // Step 1 - Basic Info
  const [leagueName, setLeagueName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [duration, setDuration] = useState('');

  // Step 2 - Configuration
  const [maxParticipants, setMaxParticipants] = useState('');
  const [numTeams, setNumTeams] = useState(2);
  const [rrFormula, setRrFormula] = useState('standard');
  const [isPublic, setIsPublic] = useState(false);
  const [isExclusive, setIsExclusive] = useState(true);

  // Tier & Pricing
  const { data: tiers = [], isLoading: tiersLoading } = useTiers();
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [pricePreview, setPricePreview] = useState<PriceBreakdown | null>(null);
  const [validation, setValidation] = useState<TierValidationResult | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [showAllTiers, setShowAllTiers] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const durationNum = parseInt(duration) || 0;
  const maxParticipantsNum = parseInt(maxParticipants) || 0;
  const restDays = Math.round(durationNum * 0.2);
  const endDate = durationNum > 0 && startDate.length === 10 ? addDays(startDate, durationNum) : '';

  const estimatedParticipants = useMemo(() => {
    if (maxParticipantsNum > 0) return maxParticipantsNum;
    return numTeams * 5;
  }, [maxParticipantsNum, numTeams]);

  // Prefill from source league (Run Your Own conversion flow)
  useEffect(() => {
    if (!sourceLeagueId) return;
    let mounted = true;
    (async () => {
      try {
        const detail = await fetchLeagueDetail(sourceLeagueId);
        if (!mounted || !detail?.data) return;
        const src = detail.data;
        setLeagueName(`Run your own: ${src.league_name}`);
        setNumTeams(src.num_teams || 4);
        setRrFormula(src.rr_config?.formula || 'standard');
        setIsPublic(src.is_public ?? false);
        setIsExclusive(src.is_exclusive ?? true);
        if (src.start_date && src.end_date) {
          const s = new Date(src.start_date);
          const e = new Date(src.end_date);
          const msPerDay = 24 * 60 * 60 * 1000;
          const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / msPerDay) + 1);
          setDuration(String(days));
        }
      } catch {
        // Non-fatal — user can fill manually
      }
    })();
    return () => { mounted = false; };
  }, [sourceLeagueId]);

  // Tier recommendation
  const recommendation = useMemo(() => {
    if (tiers.length === 0) return null;
    return recommendTier(tiers, durationNum, estimatedParticipants);
  }, [tiers, durationNum, estimatedParticipants]);

  // Auto-select recommended tier when entering step 2
  useEffect(() => {
    if (step === 2 && recommendation && !selectedTierId) {
      setSelectedTierId(recommendation.tier_id);
    }
  }, [step, recommendation, selectedTierId]);

  // Clear selected tier when form values change (matches web behavior)
  useEffect(() => {
    setSelectedTierId(null);
    setPricePreview(null);
    setValidation(null);
  }, [durationNum, estimatedParticipants]);

  // Auto-select recommended tier after clearing
  useEffect(() => {
    if (recommendation && !selectedTierId) {
      setSelectedTierId(recommendation.tier_id);
    }
  }, [recommendation, selectedTierId]);

  // Fetch price preview when tier changes
  useEffect(() => {
    if (!selectedTierId || durationNum <= 0) {
      setPricePreview(null);
      setValidation(null);
      return;
    }

    const tier = tiers.find((t) => t.tier_id === selectedTierId);
    if (!tier) return;

    // Fixed price: compute locally (matches web)
    if (tier.pricing.pricing_type === 'fixed' && tier.pricing.fixed_price != null) {
      const fixedTotal = tier.pricing.fixed_price;
      const gstAmount = (fixedTotal * (tier.pricing.gst_percentage || 18)) / 100;
      setPricePreview({
        total: fixedTotal + gstAmount,
        subtotal: fixedTotal,
        gst_amount: gstAmount,
        pricing_type: 'fixed',
        duration_days: durationNum,
        breakdown_details: [
          `Base Price: \u20B9${fixedTotal.toFixed(2)}`,
          `GST (${tier.pricing.gst_percentage || 18}%): \u20B9${gstAmount.toFixed(2)}`,
        ],
      });
      setValidation({ valid: true, errors: [], warnings: [] });
      return;
    }

    // Dynamic pricing: fetch from API (debounced)
    setLoadingPrice(true);
    const timeout = setTimeout(async () => {
      const result = await previewPrice(selectedTierId, durationNum, estimatedParticipants);
      if (result) {
        setPricePreview(result.breakdown);
        setValidation(result.validation);
      } else {
        setPricePreview(null);
        setValidation(null);
      }
      setLoadingPrice(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [selectedTierId, durationNum, estimatedParticipants, tiers]);

  // Validation per step
  const step1Valid =
    leagueName.trim().length > 0 &&
    startDate.length === 10 &&
    durationNum > 0 &&
    durationNum <= 365;

  const step2Valid = maxParticipantsNum > 0 && numTeams >= 2;

  const selectedTier = tiers.find((t) => t.tier_id === selectedTierId) ?? null;

  const canSubmit =
    !!selectedTierId &&
    !!pricePreview &&
    (!validation || validation.valid) &&
    !loadingPrice;

  const isFree = pricePreview != null && pricePreview.total === 0;

  // Handle submit
  const handleCreate = useCallback(async () => {
    if (!selectedTierId || !endDate) return;

    setSubmitting(true);
    setError(null);

    try {
      // 1. Check name uniqueness
      const exists = await checkLeagueName(leagueName.trim());
      if (exists) {
        setError('This league name is already taken. Please choose a different name.');
        setSubmitting(false);
        return;
      }

      const leagueData = {
        league_name: leagueName.trim(),
        description: description.trim() || null,
        start_date: startDate,
        end_date: endDate,
        tier_id: selectedTierId,
        num_teams: numTeams,
        max_participants: maxParticipantsNum,
        rest_days: restDays,
        rr_config: { formula: rrFormula },
        is_public: isPublic,
        is_exclusive: isExclusive,
      };

      // 2. Free tier: create directly
      if (isFree) {
        const input: CreateLeagueInput = {
          leagueName: leagueName.trim(),
          description: description.trim(),
          startDate,
          endDate,
          tierId: selectedTierId,
          numTeams,
          maxParticipants: maxParticipantsNum,
          restDays,
          rrFormula,
          isPublic,
          isExclusive,
        };

        await createMutation.mutateAsync(input);
        await queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
        if (sourceLeagueId) {
          trackConversionEvent('created', sourceLeagueId).catch(() => {});
        }
        setStep('success');
        setSubmitting(false);
        return;
      }

      // 3. Paid tier: navigate to payment checkout
      setSubmitting(false);
      router.push({
        pathname: '/(app)/payment-checkout',
        params: { leagueData: JSON.stringify(leagueData) },
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create league. Please try again.');
      setSubmitting(false);
    }
  }, [
    selectedTierId,
    endDate,
    leagueName,
    description,
    startDate,
    numTeams,
    maxParticipantsNum,
    restDays,
    rrFormula,
    isPublic,
    isExclusive,
    isFree,
    createMutation,
    queryClient,
    router,
    sourceLeagueId,
  ]);

  // ── Success State ──────────────────────────────────────────────────────────
  if (step === 'success') {
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
                {leagueName}
              </AppText>{' '}
              has been created successfully.
            </AppText>
          </View>

          {/* Summary stats */}
          <View className="flex-row gap-4">
            <View className="items-center p-3 rounded-xl" style={{ backgroundColor: mflColors.brandLight }}>
              <AppText className="text-xl font-bold" style={{ color: mflColors.brand }}>
                {numTeams}
              </AppText>
              <AppText className="text-xs text-muted">Teams</AppText>
            </View>
            <View className="items-center p-3 rounded-xl" style={{ backgroundColor: mflColors.brandLight }}>
              <AppText className="text-xl font-bold" style={{ color: mflColors.brand }}>
                {maxParticipantsNum}
              </AppText>
              <AppText className="text-xs text-muted">Capacity</AppText>
            </View>
            <View className="items-center p-3 rounded-xl" style={{ backgroundColor: mflColors.brandLight }}>
              <AppText className="text-xl font-bold" style={{ color: mflColors.brand }}>
                {durationNum}
              </AppText>
              <AppText className="text-xs text-muted">Days</AppText>
            </View>
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

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <ScreenScrollView avoidKeyboard>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => {
            if (typeof step === 'number' && step > 0) {
              setStep(step - 1);
            } else {
              router.back();
            }
          }}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <AppText className="text-lg font-bold text-foreground">Create League</AppText>
        <View style={{ width: 24 }} />
      </View>

      <View className="gap-4">
        <StepIndicator currentStep={typeof step === 'number' ? step : 2} />

        {/* Error */}
        {error && (
          <View className="p-3 rounded-lg" style={{ backgroundColor: mflColors.dangerLight }}>
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {error}
            </AppText>
          </View>
        )}

        {/* ── Step 0: Basic Info ─────────────────────────────────────────── */}
        {step === 0 && (
          <View className="gap-4">
            <DarkHeaderCard title="Basic Info" subtitle="Name your league and set the schedule." />

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">League Name *</AppText>
              <TextInput
                style={inputStyle}
                value={leagueName}
                onChangeText={setLeagueName}
                placeholder="e.g. Summer Fitness Challenge"
                placeholderTextColor={mflColors.textMuted}
                maxLength={100}
              />
            </View>

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">Description</AppText>
              <TextInput
                style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your league..."
                placeholderTextColor={mflColors.textMuted}
                multiline
                maxLength={500}
              />
            </View>

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">Start Date</AppText>
              <TextInput
                style={inputStyle}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={mflColors.textMuted}
                maxLength={10}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">Duration (days) *</AppText>
              <TextInput
                style={inputStyle}
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g. 30"
                placeholderTextColor={mflColors.textMuted}
                keyboardType="number-pad"
                maxLength={3}
              />
              {durationNum > 365 && (
                <AppText className="text-xs" style={{ color: mflColors.danger }}>
                  Duration cannot exceed 365 days
                </AppText>
              )}
            </View>

            {/* Auto-calculated end date & rest days */}
            {endDate.length > 0 && (
              <Card className="p-4 gap-2">
                <View className="flex-row justify-between">
                  <AppText className="text-sm text-muted">End Date</AppText>
                  <AppText className="text-sm font-medium text-foreground">
                    {formatDate(endDate)}
                  </AppText>
                </View>
                <View className="flex-row justify-between">
                  <AppText className="text-sm text-muted">Rest Days (20%)</AppText>
                  <AppText className="text-sm font-medium text-foreground">{restDays}</AppText>
                </View>
              </Card>
            )}

            <Button
              variant="primary"
              size="lg"
              onPress={() => {
                setError(null);
                setStep(1);
              }}
              isDisabled={!step1Valid}
              className="w-full mt-2"
            >
              <Button.Label>Next</Button.Label>
            </Button>
          </View>
        )}

        {/* ── Step 1: Configuration ─────────────────────────────────────── */}
        {step === 1 && (
          <View className="gap-4">
            <DarkHeaderCard
              title="Configuration"
              subtitle="Set up participants, teams, and scoring."
            />

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">
                Total Participants (Max) *
              </AppText>
              <TextInput
                style={inputStyle}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder="e.g. 20"
                placeholderTextColor={mflColors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
              <AppText className="text-xs text-muted">
                Max people who can join, divided across teams
              </AppText>
            </View>

            <Card className="p-4">
              <Stepper
                label="Number of Teams"
                value={numTeams}
                onIncrement={() => setNumTeams((v) => Math.min(v + 1, 20))}
                onDecrement={() => setNumTeams((v) => Math.max(v - 1, 2))}
                min={2}
                max={20}
              />
            </Card>

            {/* RR Formula */}
            <View className="gap-2">
              <SectionLabel label="SCORING FORMULA" />
              <View className="gap-2">
                {RR_FORMULAS.map((formula) => {
                  const selected = rrFormula === formula.value;
                  return (
                    <Pressable
                      key={formula.value}
                      onPress={() => setRrFormula(formula.value)}
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: selected ? mflColors.brandLight : mflColors.white,
                        borderWidth: 1,
                        borderColor: selected ? mflColors.brand : mflColors.border,
                      }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className="w-5 h-5 rounded-full items-center justify-center"
                          style={{
                            borderWidth: 2,
                            borderColor: selected ? mflColors.brand : mflColors.textMuted,
                          }}
                        >
                          {selected && (
                            <View
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: mflColors.brand }}
                            />
                          )}
                        </View>
                        <View className="flex-1">
                          <AppText className="text-sm font-semibold text-foreground">
                            {formula.label}
                          </AppText>
                          <AppText className="text-xs text-muted mt-0.5">
                            {formula.description}
                          </AppText>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Toggles */}
            <Card className="p-4">
              <ToggleRow
                label="Public League"
                description="Anyone can find and request to join."
                value={isPublic}
                onToggle={() => setIsPublic((v) => !v)}
              />
              <View style={{ height: 1, backgroundColor: mflColors.border }} />
              <ToggleRow
                label="Exclusive League"
                description="Only invited members can join."
                value={isExclusive}
                onToggle={() => setIsExclusive((v) => !v)}
              />
            </Card>

            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                size="lg"
                onPress={() => setStep(0)}
                className="flex-1"
              >
                <Button.Label>Back</Button.Label>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={() => {
                  setError(null);
                  setStep(2);
                }}
                isDisabled={!step2Valid}
                className="flex-1"
              >
                <Button.Label>Next</Button.Label>
              </Button>
            </View>
          </View>
        )}

        {/* ── Step 2: Tier & Review ─────────────────────────────────────── */}
        {step === 2 && (
          <View className="gap-4">
            <DarkHeaderCard
              title="Tier & Review"
              subtitle="Select a plan and review your settings."
            />

            {/* Tier Selection */}
            {tiersLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color={mflColors.brand} />
                <AppText className="text-sm text-muted mt-2">Loading tiers...</AppText>
              </View>
            ) : tiers.length === 0 ? (
              <View className="p-4 rounded-lg" style={{ backgroundColor: mflColors.dangerLight }}>
                <AppText className="text-sm" style={{ color: mflColors.danger }}>
                  Unable to load tiers. Please try again later.
                </AppText>
              </View>
            ) : (
              <View className="gap-3">
                <SectionLabel label="SELECT PLAN" />
                {/* Show recommended or all */}
                {!showAllTiers && recommendation ? (
                  <View className="gap-2">
                    {(() => {
                      const tier = tiers.find((t) => t.tier_id === recommendation.tier_id);
                      if (!tier) return null;
                      return (
                        <TierCard
                          tier={tier}
                          isSelected={selectedTierId === tier.tier_id}
                          isRecommended
                          onSelect={() => setSelectedTierId(tier.tier_id)}
                        />
                      );
                    })()}
                    <Pressable onPress={() => setShowAllTiers(true)}>
                      <AppText
                        className="text-sm font-medium text-center py-2"
                        style={{ color: mflColors.brand }}
                      >
                        View all plans
                      </AppText>
                    </Pressable>
                  </View>
                ) : (
                  <View className="gap-2">
                    {tiers.map((tier) => (
                      <TierCard
                        key={tier.tier_id}
                        tier={tier}
                        isSelected={selectedTierId === tier.tier_id}
                        isRecommended={recommendation?.tier_id === tier.tier_id}
                        onSelect={() => setSelectedTierId(tier.tier_id)}
                      />
                    ))}
                    {recommendation && (
                      <Pressable onPress={() => setShowAllTiers(false)}>
                        <AppText
                          className="text-sm font-medium text-center py-2"
                          style={{ color: mflColors.brand }}
                        >
                          Show recommended only
                        </AppText>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Price Preview */}
            {selectedTier && (
              <Card className="p-4 gap-3">
                <AppText className="text-sm font-semibold text-foreground">Price Summary</AppText>
                {loadingPrice ? (
                  <View className="flex-row items-center gap-2 py-2">
                    <ActivityIndicator size="small" color={mflColors.brand} />
                    <AppText className="text-sm text-muted">Calculating price...</AppText>
                  </View>
                ) : pricePreview ? (
                  <View className="gap-2">
                    {pricePreview.breakdown_details?.map((detail: string, idx: number) => (
                      <AppText key={idx} className="text-xs text-muted">
                        {detail}
                      </AppText>
                    ))}
                    <View
                      style={{ height: 1, backgroundColor: mflColors.border, marginVertical: 4 }}
                    />
                    <View className="flex-row justify-between">
                      <AppText className="text-base font-bold text-foreground">Total</AppText>
                      <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
                        {'\u20B9'}
                        {pricePreview.total.toFixed(0)}
                      </AppText>
                    </View>
                  </View>
                ) : null}

                {/* Validation errors */}
                {validation && !validation.valid && (
                  <View
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: mflColors.dangerLight }}
                  >
                    <AppText
                      className="text-xs font-semibold mb-1"
                      style={{ color: mflColors.danger }}
                    >
                      Errors
                    </AppText>
                    {validation.errors.map((err, idx) => (
                      <AppText key={idx} className="text-xs" style={{ color: mflColors.danger }}>
                        {'\u2022'} {err}
                      </AppText>
                    ))}
                  </View>
                )}

                {validation && validation.warnings.length > 0 && (
                  <View
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: mflColors.amberLight }}
                  >
                    <AppText
                      className="text-xs font-semibold mb-1"
                      style={{ color: mflColors.amber }}
                    >
                      Warnings
                    </AppText>
                    {validation.warnings.map((warn, idx) => (
                      <AppText key={idx} className="text-xs" style={{ color: mflColors.amber }}>
                        {'\u2022'} {warn}
                      </AppText>
                    ))}
                  </View>
                )}
              </Card>
            )}

            {/* Review Summary */}
            <Card className="p-4 gap-3">
              <AppText className="text-sm font-semibold text-foreground">League Summary</AppText>
              <SummaryRow label="League Name" value={leagueName} />
              {description.trim().length > 0 && (
                <SummaryRow label="Description" value={description} />
              )}
              <SummaryRow label="Start Date" value={formatDate(startDate)} />
              <SummaryRow label="End Date" value={formatDate(endDate)} />
              <SummaryRow label="Duration" value={`${durationNum} days`} />
              <SummaryRow label="Participants" value={String(maxParticipantsNum)} />
              <SummaryRow label="Teams" value={String(numTeams)} />
              <SummaryRow label="Rest Days" value={String(restDays)} />
              <SummaryRow
                label="Scoring"
                value={
                  RR_FORMULAS.find((f) => f.value === rrFormula)?.label ?? rrFormula
                }
              />
              <SummaryRow label="Visibility" value={isPublic ? 'Public' : 'Private'} />
              {selectedTier && <SummaryRow label="Plan" value={selectedTier.display_name} />}
            </Card>

            {/* Actions */}
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                size="lg"
                onPress={() => setStep(1)}
                className="flex-1"
                isDisabled={submitting}
              >
                <Button.Label>Back</Button.Label>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={handleCreate}
                isDisabled={!canSubmit || submitting}
                className="flex-1"
              >
                {submitting ? (
                  <Spinner size="sm" />
                ) : (
                  <Button.Label>{isFree ? 'Create League' : 'Pay & Create'}</Button.Label>
                )}
              </Button>
            </View>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
