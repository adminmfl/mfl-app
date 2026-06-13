import { ActivityIndicator, Pressable, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../../components/app-text';
import { DarkHeaderCard } from '../../../../components/dark-header-card';
import { SectionLabel } from '../../../../components/section-label';
import { mflColors } from '../../../../constants/colors';
import type { PriceBreakdown, TierConfig, TierValidationResult } from '../../types/tier';

const RR_FORMULAS = [
  { value: 'standard', label: 'Standard (Run Rate)' },
  { value: 'simple', label: 'Simple' },
  { value: 'points_only', label: 'Points Only' },
] as const;
interface LeagueReviewStepProps {
  leagueName: string;
  description: string;
  startDate: string;
  endDate: string;
  durationNum: number;
  maxParticipantsNum: number;
  numTeams: number;
  restDays: number;
  rrFormula: string;
  isPublic: boolean;
  selectedTierId: string | null;
  selectedTier: TierConfig | null;
  tiers: TierConfig[];
  tiersLoading: boolean;
  recommendation: { tier_id: string } | null;
  pricePreview: PriceBreakdown | null;
  validation: TierValidationResult | null;
  loadingPrice: boolean;
  showAllTiers: boolean;
  canSubmit: boolean;
  isFree: boolean;
  submitting: boolean;
  onSetSelectedTierId: (value: string) => void;
  onToggleShowAllTiers: (value: boolean) => void;
  onCreate: () => void;
  onBack: () => void;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <AppText className="text-sm text-muted">{label}</AppText>
      <AppText className="text-sm font-medium text-foreground flex-shrink" style={{ maxWidth: '60%', textAlign: 'right' }}>
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
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: mflColors.brand }}>
              <AppText className="text-[10px] font-bold" style={{ color: mflColors.white }}>
                RECOMMENDED
              </AppText>
            </View>
          )}
        </View>
        <View
          className="w-5 h-5 rounded-full items-center justify-center"
          style={{ borderWidth: 2, borderColor: isSelected ? mflColors.brand : mflColors.textMuted }}
        >
          {isSelected && <View className="w-3 h-3 rounded-full" style={{ backgroundColor: mflColors.brand }} />}
        </View>
      </View>
      <AppText className="text-xs text-muted">{tier.description}</AppText>
      <AppText className="text-xs text-muted mt-1">
        Up to {tier.max_days} days, {tier.max_participants} participants
      </AppText>
    </Pressable>
  );
}

export function LeagueReviewStep({
  leagueName,
  description,
  startDate,
  endDate,
  durationNum,
  maxParticipantsNum,
  numTeams,
  restDays,
  rrFormula,
  isPublic,
  selectedTierId,
  selectedTier,
  tiers,
  tiersLoading,
  recommendation,
  pricePreview,
  validation,
  loadingPrice,
  showAllTiers,
  canSubmit,
  isFree,
  submitting,
  onSetSelectedTierId,
  onToggleShowAllTiers,
  onCreate,
  onBack,
}: LeagueReviewStepProps) {
  return (
    <View className="gap-4">
      <DarkHeaderCard title="Tier & Review" subtitle="Select a plan and review your settings." />

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
          {!showAllTiers && recommendation ? (
            <View className="gap-2">
              {(() => {
                const recommendedTier = tiers.find((tier) => tier.tier_id === recommendation.tier_id);
                if (!recommendedTier) return null;
                return (
                  <TierCard
                    tier={recommendedTier}
                    isSelected={selectedTierId === recommendedTier.tier_id}
                    isRecommended
                    onSelect={() => onSetSelectedTierId(recommendedTier.tier_id)}
                  />
                );
              })()}
              <Pressable onPress={() => onToggleShowAllTiers(true)}>
                <AppText className="text-sm font-medium text-center py-2" style={{ color: mflColors.brand }}>
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
                  onSelect={() => onSetSelectedTierId(tier.tier_id)}
                />
              ))}
              {recommendation && (
                <Pressable onPress={() => onToggleShowAllTiers(false)}>
                  <AppText className="text-sm font-medium text-center py-2" style={{ color: mflColors.brand }}>
                    Show recommended only
                  </AppText>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}

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
              {pricePreview.breakdown_details?.map((detail, index) => (
                <AppText key={`${detail}-${index}`} className="text-xs text-muted">
                  {detail}
                </AppText>
              ))}
              <View style={{ height: 1, backgroundColor: mflColors.border, marginVertical: 4 }} />
              <View className="flex-row justify-between">
                <AppText className="text-base font-bold text-foreground">Total</AppText>
                <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
                  {'\u20B9'}
                  {pricePreview.total.toFixed(0)}
                </AppText>
              </View>
            </View>
          ) : null}

          {validation && !validation.valid && (
            <View className="p-3 rounded-lg" style={{ backgroundColor: mflColors.dangerLight }}>
              <AppText className="text-xs font-semibold mb-1" style={{ color: mflColors.danger }}>
                Errors
              </AppText>
              {validation.errors.map((validationError, index) => (
                <AppText key={`${validationError}-${index}`} className="text-xs" style={{ color: mflColors.danger }}>
                  {'\u2022'} {validationError}
                </AppText>
              ))}
            </View>
          )}

          {validation && validation.warnings.length > 0 && (
            <View className="p-3 rounded-lg" style={{ backgroundColor: mflColors.amberLight }}>
              <AppText className="text-xs font-semibold mb-1" style={{ color: mflColors.amber }}>
                Warnings
              </AppText>
              {validation.warnings.map((warning, index) => (
                <AppText key={`${warning}-${index}`} className="text-xs" style={{ color: mflColors.amber }}>
                  {'\u2022'} {warning}
                </AppText>
              ))}
            </View>
          )}
        </Card>
      )}

      <Card className="p-4 gap-3">
        <AppText className="text-sm font-semibold text-foreground">League Summary</AppText>
        <SummaryRow label="League Name" value={leagueName} />
        {description.trim().length > 0 && <SummaryRow label="Description" value={description} />}
        <SummaryRow label="Start Date" value={formatDate(startDate)} />
        <SummaryRow label="End Date" value={formatDate(endDate)} />
        <SummaryRow label="Duration" value={`${durationNum} days`} />
        <SummaryRow label="Participants" value={String(maxParticipantsNum)} />
        <SummaryRow label="Teams" value={String(numTeams)} />
        <SummaryRow label="Rest Days" value={String(restDays)} />
        <SummaryRow label="Scoring" value={RR_FORMULAS.find((f) => f.value === rrFormula)?.label ?? rrFormula.replace('_', ' ')} />
        <SummaryRow label="Visibility" value={isPublic ? 'Public' : 'Private'} />
        {selectedTier && <SummaryRow label="Plan" value={selectedTier.display_name} />}
      </Card>

      <View className="flex-row gap-3">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1" isDisabled={submitting}>
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={onCreate} isDisabled={!canSubmit || submitting} className="flex-1">
          {submitting ? <Spinner size="sm" /> : <Button.Label>{isFree ? 'Create League' : 'Pay & Create'}</Button.Label>}
        </Button>
      </View>
    </View>
  );
}
