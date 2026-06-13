import crashlytics from '@react-native-firebase/crashlytics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { useCreateLeague } from './use-create-league';
import { useTiers } from './use-tiers';
import { fetchLeagueDetail } from '../services/league.service';
import { checkLeagueName, previewPrice } from '../services/tier.service';
import { trackConversionEvent } from '../../conversion/services/conversion.service';
import { recommendTier } from '../types/tier';
import type { CreateLeagueInput } from '../types/league-management.model';
import type { PriceBreakdown, TierValidationResult } from '../types/tier';

type CreateLeagueStep = 0 | 1 | 2 | 3 | 'success';

function getTodayString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function reportError(error: unknown): void {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  crashlytics().recordError(normalizedError);
}

export function useCreateLeagueForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useCreateLeague();
  const params = useLocalSearchParams<{ source_league_id?: string | string[] }>();
  const sourceLeagueId = Array.isArray(params.source_league_id)
    ? params.source_league_id[0]
    : params.source_league_id;

  const [step, setStep] = useState<CreateLeagueStep>(0);
  const [leagueName, setLeagueName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [duration, setDuration] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [numTeams, setNumTeams] = useState(2);
  const [rrFormula, setRrFormula] = useState('standard');
  const [isPublic, setIsPublic] = useState(false);
  const [isExclusive, setIsExclusive] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [pricePreview, setPricePreview] = useState<PriceBreakdown | null>(null);
  const [validation, setValidation] = useState<TierValidationResult | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [showAllTiers, setShowAllTiers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tiers = [], isLoading: tiersLoading } = useTiers();

  const durationNum = useMemo(() => Number.parseInt(duration, 10) || 0, [duration]);
  const maxParticipantsNum = useMemo(
    () => Number.parseInt(maxParticipants, 10) || 0,
    [maxParticipants],
  );
  const restDays = useMemo(() => Math.round(durationNum * 0.2), [durationNum]);
  const endDate = useMemo(
    () => (durationNum > 0 && startDate.length === 10 ? addDays(startDate, durationNum) : ''),
    [durationNum, startDate],
  );
  const estimatedParticipants = useMemo(
    () => (maxParticipantsNum > 0 ? maxParticipantsNum : numTeams * 5),
    [maxParticipantsNum, numTeams],
  );

  const recommendation = useMemo(() => {
    if (tiers.length === 0) return null;
    return recommendTier(tiers, durationNum, estimatedParticipants);
  }, [tiers, durationNum, estimatedParticipants]);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.tier_id === selectedTierId) ?? null,
    [tiers, selectedTierId],
  );

  useEffect(() => {
    if (!sourceLeagueId) return;

    let isMounted = true;

    void (async () => {
      try {
        const detail = await fetchLeagueDetail(sourceLeagueId);
        if (!isMounted || !detail?.data) return;

        const sourceLeague = detail.data;
        setLeagueName(`Run your own: ${sourceLeague.league_name}`);
        setNumTeams(sourceLeague.num_teams || 4);
        setRrFormula(sourceLeague.rr_config?.formula || 'standard');
        setIsPublic(sourceLeague.is_public ?? false);
        setIsExclusive(sourceLeague.is_exclusive ?? true);
        if (sourceLeague.start_date && sourceLeague.end_date) {
          const start = new Date(sourceLeague.start_date);
          const end = new Date(sourceLeague.end_date);
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / millisecondsPerDay) + 1);
          setDuration(String(days));
        }
      } catch (caughtError: unknown) {
        reportError(caughtError);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [sourceLeagueId]);

  useEffect(() => {
    setSelectedTierId(null);
    setPricePreview(null);
    setValidation(null);
  }, [durationNum, estimatedParticipants]);

  useEffect(() => {
    if (step === 3 && recommendation && !selectedTierId) {
      setSelectedTierId(recommendation.tier_id);
    }
  }, [step, recommendation, selectedTierId]);

  useEffect(() => {
    if (recommendation && !selectedTierId) {
      setSelectedTierId(recommendation.tier_id);
    }
  }, [recommendation, selectedTierId]);

  useEffect(() => {
    if (!selectedTierId || durationNum <= 0) {
      setPricePreview(null);
      setValidation(null);
      return;
    }

    const selectedTierConfig = tiers.find((tier) => tier.tier_id === selectedTierId);
    if (!selectedTierConfig) return;

    if (
      selectedTierConfig.pricing.pricing_type === 'fixed' &&
      selectedTierConfig.pricing.fixed_price != null
    ) {
      const fixedTotal = selectedTierConfig.pricing.fixed_price;
      const gstAmount = (fixedTotal * (selectedTierConfig.pricing.gst_percentage || 18)) / 100;
      setPricePreview({
        total: fixedTotal + gstAmount,
        subtotal: fixedTotal,
        gst_amount: gstAmount,
        pricing_type: 'fixed',
        duration_days: durationNum,
        breakdown_details: [
          `Base Price: \u20B9${fixedTotal.toFixed(2)}`,
          `GST (${selectedTierConfig.pricing.gst_percentage || 18}%): \u20B9${gstAmount.toFixed(2)}`,
        ],
      });
      setValidation({ valid: true, errors: [], warnings: [] });
      return;
    }

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

  const stepOneValid =
    leagueName.trim().length > 0 && startDate.length === 10 && durationNum > 0 && durationNum <= 365;
  const stepTwoValid = maxParticipantsNum > 0 && numTeams >= 2;
  const canSubmit = !!selectedTierId && !!pricePreview && (!validation || validation.valid) && !loadingPrice;
  const isFree = pricePreview != null && pricePreview.total === 0;

  const handleCreate = useCallback(async () => {
    if (!selectedTierId || !endDate) return;

    setSubmitting(true);
    setError(null);

    try {
      const leagueNameIsTaken = await checkLeagueName(leagueName.trim());
      if (leagueNameIsTaken) {
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
          void trackConversionEvent('created', sourceLeagueId).catch((caughtError: unknown) => {
            reportError(caughtError);
          });
        }

        setStep('success');
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      router.push({
        pathname: '/(app)/payment-checkout',
        params: { leagueData: JSON.stringify(leagueData) },
      });
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to create league. Please try again.');
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
    router,
    sourceLeagueId,
  ]);

  return {
    step,
    setStep,
    leagueName,
    setLeagueName,
    description,
    setDescription,
    startDate,
    setStartDate,
    duration,
    setDuration,
    durationNum,
    maxParticipants,
    setMaxParticipants,
    maxParticipantsNum,
    numTeams,
    setNumTeams,
    rrFormula,
    setRrFormula,
    isPublic,
    setIsPublic,
    isExclusive,
    setIsExclusive,
    selectedTierId,
    setSelectedTierId,
    pricePreview,
    validation,
    loadingPrice,
    showAllTiers,
    setShowAllTiers,
    submitting,
    error,
    setError,
    tiers,
    tiersLoading,
    recommendation,
    selectedTier,
    restDays,
    endDate,
    estimatedParticipants,
    canSubmit,
    isFree,
    stepOneValid,
    stepTwoValid,
    handleCreate,
  };
}
