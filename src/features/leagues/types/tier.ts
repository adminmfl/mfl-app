// Types for the tier/pricing system (mirrors web tier-helpers.ts)

export interface TierConfig {
  tier_id: string;
  tier_name: string;
  display_name: string;
  description: string;
  max_days: number;
  max_participants: number;
  is_featured: boolean;
  features: string[];
  pricing: {
    id: string;
    pricing_type: 'fixed' | 'dynamic';
    fixed_price: number | null;
    base_fee: number;
    per_day_rate: number;
    per_participant_rate: number;
    gst_percentage: number;
  };
}

export interface PriceBreakdown {
  tier_id?: string;
  tier_name?: string;
  pricing_type: 'fixed' | 'dynamic';
  duration_days: number;
  participants?: number;
  base_fee?: number;
  days_cost?: number;
  participants_cost?: number;
  subtotal: number;
  gst_amount: number;
  total: number;
  currency?: string;
  breakdown_details: string[];
}

export interface TierValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TierRecommendation {
  tier_id: string;
  tier_name: string;
  display_name: string;
  reason: string;
  isRecommended: boolean;
  fits: boolean;
}

/**
 * Recommend the smallest tier that fits duration and participant constraints.
 * Matches web recommendTier() logic exactly.
 */
export function recommendTier(
  tiers: TierConfig[],
  durationDays: number,
  estimatedParticipants: number,
): TierRecommendation | null {
  if (!tiers || tiers.length === 0) return null;

  const suitableTiers = tiers.filter(
    (tier) =>
      durationDays <= tier.max_days &&
      estimatedParticipants <= tier.max_participants,
  );

  if (suitableTiers.length === 0) return null;

  const recommended = suitableTiers.reduce((best, current) => {
    if (current.is_featured && !best.is_featured) return current;
    if (best.is_featured && !current.is_featured) return best;
    return current.max_days < best.max_days ? current : best;
  });

  let reason = 'Perfect fit';
  if (recommended.is_featured) {
    reason = 'Recommended - Most popular';
  } else if (suitableTiers.length === 1) {
    reason = 'Smallest suitable tier';
  } else {
    reason = 'Best value for your needs';
  }

  return {
    tier_id: recommended.tier_id,
    tier_name: recommended.tier_name,
    display_name: recommended.display_name,
    reason,
    isRecommended: true,
    fits: true,
  };
}
