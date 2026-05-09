import { api } from '../../../core/api';
import type { TierConfig, PriceBreakdown, TierValidationResult } from '../types/tier';

interface TiersResponseDTO {
  success: boolean;
  data: { tiers: TierConfig[] };
}

interface PricePreviewResponseDTO {
  success: boolean;
  price_breakdown: PriceBreakdown;
  validation: TierValidationResult;
}

interface CheckNameResponseDTO {
  success: boolean;
  exists: boolean;
}

export async function fetchTiers(): Promise<TierConfig[]> {
  const res = await api.get<TiersResponseDTO>('/api/leagues/tiers');
  if (!res.data.success) return [];
  return res.data.data?.tiers ?? [];
}

export async function previewPrice(
  tierId: string,
  durationDays: number,
  estimatedParticipants: number,
): Promise<{ breakdown: PriceBreakdown; validation: TierValidationResult } | null> {
  try {
    const res = await api.post<PricePreviewResponseDTO>('/api/tiers/preview-price', {
      tier_id: tierId,
      duration_days: durationDays,
      estimated_participants: estimatedParticipants,
    });
    if (!res.data.success) return null;
    return {
      breakdown: res.data.price_breakdown,
      validation: res.data.validation,
    };
  } catch {
    return null;
  }
}

export async function checkLeagueName(name: string): Promise<boolean> {
  const res = await api.post<CheckNameResponseDTO>('/api/leagues/check-name', {
    league_name: name,
  });
  return res.data.exists;
}
